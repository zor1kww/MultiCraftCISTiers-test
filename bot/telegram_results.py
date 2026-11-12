"""
Публикация итогов дуэлей в Telegram-группу MultiCraftCISTiers:
  - топик "Результаты"          - дуэли, где оба игрока ниже HT3;
  - топик "Высокие результаты"  - если хотя бы один из двух игроков до
                                  матча был HT3 или выше.

Как это встроено: после завершённой дуэли discord_bot.py зовёт
publish_match_result(conn, match_id). Текст собирается из строки матча
в БД (в потоке Discord, единственном с доступом к Turso), а сама
отправка идёт в отдельном потоке через очередь - лимиты Telegram и
сетевые задержки не тормозят обработку дуэлей. Сбой отправки никогда
не влияет на подсчёт эло.

Настройка через переменные окружения Render:
  TG_TOKEN                 - токен бота (тот же, что у старого бота);
                             без него публикация выключена
  TG_RESULTS_ENABLED       - "0" / "false" выключает публикацию (по умолчанию включена)
  TG_RESULTS_CHAT          - чат группы (по умолчанию @MultiCraftCISTiers)
  TG_RESULTS_TOPIC_ID      - топик "Результаты" (по умолчанию 11)
  TG_HIGH_RESULTS_TOPIC_ID - топик "Высокие результаты" (по умолчанию 11870)

Бот должен быть участником группы с правом писать в эти топики.
"""

import json
import os
import queue
import threading
import time
import urllib.error
import urllib.request
from typing import Optional, Tuple

import elo

DEFAULT_CHAT = "@MultiCraftCISTiers"
DEFAULT_TOPIC_RESULTS = 11
DEFAULT_TOPIC_HIGH = 11870

# Кит-список для "среднего ранга" - как maintiers + subtiers в js/config.js:
# сайт усредняет эло именно по этим китам.
AVERAGE_KITS = (
    "Hardcore", "Manhunt", "Diamond Pot", "Beast", "Emerald", "Emerald Pot",
    "RVM", "Dragonhide", "Pickaxe", "SMP", "Vanilla",
    "Combo", "Gapple", "Mace", "Crystal",
)

# Нижняя граница HT3 по таблице тиров: игрок с эло от неё - "высокий".
HIGH_ELO_THRESHOLD = next(lb for lb, tier, _k in elo.TIER_TABLE if tier == "HT3")

_TIER_WORDS = {"HT": "High Tier", "MT": "Mid Tier", "LT": "Low Tier"}

_SEND_INTERVAL_SECONDS = 1.2   # между сообщениями (лимит группы ~20 в минуту)
_MAX_ATTEMPTS = 3
_QUEUE_LIMIT = 200


# ==========================================
# ТЕКСТ СООБЩЕНИЯ
# ==========================================

def tier_name(tier: str) -> str:
    """'HT3' -> 'High Tier 3'."""
    return f"{_TIER_WORDS.get(tier[:2], tier[:2])} {tier[2:]}"


def _fmt_elo(value: float) -> str:
    return str(int(round(value)))


def _fmt_delta(delta: int, sign: str) -> str:
    return f"{sign}{delta}".replace("-", "\u2212")  # настоящий минус


def _fmt_multiplier(m: float) -> str:
    return f"\u00d7{m:g}"


def average_tier(conn, player_id: int) -> str:
    """Средний ранг игрока: среднее эло по китам, на которых есть рейтинг,
    -> тир (как calcAverageTier на сайте). 'Unranked', если рейтингов нет."""
    placeholders = ",".join("?" for _ in AVERAGE_KITS)
    rows = conn.execute(
        f"SELECT elo FROM player_ratings WHERE player_id = ? AND kit IN ({placeholders})",
        (player_id, *AVERAGE_KITS),
    ).fetchall()
    if not rows:
        return "Unranked"
    avg = sum(r["elo"] for r in rows) / len(rows)
    return elo.get_tier(round(avg))


