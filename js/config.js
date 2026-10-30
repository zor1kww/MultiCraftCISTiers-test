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

// Стартовое Elo игрока на каждом ките (= нижняя часть HT5).
const STARTING_ELO = 1000;

// 15 рангов от сильного к слабому. Ранг НЕ хранится в базе - он всегда
// вычисляется из Elo по этой таблице (min - нижняя граница диапазона).
// ВАЖНО: таблица должна совпадать с TIER_TABLE в elo.py на боте
// (там же K-фактор: у новичка выше, у топов ниже).
// Цвета записаны hex-значениями (а не "gold"/"silver"), потому что код
// сайта дописывает к цвету прозрачность (например, color + "44").
const eloTiers = [
    { tier: 'HT1', min: 2250, k: 8,  color: '#FFD700' },
    { tier: 'MT1', min: 2100, k: 10, color: '#ECCE10' },
    { tier: 'LT1', min: 1950, k: 12, color: '#DAA520' },

    { tier: 'HT2', min: 1850, k: 12, color: '#C0C0C0' },
    { tier: 'MT2', min: 1750, k: 14, color: '#B4B4B4' },
    { tier: 'LT2', min: 1650, k: 16, color: '#A9A9A9' },

    { tier: 'HT3', min: 1550, k: 16, color: '#A0522D' },
    { tier: 'MT3', min: 1450, k: 18, color: '#964B20' },
    { tier: 'LT3', min: 1350, k: 20, color: '#8B4513' },

    { tier: 'HT4', min: 1250, k: 22, color: '#808080' },
    { tier: 'MT4', min: 1150, k: 24, color: '#757575' },
    { tier: 'LT4', min: 1050, k: 28, color: '#696969' },

    { tier: 'HT5', min: 1000, k: 32, color: '#008080' },
    { tier: 'MT5', min: 950,  k: 36, color: '#186868' },
    { tier: 'LT5', min: 0,    k: 40, color: '#2F4F4F' }
];

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
const BETA_SHOW_PLAYERS = true;

// Мини-игры имеют собственный Elo и не смешиваются с PTS-китами.
// Список мини-игр. Новая игра = одна строка здесь и одна строка в gameImages.
const miniGames = [
    "BedWars", "SkyWars", "BedrockBox", "Spleef", "Pillars",
    "Sumo", "Bed Fight", "Fireball Fight", "SkyWars Duel", "The Bridge", "Stick Fight"
];

// Иконки игр: файлы кладём в assets/games/ (имя: строчными, пробелы -> "_").
const gameImages = {
    "BedWars":        "assets/games/bedwars.png",
    "SkyWars":        "assets/games/skywars.png",
    "BedrockBox":     "assets/games/bedrockbox.png",
    "Spleef":         "assets/games/spleef.png",
    "Pillars":        "assets/games/pillars.png",
    "Sumo":           "assets/games/sumo.png",
    "Bed Fight":      "assets/games/bed_fight.png",
    "Fireball Fight": "assets/games/fireball_fight.png",
    "SkyWars Duel":   "assets/games/skywars_duel.png",
    "The Bridge":     "assets/games/the_bridge.png",
    "Stick Fight":    "assets/games/stick_fight.png"
};

const GAME_REGION_CODES = ["NA", "EU", "AS", "OC", "SA", "ME", "AF", "CA"];
const KIT_REGION_CODES = ["RU", "UA", "BY", "KZ", "UZ", "KG", "AM", "AZ", "MD", "TJ"];

// ДЕМО-РЕЖИМ (только для тестового репозитория): рейтинг Games берётся из
// js/demo-data.js, а не с API. В боевой версии поставьте false или удалите.
const DEMO_MODE = true;
