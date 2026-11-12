# -*- coding: utf-8 -*-
"""
Discord-клиент эло-системы: слушает канал #релей, превращает сообщения
в события (relay_parser.py) и действия в БД (handlers.py) через
relay_bot_core.process_message.

ВАЖНО: этот файл, в отличие от elo.py/relay_parser.py/db.py/handlers.py/
relay_bot_core.py, НЕ покрыт тестами в этом чате - здесь нет сети и
нет библиотеки discord.py, чтобы по-настоящему подключиться и
проверить. Вся логика, которую можно было протестировать без реального
Discord-соединения, вынесена в relay_bot_core.py и проверена там. Этот
файл - тонкая, насколько получилось, обвязка поверх неё: подписка на
канал и два фоновых цикла. Проверить его можно только вживую, с
реальным токеном бота и реальным каналом.

Переменные окружения (по аналогии с TG_TOKEN/GH_TOKEN в main.py):
    DISCORD_BOT_TOKEN        - токен Discord-бота (developer portal)
    DISCORD_RELAY_CHANNEL_ID - id канала #релей (число)
    TURSO_DATABASE_URL       - URL базы Turso (libsql://...)
    TURSO_AUTH_TOKEN         - токен доступа к ней
    ELO_REPLICA_PATH         - (необязательно) путь локального файла-реплики
    ELO_DB_PATH              - только для локального запуска БЕЗ Turso
                               (см. db.connect_from_env)

Кроме приёма событий бот держит в памяти снимок данных для сайта и
пересобирает его после каждой завершённой дуэли (api_snapshot.py);
Flask в main.py отдаёт этот снимок по GET /api/players.

Требуются библиотеки discord.py и libsql (`pip install discord.py libsql`) -
в этой среде их нет, поэтому настоящее подключение здесь не проверялось.
"""

import os

import discord
from discord.ext import tasks

import api_snapshot
import db
import export
import handlers
from relay_bot_core import extract_texts, process_message
from relay_parser import RelayParser

# Публикация итогов в Telegram необязательна: если модуль не подключился,
# бот работает как раньше, просто без постов.
try:
    import telegram_results
except Exception as _e:  # noqa: BLE001
    telegram_results = None
    print(f"[discord] telegram_results не подключён: {_e}")


# Админ-панель эло (Telegram) ходит в БД через этот поток - см. db_executor.
try:
    import db_executor
    import elo_admin_actions
except Exception as _e:  # noqa: BLE001
    db_executor = None
    elo_admin_actions = None
    print(f"[discord] админ-панель эло не подключена: {_e}")


# Разовый перенос PTS из players.js в Turso (по переменной PTS_MIGRATE, см. pts_migration.py)
try:
    import pts_migration
except Exception as _e:  # noqa: BLE001
    pts_migration = None
    print(f"[discord] pts_migration не подключён: {_e}")


try:
    import tiertest
except Exception as _e:  # noqa: BLE001
    tiertest = None
    print(f"[discord] tiertest не подключён: {_e}")


def _publish_finished_tests(conn) -> None:
    """Итоги завершившихся тиртестов - в Telegram (только текст)."""
    if tiertest is None or telegram_results is None:
        return
    for test_id in tiertest.pop_finished():
        telegram_results.publish_tiertest(conn, test_id)


def _publish_result(conn, match_id) -> None:
    if telegram_results is not None and match_id is not None:
        telegram_results.publish_match_result(conn, match_id)


DISCORD_TOKEN = os.environ.get("DISCORD_BOT_TOKEN")
RELAY_CHANNEL_ID_RAW = os.environ.get("DISCORD_RELAY_CHANNEL_ID")

# Раз в сколько секунд проверяем просроченные (>3 мин) таймеры дисконнекта.
TIMER_SWEEP_INTERVAL_SECONDS = 20
# Как часто проверяем, не пора ли пересобрать снимок данных для сайта
# (сама пересборка идёт только если после дуэли что-то изменилось).
SNAPSHOT_CHECK_INTERVAL_SECONDS = 5
# Порог "подвисшего" активного матча при старте бота - см. handlers.sweep_stale_matches.
STALE_MATCH_THRESHOLD_MINUTES = 60

intents = discord.Intents.default()
intents.message_content = True  # без этого on_message не увидит текст сообщения


