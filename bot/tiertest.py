"""
Движок тиртестов.

Игрок пишет \tiertest КИТ. Дальше 24 часа бот сам считает раунды по обычным событиям
релея (старт дуэли и смерть): для каждого соперника ведётся свой счётчик, игра идёт до ft
побед (4, а у китов FT6 - 6). Игры с разными соперниками не смешиваются. Если соперник
вышел, счётчик с ним остаётся до конца суток; поражение по тайм-ауту раундом НЕ считается
(вызывается только для смертей). Зачёт игры и штрафы - по tiertest_config.py. Поражение (или слишком узкая победа) сразу
закрывает тест; повышение - когда пройдены все нужные игры.

Штрафные очки получает только тот, кто написал команду. 2.0 очка в цикле - понижение.
"""

import json
from datetime import datetime, timedelta, timezone
from typing import Optional

import db
import tiertest_config as C

LADDER = C.TIERS_LOW_TO_HIGH

# id тестов, которые только что завершились (повышение, провал, понижение). Бот забирает
# их через pop_finished() и публикует итоговый пост в Telegram.
_finished_ids: list = []


def pop_finished() -> list:
    ids = _finished_ids[:]
    _finished_ids.clear()
    return ids


# ==========================================
# ВСПОМОГАТЕЛЬНОЕ
# ==========================================

def _now() -> datetime:
    return datetime.now(timezone.utc)


def _iso(dt: datetime) -> str:
    return dt.isoformat()


def _parse(value: str) -> datetime:
    dt = datetime.fromisoformat(value)
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def tier_index(tier: Optional[str]) -> Optional[int]:
    return LADDER.index(tier) if tier in LADDER else None


def ft_for(kit: str) -> int:
    return 6 if kit in C.FT6_KITS else 4


def resolve_kit(raw: str) -> Optional[str]:
    """Название кита из команды -> каноническое (без учёта регистра и пробелов)."""
    key = "".join(str(raw).lower().split())
    for kit in C.ALL_KITS:
        if "".join(kit.lower().split()) == key:
            return kit
    return None


def target_for(current_tier: Optional[str]) -> Optional[str]:
    """Ранг, на который тестируется игрок: на ступень выше текущего. Без ранга - LT5.
    None, если игрок уже на высшем ранге."""
    if current_tier is None:
        return LADDER[0]
    idx = tier_index(current_tier)
    if idx is None or idx + 1 >= len(LADDER):
        return None
    return LADDER[idx + 1]


def mode_for_target(target: str) -> str:
    """'single' - 1 игра, 'double' - 2 игры, 'top' - особый тест на высший ранг."""
    if target == C.TOP_TARGET:
        return "top"
    idx = tier_index(target)
    if idx <= tier_index(C.SINGLE_UP_TO):
        return "single"
    if idx <= tier_index(C.DOUBLE_UP_TO):
        return "double"
    return "top"


def get_rating(conn, player_id: int, kit: str):
    row = conn.execute("SELECT tier, retired FROM pts_ratings WHERE player_id = ? AND kit = ?", (player_id, kit)).fetchone()
    return (row["tier"], bool(row["retired"])) if row is not None else (None, False)


def set_rating(conn, player_id: int, kit: str, tier: str, now: datetime) -> None:
    conn.execute(
        "INSERT INTO pts_ratings (player_id, kit, tier, set_date, retired) VALUES (?, ?, ?, ?, 0) "
        "ON CONFLICT (player_id, kit) DO UPDATE SET tier = excluded.tier, set_date = excluded.set_date",
        (player_id, kit, tier, now.date().isoformat()),
    )


def _name(conn, player_id: int) -> str:
    row = conn.execute("SELECT name FROM players WHERE id = ?", (player_id,)).fetchone()
    return row["name"] if row is not None else f"#{player_id}"


def penalty_for(ft: int, score_player: int) -> float:
    return C.PENALTY_TABLE[ft].get(score_player, 0.0)


