# -*- coding: utf-8 -*-
"""
Мост между событиями relay_parser.py и слоем db.py.

handle_event(conn, event) - единственная точка входа. Принимает ЛЮБОЕ
событие, которое может вернуть RelayParser.feed(), и решает, что с ним
сделать в БД. Чистая функция от (БД, событие) - не знает про Discord,
легко тестируется скармливанием событий напрямую (как и elo.py/db.py).

Возвращает Outcome - маленький объект с action и подробностями, чтобы
вызывающий код (Discord-бот) мог залогировать/отреагировать эмодзи,
не заглядывая внутрь обработчика.
"""

from dataclasses import dataclass, field
from typing import Optional

import db
from relay_parser import (
    DeviceSet, DuelStarted, PlayerConnected, PlayerDied, PlayerDisconnected,
    PlayerRemoved, PlayerRestored, RegionSet, TierTestRequested,
)
import tiertest


# Регионы - части света, одинаковые для китов и мини-игр (см. regions.py).
# Принимаются только части света: старые коды стран (RU, KZ...) больше не работают.
from regions import WORLD_REGIONS as ALLOWED_REGIONS, normalize_region


# Админы игрового чата: ставят регион другим игрокам ("админ: set_region
# ник KZ"), отмечают устройство (set_device), скрывают и возвращают игроков
# (remove_player / restore_player). Сравнение без учёта регистра.
ADMINS = ("zor1kkqwix", "UHC", "-999-")
REGION_ADMINS = ADMINS  # прежнее имя, на случай внешних ссылок


def _is_admin(name: str) -> bool:
    return name.lower() in {a.lower() for a in ADMINS}


@dataclass(frozen=True)
class Outcome:
    action: str
    detail: dict = field(default_factory=dict)


def _ensure_no_active_match(conn, player_id: int, player_name: str) -> Optional[int]:
    """Если у игрока уже есть активный матч (не должно происходить в
    норме - физически он в одном месте), аннулирует его как
    'superseded': это значит, что по нему пропущено завершающее
    событие (скорее всего бот был недоступен). Возвращает id
    аннулированного матча, либо None, если активного матча не было."""
    active = db.find_active_match(conn, player_id)
    if active is None:
        return None
    db.cancel_match(conn, active["id"], reason="superseded")
    return active["id"]


def handle_event(conn, event) -> Outcome:
    if isinstance(event, DuelStarted):
        return _handle_duel_started(conn, event)
    if isinstance(event, PlayerDied):
        return _handle_player_died(conn, event)
    if isinstance(event, PlayerConnected):
        return _handle_player_connected(conn, event)
    if isinstance(event, PlayerDisconnected):
        return _handle_player_disconnected(conn, event)
    if isinstance(event, RegionSet):
        return _handle_region_set(conn, event)
    if isinstance(event, DeviceSet):
        return _handle_device_set(conn, event)
    if isinstance(event, PlayerRemoved):
        return _handle_player_removed(conn, event)
    if isinstance(event, PlayerRestored):
        return _handle_player_restored(conn, event)
    if isinstance(event, TierTestRequested):
        code, detail = tiertest.start_tiertest(conn, event.player, event.kit)
        return Outcome(code, detail)
    raise TypeError(f"неизвестный тип события: {type(event)!r}")


def _handle_duel_started(conn, event: DuelStarted) -> Outcome:
    if event.player_a.lower() == event.player_b.lower():
        # Защитная проверка на уровне домена, а не только на уровне БД
        # (там тоже есть CHECK, но так сообщение понятнее и матч
        # вообще не создаётся частично).
        return Outcome("ignored_same_player", {"player": event.player_a, "kit": event.kit})

    player_a_id = db.get_or_create_player(conn, event.player_a)
    player_b_id = db.get_or_create_player(conn, event.player_b)

    if db.is_player_excluded(conn, player_a_id) or db.is_player_excluded(conn, player_b_id):
        # PC-игрок или скрытый админом (твинк и т.п.): дуэль не создаём,
        # эло не меняется ни у кого. Смерть/дисконнект по ней потом
        # просто проигнорируются (нет активного матча).
        return Outcome("ignored_excluded_player", {
            "kit": event.kit, "player_a": event.player_a, "player_b": event.player_b,
        })

    cancelled_a = _ensure_no_active_match(conn, player_a_id, event.player_a)
    cancelled_b = _ensure_no_active_match(conn, player_b_id, event.player_b)

    match_id = db.create_match(conn, kit=event.kit, player_a_name=event.player_a,
                                player_b_name=event.player_b)

    return Outcome("match_started", {
        "match_id": match_id,
        "kit": event.kit,
        "player_a": event.player_a,
        "player_b": event.player_b,
        "cancelled_stale_match_ids": [m for m in (cancelled_a, cancelled_b) if m is not None],
    })


