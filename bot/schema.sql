-- Схема для Turso (libSQL, SQLite-совместимый диалект).
-- Четыре таблицы: players, player_ratings, matches, disconnect_timers.
-- Антиабуз-счётчик отдельной таблицы не требует - считается запросом
-- к matches по индексу (см. idx_matches_pair_window ниже).

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS players (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL UNIQUE COLLATE NOCASE,
    region      TEXT,
    created_at  TEXT NOT NULL,
    -- Устройство, выставляется админами командой set_device: 'PC' или
    -- 'MOBILE'; NULL = не отмечен (считается мобильным).
    device      TEXT,
    -- 1 = скрыт из топа админом (remove_player): твинк, пкшер и т.п.
    removed     INTEGER NOT NULL DEFAULT 0
);

-- Эло отдельно по каждому киту (не общее на игрока). Строка создаётся
-- лениво при первом матче игрока на этом ките, со стартовым эло 1000.
CREATE TABLE IF NOT EXISTS player_ratings (
    player_id   INTEGER NOT NULL REFERENCES players(id),
    kit         TEXT NOT NULL,
    elo         REAL NOT NULL DEFAULT 1000,
    updated_at  TEXT NOT NULL,
    PRIMARY KEY (player_id, kit)
);

-- Один матч = одна строка (а не две зеркальные записи на двух игроков,
-- как было в старой системе тестов - дедуплицировать тут нечего).
-- pair_low_id/pair_high_id = min/max(player_a_id, player_b_id) - так
-- антиабуз-запрос по паре не зависит от того, кто на чьей стороне, и
-- может использовать простой индекс без OR.
CREATE TABLE IF NOT EXISTS matches (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    kit                 TEXT NOT NULL,
    player_a_id         INTEGER NOT NULL REFERENCES players(id),
    player_b_id         INTEGER NOT NULL REFERENCES players(id),
    pair_low_id         INTEGER NOT NULL REFERENCES players(id),
    pair_high_id        INTEGER NOT NULL REFERENCES players(id),
    -- 'cancelled' - матч аннулирован БЕЗ начисления эло (не ошибка, а
    -- штатный исход): например, у одного из игроков уже была другая
    -- активная дуэль, когда сервер объявил новую - значит, по старой
    -- дуэли мы пропустили сообщение (смерть/дисконнект), пока бот был
    -- недоступен, и её нужно аннулировать, а не держать "подвисшей"
    -- вечно. cancelled-матчи не попадают в player_ratings и не
    -- учитываются в антиабуз-окне (там фильтр status='finished').
    status              TEXT NOT NULL CHECK (status IN ('active', 'finished', 'cancelled')),
    started_at          TEXT NOT NULL,
    finished_at         TEXT,
    winner_id           INTEGER REFERENCES players(id),
    loser_id            INTEGER REFERENCES players(id),
    end_reason          TEXT CHECK (end_reason IN ('death', 'timeout', 'superseded', 'stale_on_restart')),
    -- эло ДО матча фиксируется в момент СТАРТА (не пересчитывается
    -- задним числом), после - в момент закрытия.
    player_a_elo_before REAL NOT NULL,
    player_b_elo_before REAL NOT NULL,
    winner_elo_after    REAL,
    loser_elo_after     REAL,
    winner_delta        INTEGER,
    loser_delta         INTEGER,
    k_winner            INTEGER,
    k_loser             INTEGER,
    m_factor            REAL,
    prior_duels_count   INTEGER,
    CHECK (player_a_id != player_b_id)
);

-- Активные 3-минутные окна ожидания возврата после дисконнекта.
-- Строка удаляется при возврате игрока (таймер отменяется) или когда
-- по ней засчитывается автопоражение.
CREATE TABLE IF NOT EXISTS disconnect_timers (
    match_id        INTEGER NOT NULL REFERENCES matches(id),
    player_id       INTEGER NOT NULL REFERENCES players(id),
    disconnected_at TEXT NOT NULL,
    PRIMARY KEY (match_id, player_id)
);