def build_result_message(conn, match_id: int) -> Optional[Tuple[str, bool]]:
    """
    Собирает пост по завершённому матчу. Возвращает (текст, is_high) либо
    None, если публиковать нечего: матч не завершён, либо эло ни у кого
    не изменилось (антиабуз x0).
    """
    m = conn.execute(
        """
        SELECT m.*, pa.name AS a_name, pb.name AS b_name
        FROM matches m
        JOIN players pa ON pa.id = m.player_a_id
        JOIN players pb ON pb.id = m.player_b_id
        WHERE m.id = ?
        """,
        (match_id,),
    ).fetchone()
    if m is None or m["status"] != "finished" or m["winner_id"] is None:
        return None
    if not m["winner_delta"] and not m["loser_delta"]:
        return None

    winner_is_a = m["winner_id"] == m["player_a_id"]
    w_name, l_name = (m["a_name"], m["b_name"]) if winner_is_a else (m["b_name"], m["a_name"])
    w_before = m["player_a_elo_before"] if winner_is_a else m["player_b_elo_before"]
    l_before = m["player_b_elo_before"] if winner_is_a else m["player_a_elo_before"]
    w_after, l_after = m["winner_elo_after"], m["loser_elo_after"]
    w_delta, l_delta = m["winner_delta"] or 0, m["loser_delta"] or 0
    kit = m["kit"]

    def block(name, before, after, delta_text):
        tier_before, tier_after = elo.get_tier(before), elo.get_tier(after)
        verb = "получает" if tier_after != tier_before else "сохраняет"
        return (f"{name} {verb} {kit} {tier_name(tier_after)}\n"
                f"Эло: {_fmt_elo(before)} \u2192 {_fmt_elo(after)} ({delta_text})")

    comments = []
    if m["end_reason"] == "timeout":
        comments.append(f"{l_name} не вернулся на сервер за 3 минуты")
    if m["m_factor"] is not None and m["m_factor"] < 1:
        comments.append(f"много дуэлей этой пары за 2 часа, очки {_fmt_multiplier(m['m_factor'])}")
    if elo.WIN_BONUS_MULTIPLIER != 1:
        comments.append(f"бонус за победу {_fmt_multiplier(elo.WIN_BONUS_MULTIPLIER)}")
    comment = "; ".join(comments) if comments else "\u2014"

    w_avg = average_tier(conn, m["winner_id"])
    l_avg = average_tier(conn, m["loser_id"])

    text = (
        f"{block(w_name, w_before, w_after, _fmt_delta(w_delta, '+'))}\n\n"
        f"{block(l_name, l_before, l_after, _fmt_delta(l_delta, '-'))}\n\n"
        f"Поединок:\n"
        f"\u25b8 {w_name} победил {l_name}\n\n"
        f"Комментарий: {comment}\n"
        f"\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\n"
        f"Средний ранг: {w_name} {w_avg} \u00b7 {l_name} {l_avg}"
    )
    is_high = max(w_before, l_before) >= HIGH_ELO_THRESHOLD
    return text, is_high


# ==========================================
# ОТПРАВКА (отдельный поток + очередь)
# ==========================================

