// ДЕМО-ДАННЫЕ МАКЕТА. Нужны только чтобы оценить внешний вид рангов S-F и
// Retired (подключаются в index.html, работают при DEMO_MODE = true в
// config.js). В боевой версии файл не нужен.
// Формат как в API бота: tiers[кит] = { elo, retired? }.
const demoPlayers = [
    { name: "Aurora_X",      region: "RU", tiers: { "Hardcore": { elo: 2140 }, "Beast": { elo: 1960 }, "Emerald Pot": { elo: 2010 }, "Combo": { elo: 1830 } }, games: { "Sumo": { elo: 2050 }, "BedWars": { elo: 1900 }, "SkyWars": { elo: 1650 }, "Bed Fight": { elo: 1500, retired: true } }, matchHistory: [] },
    { name: "Karzer1",       region: "UA", tiers: { "Hardcore": { elo: 1880 }, "Diamond Pot": { elo: 1740 }, "Mace": { elo: 1620 } }, games: { "BedWars": { elo: 1780 }, "The Bridge": { elo: 1710 }, "Sumo": { elo: 1420 } }, matchHistory: [] },
    { name: "zor1kkqwix",    region: "KZ", tiers: { "Beast": { elo: 1710 }, "Emerald": { elo: 1655 }, "RVM": { elo: 1590 }, "Gapple": { elo: 1480 } }, games: { "SkyWars": { elo: 1620 }, "Pillars": { elo: 1555 }, "Spleef": { elo: 1380 }, "BedrockBox": { elo: 1250, retired: true } }, matchHistory: [] },
    { name: "-BaCk-",        region: "RU", tiers: { "Hardcore": { elo: 1630, retired: true }, "Manhunt": { elo: 1520, retired: true }, "Beast": { elo: 1490, retired: true } }, games: { "Fireball Fight": { elo: 1490 }, "BedWars": { elo: 1330, retired: true } }, matchHistory: [] },
    { name: "Prosto_oleg100-7", region: "BY", tiers: { "Emerald Pot": { elo: 1540 }, "Pickaxe": { elo: 1410, retired: true }, "Combo": { elo: 1320 } }, matchHistory: [] },
    { name: "Kw1ssst",       region: "RU", tiers: { "Beast": { elo: 1385 }, "Hardcore": { elo: 1330, retired: true }, "Crystal": { elo: 1180 } }, games: { "Sumo": { elo: 1210 }, "SkyWars Duel": { elo: 1105 } }, matchHistory: [] },
    { name: "zloy_767676",   region: "UZ", tiers: { "Emerald Pot": { elo: 1260 }, "Diamond Pot": { elo: 1195 }, "SMP": { elo: 1110 } }, matchHistory: [] },
    { name: "fuze_tea",      region: "KG", tiers: { "Combo": { elo: 1175 }, "Gapple": { elo: 1090 }, "Vanilla": { elo: 1020 } }, games: { "The Bridge": { elo: 1020 } }, matchHistory: [] },
    { name: "xopechek",      region: "AM", tiers: { "Hardcore": { elo: 1060 }, "Beast": { elo: 1000 }, "RVM": { elo: 940 } }, matchHistory: [] },
    { name: "encodexhd",     region: null, tiers: { "Emerald Pot": { elo: 1000 }, "Dragonhide": { elo: 905 } }, matchHistory: [] },
    { name: "mrtrollface",   region: "AZ", tiers: { "Manhunt": { elo: 870 }, "Pickaxe": { elo: 790 }, "Mace": { elo: 710 } }, matchHistory: [] },
    { name: "Goose_2023",    region: "MD", tiers: { "Hardcore": { elo: 735 }, "Vanilla": { elo: 660 } }, matchHistory: [] },
    { name: "D4rK_S1lA",     region: null, tiers: { "SMP": { elo: 540 }, "Beast": { elo: 610 } }, matchHistory: [] },
    { name: "Sneger",        region: "TJ", tiers: { "Combo": { elo: 420 } }, matchHistory: [] }
];