-- Найти активный матч, в котором участвует игрок (физически у игрока
-- может быть только один одновременно).
CREATE INDEX IF NOT EXISTS idx_matches_active_a ON matches(player_a_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_active_b ON matches(player_b_id, status);

-- Антиабуз: число завершённых матчей пары в ките за окно времени.
CREATE INDEX IF NOT EXISTS idx_matches_pair_window
    ON matches(kit, pair_low_id, pair_high_id, finished_at)
    WHERE status = 'finished';

-- Для свипа просроченных таймеров (поиск "кого пора автозасчитать").
CREATE INDEX IF NOT EXISTS idx_disconnect_timers_time ON disconnect_timers(disconnected_at);

-- Настройки, которые админ меняет из Telegram-панели (ключ-значение).
CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Журнал ручных действий админов из Telegram-панели.
CREATE TABLE IF NOT EXISTS admin_log (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    ts       TEXT NOT NULL,
    admin_id TEXT NOT NULL,
    action   TEXT NOT NULL,
    details  TEXT NOT NULL
);

-- ==========================================
-- PTS (киты): ранги, штрафы, история. Перенесено из players.js.
-- Elo-таблицы выше (player_ratings, matches...) остаются как архив и не используются.
-- ==========================================

-- Текущий ранг игрока на ките.
CREATE TABLE IF NOT EXISTS pts_ratings (
    player_id          INTEGER NOT NULL REFERENCES players(id),
    kit                TEXT NOT NULL,
    tier               TEXT NOT NULL,
    set_date           TEXT NOT NULL,
    retired            INTEGER NOT NULL DEFAULT 0,
    retired_changed_at TEXT,
    PRIMARY KEY (player_id, kit)
);

-- Штрафные очки по киту (цикл 30 дней, понижение при 2.0).
CREATE TABLE IF NOT EXISTS pts_penalties (
    player_id          INTEGER NOT NULL REFERENCES players(id),
    kit                TEXT NOT NULL,
    points             REAL NOT NULL,
    first_penalty_date TEXT NOT NULL,
    PRIMARY KEY (player_id, kit)
);

-- История результатов тестов (старый формат "tester" приведён к "opponent").
CREATE TABLE IF NOT EXISTS pts_history (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id      INTEGER NOT NULL REFERENCES players(id),
    date           TEXT NOT NULL,
    kit            TEXT NOT NULL,
    tier_before    TEXT,
    tier_after     TEXT,
    opponent_name  TEXT,
    score_player   INTEGER,
    score_opponent INTEGER,
    winner         TEXT CHECK (winner IN ('player', 'opponent')),
    comment        TEXT,
    is_player_side INTEGER,
    normalized     INTEGER NOT NULL DEFAULT 0,
    raw_json       TEXT
);
CREATE INDEX IF NOT EXISTS idx_pts_history_player ON pts_history (player_id, date);

-- ==========================================
-- Тиртесты (команда \tiertest КИТ): сам тест и счётчики игр с каждым соперником.
-- ==========================================
CREATE TABLE IF NOT EXISTS tiertests (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id      INTEGER NOT NULL REFERENCES players(id),
    kit            TEXT NOT NULL,
    started_at     TEXT NOT NULL,
    expires_at     TEXT NOT NULL,
    status         TEXT NOT NULL CHECK (status IN ('active', 'passed', 'failed', 'expired')),
    current_tier   TEXT,
    target_tier    TEXT NOT NULL,
    mode           TEXT NOT NULL CHECK (mode IN ('single', 'double', 'top')),
    required_json  TEXT,
    finished_at    TEXT,
    result_note    TEXT,
    result_tier    TEXT
);
CREATE INDEX IF NOT EXISTS idx_tiertests_player ON tiertests (player_id, kit, started_at);

-- Игра до ft побед с одним соперником. Раунды копятся в wins_*, пока кто-то не дойдёт до ft.
CREATE TABLE IF NOT EXISTS tiertest_games (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    tiertest_id   INTEGER NOT NULL REFERENCES tiertests(id),
    opponent_id   INTEGER NOT NULL REFERENCES players(id),
    opponent_tier TEXT,
    relation      TEXT NOT NULL CHECK (relation IN ('equal', 'higher', 'top')),
    ft            INTEGER NOT NULL,
    wins_player   INTEGER NOT NULL DEFAULT 0,
    wins_opponent INTEGER NOT NULL DEFAULT 0,
    status        TEXT NOT NULL CHECK (status IN ('open', 'passed', 'narrow', 'failed', 'annulled')),
    penalty       REAL NOT NULL DEFAULT 0,
    updated_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tiertest_games_test ON tiertest_games (tiertest_id, opponent_id);
