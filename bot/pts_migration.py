"""
Перенос PTS из players.js в Turso (таблицы pts_ratings, pts_history).

Решения:
  - Штрафные очки НЕ переносятся (аннулированы по решению админа).
  - Регионы СНГ приводятся к частям света (regions.LEGACY_REGION_TO_WORLD; Центральная Азия - AS).
  - История приводится к единому формату: поле "tester" -> opponent, scoreTester ->
    scoreOpponent, winner "tester" -> "opponent"; счёт, не подходящий под формат
    матча, подгоняется (см. normalize_history_entry). Дубли записей отбрасываются.
  - Elo-таблицы не трогаются.

Запуск:
  - режим "report": ничего не пишет в базу, печатает отчёт (по умолчанию);
  - режим "apply": пишет в базу один раз (ставит отметку в таблице settings; повторный
    запуск без force=True отказывается, чтобы не затереть новые ранги).

На Render: переменная PTS_MIGRATE=report или apply (читается при старте бота),
путь к файлу в PTS_PLAYERS_JS (по умолчанию players/players.js).
"""

import hashlib
import json
import os
import re
from collections import Counter
from datetime import datetime, timezone

import db
from regions import legacy_to_world

# Форматы матчей: до скольких побед. Старые - как было в bot_config.py, новые - по
# решению админа (Diamond Pot теперь FT6, Combo и Gapple теперь FT4).
OLD_FT2_KITS = {"Combo", "Gapple"}
OLD_FT6_KITS = {"Dragonhide", "Beast", "Emerald"}
NEW_FT6_KITS = {"Diamond Pot", "Beast", "Emerald", "Dragonhide"}

MIGRATION_MARKER = "pts_migrated_at"


# ==========================================
# РАЗБОР players.js (без Node: Render запускает только Python)
# ==========================================

def js_to_json(text: str) -> str:
    """Превращает `const players = [ ... ];` с ключами без кавычек в JSON.
    Строки в двойных кавычках не трогаем, комментарии и висящие запятые убираем."""
    start = text.index("[")
    end = text.rindex("]") + 1
    src = text[start:end]
    out = []
    i, n = 0, len(src)
    while i < n:
        c = src[i]
        if c == '"':                                  # строка - копируем целиком
            j = i + 1
            while j < n:
                if src[j] == "\\":
                    j += 2
                    continue
                if src[j] == '"':
                    break
                j += 1
            out.append(src[i:j + 1])
            i = j + 1
        elif c == "'":                                # одинарные кавычки -> двойные
            j = i + 1
            while j < n and src[j] != "'":
                j += 2 if src[j] == "\\" else 1
            out.append(json.dumps(src[i + 1:j]))
            i = j + 1
        elif src.startswith("//", i):                 # однострочный комментарий
            while i < n and src[i] != "\n":
                i += 1
        elif src.startswith("/*", i):                 # блочный комментарий
            i = src.index("*/", i) + 2
        elif c.isalpha() or c in "_$":                # возможный ключ без кавычек / true / false / null
            j = i
            while j < n and (src[j].isalnum() or src[j] in "_$"):
                j += 1
            word = src[i:j]
            k = j
            while k < n and src[k] in " \t\r\n":
                k += 1
            if k < n and src[k] == ":" and word not in ("true", "false", "null"):
                out.append(json.dumps(word))
            else:
                out.append(word)
            i = j
        else:
            out.append(c)
            i += 1
    result = "".join(out)
    return re.sub(r",(\s*[}\]])", r"\1", result)       # висящие запятые


def parse_players_js(text: str) -> list:
    return json.loads(js_to_json(text))


# ==========================================
# ПРИВЕДЕНИЕ ИСТОРИИ К ЕДИНОМУ ФОРМАТУ
# ==========================================

def _ft_cap(kit: str) -> int:
    """Максимально допустимый счёт одной стороны: берём больший из старого и нового
    формата, чтобы корректные старые записи (например FT2 у Combo) остались как есть."""
    old = 2 if kit in OLD_FT2_KITS else 6 if kit in OLD_FT6_KITS else 4
    new = 6 if kit in NEW_FT6_KITS else 4
    return max(old, new)