class ResultsPublisher:
    def __init__(self, token: Optional[str], chat_id: str, topic_results: int, topic_high: int,
                 enabled: bool = True, sender=None):
        self.token = token
        self.chat_id = chat_id
        self.topic_results = topic_results
        self.topic_high = topic_high
        self.can_send = bool(token or sender)   # есть ли вообще чем отправлять
        self.enabled = bool(enabled and self.can_send)
        self._send = sender or self._send_via_bot_api   # sender подменяется в тестах
        self._queue = queue.Queue(maxsize=_QUEUE_LIMIT)
        self._thread = None

    @classmethod
    def from_env(cls) -> "ResultsPublisher":
        flag = os.environ.get("TG_RESULTS_ENABLED", "1").strip().lower()
        return cls(
            token=os.environ.get("TG_TOKEN"),
            chat_id=os.environ.get("TG_RESULTS_CHAT", DEFAULT_CHAT),
            topic_results=int(os.environ.get("TG_RESULTS_TOPIC_ID", DEFAULT_TOPIC_RESULTS)),
            topic_high=int(os.environ.get("TG_HIGH_RESULTS_TOPIC_ID", DEFAULT_TOPIC_HIGH)),
            enabled=flag not in ("0", "false", "no", "off"),
        )

    def publish_html(self, text: str, is_high: bool) -> None:
        """Ставит в очередь готовый HTML-пост (итог тиртеста). Не бросает исключений."""
        if not self.enabled:
            return
        try:
            topic = self.topic_high if is_high else self.topic_results
            self._ensure_thread()
            self._queue.put_nowait((text, topic, "HTML"))
        except queue.Full:
            print("[tg-results] очередь переполнена, пост пропущен")
        except Exception as e:  # noqa: BLE001
            print(f"[tg-results] не удалось поставить пост в очередь: {e}")

    def set_enabled(self, flag: bool) -> None:
        """Включает/выключает публикацию на лету (из админ-панели). Без
        токена включить нельзя - останется выключенной."""
        self.enabled = bool(flag and self.can_send)

    def publish(self, conn, match_id: int) -> None:
        """Собирает пост и ставит в очередь. Никогда не бросает исключений."""
        if not self.enabled:
            return
        try:
            built = build_result_message(conn, match_id)
            if built is None:
                return
            text, is_high = built
            topic = self.topic_high if is_high else self.topic_results
            self._ensure_thread()
            self._queue.put_nowait((text, topic, None))
        except queue.Full:
            print("[tg-results] очередь переполнена, пост пропущен")
        except Exception as e:  # публикация не должна влиять на эло
            print(f"[tg-results] не удалось подготовить пост по матчу {match_id}: {e}")

    def _ensure_thread(self) -> None:
        if self._thread is None or not self._thread.is_alive():
            self._thread = threading.Thread(target=self._worker, daemon=True, name="tg-results")
            self._thread.start()

    def _worker(self) -> None:
        while True:
            text, topic, parse_mode = self._queue.get()
            delay = 0.0
            for attempt in range(1, _MAX_ATTEMPTS + 1):
                try:
                    delay = self._send(self.chat_id, topic, text, parse_mode) or 0.0
                    break
                except _RetryAfter as e:
                    print(f"[tg-results] лимит Telegram, ждём {e.seconds} с")
                    time.sleep(e.seconds + 1)
                except Exception as e:
                    print(f"[tg-results] ошибка отправки (попытка {attempt}/{_MAX_ATTEMPTS}): {e}")
                    time.sleep(2 * attempt)
            else:
                print(f"[tg-results] пост в топик {topic} потерян после {_MAX_ATTEMPTS} попыток")
            time.sleep(_SEND_INTERVAL_SECONDS + delay)

    def _send_via_bot_api(self, chat_id: str, topic_id: int, text: str, parse_mode=None):
        body = {
            "chat_id": chat_id,
            "message_thread_id": topic_id,
            "text": text,
            "disable_web_page_preview": True,
        }
        if parse_mode:
            body["parse_mode"] = parse_mode
        payload = json.dumps(body).encode("utf-8")
        req = urllib.request.Request(
            f"https://api.telegram.org/bot{self.token}/sendMessage",
            data=payload, headers={"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                resp.read()
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", "replace")
            if e.code == 429:
                try:
                    seconds = int(json.loads(body)["parameters"]["retry_after"])
                except Exception:
                    seconds = 5
                raise _RetryAfter(seconds)
            raise RuntimeError(f"Telegram HTTP {e.code}: {body[:200]}")
        return 0.0


class _RetryAfter(Exception):
    def __init__(self, seconds: int):
        super().__init__(f"retry after {seconds}")
        self.seconds = seconds


_publisher: Optional[ResultsPublisher] = None


def get_publisher() -> ResultsPublisher:
    global _publisher
    if _publisher is None:
        _publisher = ResultsPublisher.from_env()
        state = "включена" if _publisher.enabled else "выключена (нет TG_TOKEN или TG_RESULTS_ENABLED=0)"
        print(f"[tg-results] публикация результатов {state}")
    return _publisher


def publish_match_result(conn, match_id: int) -> None:
    get_publisher().publish(conn, match_id)


def publish_tiertest(conn, tiertest_id: int) -> None:
    """Итоговый пост о тиртесте (повышение, провал, понижение). Сбой не влияет на тест."""
    try:
        import tiertest_posts
        built = tiertest_posts.build_post(conn, tiertest_id)
        if built is not None:
            get_publisher().publish_html(*built)
    except Exception as e:  # noqa: BLE001
        print(f"[tg-results] не удалось подготовить пост по тиртесту {tiertest_id}: {e}")