def evaluate_game(ft: int, relation: str, score_player: int, score_opponent: int):
    """
    Результат законченной игры: ('passed' | 'narrow' | 'failed', штраф).
      - со своим рангом (equal/top): победа, где соперник взял не больше EQUAL_MAX_OPPONENT, - зачёт;
        победа поуже (4:3) - 'narrow' (не зачтено, без штрафа); поражение - 'failed' со штрафом.
      - с рангом выше (higher): зачёт, если игрок набрал не меньше HIGHER_MIN_PLAYER очков
        (даже при поражении); иначе 'failed' со штрафом.
    """
    if relation == "higher":
        if score_player >= C.HIGHER_MIN_PLAYER[ft]:
            return "passed", 0.0
        return "failed", penalty_for(ft, score_player)
    if score_player > score_opponent:
        if score_opponent <= C.EQUAL_MAX_OPPONENT[ft]:
            return "passed", 0.0
        return "narrow", 0.0
    return "failed", penalty_for(ft, score_player)


# ==========================================
# ЗАПУСК ТЕСТА
# ==========================================

def expire_old(conn, now: Optional[datetime] = None) -> int:
    """Суточные тесты, время которых вышло, закрываются без итога; открытые игры аннулируются
    (соперник вышел и не доиграл - счёт аннулируется)."""
    now = now or _now()
    rows = conn.execute(
        "SELECT id FROM tiertests WHERE status = 'active' AND expires_at <= ?", (_iso(now),)
    ).fetchall()
    for row in rows:
        conn.execute("UPDATE tiertest_games SET status = 'annulled', updated_at = ? WHERE tiertest_id = ? AND status = 'open'",
                     (_iso(now), row["id"]))
        conn.execute("UPDATE tiertests SET status = 'expired', finished_at = ?, result_note = ? WHERE id = ?",
                     (_iso(now), "время (24 часа) вышло", row["id"]))
    if rows:
        conn.commit()
    return len(rows)


def start_tiertest(conn, player_name: str, kit_raw: str, now: Optional[datetime] = None):
    """Возвращает (код, детали). Код 'tiertest_started' - тест запущен, иначе причина отказа."""
    now = now or _now()
    kit = resolve_kit(kit_raw)
    if kit is None:
        return "tiertest_bad_kit", {"player": player_name, "kit": kit_raw}

    player_id = db.get_or_create_player(conn, player_name)
    if db.is_player_excluded(conn, player_id):
        return "tiertest_excluded", {"player": player_name}

    expire_old(conn, now)
    current, retired = get_rating(conn, player_id, kit)
    if retired:
        return "tiertest_retired", {"player": player_name, "kit": kit}

    active = conn.execute(
        "SELECT id, expires_at FROM tiertests WHERE player_id = ? AND kit = ? AND status = 'active'", (player_id, kit)
    ).fetchone()
    if active is not None:
        return "tiertest_active", {"player": player_name, "kit": kit, "expires_at": active["expires_at"]}

    last = conn.execute(
        "SELECT started_at FROM tiertests WHERE player_id = ? AND kit = ? ORDER BY started_at DESC LIMIT 1", (player_id, kit)
    ).fetchone()
    if last is not None:
        available = _parse(last["started_at"]) + timedelta(days=C.TEST_COOLDOWN_DAYS)
        if available > now:
            return "tiertest_cooldown", {"player": player_name, "kit": kit, "available_at": _iso(available)}

    target = target_for(current)
    if target is None:
        return "tiertest_top_rank", {"player": player_name, "kit": kit, "tier": current}
    mode = mode_for_target(target)

    required = None
    if mode == "top":
        marks = ",".join("?" for _ in C.TOP_OPPONENT_TIERS)
        rows = conn.execute(
            f"SELECT player_id FROM pts_ratings WHERE kit = ? AND tier IN ({marks}) AND retired = 0 AND player_id != ?",
            (kit, *C.TOP_OPPONENT_TIERS, player_id),
        ).fetchall()
        required = [r["player_id"] for r in rows]
        if not required:
            return "tiertest_no_opponents", {"player": player_name, "kit": kit}

    cur = conn.execute(
        "INSERT INTO tiertests (player_id, kit, started_at, expires_at, status, current_tier, target_tier, mode, required_json) "
        "VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?) RETURNING id",
        (player_id, kit, _iso(now), _iso(now + timedelta(hours=C.TEST_WINDOW_HOURS)), current, target, mode,
         json.dumps(required) if required is not None else None),
    )
    test_id = cur.fetchone()["id"]
    conn.commit()
    return "tiertest_started", {
        "tiertest_id": test_id, "player": player_name, "kit": kit, "current_tier": current,
        "target_tier": target, "mode": mode, "ft": ft_for(kit), "expires_at": _iso(now + timedelta(hours=C.TEST_WINDOW_HOURS)),
        "required_opponents": len(required) if required is not None else None,
    }