def _as_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def normalize_history_entry(entry: dict):
    """
    Возвращает (запись в новом формате, список причин правок).
    Правки (счёт "не важен", главное единый вид):
      - счёт выше формата матча: победитель получает максимум, проигравший не больше максимума-1;
      - победитель не совпадает со счётом: переворачиваем счёт (чаще всего его просто перепутали);
      - равный счёт: победителю добавляем очко (в пределах формата).
    """
    reasons = []
    kit = entry.get("kit", "")
    cap = _ft_cap(kit)

    winner_raw = entry.get("winner")
    winner = "opponent" if winner_raw in ("tester", "opponent") else "player"
    if winner_raw == "tester":
        reasons.append("tester->opponent")

    opponent = entry.get("opponent") or entry.get("tester")
    score_player = _as_int(entry.get("scorePlayer"))
    score_opponent = _as_int(entry.get("scoreOpponent") if entry.get("scoreOpponent") is not None else entry.get("scoreTester"))
    if score_player is None or score_player < 0:
        score_player = 0
        reasons.append("счёт игрока отсутствовал")
    if score_opponent is None or score_opponent < 0:
        score_opponent = 0
        reasons.append("счёт соперника отсутствовал")

    w_score, l_score = (score_player, score_opponent) if winner == "player" else (score_opponent, score_player)

    if score_player != score_opponent and w_score < l_score:      # победитель не совпал со счётом
        w_score, l_score = l_score, w_score
        reasons.append("счёт перевёрнут по победителю")
    if w_score > cap or l_score > cap:
        w_score = cap
        l_score = min(l_score, cap - 1)
        reasons.append(f"счёт выше формата (до {cap})")
    if w_score <= l_score:                                         # ничья или победитель не впереди
        w_score = min(cap, l_score + 1)
        if w_score <= l_score:
            l_score = w_score - 1
        reasons.append("равный счёт")

    score_player, score_opponent = (w_score, l_score) if winner == "player" else (l_score, w_score)

    normalized = {
        "date": entry.get("date"),
        "kit": kit,
        "tier_before": entry.get("tierBefore"),
        "tier_after": entry.get("tierAfter"),
        "opponent_name": opponent,
        "score_player": score_player,
        "score_opponent": score_opponent,
        "winner": winner,
        "comment": entry.get("comment"),
        "is_player_side": None if entry.get("isPlayerSide") is None else int(bool(entry.get("isPlayerSide"))),
    }
    return normalized, reasons


def _history_key(player_name: str, entry: dict) -> str:
    """Ключ для поиска дублей: одна и та же запись, внесённая дважды."""
    parts = [player_name.lower(), entry.get("date"), entry.get("kit"), entry.get("tierBefore"), entry.get("tierAfter"),
             entry.get("opponent") or entry.get("tester"), entry.get("scorePlayer"),
             entry.get("scoreOpponent") if entry.get("scoreOpponent") is not None else entry.get("scoreTester"),
             entry.get("winner")]
    return json.dumps(parts, ensure_ascii=False, sort_keys=True)


# ==========================================
# ПЛАН ПЕРЕНОСА
# ==========================================

def build_plan(players: list) -> dict:
    """Собирает всё, что будет записано, и отчёт об аномалиях. В базу не пишет."""
    plan = {"players": [], "report": {}}
    region_counter = Counter()
    unmapped_regions = []
    normalized_reasons = Counter()
    duplicates = 0
    ratings_total = history_total = penalties_dropped = penalty_players_dropped = 0
    normalized_total = 0

    for player in players:
        name = player["name"]
        region_raw = player.get("region") or ""
        region_world = legacy_to_world(region_raw)
        if region_raw and region_world is None:
            unmapped_regions.append((name, region_raw))
        region_counter[region_world or "—"] += 1

        ratings = []
        for kit, data in (player.get("tiers") or {}).items():
            if isinstance(data, str):
                data = {"tier": data}
            ratings.append({
                "kit": kit,
                "tier": data["tier"],
                "set_date": data.get("date") or "2026-01-01",
                "retired": 1 if data.get("retired") else 0,
            })
        ratings_total += len(ratings)

        history, seen = [], set()
        for entry in player.get("matchHistory") or []:
            key = _history_key(name, entry)
            if key in seen:
                duplicates += 1
                continue
            seen.add(key)
            normalized, reasons = normalize_history_entry(entry)
            normalized["normalized"] = 1 if [r for r in reasons if r != "tester->opponent"] else 0
            normalized["raw_json"] = json.dumps(entry, ensure_ascii=False, sort_keys=True)
            if normalized["normalized"]:
                normalized_total += 1
            for r in reasons:
                normalized_reasons[r] += 1
            history.append(normalized)
        history_total += len(history)

        pen = player.get("penaltyByKit") or {}
        if pen:
            penalty_players_dropped += 1
            penalties_dropped += len(pen)

        plan["players"].append({"name": name, "region_world": region_world, "ratings": ratings, "history": history})

    plan["report"] = {
        "players": len(players),
        "ratings": ratings_total,
        "history_written": history_total,
        "history_duplicates_dropped": duplicates,
        "history_normalized": normalized_total,
        "history_fix_reasons": dict(normalized_reasons),
        "penalties_annulled": penalties_dropped,
        "penalty_players": penalty_players_dropped,
        "regions": dict(region_counter),
        "unmapped_regions": unmapped_regions,
    }
    return plan


