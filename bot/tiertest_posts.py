"""
Итоговые посты о тиртестах для Telegram (только текст, HTML, всё жирным, ники - ссылки
на профиль игрока на сайте).

Три вида заголовка:
  получает <Кит> <Ранг>       - тест пройден
  проваливает <Кит> <Ранг>    - тест провален (ранг тот, на который шёл тест), понижения нет
  понижается до <Кит> <Ранг>  - тест провален и набрано 2.0 штрафа: понижение на ранг

Поединки группируются по рангу соперника ("Против High Tier 3"); понижение показывается
матчами теста, а не фразой "получено 2/2 штрафных очка".
"""

import html
import os
from urllib.parse import quote

import tiertest as T

# Ссылка на профиль: {nick} подставляется (кодируется). Сайт должен открывать профиль по #player/ник.
PROFILE_URL = os.environ.get("SITE_PROFILE_URL", "https://zor1kww.github.io/MultiCraftCISTiers/#player/{nick}")

_TIER_WORDS = {"HT": "High Tier", "MT": "Middle Tier", "LT": "Low Tier"}
SEPARATOR = "\u2501" * 14


def tier_title(tier: str) -> str:
    """'HT3' -> 'High Tier 3'."""
    return f"{_TIER_WORDS.get(tier[:2], tier[:2])} {tier[2:]}"


def _link(name: str) -> str:
    url = PROFILE_URL.format(nick=quote(name, safe=""))
    return f'<a href="{html.escape(url, quote=True)}">{html.escape(name)}</a>'


def average_tier(conn, player_id: int) -> str:
    """Средний ранг игрока по всем китам (main и sub, Retired тоже входит), округление вверх
    от .5. 'Unranked', если рангов нет."""
    rows = conn.execute("SELECT tier FROM pts_ratings WHERE player_id = ?", (player_id,)).fetchall()
    idxs = [T.tier_index(r["tier"]) for r in rows if T.tier_index(r["tier"]) is not None]
    if not idxs:
        return "Unranked"
    return T.LADDER[int(sum(idxs) / len(idxs) + 0.5)]


def build_post(conn, tiertest_id: int):
    """(html_текст, is_high) для завершённого теста или None, если постить нечего."""
    test = conn.execute(
        "SELECT t.*, p.name AS player_name FROM tiertests t JOIN players p ON p.id = t.player_id WHERE t.id = ?", (tiertest_id,)
    ).fetchone()
    if test is None or test["status"] not in ("passed", "failed"):
        return None
    test = dict(test)

    kit = test["kit"]
    if test["status"] == "passed":
        action = f"получает {kit} {tier_title(test['target_tier'])}"
    elif test["result_tier"] and test["result_tier"] != test["current_tier"]:
        action = f"понижается до {kit} {tier_title(test['result_tier'])}"
    else:
        action = f"проваливает {kit} {tier_title(test['target_tier'])}"

    games = conn.execute(
        "SELECT g.*, o.name AS opponent_name FROM tiertest_games g JOIN players o ON o.id = g.opponent_id "
        "WHERE g.tiertest_id = ? AND g.status IN ('passed', 'failed', 'narrow') ORDER BY g.id",
        (tiertest_id,),
    ).fetchall()
    groups = {}
    for g in games:
        groups.setdefault(g["opponent_tier"], []).append(g)

    player = _link(test["player_name"])
    lines = [f"<b>{player} {html.escape(action)}</b>", "", "<b>Поединки:</b>"]
    for tier in sorted(groups, key=lambda x: T.tier_index(x) if T.tier_index(x) is not None else -1):
        lines += ["", f"<b>\u25b8 Против {tier_title(tier)}</b>"]
        for g in groups[tier]:
            lines.append(f"<b>{player}  {g['wins_player']}:{g['wins_opponent']}  {_link(g['opponent_name'])}</b>")
    lines += ["", f"<b>{SEPARATOR}</b>", f"<b>Текущий средний ранг: {average_tier(conn, test['player_id'])}</b>"]

    high_idx = T.tier_index("HT3")
    top = max(T.tier_index(test["current_tier"]) if test["current_tier"] else -1,
              T.tier_index(test["result_tier"] or test["target_tier"]) or -1,
              T.tier_index(test["target_tier"]) or -1)
    return "\n".join(lines), top >= high_idx