# ==========================================
# ПОДСЧЁТ РАУНДОВ
# ==========================================

def on_round(conn, kit: str, winner_id: int, loser_id: int, now: Optional[datetime] = None) -> list:
    """Вызывается после КАЖДОЙ смерти в дуэли (тайм-ауты сюда не попадают).
    Возвращает список событий по активным тестам, которых коснулся раунд."""
    now = now or _now()
    expire_old(conn, now)
    events = []
    for tester_id, opponent_id, tester_won in ((winner_id, loser_id, True), (loser_id, winner_id, False)):
        test = conn.execute(
            "SELECT * FROM tiertests WHERE player_id = ? AND kit = ? AND status = 'active' AND expires_at > ?",
            (tester_id, kit, _iso(now)),
        ).fetchone()
        if test is not None:
            event = _count_round(conn, dict(test), opponent_id, tester_won, now)
            if event is not None:
                events.append(event)
    return events


def _relation_for(test: dict, opponent_tier: str, opponent_id: int) -> Optional[str]:
    if test["mode"] == "top":
        required = json.loads(test["required_json"] or "[]")
        return "top" if opponent_id in required else None
    opp_idx = tier_index(opponent_tier)
    if opp_idx is None:
        return None
    cur_idx = tier_index(test["current_tier"]) if test["current_tier"] else -1
    if test["current_tier"] and opp_idx == cur_idx:
        return "equal"
    if opp_idx == cur_idx + 1:
        return "higher"
    return None


def _slot_done(conn, test: dict, relation: str) -> bool:
    """Нужная игра уже зачтена (для 'single' - любая, для 'double' - своя по типу)."""
    if test["mode"] == "single":
        row = conn.execute("SELECT 1 FROM tiertest_games WHERE tiertest_id = ? AND status = 'passed'", (test["id"],)).fetchone()
    elif test["mode"] == "double":
        row = conn.execute("SELECT 1 FROM tiertest_games WHERE tiertest_id = ? AND relation = ? AND status = 'passed'",
                           (test["id"], relation)).fetchone()
    else:
        return False   # для 'top' слот - сам соперник, проверяется по opponent_id
    return row is not None