def _handle_player_died(conn, event: PlayerDied) -> Outcome:
    player_id = db.get_or_create_player(conn, event.player)
    match = db.find_active_match(conn, player_id)
    if match is None:
        # Смерть вне какой-либо отслеживаемой дуэли (упал где-то в
        # обычной игре, не в зоне дуэлей) - не наша забота, игнорируем.
        return Outcome("ignored_no_active_match", {"player": event.player, "event": "death"})

    if db.is_player_excluded(conn, match["player_a_id"]) or db.is_player_excluded(conn, match["player_b_id"]):
        # Статус одного из игроков поменяли уже во время матча.
        db.cancel_match(conn, match["id"], reason="superseded")
        return Outcome("ignored_excluded_player", {"match_id": match["id"], "event": "death"})

    result = db.finish_match(conn, match["id"], loser_player_id=player_id, end_reason="death")
    winner_id = db.get_opponent_id(match, player_id)
    detail = {
        "match_id": match["id"],
        "kit": match["kit"],
        "loser": event.player,
        "winner_id": winner_id,
        "winner_delta": result.winner_delta,
        "loser_delta": result.loser_delta,
        "end_reason": "death",
    }
    # Раунд засчитывается в активные тиртесты (только смерти; тайм-ауты не считаются).
    # Сбой тиртеста не должен ломать обработку дуэли.
    try:
        tt_events = tiertest.on_round(conn, match["kit"], winner_id, player_id)
        if tt_events:
            detail["tiertest"] = tt_events
    except Exception as e:  # noqa: BLE001
        print(f"[tiertest] ошибка подсчёта раунда: {e}")
    return Outcome("match_finished", detail)


def _handle_player_connected(conn, event: PlayerConnected) -> Outcome:
    player_id = db.get_or_create_player(conn, event.player)
    match = db.find_active_match(conn, player_id)
    if match is None:
        # Коннект вне активной дуэли (обычный вход на сервер) -
        # отменять нечего.
        return Outcome("ignored_no_active_match", {"player": event.player, "event": "connect"})

    db.cancel_disconnect_timer(conn, match["id"], player_id)
    return Outcome("timer_cancelled", {"match_id": match["id"], "player": event.player})


def _handle_player_disconnected(conn, event: PlayerDisconnected) -> Outcome:
    player_id = db.get_or_create_player(conn, event.player)
    match = db.find_active_match(conn, player_id)
    if match is None:
        # Дисконнект вне активной дуэли - нормальный выход с сервера,
        # таймер заводить не на чем.
        return Outcome("ignored_no_active_match", {"player": event.player, "event": "disconnect"})

    db.start_disconnect_timer(conn, match["id"], player_id)
    return Outcome("timer_started", {
        "match_id": match["id"], "player": event.player, "timeout_flag": event.timeout,
    })


def _handle_region_set(conn, event: RegionSet) -> Outcome:
    region = normalize_region(event.region)
    target = event.target or event.player

    if event.target is not None and not _is_admin(event.player):
        # Ставить регион другим могут только админы.
        return Outcome("region_denied", {"player": event.player, "target": event.target})

    if region is None:
        # Игроку в игре ответить нельзя, поэтому опечатка просто не
        # применяется (видно только в логе бота).
        return Outcome("region_invalid", {"player": event.player, "region": event.region})

    # Игрока создаём, если его ещё нет: регион не должен потеряться, пока
    # он не сыграл дуэль. Без дуэлей на сайт он не попадает (см. export).
    player_id = db.get_or_create_player(conn, target)
    previous = db.set_player_region(conn, player_id, region)
    return Outcome("region_set", {
        "player": target, "set_by": event.player, "region": region, "previous": previous,
    })


