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

// Очки PTS за каждый тир
const tierPoints = {
    HT1: 60, LT1: 45,
    HT2: 30, LT2: 20,
    HT3: 10, LT3: 6,
    HT4: 4,  LT4: 3,
    HT5: 2,  LT5: 1,
    Unranked: 0
};

// Цветовая палитра тиров (для рамок и текста)
const tierColors = {
    HT1: '#DAA520', LT1: '#DAA520', 
    HT2: '#A9A9A9', LT2: '#A9A9A9', 
    HT3: '#A0522D', LT3: '#8B4513', 
    HT4: '#808080', LT4: '#696969', 
    HT5: '#008080', LT5: '#2F4F4F', 
    Unranked: '#444b66'
};

// Списки основных и дополнительных режимов
const maintiers = ["Hardcore", "Manhunt", "Diamond Pot", "Beast", "Emerald", "Emerald Pot", "RVM", "Dragonhide", "Pickaxe", "SMP", "Vanilla"];
const subtiers = ["Combo", "Gapple", "Mace", "Crystal"];