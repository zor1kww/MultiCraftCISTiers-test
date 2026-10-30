// ДЕМО-ДАННЫЕ ДЛЯ ТЕСТОВОГО РЕПОЗИТОРИЯ (раздел Games, рейтинг Elo).
// Подключаются при DEMO_MODE = true в config.js. Регионы игр - мировые:
// NA, EU, AS, OC, SA, ME, AF, CA. Формат как в API бота: games[игра] = { elo, retired? }.
const demoPlayers = [
    { name: "Aurora_X",   region: "EU", games: { "Sumo": { elo: 2050 }, "BedWars": { elo: 1900 }, "SkyWars": { elo: 1650 }, "Stick Fight": { elo: 1810 }, "Bed Fight": { elo: 1500, retired: true } }, matchHistory: [] },
    { name: "JostPvP",    region: "NA", games: { "BedWars": { elo: 1980 }, "The Bridge": { elo: 1710 }, "Fireball Fight": { elo: 1690 }, "Sumo": { elo: 1420 } }, matchHistory: [] },
    { name: "Karzer1",    region: "EU", games: { "BedWars": { elo: 1780 }, "The Bridge": { elo: 1710 }, "Sumo": { elo: 1420 }, "Pillars": { elo: 1330 } }, matchHistory: [] },
    { name: "nolarf",     region: "ME", games: { "SkyWars": { elo: 1620 }, "Pillars": { elo: 1555 }, "Spleef": { elo: 1380 }, "BedrockBox": { elo: 1250, retired: true } }, matchHistory: [] },
    { name: "TokyoDrift", region: "AS", games: { "Sumo": { elo: 1590 }, "Stick Fight": { elo: 1480 }, "SkyWars Duel": { elo: 1360 } }, matchHistory: [] },
    { name: "-BaCk-",     region: "EU", games: { "Fireball Fight": { elo: 1490 }, "BedWars": { elo: 1330, retired: true }, "Stick Fight": { elo: 1210 } }, matchHistory: [] },
    { name: "Outback_Ace", region: "OC", games: { "SkyWars": { elo: 1405 }, "Spleef": { elo: 1285 } }, matchHistory: [] },
    { name: "Kw1ssst",    region: "EU", games: { "Sumo": { elo: 1210 }, "SkyWars Duel": { elo: 1105 }, "BedWars": { elo: 1040 } }, matchHistory: [] },
    { name: "Lrrys",      region: "NA", games: { "Pillars": { elo: 1175 }, "BedrockBox": { elo: 1120 } }, matchHistory: [] },
    { name: "Paulista",   region: "SA", games: { "Stick Fight": { elo: 1090 }, "Bed Fight": { elo: 1020 } }, matchHistory: [] },
    { name: "Cape_Wolf",  region: "AF", games: { "The Bridge": { elo: 985 } }, matchHistory: [] },
    { name: "Maple_Leaf", region: "CA", games: { "BedWars": { elo: 940 }, "Spleef": { elo: 870 } }, matchHistory: [] },
    { name: "fuze_tea",   region: "EU", games: { "The Bridge": { elo: 820 } }, matchHistory: [] }
];