def _handle_device_set(conn, event: DeviceSet) -> Outcome:
    if not _is_admin(event.player):
        return Outcome("admin_denied", {"player": event.player, "command": "set_device"})
    device = event.device.upper()
    if device not in ("PC", "MOBILE"):
        return Outcome("device_invalid", {"player": event.player, "device": event.device})
    player_id = db.get_or_create_player(conn, event.target)
    previous = db.set_player_device(conn, player_id, device)
    return Outcome("device_set", {
        "player": event.target, "set_by": event.player, "device": device, "previous": previous,
    })


def _handle_player_removed(conn, event: PlayerRemoved) -> Outcome:
    if not _is_admin(event.player):
        return Outcome("admin_denied", {"player": event.player, "command": "remove_player"})
    # Игрока создаём, если его ещё нет: твинка можно скрыть заранее, до
    # его первой дуэли.
    player_id = db.get_or_create_player(conn, event.target)
    previous = db.set_player_removed(conn, player_id, True)
    return Outcome("player_removed", {
        "player": event.target, "set_by": event.player, "was_removed": previous,
    })


def _handle_player_restored(conn, event: PlayerRestored) -> Outcome:
    if not _is_admin(event.player):
        return Outcome("admin_denied", {"player": event.player, "command": "restore_player"})
    player_id = db.find_player_id(conn, event.target)
    if player_id is None:
        return Outcome("target_not_found", {"player": event.target, "command": "restore_player"})
    previous = db.set_player_removed(conn, player_id, False)
    return Outcome("player_restored", {
        "player": event.target, "set_by": event.player, "was_removed": previous,
    })


def sweep_stale_matches(conn, older_than_minutes: int = 60) -> list:
    """
    Аннулирует активные матчи, которые стартовали давно и, скорее
    всего, "подвисли" из-за недоступности бота (сообщение о смерти/
    дисконнекте пришло, пока бот не слушал канал, и больше не
    повторится). Вызывается ОДИН РАЗ при старте Discord-клиента, не
    по расписанию - в отличие от sweep_expired_timers, которая
    реагирует на штатный, ожидаемый трёхминутный таймер.

    older_than_minutes - намеренно куда больше 3 минут (по умолчанию
    час): обычная дуэль не должна идти часами, и час - это щедрый
    запас, чтобы не аннулировать матч, который на самом деле просто
    ещё идёт.
    """
    outcomes = []
    for row in db.find_stale_active_matches(conn, older_than_minutes):
        db.cancel_match(conn, row["id"], reason="stale_on_restart")
        outcomes.append(Outcome("match_cancelled_stale", {
            "match_id": row["id"], "kit": row["kit"], "started_at": row["started_at"],
        }))
    return outcomes


def sweep_expired_timers(conn) -> list:
    """
    Находит все просроченные (>3 минуты) таймеры дисконнекта и
    засчитывает по ним автопоражение. Вызывается периодически фоновой
    задачей (не из handle_event - это отдельный, не событийный поток).
    Возвращает список Outcome по каждому обработанному таймеру.
    """
    outcomes = []
    for timer_row in db.due_disconnect_timers(conn):
        match = conn.execute(
            "SELECT * FROM matches WHERE id = ?", (timer_row["match_id"],)
        ).fetchone()
        if match is None or match["status"] != "active":
            # Матч уже как-то иначе завершился/аннулировался раньше,
            # чем до него дошла очередь в свипе - таймер неактуален,
            # просто подчищаем и идём дальше.
            db.cancel_disconnect_timer(conn, timer_row["match_id"], timer_row["player_id"])
            continue

        if db.is_player_excluded(conn, match["player_a_id"]) or db.is_player_excluded(conn, match["player_b_id"]):
            db.cancel_match(conn, match["id"], reason="superseded")  # заодно снимает таймер
            continue

        loser_id = timer_row["player_id"]
        result = db.finish_match(conn, match["id"], loser_player_id=loser_id, end_reason="timeout")
        winner_id = db.get_opponent_id(match, loser_id)
        outcomes.append(Outcome("match_finished", {
            "match_id": match["id"],
            "kit": match["kit"],
            "loser_id": loser_id,
            "winner_id": winner_id,
            "winner_delta": result.winner_delta,
            "loser_delta": result.loser_delta,
            "end_reason": "timeout",
        }))
    return outcomes