# ==========================================
# ЗАПИСЬ В БАЗУ
# ==========================================

def already_migrated(conn) -> bool:
    row = conn.execute("SELECT value FROM settings WHERE key = ?", (MIGRATION_MARKER,)).fetchone()
    return row is not None


def apply_plan(conn, plan: dict, force: bool = False) -> dict:
    """Записывает план в Turso. Повторно не запускается (иначе затёрлись бы новые ранги)."""
    if already_migrated(conn) and not force:
        raise RuntimeError("Перенос PTS уже выполнен (отметка в settings). Чтобы повторить, нужен force=True.")

    written = {"players_created": 0, "ratings": 0, "history": 0, "regions_set": 0}
    for p in plan["players"]:
        existing = db.find_player_id(conn, p["name"])
        player_id = existing if existing is not None else db.get_or_create_player(conn, p["name"])
        if existing is None:
            written["players_created"] += 1

        # Регион: уже мировой код (поставлен через \set_region) оставляем, иначе - из players.js
        row = conn.execute("SELECT region FROM players WHERE id = ?", (player_id,)).fetchone()
        current = legacy_to_world(row["region"]) if row is not None else None
        target = current or p["region_world"]
        if target and (row is None or row["region"] != target):
            db.set_player_region(conn, player_id, target)
            written["regions_set"] += 1

        for r in p["ratings"]:
            conn.execute(
                "INSERT INTO pts_ratings (player_id, kit, tier, set_date, retired) VALUES (?, ?, ?, ?, ?) "
                "ON CONFLICT (player_id, kit) DO UPDATE SET tier = excluded.tier, set_date = excluded.set_date, retired = excluded.retired",
                (player_id, r["kit"], r["tier"], r["set_date"], r["retired"]),
            )
            written["ratings"] += 1

        for h in p["history"]:
            exists = conn.execute(
                "SELECT 1 FROM pts_history WHERE player_id = ? AND raw_json = ?", (player_id, h["raw_json"])
            ).fetchone()
            if exists is not None:
                continue
            conn.execute(
                "INSERT INTO pts_history (player_id, date, kit, tier_before, tier_after, opponent_name, "
                "score_player, score_opponent, winner, comment, is_player_side, normalized, raw_json) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (player_id, h["date"], h["kit"], h["tier_before"], h["tier_after"], h["opponent_name"],
                 h["score_player"], h["score_opponent"], h["winner"], h["comment"], h["is_player_side"],
                 h["normalized"], h["raw_json"]),
            )
            written["history"] += 1
        conn.commit()

    # Игроки, у которых в Turso остался старый код страны (поставили через \set_region до смены)
    rows = conn.execute("SELECT id, region FROM players WHERE region IS NOT NULL").fetchall()
    for row in rows:
        world = legacy_to_world(row["region"])
        if world and row["region"] != world:
            db.set_player_region(conn, row["id"], world)
            written["regions_set"] += 1

    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value",
        (MIGRATION_MARKER, datetime.now(timezone.utc).isoformat()),
    )
    conn.commit()
    return written


def format_report(report: dict) -> str:
    lines = [
        f"Игроков: {report['players']}, рангов (игрок+кит): {report['ratings']}",
        f"История: к записи {report['history_written']}, дублей отброшено {report['history_duplicates_dropped']}, "
        f"подогнано под формат {report['history_normalized']}",
        f"Причины правок: {report['history_fix_reasons']}",
        f"Штрафы аннулированы: {report['penalties_annulled']} записей у {report['penalty_players']} игроков",
        f"Регионы после перевода в части света: {report['regions']}",
    ]
    if report["unmapped_regions"]:
        lines.append(f"Регион не распознан (будет пустым): {report['unmapped_regions']}")
    return "\n".join(lines)


def run_from_env(conn) -> None:
    """Вызывается при старте бота: PTS_MIGRATE=report|apply. Ошибки не роняют бота."""
    mode = os.environ.get("PTS_MIGRATE", "").strip().lower()
    if mode not in ("report", "apply"):
        return
    path = os.environ.get("PTS_PLAYERS_JS", "players/players.js")
    try:
        with open(path, encoding="utf-8") as f:
            plan = build_plan(parse_players_js(f.read()))
        print("[pts-migration] отчёт:\n" + format_report(plan["report"]))
        if mode == "apply":
            if already_migrated(conn):
                print("[pts-migration] уже выполнено раньше - запись пропущена (отметка в settings)")
            else:
                print(f"[pts-migration] записано: {apply_plan(conn, plan)}")
    except Exception as e:
        print(f"[pts-migration] ошибка: {e}")