class RelayClient(discord.Client):
    def __init__(self, conn, relay_channel_id: int, **kwargs):
        super().__init__(intents=intents, **kwargs)
        self.conn = conn
        self.relay_channel_id = relay_channel_id
        self.parser = RelayParser()
        # Снимок данных для сайта (GET /api/players, см. api_snapshot.py).
        # Собирается здесь, в потоке бота, потому что только у него есть
        # соединение с БД; Flask лишь отдаёт готовый снимок.
        self.refresher = api_snapshot.SnapshotRefresher(
            lambda: export.build_export_data(self.conn, history_limit=api_snapshot.HISTORY_LIMIT)
        )

    async def on_ready(self):
        print(f"[discord] Бот запущен как {self.user}, слушаю канал {self.relay_channel_id}")

        # Разовая зачистка подвисших с прошлого запуска матчей - см.
        # docstring handlers.sweep_stale_matches про то, зачем это нужно.
        stale_outcomes = handlers.sweep_stale_matches(self.conn, STALE_MATCH_THRESHOLD_MINUTES)
        for outcome in stale_outcomes:
            print(f"[discord] При старте аннулирован подвисший матч: {outcome.detail}")

        # Настройки, сохранённые из админ-панели (множитель победы,
        # публикация результатов), - применяем сразу при старте.
        if elo_admin_actions is not None:
            try:
                elo_admin_actions.apply_settings(self.conn)
            except Exception as e:
                print(f"[discord] не удалось применить сохранённые настройки: {e}")

        if pts_migration is not None:
            pts_migration.run_from_env(self.conn)

        # Первый снимок для сайта - сразу при старте, из данных в Turso
        # (после перезапуска Render память пуста, а база - нет).
        if self.refresher.tick():
            print("[discord] Снимок данных для сайта собран")

        # on_ready может сработать повторно при переподключении -
        # не запускаем вторую копию цикла поверх уже идущей.
        if not timer_sweep_loop.is_running():
            timer_sweep_loop.start(self)
        if not snapshot_loop.is_running():
            snapshot_loop.start(self)
        if db_executor is not None and not admin_exec_loop.is_running():
            admin_exec_loop.start(self)

    async def on_message(self, message: discord.Message):
        if message.channel.id != self.relay_channel_id:
            return

        # Свои сообщения НАМЕРЕННО не фильтруем: наш бот в этот канал
        # ничего не пишет, а встроенный релей MultiCraft может публиковать
        # события от имени того же бота-приложения, под токеном которого
        # мы слушаем канал, - фильтр по автору отбросил бы все события.

        # Часть событий (коннект/дисконнект) приходит embed-блоком с
        # пустым content - берём текст и оттуда (см. extract_texts).
        for text in extract_texts(message.content, message.embeds):
            try:
                outcome = process_message(self.conn, self.parser, text)
            except Exception as e:
                # Один кривой/неожиданный текст не должен ронять весь
                # процесс - логируем и едем дальше, как и в остальном боте.
                print(f"[discord] Ошибка обработки сообщения {message.id!r}: {e}")
                continue

            # Одиночные строки старта дуэли, не нашедшие пару (командный блок
            # сработал сам, потерялась строка и т.п.), - в лог.
            for orphan in self.parser.pop_dropped():
                print(f"[discord] осиротевшая строка старта: {orphan!r}")

            if outcome is None:
                # Диагностика: служебные строки UHC, которые парсер не разобрал
                # (строки старта дуэли и ">>"-объявления - норма, их не шумим).
                if (text.startswith("UHC") and ">>" not in text
                        and "игрока" not in text and "игроком" not in text):
                    print(f"[discord] не разобрано: {text!r}")
                # Строки, похожие на смерть, но не распознанные парсером:
                # именно из-за них дуэль может тихо не засчитаться.
                elif text.startswith("\U0001FAA6") or "погиб" in text.lower():
                    print(f"[discord] смерть не разобрана: {text!r}")
            else:
                print(f"[discord] {outcome.action}: {outcome.detail}")
                if outcome.action in ("match_finished", "region_set", "device_set",
                                      "player_removed", "player_restored"):
                    # Эло/история или регион изменились - снимок для сайта устарел
                    self.refresher.mark_dirty()
                # Посты о результатах китов - итоги тиртестов; Elo-посты по китам больше не шлём
                _publish_finished_tests(self.conn)


@tasks.loop(seconds=TIMER_SWEEP_INTERVAL_SECONDS)
async def timer_sweep_loop(client: RelayClient):
    try:
        outcomes = handlers.sweep_expired_timers(client.conn)
    except Exception as e:
        print(f"[discord] Ошибка свипа таймеров: {e}")
        return
    for outcome in outcomes:
        print(f"[discord] Автопоражение по таймеру: {outcome.detail}")
    if outcomes:
        client.refresher.mark_dirty()


@tasks.loop(seconds=SNAPSHOT_CHECK_INTERVAL_SECONDS)
async def snapshot_loop(client: RelayClient):
    try:
        if client.refresher.tick():
            print("[discord] Снимок данных для сайта обновлён")
    except Exception as e:
        print(f"[discord] Ошибка обновления снимка для сайта: {e}")


@tasks.loop(seconds=1)
async def admin_exec_loop(client: RelayClient):
    """Выполняет запросы Telegram-админки к БД в этом (Discord) потоке."""
    try:
        if db_executor.drain(client.conn):
            client.refresher.mark_dirty()  # админ мог поменять данные - обновить снимок сайта
    except Exception as e:
        print(f"[discord] Ошибка выполнения запросов админ-панели: {e}")


def run():
    if not DISCORD_TOKEN:
        raise RuntimeError("DISCORD_BOT_TOKEN не задан")
    if not RELAY_CHANNEL_ID_RAW:
        raise RuntimeError("DISCORD_RELAY_CHANNEL_ID не задан")
    relay_channel_id = int(RELAY_CHANNEL_ID_RAW)

    # Соединение открывается здесь, В ПОТОКЕ Discord-бота, и используется
    # только в нём (событийный цикл discord.py и tasks.loop - один поток):
    # sqlite3-совместимые драйверы не любят общие соединения между потоками.
    conn = db.connect_from_env()
    db.init_schema(conn)  # CREATE ... IF NOT EXISTS - безопасно повторять

    client = RelayClient(conn, relay_channel_id)
    client.run(DISCORD_TOKEN)


if __name__ == "__main__":
    run()