def _count_round(conn, test: dict, opponent_id: int, tester_won: bool, now: datetime) -> Optional[dict]:
    kit = test["kit"]
    tester_id = test["player_id"]
    opp_tier, opp_retired = get_rating(conn, opponent_id, kit)
    base = {"tiertest_id": test["id"], "player": _name(conn, tester_id), "opponent": _name(conn, opponent_id), "kit": kit}
    if opp_tier is None or opp_retired:
        return {**base, "event": "round_ignored", "reason": "у соперника нет активного ранга на ките"}

    relation = _relation_for(test, opp_tier, opponent_id)
    if relation is None:
        return {**base, "event": "round_ignored", "reason": "ранг соперника не подходит для теста"}

    game = conn.execute(
        "SELECT * FROM tiertest_games WHERE tiertest_id = ? AND opponent_id = ? AND status = 'open'", (test["id"], opponent_id)
    ).fetchone()
    if game is None:
        finished_same = conn.execute(
            "SELECT 1 FROM tiertest_games WHERE tiertest_id = ? AND opponent_id = ? AND status IN ('passed', 'failed', 'narrow')",
            (test["id"], opponent_id),
        ).fetchone()
        if finished_same is not None:
            return {**base, "event": "round_ignored", "reason": "игра с этим соперником в этом тесте уже сыграна"}
        if test["mode"] == "top":
            done = conn.execute("SELECT 1 FROM tiertest_games WHERE tiertest_id = ? AND opponent_id = ? AND status = 'passed'",
                                (test["id"], opponent_id)).fetchone()
            if done is not None:
                return {**base, "event": "round_ignored", "reason": "с этим соперником игра уже зачтена"}
        elif _slot_done(conn, test, relation):
            return {**base, "event": "round_ignored", "reason": "эта игра теста уже зачтена"}
        repeat = conn.execute(
            "SELECT 1 FROM tiertest_games g JOIN tiertests t ON t.id = g.tiertest_id "
            "WHERE t.player_id = ? AND t.kit = ? AND g.opponent_id = ? AND g.status = 'passed' AND g.updated_at > ?",
            (tester_id, kit, opponent_id, _iso(now - timedelta(days=C.REPEAT_OPPONENT_DAYS))),
        ).fetchone()
        if repeat is not None:
            return {**base, "event": "round_ignored", "reason": f"с этим игроком зачётная игра раз в {C.REPEAT_OPPONENT_DAYS} дней"}
        conn.execute(
            "INSERT INTO tiertest_games (tiertest_id, opponent_id, opponent_tier, relation, ft, status, updated_at) "
            "VALUES (?, ?, ?, ?, ?, 'open', ?)",
            (test["id"], opponent_id, opp_tier, relation, ft_for(kit), _iso(now)),
        )
        game = conn.execute("SELECT * FROM tiertest_games WHERE tiertest_id = ? AND opponent_id = ? AND status = 'open'",
                            (test["id"], opponent_id)).fetchone()

    wins_player = game["wins_player"] + (1 if tester_won else 0)
    wins_opponent = game["wins_opponent"] + (0 if tester_won else 1)
    ft = game["ft"]
    if wins_player < ft and wins_opponent < ft:
        conn.execute("UPDATE tiertest_games SET wins_player = ?, wins_opponent = ?, updated_at = ? WHERE id = ?",
                     (wins_player, wins_opponent, _iso(now), game["id"]))
        conn.commit()
        return {**base, "event": "round_counted", "score": f"{wins_player}:{wins_opponent}", "ft": ft, "relation": relation}

    status, penalty = evaluate_game(ft, game["relation"], wins_player, wins_opponent)
    conn.execute("UPDATE tiertest_games SET wins_player = ?, wins_opponent = ?, status = ?, penalty = ?, updated_at = ? WHERE id = ?",
                 (wins_player, wins_opponent, status, penalty, _iso(now), game["id"]))
    event = {**base, "event": "game_finished", "score": f"{wins_player}:{wins_opponent}", "ft": ft,
             "relation": game["relation"], "game_status": status, "penalty": penalty}
    event.update(_resolve_test(conn, test, opponent_id, wins_player, wins_opponent, status, penalty, now))
    conn.commit()
    return event


# ==========================================
# ИТОГ ТЕСТА: повышение, провал, штрафы, понижение
# ==========================================

def _history(conn, test: dict, opponent_id: int, score_p: int, score_o: int, tier_after: str, comment: str, now: datetime) -> None:
    winner = "player" if score_p > score_o else "opponent"
    conn.execute(
        "INSERT INTO pts_history (player_id, date, kit, tier_before, tier_after, opponent_name, score_player, score_opponent, "
        "winner, comment, is_player_side, normalized, raw_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NULL)",
        (test["player_id"], now.date().isoformat(), test["kit"], test["current_tier"], tier_after, _name(conn, opponent_id),
         score_p, score_o, winner, comment),
    )


def _required_all_passed(conn, test: dict) -> bool:
    if test["mode"] == "single":
        return conn.execute("SELECT 1 FROM tiertest_games WHERE tiertest_id = ? AND status = 'passed'", (test["id"],)).fetchone() is not None
    if test["mode"] == "double":
        rels = {r["relation"] for r in conn.execute(
            "SELECT DISTINCT relation FROM tiertest_games WHERE tiertest_id = ? AND status = 'passed'", (test["id"],)).fetchall()}
        return {"equal", "higher"} <= rels
    required = set(json.loads(test["required_json"] or "[]"))
    passed = {r["opponent_id"] for r in conn.execute(
        "SELECT opponent_id FROM tiertest_games WHERE tiertest_id = ? AND status = 'passed'", (test["id"],)).fetchall()}
    return required <= passed


def _close_test(conn, test_id: int, status: str, note: str, result_tier: Optional[str], now: datetime) -> None:
    conn.execute("UPDATE tiertest_games SET status = 'annulled', updated_at = ? WHERE tiertest_id = ? AND status = 'open'",
                 (_iso(now), test_id))
    conn.execute("UPDATE tiertests SET status = ?, finished_at = ?, result_note = ?, result_tier = ? WHERE id = ?",
                 (status, _iso(now), note, result_tier, test_id))
    _finished_ids.append(test_id)


