const players = [
    {
        name: "Sneger",
        region: "RU",
        tiers: {
            Crystal: {
                tier: "LT1",
                date: "2026-08-18",
                retired: true
            },
            Mace: {
                tier: "HT1",
                date: "2026-08-18",
                retired: true
            },
            Hardcore: {
                tier: "LT1",
                date: "2026-08-18",
                retired: true
            },
            "Emerald Pot": {
                tier: "LT1",
                date: "2026-08-18",
                retired: true
            },
            Beast: {
                tier: "LT1",
                date: "2026-08-21",
                retired: true
            },
            Pickaxe: {
                tier: "LT1",
                date: "2026-08-18",
                retired: true
            },
            Emerald: {
                tier: "LT1",
                date: "2026-08-21",
                retired: true
            },
            "Diamond Pot": {
                tier: "HT1",
                date: "2026-08-28",
                retired: true
            },
            Combo: {
                tier: "LT1",
                date: "2026-08-18",
                retired: true
            },
            SMP: {
                tier: "LT1",
                date: "2026-08-18",
                retired: true
            },
            Gapple: {
                tier: "LT1",
                date: "2026-08-21",
                retired: true
            },
            RVM: {
                tier: "LT1",
                date: "2026-08-18",
                retired: true
            },
            Dragonhide: {
                tier: "LT1",
                date: "2026-09-26",
                retired: true
            },
            Vanilla: {
                tier: "HT2",
                date: "2026-09-27",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-28",
                kit: "Diamond Pot",
                tester: "-999-",
                tierBefore: "LT1",
                tierAfter: "HT1",
                scoreTester: 6,
                scorePlayer: 16,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-31",
                kit: "Diamond Pot",
                opponent: "DzIla_EDITSmob",
                tierBefore: "HT2",
                tierAfter: "LT1",
                scorePlayer: 11,
                scoreOpponent: 7,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-17",
                kit: "Dragonhide",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "LT4",
                scorePlayer: 0,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-23",
                kit: "Dragonhide",
                opponent: "-BaCk-",
                tierBefore: "LT4",
                tierAfter: "LT3",
                scorePlayer: 6,
                scoreOpponent: 0,
                winner: "player",
                comment: "в каждом раунде ПАЧТИ убивал"
            },
            {
                date: "2026-09-26",
                kit: "Dragonhide",
                opponent: "-999-",
                tierBefore: "LT3",
                tierAfter: "LT1",
                scorePlayer: 1,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {
            Dragonhide: {
                points: 1.6,
                firstPenaltyDate: "2026-09-26"
            }
        }
    },
    {
        name: "-999-",
        region: "RU",
        tiers: {
            Dragonhide: {
                tier: "HT1",
                date: "2026-08-25",
                retired: false
            },
            Emerald: {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            "Diamond Pot": {
                tier: "LT1",
                date: "2026-08-27",
                retired: false
            },
            SMP: {
                tier: "HT1",
                date: "2026-08-25",
                retired: false
            },
            Crystal: {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            Combo: {
                tier: "HT1",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "HT1",
                date: "2026-08-28",
                retired: false
            },
            "Emerald Pot": {
                tier: "HT1",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "HT1",
                date: "2026-08-21",
                retired: false
            },
            Beast: {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            Pickaxe: {
                tier: "HT1",
                date: "2026-08-18",
                retired: false
            },
            Gapple: {
                tier: "HT1",
                date: "2026-08-21",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-25",
                kit: "Dragonhide",
                tester: "Sneger",
                tierBefore: "LT1",
                tierAfter: "HT1",
                scoreTester: 2,
                scorePlayer: 4,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-25",
                kit: "SMP",
                tester: "Sneger",
                tierBefore: "LT1",
                tierAfter: "HT1",
                scoreTester: 2,
                scorePlayer: 4,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-27",
                kit: "Diamond Pot",
                tester: "Sneger",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scoreTester: 4,
                scorePlayer: 3,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-09-12",
                kit: "Hardcore",
                opponent: "YTdrumv",
                tierBefore: "HT1",
                tierAfter: "HT1",
                scorePlayer: 3,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-26",
                kit: "Dragonhide",
                opponent: "Sneger",
                tierBefore: "HT1",
                tierAfter: "HT1",
                scorePlayer: 6,
                scoreOpponent: 1,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-27",
                kit: "Emerald",
                opponent: "Prosto_oleg100-7",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 6,
                scoreOpponent: 2,
                winner: "player",
                comment: "унизился"
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "zor1kkqwix",
        region: "RU",
        tiers: {
            Hardcore: {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "HT3",
                date: "2026-08-29",
                retired: false
            },
            "Emerald Pot": {
                tier: "HT3",
                date: "2026-08-29",
                retired: false
            },
            Combo: {
                tier: "LT3",
                date: "2026-09-27",
                retired: false
            },
            RVM: {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            Pickaxe: {
                tier: "HT2",
                date: "2026-10-08",
                retired: false
            },
            Emerald: {
                tier: "HT3",
                date: "2026-10-02",
                retired: false
            },
            "Diamond Pot": {
                tier: "HT3",
                date: "2026-08-29",
                retired: false
            },
            Dragonhide: {
                tier: "LT3",
                date: "2026-10-05",
                retired: false
            },
            Beast: {
                tier: "LT2",
                date: "2026-10-02",
                retired: false
            },
            Crystal: {
                tier: "HT1",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            Gapple: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Vanilla: {
                tier: "LT1",
                date: "2026-09-27",
                retired: false
            }
        },
        penaltyByKit: {
            Dragonhide: {
                points: 0.0,
                firstPenaltyDate: "2026-10-05"
            },
            "Diamond Pot": {
                points: 0,
                firstPenaltyDate: "2026-08-25"
            },
            "Emerald Pot": {
                points: 1,
                firstPenaltyDate: "2026-08-23"
            },
            Beast: {
                points: 0,
                firstPenaltyDate: "2026-08-30"
            },
            Pickaxe: {
                points: 1.5,
                firstPenaltyDate: "2026-08-25"
            },
            SMP: {
                points: 0,
                firstPenaltyDate: "2026-08-29"
            },
            RVM: {
                points: 1.0,
                firstPenaltyDate: "2026-09-19"
            },
            Mace: {
                points: 1.0,
                firstPenaltyDate: "2026-10-09"
            }
        },
        matchHistory: [
            {
                date: "2026-08-23",
                kit: "Dragonhide",
                tester: "система",
                tierBefore: "HT3",
                tierAfter: "LT3",
                scoreTester: 0,
                scorePlayer: 0,
                winner: "tester",
                comment: "Автопонижение: накоплено 2 штрафных очка"
            },
            {
                date: "2026-08-23",
                kit: "Diamond Pot",
                tester: "система",
                tierBefore: "HT3",
                tierAfter: "LT3",
                scoreTester: 0,
                scorePlayer: 0,
                winner: "tester",
                comment: "Автопонижение: накоплено 2 штрафных очка"
            },
            {
                date: "2026-08-23",
                kit: "Dragonhide",
                tester: "test",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scoreTester: 0,
                scorePlayer: 4,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-23",
                kit: "Emerald Pot",
                tester: "система",
                tierBefore: "HT3",
                tierAfter: "LT3",
                scoreTester: 0,
                scorePlayer: 0,
                winner: "tester",
                comment: "Автопонижение: накоплено 2 штрафных очка"
            },
            {
                date: "2026-08-25",
                kit: "Diamond Pot",
                tester: "система",
                tierBefore: "LT3",
                tierAfter: "HT4",
                scoreTester: 0,
                scorePlayer: 0,
                winner: "tester",
                comment: "Автопонижение: накоплено 2 штрафных очка"
            },
            {
                date: "2026-08-28",
                kit: "Hardcore",
                opponent: "keik2g",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 2,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-28",
                kit: "Emerald",
                opponent: "keik2g",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "RVM",
                opponent: "Say",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 4,
                scoreOpponent: 2,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Emerald Pot",
                opponent: "Master",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Beast",
                opponent: "Master",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 3,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Beast",
                opponent: "система",
                tierBefore: "LT2",
                tierAfter: "HT3",
                scorePlayer: 0,
                scoreOpponent: 0,
                winner: "opponent",
                comment: "Автопонижение: накоплено 2 штрафных очка"
            },
            {
                date: "2026-08-29",
                kit: "Beast",
                opponent: "Master",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 3,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Emerald",
                opponent: "Master",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 6,
                scoreOpponent: 4,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Diamond Pot",
                opponent: "-BaCk-",
                tierBefore: "HT4",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "SMP",
                opponent: "ZirtMobile",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "SMP",
                opponent: "система",
                tierBefore: "HT3",
                tierAfter: "LT3",
                scorePlayer: 0,
                scoreOpponent: 0,
                winner: "opponent",
                comment: "Автопонижение: накоплено 2 штрафных очка"
            },
            {
                date: "2026-08-29",
                kit: "Emerald Pot",
                opponent: "heliN193",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 1,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "SMP",
                opponent: "WezzikBigClop",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Emerald Pot",
                opponent: "The_FV4005",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 2,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Emerald Pot",
                opponent: "WezzikBigClop",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-30",
                kit: "SMP",
                opponent: "heliN193",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 3,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-30",
                kit: "Dragonhide",
                opponent: "heliN193",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 5,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-30",
                kit: "Beast",
                opponent: "heliN193",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 2,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-30",
                kit: "Beast",
                opponent: "система",
                tierBefore: "HT3",
                tierAfter: "LT3",
                scorePlayer: 0,
                scoreOpponent: 0,
                winner: "opponent",
                comment: "Автопонижение: накоплено 2 штрафных очка"
            },
            {
                date: "2026-08-30",
                kit: "Emerald",
                opponent: "-BaCk-",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-30",
                kit: "Diamond Pot",
                opponent: "-BaCk-",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 1,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-30",
                kit: "Beast",
                opponent: "Zock",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 6,
                scoreOpponent: 0,
                winner: "player",
                comment: "по одному хп оставляет"
            },
            {
                date: "2026-08-30",
                kit: "Beast",
                opponent: "YTdrumv",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 3,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-12",
                kit: "Diamond Pot",
                opponent: "YTdrumv",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 2,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-12",
                kit: "Crystal",
                opponent: "_-XKakTakX-_",
                tierBefore: "HT1",
                tierAfter: "HT1",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-12",
                kit: "Crystal",
                opponent: "_-XKakTakX-_",
                tierBefore: "HT1",
                tierAfter: "HT1",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-16",
                kit: "Hardcore",
                opponent: "xopechek",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 4,
                scoreOpponent: 1,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-16",
                kit: "RVM",
                opponent: "PASIK66666",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-18",
                kit: "Hardcore",
                opponent: "D4rK_S1lA",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 3,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-19",
                kit: "RVM",
                opponent: "Prosto_oleg100-7",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 2,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "Crystal",
                opponent: "gg_Yt_tt",
                tierBefore: "HT1",
                tierAfter: "HT1",
                scorePlayer: 3,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "RVM",
                opponent: "Xx_KILBIT_xX",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 5,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-21",
                kit: "Beast",
                opponent: "Michael_59k_YT",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scorePlayer: 6,
                scoreOpponent: 4,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-21",
                kit: "Mace",
                opponent: "proo",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 3,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-25",
                kit: "Crystal",
                opponent: "tegy",
                tierBefore: "HT1",
                tierAfter: "HT1",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-25",
                kit: "Beast",
                opponent: "tegy",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-25",
                kit: "Emerald Pot",
                opponent: "tegy",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-25",
                kit: "Emerald Pot",
                opponent: "Fare",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-26",
                kit: "Hardcore",
                opponent: "M_E_G_A",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-26",
                kit: "SMP",
                opponent: "damir26",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-10-02",
                kit: "Diamond Pot",
                opponent: "Michael_59k_YT",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 2,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-02",
                kit: "Beast",
                opponent: "Michael_59k_YT",
                tierBefore: "HT3",
                tierAfter: "LT2",
                scorePlayer: 6,
                scoreOpponent: 2,
                winner: "player",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-02",
                kit: "Dragonhide",
                opponent: "Michael_59k_YT",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 6,
                scoreOpponent: 2,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-02",
                kit: "RVM",
                opponent: "Michael_59k_YT",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-02",
                kit: "Diamond Pot",
                opponent: "mrtrollface",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 2,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-02",
                kit: "Emerald",
                opponent: "mrtrollface",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 6,
                scoreOpponent: 4,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-02",
                kit: "Emerald Pot",
                opponent: "HE_YOUTUBE",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 1,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-02",
                kit: "Combo",
                opponent: "HE_YOUTUBE",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 0,
                scoreOpponent: 2,
                winner: "opponent",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-02",
                kit: "RVM",
                opponent: "767676_",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-02",
                kit: "Emerald",
                opponent: "Michael_59k_YT",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 6,
                scoreOpponent: 0,
                winner: "player",
                comment: "Михаил незнающий побед",
                isPlayerSide: false
            },
            {
                date: "2026-10-05",
                kit: "Emerald Pot",
                opponent: "_-XKakTakX-_",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 3,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-05",
                kit: "Beast",
                opponent: "767676_",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-05",
                kit: "Mace",
                opponent: "LEGENDA",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-05",
                kit: "Mace",
                opponent: "Recherche",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-05",
                kit: "Dragonhide",
                opponent: "Recherche",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 0,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-05",
                kit: "Dragonhide",
                opponent: "система",
                tierBefore: "HT3",
                tierAfter: "LT3",
                scorePlayer: 0,
                scoreOpponent: 0,
                winner: "opponent",
                comment: "Автопонижение: накоплено 2 штрафных очка",
                isPlayerSide: true
            },
            {
                date: "2026-10-05",
                kit: "Mace",
                opponent: "heliN193",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 4,
                scoreOpponent: 1,
                winner: "player",
                comment: "luck",
                isPlayerSide: false
            },
            {
                date: "2026-10-06",
                kit: "Emerald",
                opponent: "fuze_tea",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-06",
                kit: "Beast",
                opponent: "fuze_tea",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-06",
                kit: "Diamond Pot",
                opponent: "fuze_tea",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-08",
                kit: "Pickaxe",
                opponent: "Michael_59k_YT",
                tierBefore: "LT2",
                tierAfter: "HT2",
                scorePlayer: 4,
                scoreOpponent: 1,
                winner: "player",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-09",
                kit: "Beast",
                opponent: "Kenny13",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-09",
                kit: "Beast",
                opponent: "Wemmbu__",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-09",
                kit: "Beast",
                opponent: "mrtrollface",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 4,
                scoreOpponent: 2,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-09",
                kit: "Dragonhide",
                opponent: "mrtrollface",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 6,
                scoreOpponent: 2,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-09",
                kit: "Emerald Pot",
                opponent: "tegy",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-09",
                kit: "Emerald Pot",
                opponent: "-_1986_APREL_26_-",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-09",
                kit: "RVM",
                opponent: "tegy",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 4,
                scoreOpponent: 1,
                winner: "player",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-09",
                kit: "Mace",
                opponent: "Prosto_oleg100-7",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 2,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: false
            }
        ]
    },
    {
        name: "Itz-Fake",
        region: "RU",
        tiers: {
            Hardcore: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Dev1ce",
        region: "RU",
        tiers: {
            Hardcore: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            "Diamond Pot": {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "_Xx_deras_xX",
        region: "UA",
        tiers: {
            "Emerald Pot": {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            Pickaxe: {
                tier: "HT2",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "HT3",
                date: "2026-08-31",
                retired: false
            },
            Emerald: {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "HT1",
                date: "2026-08-27",
                retired: false
            },
            Combo: {
                tier: "HT2",
                date: "2026-08-18",
                retired: false
            },
            Gapple: {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "HT2",
                date: "2026-08-18",
                retired: false
            },
            "Diamond Pot": {
                tier: "HT2",
                date: "2026-09-13",
                retired: false
            },
            Vanilla: {
                tier: "LT2",
                date: "2026-09-27",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-27",
                kit: "Beast",
                tester: "firary67",
                tierBefore: "LT1",
                tierAfter: "HT1",
                scoreTester: 3,
                scorePlayer: 6,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Dragonhide",
                opponent: "ZirtMobile",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 6,
                scoreOpponent: 5,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-31",
                kit: "RVM",
                opponent: "DzIla_EDITSmob",
                tierBefore: "LT2",
                tierAfter: "HT3",
                scorePlayer: 2,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {
            RVM: {
                points: 1,
                firstPenaltyDate: "2026-08-31"
            }
        }
    },
    {
        name: "2b2tPE",
        region: "KG",
        tiers: {
            Dragonhide: {
                tier: "HT2",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            Emerald: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "HT3",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "HT3",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            "Diamond Pot": {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "The_FV4005",
        region: "RU",
        tiers: {
            Emerald: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "LT2",
                date: "2026-08-31",
                retired: false
            },
            SMP: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "HT4",
                date: "2026-09-20",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-08-29",
                retired: false
            },
            Pickaxe: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            "Diamond Pot": {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Gapple: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Combo: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-29",
                kit: "Emerald Pot",
                opponent: "zor1kkqwix",
                tierBefore: "HT4",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-31",
                kit: "Hardcore",
                opponent: "DzIla_EDITSmob",
                tierBefore: "HT4",
                tierAfter: "LT2",
                scorePlayer: 3,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "RVM",
                opponent: "aetherelegantius",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "RVM",
                opponent: "система",
                tierBefore: "LT3",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 0,
                winner: "opponent",
                comment: "Автопонижение: накоплено 2 штрафных очка"
            }
        ],
        penaltyByKit: {
            RVM: {
                points: 0.0,
                firstPenaltyDate: "2026-09-20"
            }
        }
    },
    {
        name: "YouTube_ggs",
        region: "RU",
        tiers: {
            Crystal: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT5",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Master",
        region: "RU",
        tiers: {
            RVM: {
                tier: "HT3",
                date: "2026-08-29",
                retired: false
            },
            Dragonhide: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "HT2",
                date: "2026-08-29",
                retired: false
            },
            "Diamond Pot": {
                tier: "HT3",
                date: "2026-08-18",
                retired: false
            },
            Pickaxe: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Emerald: {
                tier: "LT3",
                date: "2026-08-29",
                retired: false
            },
            SMP: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "HT3",
                date: "2026-08-29",
                retired: false
            },
            Hardcore: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Combo: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Gapple: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-29",
                kit: "Emerald Pot",
                opponent: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 2,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "RVM",
                opponent: "D4rK_S1lA",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scorePlayer: 2,
                scoreOpponent: 1,
                winner: "player",
                comment: "техническое поражение оппоненту за выход во время пвп"
            },
            {
                date: "2026-08-29",
                kit: "Beast",
                opponent: "zor1kkqwix",
                tierBefore: "HT3",
                tierAfter: "HT2",
                scorePlayer: 6,
                scoreOpponent: 3,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Beast",
                opponent: "zor1kkqwix",
                tierBefore: "HT3",
                tierAfter: "HT2",
                scorePlayer: 6,
                scoreOpponent: 3,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Emerald",
                opponent: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "Darius",
        region: "UA",
        tiers: {
            RVM: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "OcM_sila",
        region: "RU",
        tiers: {
            SMP: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "OcM",
        region: "UA",
        tiers: {
            Hardcore: {
                tier: "HT2",
                date: "2026-06-18",
                retired: true
            },
            Mace: {
                tier: "LT2",
                date: "2026-08-18",
                retired: true
            }
        }
    },
    {
        name: "Say",
        region: "RU",
        tiers: {
            RVM: {
                tier: "HT3",
                date: "2026-08-29",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-29",
                kit: "RVM",
                opponent: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scorePlayer: 2,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {
            RVM: {
                points: 1,
                firstPenaltyDate: "2026-08-29"
            }
        }
    },
    {
        name: "ZirtMobile",
        region: "RU",
        tiers: {
            RVM: {
                tier: "LT2",
                date: "2026-08-29",
                retired: false
            },
            Dragonhide: {
                tier: "HT2",
                date: "2026-08-29",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "HT3",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            "Diamond Pot": {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "HT2",
                date: "2026-08-18",
                retired: false
            },
            Pickaxe: {
                tier: "HT2",
                date: "2026-08-21",
                retired: false
            },
            Hardcore: {
                tier: "HT2",
                date: "2026-08-18",
                retired: false
            },
            Gapple: {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            Combo: {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "LT2",
                date: "2026-08-29",
                retired: false
            },
            Emerald: {
                tier: "HT2",
                date: "2026-08-18",
                retired: false
            }
        },
        penaltyByKit: {
            Emerald: {
                points: 0.4,
                firstPenaltyDate: "2026-08-25"
            }
        },
        matchHistory: [
            {
                date: "2026-08-29",
                kit: "SMP",
                opponent: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "LT2",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "RVM",
                opponent: "DzIla_EDITSmob",
                tierBefore: "LT3",
                tierAfter: "LT2",
                scorePlayer: 3,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Dragonhide",
                opponent: "_Xx_deras_xX",
                tierBefore: "HT2",
                tierAfter: "HT2",
                scorePlayer: 5,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            }
        ]
    },
    {
        name: "WezzikBigClop",
        region: "RU",
        tiers: {
            RVM: {
                tier: "LT3",
                date: "2026-08-25",
                retired: false
            },
            "Emerald Pot": {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Pickaxe: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            "Diamond Pot": {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-25",
                kit: "RVM",
                tester: "-999-",
                tierBefore: "HT4",
                tierAfter: "LT3",
                scoreTester: 4,
                scorePlayer: 0,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "SMP",
                opponent: "zor1kkqwix",
                tierBefore: "LT4",
                tierAfter: "LT4",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Emerald Pot",
                opponent: "zor1kkqwix",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "NeXoXoroshy2",
        region: "KG",
        tiers: {
            "Emerald Pot": {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            "Diamond Pot": {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Emerald: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Combo: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Gapple: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "LEGENDAMETRO",
        region: "RU",
        tiers: {
            "Emerald Pot": {
                tier: "HT3",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Combo: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "LT3",
                date: "2026-08-21",
                retired: false
            }
        }
    },
    {
        name: "Nikos",
        region: "RU",
        tiers: {
            RVM: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Y-Japan",
        region: "RU",
        tiers: {
            Crystal: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT5",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "LT5",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "-BaCk-",
        region: "KZ",
        tiers: {
            Mace: {
                tier: "LT3",
                date: "2026-08-22",
                retired: false
            },
            Dragonhide: {
                tier: "LT3",
                date: "2026-08-29",
                retired: false
            },
            Beast: {
                tier: "LT2",
                date: "2026-09-16",
                retired: false
            },
            Hardcore: {
                tier: "HT3",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Emerald: {
                tier: "HT3",
                date: "2026-08-30",
                retired: false
            },
            "Diamond Pot": {
                tier: "HT3",
                date: "2026-09-23",
                retired: false
            },
            SMP: {
                tier: "HT3",
                date: "2026-09-23",
                retired: false
            },
            Pickaxe: {
                tier: "HT3",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Gapple: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-09-27",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-22",
                kit: "Mace",
                tester: "_Xx_deras_xX",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scoreTester: 10,
                scorePlayer: 0,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Dragonhide",
                opponent: "система",
                tierBefore: "HT3",
                tierAfter: "LT3",
                scorePlayer: 0,
                scoreOpponent: 0,
                winner: "opponent",
                comment: "Автопонижение: накоплено 2 штрафных очка"
            },
            {
                date: "2026-08-29",
                kit: "Diamond Pot",
                opponent: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Dragonhide",
                opponent: "Prosto_oleg100-7",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 3,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Dragonhide",
                opponent: "Prosto_oleg100-7",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 3,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-30",
                kit: "Emerald Pot",
                opponent: "Zock",
                tierBefore: "Unranked",
                tierAfter: "HT4",
                scorePlayer: 2,
                scoreOpponent: 3,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-30",
                kit: "Emerald Pot",
                opponent: "Zock",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 2,
                scoreOpponent: 3,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-30",
                kit: "Emerald",
                opponent: "zor1kkqwix",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 6,
                scoreOpponent: 4,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-30",
                kit: "Diamond Pot",
                opponent: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "HT4",
                scorePlayer: 1,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-12",
                kit: "RVM",
                opponent: "YTdrumv",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 1,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-12",
                kit: "Dragonhide",
                opponent: "YTdrumv",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 5,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-12",
                kit: "RVM",
                opponent: "SoLoGeMs",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-16",
                kit: "RVM",
                opponent: "Karabasik",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 3,
                scoreOpponent: 1,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-16",
                kit: "Mace",
                opponent: "123amd",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-16",
                kit: "Emerald Pot",
                opponent: "xopechek",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-16",
                kit: "SMP",
                opponent: "Karabasik",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 0,
                scoreOpponent: 2,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-16",
                kit: "Beast",
                opponent: "Michael_59k_YT",
                tierBefore: "HT3",
                tierAfter: "LT2",
                scorePlayer: 6,
                scoreOpponent: 2,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-17",
                kit: "Diamond Pot",
                opponent: "mrtrollface",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 3,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-17",
                kit: "Emerald Pot",
                opponent: "mrtrollface",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-17",
                kit: "Dragonhide",
                opponent: "Sneger",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 6,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "Crystal",
                opponent: "-Sorry-",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 3,
                scoreOpponent: 1,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "Mace",
                opponent: "-Sorry-",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 5,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "Hardcore",
                opponent: "-Sorry-",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-21",
                kit: "Mace",
                opponent: "gg_Yt_tt",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 3,
                scoreOpponent: 0,
                winner: "player",
                comment: "0 ударов братан"
            },
            {
                date: "2026-09-22",
                kit: "Pickaxe",
                opponent: "mrtrollface",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 1,
                scoreOpponent: 2,
                winner: "opponent",
                comment: "играл с 250-350 пингом, ощущение что нт4 черканите его на достоверность лт3, но дал лт3 всеже"
            },
            {
                date: "2026-09-22",
                kit: "SMP",
                opponent: "Michael_59k_YT",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 0,
                winner: "player",
                comment: "если честно он отыграл на лт4,буквально я его каждый раз подкидываю он не умеет ставить слизни и получает урон от падения, и еще, я иногда ставил слизни когда подлетал на 7-8 блоков чтоб когда он падал мог засейв как то или намек дать, но он застраивал бля пиздец"
            },
            {
                date: "2026-09-22",
                kit: "Diamond Pot",
                opponent: "Michael_59k_YT",
                tierBefore: "HT4",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 1,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-23",
                kit: "SMP",
                opponent: "DzIla_EDITSmob",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: "бля я прошу у нево подтвердить что он даед мне нт3 а он говорид сам патверти ну УРОТ"
            },
            {
                date: "2026-09-23",
                kit: "Hardcore",
                opponent: "aetherelegantius",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 1,
                scoreOpponent: 2,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-23",
                kit: "Diamond Pot",
                opponent: "Michael_59k_YT",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 1,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-23",
                kit: "Mace",
                opponent: "Michael_59k_YT",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 1,
                winner: "player",
                comment: "брат все катки убегал, ладно лт3"
            },
            {
                date: "2026-09-23",
                kit: "Dragonhide",
                opponent: "Sneger",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 0,
                scoreOpponent: 6,
                winner: "opponent",
                comment: "в каждом раунде ПАЧТИ убивал"
            },
            {
                date: "2026-09-25",
                kit: "Mace",
                opponent: "M_E_G_A",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: "стыдно лт5 даже давать, это чото между нт6-лт6 буквально в 3 раундах 0 удара и он откисал за три сам удара"
            },
            {
                date: "2026-09-26",
                kit: "Mace",
                opponent: "politik_monster4",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 3,
                scoreOpponent: 0,
                winner: "player",
                comment: "игрок ливнул при счёте 2:0,до 3 округлил. Совет: сначало поиграй на ките хотяюы от силы 10 раундов, потом иди тест. На тесте она буквально ничего не понимала как ставить сено итд но всё же давала криты"
            },
            {
                date: "2026-09-27",
                kit: "Emerald Pot",
                opponent: "xopechek",
                tierBefore: "HT4",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 1,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-28",
                kit: "Dragonhide",
                opponent: "Michael_59k_YT",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 6,
                scoreOpponent: 5,
                winner: "player",
                comment: "не судьба быть твоей первой победе"
            },
            {
                date: "2026-10-05",
                kit: "Emerald Pot",
                opponent: "Recherche",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-05",
                kit: "Gapple",
                opponent: "Recherche",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 0,
                scoreOpponent: 2,
                winner: "opponent",
                comment: null,
                isPlayerSide: false
            }
        ],
        penaltyByKit: {
            Hardcore: {
                points: 1.5,
                firstPenaltyDate: "2026-08-25"
            },
            RVM: {
                points: 1.5,
                firstPenaltyDate: "2026-08-29"
            },
            Dragonhide: {
                points: 1.6,
                firstPenaltyDate: "2026-08-29"
            }
        }
    },
    {
        name: "Hayzi",
        region: "RU",
        tiers: {
            Emerald: {
                tier: "LT5",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT5",
                date: "2026-08-18",
                retired: false
            },
            Combo: {
                tier: "LT5",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "LT5",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Samaelka",
        region: "RU",
        tiers: {
            Dragonhide: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Pickaxe: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "boy",
        region: "UA",
        tiers: {
            Hardcore: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Pickaxe: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Emerald: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "HT3",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            "Diamond Pot": {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Mirops",
        region: "RU",
        tiers: {
            Mace: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Emerald: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "LT5",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "blablablublubluble",
        region: "RU",
        tiers: {
            Beast: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            "Diamond Pot": {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "_-XKakTakX-_",
        region: "RU",
        tiers: {
            Dragonhide: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "LT2",
                date: "2026-08-27",
                retired: false
            },
            Crystal: {
                tier: "HT2",
                date: "2026-09-13",
                retired: false
            },
            Mace: {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Pickaxe: {
                tier: "LT3",
                date: "2026-08-21",
                retired: false
            },
            "Diamond Pot": {
                tier: "LT2",
                date: "2026-08-25",
                retired: false
            },
            Beast: {
                tier: "HT2",
                date: "2026-08-25",
                retired: false
            },
            Hardcore: {
                tier: "LT3",
                date: "2026-09-13",
                retired: false
            },
            "Emerald Pot": {
                tier: "HT3",
                date: "2026-10-05",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-25",
                kit: "Diamond Pot",
                tester: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "LT2",
                scoreTester: 0,
                scorePlayer: 4,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-25",
                kit: "Beast",
                tester: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "HT2",
                scoreTester: 1,
                scorePlayer: 6,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-27",
                kit: "RVM",
                tester: "DzIla_EDITSmob",
                tierBefore: "LT3",
                tierAfter: "LT2",
                scoreTester: 4,
                scorePlayer: 2,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-09-12",
                kit: "Crystal",
                opponent: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "HT2",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-12",
                kit: "Crystal",
                opponent: "система",
                tierBefore: "HT2",
                tierAfter: "LT2",
                scorePlayer: 0,
                scoreOpponent: 0,
                winner: "opponent",
                comment: "Автопонижение: накоплено 2 штрафных очка"
            },
            {
                date: "2026-10-05",
                kit: "Emerald Pot",
                opponent: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 3,
                winner: "player",
                comment: null,
                isPlayerSide: true
            }
        ],
        penaltyByKit: {
            RVM: {
                points: 1,
                firstPenaltyDate: "2026-08-27"
            },
            Crystal: {
                points: 0,
                firstPenaltyDate: "2026-09-12"
            }
        }
    },
    {
        name: "Igrok355",
        region: "RU",
        tiers: {
            Beast: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Emerald: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Prosto_oleg100-7",
        region: "RU",
        tiers: {
            Crystal: {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "HT2",
                date: "2026-09-19",
                retired: false
            },
            SMP: {
                tier: "LT1",
                date: "2026-09-14",
                retired: false
            },
            "Diamond Pot": {
                tier: "LT1",
                date: "2026-09-14",
                retired: false
            },
            Beast: {
                tier: "LT1",
                date: "2026-09-20",
                retired: false
            },
            Emerald: {
                tier: "HT3",
                date: "2026-09-27",
                retired: false
            },
            Dragonhide: {
                tier: "LT1",
                date: "2026-09-14",
                retired: false
            },
            Mace: {
                tier: "LT1",
                date: "2026-10-09",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT1",
                date: "2026-09-21",
                retired: false
            },
            Combo: {
                tier: "HT3",
                date: "2026-08-18",
                retired: false
            },
            Gapple: {
                tier: "HT4",
                date: "2026-08-28",
                retired: false
            },
            Hardcore: {
                tier: "LT2",
                date: "2026-08-25",
                retired: false
            },
            Pickaxe: {
                tier: "LT1",
                date: "2026-09-14",
                retired: false
            },
            Vanilla: {
                tier: "HT2",
                date: "2026-09-27",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-22",
                kit: "Beast",
                tester: "zor1kkqwix",
                tierBefore: "LT2",
                tierAfter: "HT2",
                scoreTester: 3,
                scorePlayer: 6,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-22",
                kit: "Dragonhide",
                tester: "zor1kkqwix",
                tierBefore: "HT3",
                tierAfter: "LT3",
                scoreTester: 6,
                scorePlayer: 0,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-08-23",
                kit: "Dragonhide",
                tester: "zor1kkqwix",
                tierBefore: "HT3",
                tierAfter: "LT3",
                scoreTester: 6,
                scorePlayer: 0,
                winner: "tester",
                comment: "тест"
            },
            {
                date: "2026-08-23",
                kit: "Gapple",
                tester: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "HT4",
                scoreTester: 2,
                scorePlayer: 0,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-08-24",
                kit: "Emerald Pot",
                tester: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "HT4",
                scoreTester: 5,
                scorePlayer: 0,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-08-24",
                kit: "Emerald",
                tester: "_Xx_deras_xX",
                tierBefore: "LT2",
                tierAfter: "HT3",
                scoreTester: 4,
                scorePlayer: 0,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-08-24",
                kit: "Emerald",
                tester: "система",
                tierBefore: "HT3",
                tierAfter: "LT3",
                scoreTester: 0,
                scorePlayer: 0,
                winner: "tester",
                comment: "Автопонижение: накоплено 2 штрафных очка"
            },
            {
                date: "2026-08-25",
                kit: "Hardcore",
                tester: "-BaCk-",
                tierBefore: "LT3",
                tierAfter: "LT2",
                scoreTester: 1,
                scorePlayer: 4,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-25",
                kit: "RVM",
                tester: "HAVCHIK",
                tierBefore: "HT3",
                tierAfter: "LT2",
                scoreTester: 2,
                scorePlayer: 4,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-25",
                kit: "Emerald",
                tester: "ZirtMobile",
                tierBefore: "HT3",
                tierAfter: "LT2",
                scoreTester: 4,
                scorePlayer: 6,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-27",
                kit: "Diamond Pot",
                tester: "DzIla_EDITSmob",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scoreTester: 4,
                scorePlayer: 2,
                winner: "tester",
                comment: "анрил играть на даймонт кб после отдачи новой"
            },
            {
                date: "2026-08-28",
                kit: "Gapple",
                opponent: "zor1kkqwix",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-28",
                kit: "Emerald Pot",
                opponent: "zor1kkqwix",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Dragonhide",
                opponent: "-BaCk-",
                tierBefore: "LT3",
                tierAfter: "LT2",
                scorePlayer: 6,
                scoreOpponent: 3,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Dragonhide",
                opponent: "-BaCk-",
                tierBefore: "LT3",
                tierAfter: "LT2",
                scorePlayer: 6,
                scoreOpponent: 3,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-14",
                kit: "Diamond Pot",
                opponent: "DzIla_EDITSmob",
                tierBefore: "HT2",
                tierAfter: "LT1",
                scorePlayer: 3,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-14",
                kit: "Pickaxe",
                opponent: "DzIla_EDITSmob",
                tierBefore: "LT3",
                tierAfter: "LT1",
                scorePlayer: 1,
                scoreOpponent: 4,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-14",
                kit: "SMP",
                opponent: "DzIla_EDITSmob",
                tierBefore: "LT2",
                tierAfter: "LT1",
                scorePlayer: 3,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-14",
                kit: "Dragonhide",
                opponent: "DzIla_EDITSmob",
                tierBefore: "LT2",
                tierAfter: "HT2",
                scorePlayer: 6,
                scoreOpponent: 4,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-14",
                kit: "Emerald Pot",
                opponent: "DzIla_EDITSmob",
                tierBefore: "HT4",
                tierAfter: "HT2",
                scorePlayer: 2,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-14",
                kit: "Dragonhide",
                opponent: "DzIla_EDITSmob",
                tierBefore: "LT2",
                tierAfter: "LT1",
                scorePlayer: 6,
                scoreOpponent: 4,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-19",
                kit: "RVM",
                opponent: "zor1kkqwix",
                tierBefore: "LT2",
                tierAfter: "HT2",
                scorePlayer: 4,
                scoreOpponent: 2,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "Pickaxe",
                opponent: "DzIla_EDITSmob",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 4,
                scoreOpponent: 3,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "RVM",
                opponent: "DzIla_EDITSmob",
                tierBefore: "HT2",
                tierAfter: "HT2",
                scorePlayer: 2,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "Beast",
                opponent: "система",
                tierBefore: "LT1",
                tierAfter: "HT2",
                scorePlayer: 0,
                scoreOpponent: 0,
                winner: "opponent",
                comment: "Автопонижение: накоплено 2 штрафных очка"
            },
            {
                date: "2026-09-20",
                kit: "Beast",
                opponent: "DzIla_EDITSmob",
                tierBefore: "HT2",
                tierAfter: "LT1",
                scorePlayer: 3,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "Emerald",
                opponent: "DzIla_EDITSmob",
                tierBefore: "LT2",
                tierAfter: "HT2",
                scorePlayer: 3,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-21",
                kit: "Dragonhide",
                opponent: "DzIla_EDITSmob",
                tierBefore: "HT2",
                tierAfter: "LT1",
                scorePlayer: 6,
                scoreOpponent: 5,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-21",
                kit: "Emerald Pot",
                opponent: "DzIla_EDITSmob",
                tierBefore: "HT2",
                tierAfter: "LT1",
                scorePlayer: 3,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-27",
                kit: "Emerald",
                opponent: "-999-",
                tierBefore: "HT2",
                tierAfter: "LT2",
                scorePlayer: 2,
                scoreOpponent: 6,
                winner: "opponent",
                comment: "унизился"
            },
            {
                date: "2026-09-27",
                kit: "Emerald",
                opponent: "система",
                tierBefore: "LT2",
                tierAfter: "HT3",
                scorePlayer: 0,
                scoreOpponent: 0,
                winner: "opponent",
                comment: "Автопонижение: накоплено 2 штрафных очка"
            },
            {
                date: "2026-10-09",
                kit: "Mace",
                opponent: "zor1kkqwix",
                tierBefore: "LT2",
                tierAfter: "LT1",
                scorePlayer: 4,
                scoreOpponent: 2,
                winner: "player",
                comment: null,
                isPlayerSide: true
            }
        ],
        penaltyByKit: {
            Emerald: {
                points: 0.0,
                firstPenaltyDate: "2026-09-27"
            },
            "Diamond Pot": {
                points: 1,
                firstPenaltyDate: "2026-08-27"
            },
            Beast: {
                points: 0.8,
                firstPenaltyDate: "2026-09-20"
            },
            "Emerald Pot": {
                points: 1,
                firstPenaltyDate: "2026-09-14"
            },
            RVM: {
                points: 1.0,
                firstPenaltyDate: "2026-09-20"
            }
        }
    },
    {
        name: "Rost_aura",
        region: "RU",
        tiers: {
            Hardcore: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-08-24",
                retired: false
            },
            Beast: {
                tier: "HT3",
                date: "2026-09-21",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-24",
                kit: "Emerald Pot",
                tester: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scoreTester: 0,
                scorePlayer: 4,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-19",
                kit: "Beast",
                opponent: "D4rK_S1lA",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scorePlayer: 6,
                scoreOpponent: 2,
                winner: "player",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "Lolotrack",
        region: "UA",
        tiers: {
            Crystal: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            },
            "Diamond Pot": {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Cira",
        region: "RU",
        tiers: {
            Hardcore: {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "HT2",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "HT3",
                date: "2026-08-18",
                retired: false
            },
            Pickaxe: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Gggg1029",
        region: "RU",
        tiers: {
            Mace: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Combo: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "YouTubePvPXelp_999",
        region: "RU",
        tiers: {
            SMP: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Saxapok13373",
        region: "RU",
        tiers: {
            SMP: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Dzhambulat1322",
        region: "RU",
        tiers: {
            RVM: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "D4rK_S1lA",
        region: "RU",
        tiers: {
            Beast: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "LT1",
                date: "2026-09-18",
                retired: false
            },
            Mace: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Gapple: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-29",
                kit: "RVM",
                opponent: "Master",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 1,
                scoreOpponent: 2,
                winner: "opponent",
                comment: "техническое поражение оппоненту за выход во время пвп"
            },
            {
                date: "2026-08-30",
                kit: "Beast",
                opponent: "Vex",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 5,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-18",
                kit: "Hardcore",
                opponent: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "LT1",
                scorePlayer: 4,
                scoreOpponent: 3,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-19",
                kit: "Beast",
                opponent: "Rost_aura",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {
            RVM: {
                points: 1.5,
                firstPenaltyDate: "2026-08-29"
            },
            Beast: {
                points: 1.2,
                firstPenaltyDate: "2026-09-19"
            }
        }
    },
    {
        name: "7STARS",
        region: "RU",
        tiers: {
            Dragonhide: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Combo: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            "Diamond Pot": {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Emerald: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Gapple: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Kenny13",
        region: "RU",
        tiers: {
            Hardcore: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "HT5",
                date: "2026-10-09",
                retired: false
            },
            Mace: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-10-09",
                kit: "Beast",
                opponent: "zor1kkqwix",
                tierBefore: "LT4",
                tierAfter: "HT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "Exponat",
        region: "RU",
        tiers: {
            "Emerald Pot": {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Gapple: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Noch",
        region: "RU",
        tiers: {
            RVM: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "-_-nyschka-_-",
        region: "RU",
        tiers: {
            Mace: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Susla",
        region: "RU",
        tiers: {
            Mace: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "rrrr11",
        region: "RU",
        tiers: {
            Mace: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "hohNagiBator",
        region: "RU",
        tiers: {
            Emerald: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Legenda_loytaba",
        region: "RU",
        tiers: {
            Hardcore: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "MAXTY",
        region: "RU",
        tiers: {
            RVM: {
                tier: "LT5",
                date: "2026-08-18",
                retired: false
            },
            Emerald: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "saimon",
        region: "RU",
        tiers: {
            Mace: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "HT5",
                date: "2026-08-21",
                retired: false
            }
        }
    },
    {
        name: "Grisha",
        region: "RU",
        tiers: {
            Mace: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Meteor",
        region: "UA",
        tiers: {
            RVM: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "killdoIbaeb4455",
        region: "RU",
        tiers: {
            Hardcore: {
                tier: "LT2",
                date: "2026-08-18",
                retired: true
            }
        }
    },
    {
        name: "Sneszok123",
        region: "RU",
        tiers: {
            Beast: {
                tier: "HT3",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Aliazo",
        region: "RU",
        tiers: {
            Hardcore: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "gftun",
        region: "RU",
        tiers: {
            Dragonhide: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Vex",
        region: "RU",
        tiers: {
            Hardcore: {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "LT3",
                date: "2026-08-30",
                retired: false
            },
            "Diamond Pot": {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-30",
                kit: "Beast",
                opponent: "D4rK_S1lA",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 6,
                scoreOpponent: 5,
                winner: "player",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "M_E_G_A",
        region: "RU",
        tiers: {
            RVM: {
                tier: "LT5",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "HT5",
                date: "2026-08-22",
                retired: false
            },
            Mace: {
                tier: "LT5",
                date: "2026-09-25",
                retired: false
            },
            Hardcore: {
                tier: "HT5",
                date: "2026-09-26",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-22",
                kit: "Beast",
                tester: "-BaCk-",
                tierBefore: "LT5",
                tierAfter: "HT5",
                scoreTester: 4,
                scorePlayer: 0,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-09-25",
                kit: "Mace",
                opponent: "-BaCk-",
                tierBefore: "HT5",
                tierAfter: "LT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: "стыдно лт5 даже давать, это чото между нт6-лт6 буквально в 3 раундах 0 удара и он откисал за три сам удара"
            },
            {
                date: "2026-09-26",
                kit: "Hardcore",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "JANDELL",
        region: "RU",
        tiers: {
            Hardcore: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Michael_59k_YT",
        region: "AM",
        tiers: {
            Beast: {
                tier: "LT3",
                date: "2026-09-16",
                retired: false
            },
            Mace: {
                tier: "LT3",
                date: "2026-09-23",
                retired: false
            },
            Pickaxe: {
                tier: "LT2",
                date: "2026-08-22",
                retired: false
            },
            Hardcore: {
                tier: "LT3",
                date: "2026-08-22",
                retired: false
            },
            Emerald: {
                tier: "HT4",
                date: "2026-10-02",
                retired: false
            },
            "Diamond Pot": {
                tier: "LT3",
                date: "2026-10-02",
                retired: false
            },
            SMP: {
                tier: "HT4",
                date: "2026-09-22",
                retired: false
            },
            Dragonhide: {
                tier: "LT3",
                date: "2026-10-02",
                retired: false
            },
            RVM: {
                tier: "HT4",
                date: "2026-10-02",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-22",
                kit: "Hardcore",
                tester: "zor1kkqwix",
                tierBefore: "HT4",
                tierAfter: "LT3",
                scoreTester: 4,
                scorePlayer: 0,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-08-22",
                kit: "Pickaxe",
                tester: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "LT2",
                scoreTester: 4,
                scorePlayer: 3,
                winner: "tester",
                comment: "проходит бридж лт2"
            },
            {
                date: "2026-08-23",
                kit: "Emerald",
                tester: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT4",
                scoreTester: 4,
                scorePlayer: 0,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-08-23",
                kit: "Beast",
                tester: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scoreTester: 6,
                scorePlayer: 3,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-08-25",
                kit: "Beast",
                tester: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scoreTester: 6,
                scorePlayer: 3,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-08-25",
                kit: "Diamond Pot",
                tester: "_Xx_deras_xX",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scoreTester: 4,
                scorePlayer: 0,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-09-16",
                kit: "Beast",
                opponent: "-BaCk-",
                tierBefore: "HT3",
                tierAfter: "HT3",
                scorePlayer: 2,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-16",
                kit: "Beast",
                opponent: "система",
                tierBefore: "HT3",
                tierAfter: "LT3",
                scorePlayer: 0,
                scoreOpponent: 0,
                winner: "opponent",
                comment: "Автопонижение: накоплено 2 штрафных очка"
            },
            {
                date: "2026-09-21",
                kit: "Beast",
                opponent: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-22",
                kit: "SMP",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 2,
                winner: "opponent",
                comment: "если честно он отыграл на лт4,буквально я его каждый раз подкидываю он не умеет ставить слизни и получает урон от падения, и еще, я иногда ставил слизни когда подлетал на 7-8 блоков чтоб когда он падал мог засейв как то или намек дать, но он застраивал бля пиздец"
            },
            {
                date: "2026-09-22",
                kit: "Diamond Pot",
                opponent: "-BaCk-",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 1,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-23",
                kit: "Diamond Pot",
                opponent: "-BaCk-",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 1,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-23",
                kit: "Mace",
                opponent: "-BaCk-",
                tierBefore: "LT4",
                tierAfter: "LT3",
                scorePlayer: 1,
                scoreOpponent: 2,
                winner: "opponent",
                comment: "брат все катки убегал, ладно лт3"
            },
            {
                date: "2026-09-23",
                kit: "Hardcore",
                opponent: "aetherelegantius",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-28",
                kit: "Dragonhide",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scorePlayer: 5,
                scoreOpponent: 6,
                winner: "opponent",
                comment: "не судьба быть твоей первой победе"
            },
            {
                date: "2026-10-02",
                kit: "Diamond Pot",
                opponent: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-02",
                kit: "Beast",
                opponent: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null,
                isPlayerSide: false
            },
            {
                date: "2026-10-02",
                kit: "Dragonhide",
                opponent: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-02",
                kit: "RVM",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-02",
                kit: "Emerald",
                opponent: "zor1kkqwix",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 6,
                winner: "opponent",
                comment: "Михаил незнающий побед",
                isPlayerSide: true
            },
            {
                date: "2026-10-08",
                kit: "Pickaxe",
                opponent: "zor1kkqwix",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 1,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: false
            }
        ],
        penaltyByKit: {
            Beast: {
                points: 0.4,
                firstPenaltyDate: "2026-09-16"
            },
            "Diamond Pot": {
                points: 1.5,
                firstPenaltyDate: "2026-09-23"
            },
            Hardcore: {
                points: 1.0,
                firstPenaltyDate: "2026-09-23"
            },
            Pickaxe: {
                points: 1.5,
                firstPenaltyDate: "2026-10-08"
            }
        }
    },
    {
        name: "Topor",
        region: "RU",
        tiers: {
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Combo: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "HT3",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "DzIla_EDITSmob",
        region: "RU",
        tiers: {
            "Emerald Pot": {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            "Diamond Pot": {
                tier: "LT1",
                date: "2026-08-31",
                retired: false
            },
            Emerald: {
                tier: "LT1",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "HT2",
                date: "2026-08-27",
                retired: false
            },
            RVM: {
                tier: "LT1",
                date: "2026-09-20",
                retired: false
            },
            Hardcore: {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "LT1",
                date: "2026-09-21",
                retired: false
            },
            Pickaxe: {
                tier: "LT1",
                date: "2026-09-20",
                retired: false
            },
            SMP: {
                tier: "LT1",
                date: "2026-08-27",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-22",
                kit: "Beast",
                tester: "Sneger",
                tierBefore: "LT2",
                tierAfter: "LT1",
                scoreTester: 5,
                scorePlayer: 6,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-08-25",
                kit: "Pickaxe",
                tester: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT2",
                scoreTester: 1,
                scorePlayer: 4,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-27",
                kit: "SMP",
                tester: "-999-",
                tierBefore: "Unranked",
                tierAfter: "LT1",
                scoreTester: 4,
                scorePlayer: 2,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-08-27",
                kit: "Beast",
                tester: "-999-",
                tierBefore: "LT1",
                tierAfter: "HT2",
                scoreTester: 3,
                scorePlayer: 6,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-08-27",
                kit: "RVM",
                tester: "zor1kkqwix",
                tierBefore: "LT1",
                tierAfter: "LT2",
                scoreTester: 3,
                scorePlayer: 4,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "RVM",
                opponent: "ZirtMobile",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 4,
                scoreOpponent: 3,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-31",
                kit: "RVM",
                opponent: "_Xx_deras_xX",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 4,
                scoreOpponent: 2,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-31",
                kit: "Hardcore",
                opponent: "The_FV4005",
                tierBefore: "LT2",
                tierAfter: "LT2",
                scorePlayer: 4,
                scoreOpponent: 3,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-31",
                kit: "Diamond Pot",
                opponent: "Sneger",
                tierBefore: "HT2",
                tierAfter: "LT1",
                scorePlayer: 7,
                scoreOpponent: 11,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-14",
                kit: "Diamond Pot",
                opponent: "Prosto_oleg100-7",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 4,
                scoreOpponent: 3,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-14",
                kit: "Pickaxe",
                opponent: "Prosto_oleg100-7",
                tierBefore: "HT2",
                tierAfter: "HT2",
                scorePlayer: 4,
                scoreOpponent: 1,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-14",
                kit: "SMP",
                opponent: "Prosto_oleg100-7",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 4,
                scoreOpponent: 3,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-14",
                kit: "Dragonhide",
                opponent: "Prosto_oleg100-7",
                tierBefore: "HT2",
                tierAfter: "HT2",
                scorePlayer: 4,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-14",
                kit: "Emerald Pot",
                opponent: "Prosto_oleg100-7",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 4,
                scoreOpponent: 2,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-14",
                kit: "Dragonhide",
                opponent: "Prosto_oleg100-7",
                tierBefore: "HT2",
                tierAfter: "HT2",
                scorePlayer: 4,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "Pickaxe",
                opponent: "Prosto_oleg100-7",
                tierBefore: "HT2",
                tierAfter: "LT1",
                scorePlayer: 3,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "RVM",
                opponent: "Prosto_oleg100-7",
                tierBefore: "LT2",
                tierAfter: "LT1",
                scorePlayer: 4,
                scoreOpponent: 2,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "Beast",
                opponent: "Prosto_oleg100-7",
                tierBefore: "HT2",
                tierAfter: "LT1",
                scorePlayer: 6,
                scoreOpponent: 3,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "Emerald",
                opponent: "Prosto_oleg100-7",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 6,
                scoreOpponent: 3,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-21",
                kit: "Dragonhide",
                opponent: "Prosto_oleg100-7",
                tierBefore: "HT2",
                tierAfter: "LT1",
                scorePlayer: 5,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-21",
                kit: "Emerald Pot",
                opponent: "Prosto_oleg100-7",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 4,
                scoreOpponent: 3,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-21",
                kit: "Mace",
                opponent: "xopechek",
                tierBefore: null,
                tierAfter: "HT4",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-21",
                kit: "Mace",
                opponent: "mrtrollface",
                tierBefore: null,
                tierAfter: "HT4",
                scorePlayer: 4,
                scoreOpponent: 1,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-23",
                kit: "SMP",
                opponent: "-BaCk-",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: "бля я прошу у нево подтвердить что он даед мне нт3 а он говорид сам патверти ну УРОТ"
            },
            {
                date: "2026-10-06",
                kit: "Emerald Pot",
                opponent: "mrtrollface",
                tierBefore: "LT1",
                tierAfter: "LT1",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: false
            }
        ],
        penaltyByKit: {
            Dragonhide: {
                points: 0.8,
                firstPenaltyDate: "2026-09-14"
            },
            Beast: {
                points: 0.8,
                firstPenaltyDate: "2026-09-20"
            }
        }
    },
    {
        name: "AMORE",
        region: "UA",
        tiers: {
            Hardcore: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT5",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "h9nto",
        region: "RU",
        tiers: {
            Mace: {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "HT3",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "1641085O8",
        region: "RU",
        tiers: {
            "Emerald Pot": {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "Top",
        region: "UA",
        tiers: {
            Hardcore: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "HT4",
                date: "2026-08-28",
                retired: false
            },
            Mace: {
                tier: "LT5",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            },
            Gapple: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-28",
                kit: "Beast",
                tester: "zor1kkqwix",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scoreTester: 5,
                scorePlayer: 0,
                winner: "tester",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "HAVCHIK",
        region: "RU",
        tiers: {
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "HT3",
                date: "2026-08-21",
                retired: false
            }
        },
        penaltyByKit: {
            RVM: {
                points: 1,
                firstPenaltyDate: "2026-08-25"
            }
        }
    },
    {
        name: "Mirage",
        region: "RU",
        tiers: {
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "-Sorry-",
        region: "RU",
        tiers: {
            Mace: {
                tier: "HT4",
                date: "2026-09-20",
                retired: false
            },
            Hardcore: {
                tier: "HT4",
                date: "2026-09-20",
                retired: false
            },
            Crystal: {
                tier: "LT4",
                date: "2026-09-20",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-09-20",
                kit: "Crystal",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "LT4",
                scorePlayer: 1,
                scoreOpponent: 3,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "Mace",
                opponent: "-BaCk-",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 5,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-20",
                kit: "Hardcore",
                opponent: "-BaCk-",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "Fialka_",
        region: "RU",
        tiers: {
            SMP: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "NOVENKIY1",
        region: "RU",
        tiers: {
            RVM: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "zaxvatchik6",
        region: "RU",
        tiers: {
            RVM: {
                tier: "LT5",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "-_MACKA_-",
        region: "RU",
        tiers: {
            Dragonhide: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-08-21",
                retired: false
            }
        }
    },
    {
        name: "Karabasik",
        region: "RU",
        tiers: {
            Dragonhide: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Emerald: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "HT4",
                date: "2026-09-16",
                retired: false
            },
            SMP: {
                tier: "LT3",
                date: "2026-09-16",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-09-16",
                kit: "RVM",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "HT4",
                scorePlayer: 1,
                scoreOpponent: 3,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-16",
                kit: "SMP",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "ofofoffo",
        region: "UA",
        tiers: {
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "sw3don",
        region: "RU",
        tiers: {
            Hardcore: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "xivivideking",
        region: "RU",
        tiers: {
            RVM: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "LT2",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "qak1ow",
        region: "RU",
        tiers: {
            RVM: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Gapple: {
                tier: "LT3",
                date: "2026-08-18",
                retired: false
            },
            Beast: {
                tier: "HT4",
                date: "2026-09-21",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-27",
                kit: "Beast",
                tester: "DzIla_EDITSmob",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scoreTester: 5,
                scorePlayer: 0,
                winner: "tester",
                comment: "слаба но урон наносил может дойти до хт3. Квалификационный тест пройден"
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "YTdrumv",
        region: "RU",
        tiers: {
            Beast: {
                tier: "LT4",
                date: "2026-08-30",
                retired: false
            },
            Emerald: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Crystal: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Dragonhide: {
                tier: "LT3",
                date: "2026-09-12",
                retired: false
            },
            "Diamond Pot": {
                tier: "HT4",
                date: "2026-09-12",
                retired: false
            },
            Hardcore: {
                tier: "HT4",
                date: "2026-09-12",
                retired: false
            },
            Pickaxe: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Mace: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            SMP: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Gapple: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            Combo: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "LT4",
                date: "2026-09-12",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-30",
                kit: "Beast",
                opponent: "zor1kkqwix",
                tierBefore: "LT5",
                tierAfter: "LT4",
                scorePlayer: 0,
                scoreOpponent: 3,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-12",
                kit: "Hardcore",
                opponent: "-999-",
                tierBefore: "LT5",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 3,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-12",
                kit: "RVM",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "LT4",
                scorePlayer: 1,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-12",
                kit: "Dragonhide",
                opponent: "-BaCk-",
                tierBefore: "HT5",
                tierAfter: "LT3",
                scorePlayer: 6,
                scoreOpponent: 5,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-12",
                kit: "Diamond Pot",
                opponent: "zor1kkqwix",
                tierBefore: "HT5",
                tierAfter: "HT4",
                scorePlayer: 2,
                scoreOpponent: 2,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "Zock",
        region: "RU",
        tiers: {
            RVM: {
                tier: "LT4",
                date: "2026-08-18",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-08-30",
                retired: false
            },
            Beast: {
                tier: "LT3",
                date: "2026-08-30",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-30",
                kit: "Emerald Pot",
                opponent: "-BaCk-",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 3,
                scoreOpponent: 2,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-30",
                kit: "Emerald Pot",
                opponent: "-BaCk-",
                tierBefore: "HT4",
                tierAfter: "LT3",
                scorePlayer: 3,
                scoreOpponent: 2,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-30",
                kit: "Beast",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scorePlayer: 0,
                scoreOpponent: 6,
                winner: "opponent",
                comment: "по одному хп оставляет"
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "-Dan41k",
        region: "RU",
        tiers: {
            Mace: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Hardcore: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "vov4ikusss",
        region: "RU",
        tiers: {
            Beast: {
                tier: "HT5",
                date: "2026-08-18",
                retired: false
            },
            RVM: {
                tier: "LT5",
                date: "2026-08-18",
                retired: false
            }
        }
    },
    {
        name: "firary67",
        region: "RU",
        tiers: {
            Hardcore: {
                tier: "LT2",
                date: "2026-08-29",
                retired: false
            },
            Emerald: {
                tier: "HT1",
                date: "2026-08-21",
                retired: false
            },
            Beast: {
                tier: "LT1",
                date: "2026-08-27",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-27",
                kit: "Beast",
                tester: "DzIla_EDITSmob",
                tierBefore: "Unranked",
                tierAfter: "LT1",
                scoreTester: 6,
                scorePlayer: 5,
                winner: "tester",
                comment: null
            },
            {
                date: "2026-08-29",
                kit: "Hardcore",
                opponent: "DzIla_EDITmob",
                tierBefore: "LT3",
                tierAfter: "LT2",
                scorePlayer: 3,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {
            Beast: {
                points: 0.8,
                firstPenaltyDate: "2026-08-27"
            }
        }
    },
    {
        name: "bob_ara_1029",
        region: "RU",
        tiers: {
            Mace: {
                tier: "HT4",
                date: "2026-08-18",
                retired: false
            },
            Pickaxe: {
                tier: "LT3",
                date: "2026-08-21",
                retired: false
            }
        }
    },
    {
        name: "Egoiste",
        region: "UA",
        tiers: {
            RVM: {
                tier: "HT5",
                date: "2026-08-21",
                retired: false
            },
            Mace: {
                tier: "HT4",
                date: "2026-08-21",
                retired: false
            }
        }
    },
    {
        name: "SoLoGeMs",
        region: "RU",
        tiers: {
            Crystal: {
                tier: "LT4",
                date: "2026-08-21",
                retired: false
            },
            RVM: {
                tier: "LT5",
                date: "2026-09-12",
                retired: false
            },
            Pickaxe: {
                tier: "LT5",
                date: "2026-08-21",
                retired: false
            },
            Beast: {
                tier: "LT4",
                date: "2026-08-21",
                retired: false
            },
            Dragonhide: {
                tier: "LT4",
                date: "2026-08-21",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-09-12",
                kit: "RVM",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "LT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "meker_pvp",
        region: "UA",
        tiers: {
            RVM: {
                tier: "LT4",
                date: "2026-08-21",
                retired: false
            }
        }
    },
    {
        name: "Domchikr",
        region: "RU",
        tiers: {
            Hardcore: {
                tier: "LT5",
                date: "2026-08-21",
                retired: false
            }
        }
    },
    {
        name: "FASTER-cq-q",
        region: "RU",
        tiers: {
            Hardcore: {
                tier: "HT3",
                date: "2026-08-21",
                retired: false
            }
        }
    },
    {
        name: "_UnU_",
        region: "RU",
        tiers: {
            Mace: {
                tier: "LT4",
                date: "2026-08-21",
                retired: false
            }
        }
    },
    {
        name: "BBBOOOSSS",
        region: "RU",
        tiers: {
            RVM: {
                tier: "HT5",
                date: "2026-08-21",
                retired: false
            }
        }
    },
    {
        name: "aetherelegantius",
        region: "RU",
        tiers: {
            RVM: {
                tier: "HT3",
                date: "2026-09-20",
                retired: false
            },
            Hardcore: {
                tier: "HT3",
                date: "2026-09-23",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-25",
                kit: "RVM",
                tester: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scoreTester: 0,
                scorePlayer: 4,
                winner: "player",
                comment: "квалификационный тест пройден"
            },
            {
                date: "2026-09-20",
                kit: "RVM",
                opponent: "The_FV4005",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-23",
                kit: "Hardcore",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 1,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-23",
                kit: "Hardcore",
                opponent: "Michael_59k_YT",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 2,
                winner: "player",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "keik2g",
        region: "BY",
        tiers: {
            Hardcore: {
                tier: "LT5",
                date: "2026-08-28",
                retired: false
            },
            Emerald: {
                tier: "LT5",
                date: "2026-08-28",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-28",
                kit: "Hardcore",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT5",
                scorePlayer: 0,
                scoreOpponent: 2,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-28",
                kit: "Emerald",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "heliN193",
        region: "BY",
        tiers: {
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-09-27",
                retired: false
            },
            SMP: {
                tier: "HT3",
                date: "2026-08-30",
                retired: false
            },
            Dragonhide: {
                tier: "HT3",
                date: "2026-08-30",
                retired: false
            },
            Beast: {
                tier: "LT2",
                date: "2026-08-30",
                retired: false
            },
            Mace: {
                tier: "HT3",
                date: "2026-10-05",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-08-29",
                kit: "Emerald Pot",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT4",
                scorePlayer: 1,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-08-30",
                kit: "SMP",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT3",
                scorePlayer: 4,
                scoreOpponent: 3,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-30",
                kit: "Dragonhide",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT3",
                scorePlayer: 6,
                scoreOpponent: 5,
                winner: "player",
                comment: null
            },
            {
                date: "2026-08-30",
                kit: "Beast",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT2",
                scorePlayer: 6,
                scoreOpponent: 2,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-21",
                kit: "Emerald Pot",
                opponent: "JHkyu",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-27",
                kit: "Emerald Pot",
                opponent: "mrtrollface",
                tierBefore: "HT4",
                tierAfter: "LT3",
                scorePlayer: 5,
                scoreOpponent: 0,
                winner: "player",
                comment: null
            },
            {
                date: "2026-10-05",
                kit: "Mace",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT3",
                scorePlayer: 1,
                scoreOpponent: 4,
                winner: "opponent",
                comment: "luck",
                isPlayerSide: true
            }
        ],
        penaltyByKit: {
            Mace: {
                points: 1.5,
                firstPenaltyDate: "2026-10-05"
            }
        }
    },
    {
        name: "123amd",
        region: "RU",
        tiers: {
            Mace: {
                tier: "LT5",
                date: "2026-09-16",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-09-16",
                kit: "Mace",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "LT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "xopechek",
        region: "RU",
        tiers: {
            "Emerald Pot": {
                tier: "HT4",
                date: "2026-09-16",
                retired: false
            },
            Hardcore: {
                tier: "LT3",
                date: "2026-09-16",
                retired: false
            },
            Mace: {
                tier: "HT4",
                date: "2026-09-21",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-09-16",
                kit: "Emerald Pot",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-16",
                kit: "Hardcore",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scorePlayer: 1,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-21",
                kit: "Mace",
                opponent: "DzIla_EDITSmob",
                tierBefore: "Unranked",
                tierAfter: "LT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-21",
                kit: "Mace",
                opponent: "mrtrollface",
                tierBefore: "LT5",
                tierAfter: "LT5",
                scorePlayer: 2,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-27",
                kit: "Emerald Pot",
                opponent: "-BaCk-",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 1,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "PASIK66666",
        region: "RU",
        tiers: {
            RVM: {
                tier: "LT5",
                date: "2026-09-16",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-09-16",
                kit: "RVM",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "mrtrollface",
        region: "RU",
        tiers: {
            "Diamond Pot": {
                tier: "LT3",
                date: "2026-10-02",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-10-06",
                retired: false
            },
            Mace: {
                tier: "LT3",
                date: "2026-09-21",
                retired: false
            },
            Pickaxe: {
                tier: "LT3",
                date: "2026-09-22",
                retired: false
            },
            Emerald: {
                tier: "LT3",
                date: "2026-10-02",
                retired: false
            },
            Beast: {
                tier: "LT3",
                date: "2026-10-09",
                retired: false
            },
            Dragonhide: {
                tier: "HT4",
                date: "2026-10-09",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-09-17",
                kit: "Diamond Pot",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 3,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-17",
                kit: "Emerald Pot",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-21",
                kit: "Mace",
                opponent: "DzIla_EDITSmob",
                tierBefore: "Unranked",
                tierAfter: "LT5",
                scorePlayer: 1,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-21",
                kit: "Mace",
                opponent: "xopechek",
                tierBefore: "HT4",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 2,
                winner: "player",
                comment: null
            },
            {
                date: "2026-09-22",
                kit: "Pickaxe",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 1,
                winner: "player",
                comment: "играл с 250-350 пингом, ощущение что нт4 черканите его на достоверность лт3, но дал лт3 всеже"
            },
            {
                date: "2026-09-27",
                kit: "Emerald Pot",
                opponent: "heliN193",
                tierBefore: "HT4",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 5,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-10-02",
                kit: "Diamond Pot",
                opponent: "zor1kkqwix",
                tierBefore: "LT3",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-02",
                kit: "Emerald",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-06",
                kit: "Emerald Pot",
                opponent: "DzIla_EDITSmob",
                tierBefore: "LT3",
                tierAfter: "HT3",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-06",
                kit: "Emerald Pot",
                opponent: "система",
                tierBefore: "HT3",
                tierAfter: "LT3",
                scorePlayer: 0,
                scoreOpponent: 0,
                winner: "opponent",
                comment: "Автопонижение: накоплено 2 штрафных очка",
                isPlayerSide: true
            },
            {
                date: "2026-10-09",
                kit: "Beast",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-09",
                kit: "Dragonhide",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT4",
                scorePlayer: 2,
                scoreOpponent: 6,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            }
        ],
        penaltyByKit: {
            "Emerald Pot": {
                points: 0.0,
                firstPenaltyDate: "2026-10-06"
            }
        }
    },
    {
        name: "gg_Yt_tt",
        region: "RU",
        tiers: {
            Crystal: {
                tier: "HT5",
                date: "2026-09-20",
                retired: false
            },
            Mace: {
                tier: "LT5",
                date: "2026-09-21",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-09-20",
                kit: "Crystal",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT5",
                scorePlayer: 0,
                scoreOpponent: 3,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-21",
                kit: "Mace",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "LT5",
                scorePlayer: 0,
                scoreOpponent: 3,
                winner: "opponent",
                comment: "0 ударов братан"
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "Xx_KILBIT_xX",
        region: "RU",
        tiers: {
            RVM: {
                tier: "HT4",
                date: "2026-09-20",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-09-20",
                kit: "RVM",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 5,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "JHkyu",
        region: "RU",
        tiers: {
            "Emerald Pot": {
                tier: "HT5",
                date: "2026-09-21",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-09-21",
                kit: "Emerald Pot",
                opponent: "heliN193",
                tierBefore: "Unranked",
                tierAfter: "HT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "proo",
        region: "RU",
        tiers: {
            Mace: {
                tier: "HT4",
                date: "2026-09-21",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-09-21",
                kit: "Mace",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 3,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "tegy",
        region: "RU",
        tiers: {
            Crystal: {
                tier: "LT5",
                date: "2026-09-25",
                retired: false
            },
            Beast: {
                tier: "LT5",
                date: "2026-09-25",
                retired: false
            },
            "Emerald Pot": {
                tier: "HT5",
                date: "2026-10-09",
                retired: false
            },
            RVM: {
                tier: "HT5",
                date: "2026-10-09",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-09-25",
                kit: "Crystal",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-25",
                kit: "Beast",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-09-25",
                kit: "Emerald Pot",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            },
            {
                date: "2026-10-09",
                kit: "Emerald Pot",
                opponent: "zor1kkqwix",
                tierBefore: "HT5",
                tierAfter: "HT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-09",
                kit: "RVM",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT5",
                scorePlayer: 1,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "Fare",
        region: "RU",
        tiers: {
            "Emerald Pot": {
                tier: "LT4",
                date: "2026-09-25",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-09-25",
                kit: "Emerald Pot",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT4",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "damir26",
        region: "RU",
        tiers: {
            SMP: {
                tier: "HT5",
                date: "2026-09-26",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-09-26",
                kit: "SMP",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "politik_monster4",
        region: "RU",
        tiers: {
            Mace: {
                tier: "HT5",
                date: "2026-09-26",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-09-26",
                kit: "Mace",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "HT5",
                scorePlayer: 0,
                scoreOpponent: 3,
                winner: "opponent",
                comment: "игрок ливнул при счёте 2:0,до 3 округлил. Совет: сначало поиграй на ките хотяюы от силы 10 раундов, потом иди тест. На тесте она буквально ничего не понимала как ставить сено итд но всё же давала криты"
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "Recherche",
        region: "RU",
        tiers: {
            Vanilla: {
                tier: "LT2",
                date: "2026-09-27",
                retired: false
            },
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-10-05",
                retired: false
            },
            Gapple: {
                tier: "LT3",
                date: "2026-10-05",
                retired: false
            },
            Mace: {
                tier: "LT3",
                date: "2026-10-05",
                retired: false
            },
            Dragonhide: {
                tier: "LT2",
                date: "2026-10-05",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-10-05",
                kit: "Emerald Pot",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scorePlayer: 4,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-05",
                kit: "Gapple",
                opponent: "-BaCk-",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-05",
                kit: "Mace",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-05",
                kit: "Dragonhide",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT2",
                scorePlayer: 6,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: true
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "test",
        region: "",
        tiers: {},
        matchHistory: [],
        penaltyByKit: {}
    },
    {
        name: "HE_YOUTUBE",
        region: "RU",
        tiers: {
            "Emerald Pot": {
                tier: "LT3",
                date: "2026-10-02",
                retired: false
            },
            Combo: {
                tier: "LT3",
                date: "2026-10-02",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-10-02",
                kit: "Emerald Pot",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scorePlayer: 1,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-02",
                kit: "Combo",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT3",
                scorePlayer: 2,
                scoreOpponent: 0,
                winner: "player",
                comment: null,
                isPlayerSide: true
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "767676_",
        region: "UA",
        tiers: {
            RVM: {
                tier: "LT5",
                date: "2026-10-02",
                retired: false
            },
            Beast: {
                tier: "LT5",
                date: "2026-10-05",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-10-02",
                kit: "RVM",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-05",
                kit: "Beast",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "LEGENDA",
        region: "RU",
        tiers: {
            Mace: {
                tier: "LT5",
                date: "2026-10-05",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-10-05",
                kit: "Mace",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "fuze_tea",
        region: "RU",
        tiers: {
            Emerald: {
                tier: "LT4",
                date: "2026-10-06",
                retired: false
            },
            Beast: {
                tier: "HT4",
                date: "2026-10-06",
                retired: false
            },
            "Diamond Pot": {
                tier: "LT4",
                date: "2026-10-06",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-10-06",
                kit: "Emerald",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT4",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-06",
                kit: "Beast",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "HT4",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            },
            {
                date: "2026-10-06",
                kit: "Diamond Pot",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT4",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "Wemmbu__",
        region: "BY",
        tiers: {
            Beast: {
                tier: "LT5",
                date: "2026-10-09",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-10-09",
                kit: "Beast",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            }
        ],
        penaltyByKit: {}
    },
    {
        name: "-_1986_APREL_26_-",
        region: "RU",
        tiers: {
            "Emerald Pot": {
                tier: "LT5",
                date: "2026-10-09",
                retired: false
            }
        },
        matchHistory: [
            {
                date: "2026-10-09",
                kit: "Emerald Pot",
                opponent: "zor1kkqwix",
                tierBefore: "Unranked",
                tierAfter: "LT5",
                scorePlayer: 0,
                scoreOpponent: 4,
                winner: "opponent",
                comment: null,
                isPlayerSide: true
            }
        ],
        penaltyByKit: {}
    }
];
