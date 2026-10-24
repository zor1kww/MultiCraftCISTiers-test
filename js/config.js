// Конфигурация путей к иконкам предметов
const kitImages = {
    "Hardcore": "assets/logos/hardcore.png",
    "Manhunt": "assets/logos/manhunt.png",
    "Diamond Pot": "assets/logos/diamond.png",
    "Vanilla": "assets/logos/vanilla.png",
    "Beast": "assets/logos/beast.png",
    "Emerald": "assets/logos/emerald.png",
    "Emerald Pot": "assets/logos/emerald_pot.png",
    "RVM": "assets/logos/rvm.png",
    "Dragonhide": "assets/logos/dragonhide.png",
    "Pickaxe": "assets/logos/pickaxe.png",
    "SMP": "assets/logos/smp.png",
    "Combo": "assets/logos/combo.png",
    "Gapple": "assets/logos/gapple.png",
    "Mace": "assets/logos/mace.png",
    "Crystal": "assets/logos/crystal.png"
};

// ==========================================
// ЭЛО И РАНГИ
// ==========================================

// Стартовое Elo игрока на каждом ките (= нижняя граница ранга C-).
const STARTING_ELO = 1000;

// 10 рангов от сильного к слабому: S, A+, A-, B+, B-, C+, C-, D+, D-, F.
// Ранг НЕ хранится в базе - он всегда вычисляется из Elo по этой таблице
// (min - нижняя граница диапазона). ЧЕРНОВАЯ ШКАЛА: пороги и K-фактор можно
// менять здесь, остальной сайт подстроится сам. На боте та же таблица
// должна лежать в TIER_TABLE (elo.py).
// Цвета - hex-значениями (а не "gold"/"silver"), потому что код сайта
// дописывает к цвету прозрачность (например, color + "44").
const eloTiers = [
    { tier: 'S',  min: 2000, k: 12, color: '#FFD700' },

    { tier: 'A+', min: 1800, k: 14, color: '#FF8C42' },
    { tier: 'A-', min: 1600, k: 16, color: '#E07B39' },

    { tier: 'B+', min: 1450, k: 18, color: '#C0C0C0' },
    { tier: 'B-', min: 1300, k: 22, color: '#A9A9A9' },

    { tier: 'C+', min: 1150, k: 24, color: '#CD7F32' },
    { tier: 'C-', min: 1000, k: 32, color: '#A0522D' },

    { tier: 'D+', min: 850,  k: 36, color: '#2BA39B' },
    { tier: 'D-', min: 650,  k: 40, color: '#1F7A74' },

    { tier: 'F',  min: 0,    k: 40, color: '#5F6B7A' }
];

// Retired: доступен с этого ранга и выше (эло от этого значения).
// Правила (показываются в "Другая информация"): по каждому киту отдельно,
// автоматически после 60 дней без дуэлей на ките, вручную командами
// retire / unretire кит, повторный вход и выход - не чаще раза в неделю.
const RETIRED_MIN_ELO = 1300;   // B-
const RETIRED_INACTIVE_DAYS = 60;

// Цветовая палитра рангов (для рамок и текста) - строится из таблицы выше
const tierColors = { Unranked: '#444b66' };
eloTiers.forEach(t => { tierColors[t.tier] = t.color; });

// Как считать Elo в общем топе (Main/Sub Overall):
//   'sum' - сумма Elo по китам (прямая замена прежних очков: чем больше
//           китов сыграно и чем выше Elo, тем выше место);
//   'avg' - среднее Elo по сыгранным китам (оценивает уровень, а не
//           количество китов).
const overallEloMode = 'sum';

// Списки основных и дополнительных режимов
const maintiers = ["Hardcore", "Manhunt", "Diamond Pot", "Beast", "Emerald", "Emerald Pot", "RVM", "Dragonhide", "Pickaxe", "SMP", "Vanilla"];
const subtiers = ["Combo", "Gapple", "Mace", "Crystal"];

// ==========================================
// ДАННЫЕ ИГРОКОВ (API бота)
// ==========================================

// Адрес сервиса бота на Render: оттуда сайт забирает данные игроков
// (GET /api/players). Сайт лежит на GitHub Pages, поэтому адрес нужен полный.
// Для локальной проверки вместе с ботом можно оставить пустую строку ''.
const API_BASE_URL = 'https://multicraftcistiers.onrender.com';

// Как часто сайт перезапрашивает данные, пока вкладка открыта (секунды)
const PLAYERS_REFRESH_SECONDS = 60;

// ==========================================
// BETA ELO: ПОКАЗ ИГРОКОВ
// ==========================================

// Elo-система только запущена, поэтому в Beta Elo пока никого не показываем
// (сайт при этом даже не обращается к боту). Когда будете готовы открыть
// рейтинг - поставьте true, данные пойдут из API как раньше.
const BETA_SHOW_PLAYERS = false;


// ==========================================
// СТРУКТУРА РЕЙТИНГА: Elo -> PvP Duels / Mini-Games
// ==========================================

// Мини-игры раздела Mini-Games (список будет расширяться).
const miniGames = [
    "BedWars", "SkyWars", "BedrockBox", "Spleef", "Pillars",
    "Sumo", "Bed Fight", "Fireball Fight", "SkyWars Duel", "The Bridge"
];

// ==========================================
// ДЕМО-РЕЖИМ (только для макета)
// ==========================================

// true: сайт не обращается к API, а показывает демонстрационных игроков из
// js/demo-data.js - чтобы оценить внешний вид новых рангов и Retired.
// В боевой версии должно быть false (или строка удалена).
const DEMO_MODE = true;