def _add_penalty(conn, player_id: int, kit: str, points: float, now: datetime):
    """Добавляет штраф. Возвращает (сумма в цикле, ранг после понижения или None)."""
    row = conn.execute("SELECT points, first_penalty_date FROM pts_penalties WHERE player_id = ? AND kit = ?", (player_id, kit)).fetchone()
    total, first = points, now.date().isoformat()
    if row is not None and (now.date() - datetime.fromisoformat(row["first_penalty_date"]).date()).days <= C.PENALTY_CYCLE_DAYS:
        total += row["points"]
        first = row["first_penalty_date"]
    if total >= C.DEMOTION_POINTS:
        current, _ = get_rating(conn, player_id, kit)
        idx = tier_index(current)
        demoted = LADDER[idx - 1] if idx is not None and idx > 0 else None
        if demoted:
            set_rating(conn, player_id, kit, demoted, now)
        conn.execute("DELETE FROM pts_penalties WHERE player_id = ? AND kit = ?", (player_id, kit))
        return total, demoted
    conn.execute(
        "INSERT INTO pts_penalties (player_id, kit, points, first_penalty_date) VALUES (?, ?, ?, ?) "
        "ON CONFLICT (player_id, kit) DO UPDATE SET points = excluded.points, first_penalty_date = excluded.first_penalty_date",
        (player_id, kit, total, first),
    )
    return total, None


def _finalize_failure(conn, test: dict, now: datetime, note: str) -> dict:
    """Тест провален. Штраф - за матч, на котором игрок проиграл (за последний проваленный;
    пройденные игры теста штрафа не дают). Понижение - если за цикл набралось 2.0; в итоговом
    посте оно показывается как матчи теста, а не как "2/2 штрафных очка"."""
    player_id, kit = test["player_id"], test["kit"]
    last = conn.execute(
        "SELECT * FROM tiertest_games WHERE tiertest_id = ? AND status = 'failed' ORDER BY id DESC LIMIT 1", (test["id"],)
    ).fetchone()
    penalty, total, demoted = 0.0, None, None
    if last is not None and last["penalty"] > 0:
        penalty = last["penalty"]
        total, demoted = _add_penalty(conn, player_id, kit, penalty, now)
    result_tier = demoted or test["current_tier"]
    if conn.execute("SELECT 1 FROM tiertest_games WHERE tiertest_id = ? AND status IN ('failed', 'narrow')", (test["id"],)).fetchone():
        game = last or conn.execute("SELECT * FROM tiertest_games WHERE tiertest_id = ? ORDER BY id DESC LIMIT 1", (test["id"],)).fetchone()
        _history(conn, test, game["opponent_id"], game["wins_player"], game["wins_opponent"], result_tier,
                 "тиртест провален" + (" (понижение)" if demoted else ""), now)
    _close_test(conn, test["id"], "failed", note, result_tier, now)
    return {"test_result": "demoted" if demoted else "failed", "penalty": penalty, "penalty_total": total, "demoted_to": demoted}


def _resolve_test(conn, test: dict, opponent_id: int, score_p: int, score_o: int, status: str, penalty: float, now: datetime) -> dict:
    player_id, kit = test["player_id"], test["kit"]
    if status == "passed":
        if _required_all_passed(conn, test):
            # Ранг получен: штрафы за проваленные игры этого теста не начисляются
            set_rating(conn, player_id, kit, test["target_tier"], now)
            conn.execute("DELETE FROM pts_penalties WHERE player_id = ? AND kit = ?", (player_id, kit))
            _history(conn, test, opponent_id, score_p, score_o, test["target_tier"], "тиртест пройден", now)
            _close_test(conn, test["id"], "passed", f"повышение до {test['target_tier']}", test["target_tier"], now)
            return {"test_result": "passed", "new_tier": test["target_tier"]}
        _history(conn, test, opponent_id, score_p, score_o, test["current_tier"], "игра теста зачтена", now)
        return {"test_result": "continues"}

    # Поражение или слишком узкая победа: тест закрывается сразу. Штраф - только за этот
    # (последний) проваленный матч; пройденные игры штрафов не дают.
    return _finalize_failure(conn, test, now, "поражение" if status == "failed" else "победа поуже нужного счёта")
