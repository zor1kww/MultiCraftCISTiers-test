@font-face {
    font-family: 'MultiCraftFont';
    src: url('../assets/MultiCraftFont.ttf') format('truetype'),
         url('../assets/fonts/MultiCraftFont.ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
}

*, body, div, span, p, a, button, input, select, option, table, tr, td, th, h1, h2, h3, h4 {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'MultiCraftFont', 'Courier New', monospace !important;
    -webkit-font-smoothing: none;
    -moz-osx-font-smoothing: none;
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

:root {
    --bg-start: #070b17;
    --bg-end: #0b1224;
    --bg-solid: #050816;
    --card-bg: #0f1729;
    --card-hover: #131d33;
    --text-main: #fff;
    --text-muted: #8892b0;
    --border-color: rgba(255,255,255,.08);
    --sidebar-bg: #0a1020;
    --sidebar-item: #121b2e;
    --modal-bg: #0b1120;
    --modal-block: rgba(18, 28, 49, 0.5);
    --accent: #ffcc47;
}

[data-theme="light"] {
    --bg-start: #f4f6fa;
    --bg-end: #e2e8f0;
    --bg-solid: #f8fafc;
    --card-bg: #ffffff;
    --card-hover: #f1f5f9;
    --text-main: #0f172a;
    --text-muted: #64748b;
    --border-color: rgba(0,0,0,.08);
    --sidebar-bg: #ffffff;
    --sidebar-item: #f1f5f9;
    --modal-bg: #ffffff;
    --modal-block: #f8fafc;
}

body, html {
    background: var(--bg-solid);
    color: var(--text-main);
    min-height: 100vh;
    overflow-x: hidden;
    background-image: linear-gradient(180deg, var(--bg-start), var(--bg-end));
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center top;
    background-attachment: fixed;
}

.header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px 20px;
    border-bottom: 1px solid var(--border-color);
    background: var(--bg-solid);
    position: sticky;
    top: 0;
    z-index: 1000;
    width: 100%;
}

/* Декоративная неоновая линия под шапкой с аппаратным ускорением */
.header::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), transparent);
    background-size: 200% 100%;
    animation: neonLine 4s linear infinite;
    will-change: transform;
}

@keyframes neonLine {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

.logo {
    font-size: 22px;
    color: var(--accent);
    white-space: nowrap;
    flex-shrink: 0;
}

.header-right {
    display: flex;
    align-items: center;
}

.menu-btn {
    background: var(--sidebar-item);
    border: 1px solid rgba(255,204,71,.3);
    color: var(--accent);
    padding: 10px 14px;
    border-radius: 10px;
    cursor: pointer;
}

.menu-btn:hover {
    box-shadow: 0 0 15px rgba(255,204,71,.4);
}

.sidebar {
    position: fixed;
    top: 0;
    left: -320px;
    width: 300px;
    height: 100%;
    background: var(--sidebar-bg);
    border-right: 1px solid var(--border-color);
    padding: 20px;
    z-index: 2000;
    overflow-y: auto;
    transition: transform .3s ease;
}

.sidebar.active {
    transform: translateX(320px);
}

.sidebar h3 {
    color: var(--accent);
    margin: 20px 0 10px;
    font-size: 18px;
}

.sidebar a {
    display: block;
    text-decoration: none;
    color: var(--text-main);
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 10px;
    background: var(--sidebar-item);
}

.sidebar a:hover {
    box-shadow: 0 0 15px rgba(255,204,71,.4);
    color: var(--accent);
}

.theme-toggle-container {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid var(--border-color);
}

.theme-toggle-btn {
    width: 100%;
    background: var(--sidebar-item);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    font-size: 14px;
    cursor: pointer;
    padding: 12px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.main-page, .tab-content {
    max-width: 1200px;
    margin: auto;
    padding: 20px 15px;
}

.hero {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 25px;
    box-shadow: 0 0 40px rgba(255,187,0,.02);
}

.hero h1 {
    font-size: 36px;
    color: var(--accent);
    text-align: center;
    margin-bottom: 10px;
}

.hero p {
    line-height: 1.6;
    color: var(--text-muted);
    font-size: 14px;
    text-align: center;
    max-width: 700px;
    margin: 0 auto 20px;
}

.tg-wrapper {
    text-align: center;
    margin-bottom: 25px;
}

.telegram-btn {
    display: inline-block;
    background: var(--accent);
    color: #070b17 !important;
    padding: 12px 28px;
    border-radius: 8px;
    font-weight: bold;
    text-decoration: none;
    transition: all 0.2s ease;
}

.telegram-btn:hover {
    background: #ffe082;
    box-shadow: 0 0 15px rgba(255, 204, 71, 0.4);
    transform: translateY(-1px);
}

.back-btn {
    background: #16223f;
    border: 1px solid var(--accent);
    color: var(--accent);
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 20px;
}

.back-btn:hover {
    background: var(--accent);
    color: #16223f;
}

.filters {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 20px;
}

.filters-row-2 {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 12px;
}

.filters-row-3 {
    margin-top: 12px;
    background: var(--bg-solid);
    border: 1px solid var(--border-color);
    padding: 12px;
    border-radius: 8px;
    display: flex;
    align-items: center;
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--text-main);
    cursor: pointer;
    user-select: none;
}

.checkbox-label input {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: var(--accent);
}

.filters input, .filters select, .filters-row-2 select {
    background: var(--bg-solid);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    padding: 12px;
    border-radius: 8px;
    outline: none;
    width: 100%;
}

/* ==========================================================================
   КАСТОМНЫЙ ВЫПАДАЮЩИЙ СПИСОК ДЛЯ ФИЛЬТРА КИТОВ (Main/Sub Overall)
   ========================================================================== */
.custom-select {
    position: relative;
    width: 100%;
}

.custom-select-trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    background: var(--bg-solid);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    padding: 12px;
    border-radius: 8px;
    outline: none;
    width: 100%;
    font-size: 14px;
    font-family: inherit;
    cursor: pointer;
    text-align: left;
}

.custom-select-trigger:hover {
    border-color: var(--accent);
}

.custom-select-arrow {
    flex-shrink: 0;
    color: var(--text-secondary, #8892b0);
    transition: transform 0.2s ease;
}

.custom-select.open .custom-select-arrow {
    transform: rotate(180deg);
}

.custom-select-panel {
    display: none;
    position: absolute;
    top: calc(100% + 6px);
    left: 0;
    right: 0;
    max-height: 320px;
    overflow-y: auto;
    background: var(--bg-solid);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.35);
    z-index: 50;
    padding: 6px;
}

.custom-select.open .custom-select-panel {
    display: block;
}

.custom-select-option {
    padding: 10px 12px;
    border-radius: 6px;
    font-size: 14px;
    color: var(--text-main);
    cursor: pointer;
    user-select: none;
}

.custom-select-option:hover {
    background: var(--card-hover);
}

.custom-select-option.selected {
    background: var(--accent);
    color: #0a0e1a;
    font-weight: 600;
}

.custom-select-group-label {
    padding: 10px 12px 4px;
    font-weight: 700;
    color: var(--accent);
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.05em;
    margin-top: 4px;
    border-top: 1px solid var(--border-color);
    cursor: default;
    user-select: none;
    pointer-events: none;
}

.custom-select-group-label:first-child {
    margin-top: 0;
    padding-top: 10px;
    border-top: none;
}

.custom-select-group-label.selected {
    color: #0a0e1a;
}

.section-title {
    font-size: 26px;
    margin: 30px 0 15px;
    color: var(--accent);
    text-align: center;
}

.players-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.player-container {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    overflow: hidden;
}

.player-container:hover {
    border-color: var(--accent);
    background: var(--card-hover);
}

/* ==========================================================================
   ТОП 1-5 ЦВЕТА И СВЕЧЕНИЯ РАМОК
   ========================================================================== */
.top-rank-1 {
    border-color: rgba(218, 165, 32, 0.7) !important;
    box-shadow: 0 0 15px rgba(218, 165, 32, 0.15);
}
.top-rank-2 { border-color: rgba(169, 169, 169, 0.7) !important; box-shadow: 0 0 15px rgba(169, 169, 169, 0.15); }
.top-rank-3 { border-color: rgba(160, 82, 45, 0.7) !important; box-shadow: 0 0 15px rgba(160, 82, 45, 0.15); }
.top-rank-4 { border-color: rgba(128, 128, 128, 0.7) !important; box-shadow: 0 0 15px rgba(128, 128, 128, 0.15); }
.top-rank-5 { border-color: rgba(0, 128, 128, 0.7) !important; box-shadow: 0 0 15px rgba(0, 128, 128, 0.15); }

/* ==========================================================================
   ЛОГИКА ДЛЯ RETIRED-СТАТУСА (ИГНОРИРУЕТСЯ, ЕСЛИ ИГРОК В ТОП 1-5)
   ========================================================================== */
.player-container.retired-status:not(.top-rank-1):not(.top-rank-2):not(.top-rank-3):not(.top-rank-4):not(.top-rank-5) {
    opacity: 0.55;
    border-color: rgba(136, 146, 176, 0.2) !important;
    box-shadow: none !important;
}

.player-container.retired-status:not(.top-rank-1):not(.top-rank-2):not(.top-rank-3):not(.top-rank-4):not(.top-rank-5):hover {
    border-color: rgba(136, 146, 176, 0.5) !important;
    background: var(--card-hover);
}

/* ==========================================================================
   СТРУКТУРА КАРТОЧКИ ИГРОКА (.player-card-row)
   ========================================================================== */
.player-card-row {
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 20px;
    cursor: pointer;
    width: 100%;
}

.player-name-block {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-shrink: 0;
    min-width: 180px;
}

.player-rank {
    color: var(--accent);
    font-size: 16px;
    font-weight: bold;
}

.player-name {
    color: var(--text-main);
    font-size: 16px;
}

.player-center-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-grow: 1;
}

.player-meta-box {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap; 
}

/* ==========================================================================
   ЕДИНЫЙ СТАНДАРТ ДЛЯ ВСЕХ МЕТА-ТЕГОВ (Регион, Устройство)
   ========================================================================== */
.player-meta-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 22px; /* Фиксированная высота для идеального горизонтального выравнивания */
    padding: 0 8px;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-radius: 4px;
    background: rgba(255,255,255,0.05);
    color: var(--text-muted);
    border: 1px solid var(--border-color);
    box-sizing: border-box;
    white-space: nowrap;
}

[data-theme="light"] .player-meta-tag {
    background: rgba(0,0,0,0.05);
}

/* Отдельный класс для Retired — исправлено выравнивание и возвращен красный цвет */
.retired-meta-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 22px; /* Вровень с остальными тегами */
    padding: 0 8px;
    font-size: 11px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-radius: 4px;
    background: rgba(255, 71, 71, 0.1) !important;
    color: #ff4747 !important;
    border: 1px solid rgba(255, 71, 71, 0.25) !important;
    box-sizing: border-box;
    white-space: nowrap;
    margin-top: 0; /* Убран кривой сдвиг */
}

.player-tiers-row {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 4px;
}

.tier-item-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    width: 42px;
}

.tier-icon-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.03);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    overflow: hidden;
}

/* Стили для сабтиров ветеранов */
.tier-item-box.retired-kit .tier-icon-circle {
    border-color: rgba(255, 71, 71, 0.4) !important;
    background: rgba(255, 71, 71, 0.02);
}

.tier-item-box.retired-kit .tier-label-under {
    color: #ff4747 !important;
}

.tier-icon-circle img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.tier-icon-circle.unranked {
    opacity: 0.15;
}

.tier-label-under {
    font-size: 10px;
    font-weight: bold;
    text-align: center;
}

/* Блок PTS / Тир (Всегда прижат в самый правый край) */
.player-right {
    margin-left: auto;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    font-size: 16px;
    font-weight: bold;
    min-width: 90px;
}

.tier-badge {
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: bold;
    display: inline-block;
    text-align: center;
    min-width: 55px;
}

/* ==========================================================================
   ТОП ПО КОНКРЕТНОМУ КИТУ — карточка со скином игрока (bust-портрет)
   Пока используется один дефолтный скин для всех - индивидуальные скины
   планируются позже отдельной системой загрузки/модерации.
   ========================================================================== */
.player-card-row-bust {
    padding: 0;
    align-items: stretch;
    gap: 16px;
}

.bust-card-skin {
    width: 84px;
    min-height: 84px;
    align-self: stretch;
    object-fit: cover;
    object-position: center top;
    flex-shrink: 0;
    display: block;
    border-radius: 14px 0 0 14px;
    /* Скин рисуется впритык к левому краю и растягивается на всю высоту
       карточки (align-self: stretch), повторяя компоновку с референса -
       портрет как часть рамки, а не элемент с отступами внутри неё.
       border-radius дублирует скругление .player-container на случай,
       если overflow:hidden не сработает в каком-то браузере. */
}

.bust-card-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    padding: 14px 16px 14px 0;
    min-width: 0; /* чтобы длинные ники корректно переносились/обрезались */
    flex-grow: 1;
}

.bust-card-top {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
}

.bust-card-bottom {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.bust-penalty-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 9px;
    border-radius: 20px;
    background: rgba(255, 107, 53, 0.15);
    border: 1px solid rgba(255, 107, 53, 0.35);
    color: #ff6b35;
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
}

@media (max-width: 480px) {
    .bust-card-skin {
        width: 68px;
        min-height: 68px;
    }
    .bust-card-info {
        padding: 10px 12px 10px 0;
        gap: 6px;
    }
}

/* ==========================================================================
   МОДАЛЬНЫЕ ОКНА И ДИАЛОГИ
   ========================================================================== */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(3, 5, 12, 0.85);
    display: none;
    justify-content: center;
    align-items: center;
    z-index: 3000;
    padding: 15px;
}

.modal-overlay.active {
    display: flex;
}

.modal-card {
    background: var(--modal-bg);
    border: 1px solid rgba(255, 204, 71, 0.3);
    box-shadow: 0 0 35px rgba(255, 204, 71, 0.15);
    border-radius: 20px;
    width: 100%;
    max-width: 700px;
    max-height: 85vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid var(--border-color);
}

.modal-title-box h2 {
    color: var(--accent);
    font-size: 24px;
}

.modal-title-box p {
    color: var(--text-muted);
    font-size: 14px;
    margin-top: 6px;
    letter-spacing: 0.5px;
    font-weight: bold;
}

.custom-role-badge {
    display: inline-block;
    font-size: 11px;
    color: var(--accent);
    background: rgba(255, 204, 71, 0.12);
    border: 1px solid rgba(255, 204, 71, 0.25);
    padding: 3px 8px;
    border-radius: 6px;
    margin-top: 6px;
    font-weight: bold;
}

.close-modal-btn {
    background: var(--sidebar-item);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    font-size: 16px;
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
}

.close-modal-btn:hover {
    background: #cc3333;
    color: #fff;
}

.modal-body {
    padding: 20px;
}

.modal-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.modal-block {
    background: var(--modal-block);
    border: 1px solid var(--border-color);
    padding: 15px;
    border-radius: 12px;
}

.modal-block h4 {
    color: var(--accent);
    font-size: 14px;
    margin-bottom: 10px;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(255,204,71,0.2);
    padding-bottom: 4px;
}

.modal-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 13px;
    padding: 8px 0;
    border-bottom: 1px dashed var(--border-color);
}

.modal-row:last-child {
    border-bottom: none;
}

.modal-kit-left {
    display: flex;
    align-items: center;
    gap: 8px;
}

.modal-kit-icon {
    width: 22px;
    height: 22px;
    object-fit: contain;
}

.m-kit { color: var(--text-main); }

.m-right-side {
    display: flex;
    align-items: center;
    gap: 6px;
}

.m-elo-box {
    display: inline-block;
    width: 65px; 
    text-align: right;
    color: var(--text-muted);
    font-size: 11px;
}

/* Индикатор штрафных очков по конкретному киту в профиле игрока
   (см. penalty_logic.py на боте - только для HT3+ тестов) */
.m-penalty-box {
    display: inline-block;
    margin-left: 6px;
    padding: 1px 6px;
    border-radius: 4px;
    background: rgba(255, 107, 53, 0.15);
    color: #ff6b35;
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
}

/* Суммарные штрафные очки игрока в шапке профиля */
.modal-penalty-total {
    color: #ff6b35;
    font-size: 12px;
    font-weight: 600;
    margin: 2px 0 0 0;
}

.modal-block-footer {
    margin-top: 10px;
    text-align: right;
    font-size: 12px;
    color: var(--accent);
    font-weight: bold;
}

/* Блок "Дуэли" в профиле игрока — на всю ширину, под Main/Sub Tiers */
.modal-duels-block {
    margin-top: 15px;
    max-height: 340px;
    overflow-y: auto;
}

.duels-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.duels-empty {
    font-size: 13px;
    color: var(--text-muted);
    text-align: center;
    padding: 12px 0;
}

.duel-row {
    border: 1px solid var(--border-color);
    border-left: 3px solid var(--border-color);
    border-radius: 8px;
    padding: 8px 12px;
    background: var(--card-bg);
}

.duel-row.duel-win {
    border-left-color: #4ade80;
}

.duel-row.duel-loss {
    border-left-color: #ff4747;
}

.duel-row-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
}

.duel-kit {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.duel-kit-icon {
    width: 16px;
    height: 16px;
    object-fit: contain;
}

.duel-date {
    font-size: 11px;
    color: var(--text-muted);
}

.duel-row-main {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 13px;
}

.duel-opponent-label {
    color: var(--text-muted);
    font-size: 12px;
}

.duel-opponent-name {
    color: var(--text-main);
    font-weight: 700;
    cursor: pointer;
}

.duel-opponent-name:hover {
    color: var(--accent);
}

.duel-score {
    color: var(--text-main);
    font-weight: 700;
    font-family: monospace;
}

.duel-result-badge {
    margin-left: auto;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 20px;
}

.duel-win .duel-result-badge {
    color: #4ade80;
    background: rgba(74, 222, 128, 0.12);
}

.duel-loss .duel-result-badge {
    color: #ff4747;
    background: rgba(255, 71, 71, 0.12);
}

.duel-comment {
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-muted);
    font-style: italic;
}

/* Блок изменения ранга внутри строки дуэли (предыдущий → полученный) */
.duel-tier-change {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 6px;
    font-size: 12px;
    font-weight: 700;
    font-family: monospace;
}

.duel-tier-arrow {
    color: var(--text-muted);
    font-weight: normal;
}

/* Вкладка "Дуэли" — тот же список, но без ограничения по высоте */
.duels-list-global {
    margin-top: 15px;
    max-width: 720px;
}

/* ==========================================================================
   ИНФО-ЦЕНТР И ТАБЛИЦЫ FAQ
   ========================================================================== */
.info-box {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 18px;
    padding: 25px;
    line-height: 1.8;
    margin-bottom: 20px;
}

.faq-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    background: var(--bg-solid);
    border-radius: 10px;
    overflow: hidden;
}

.faq-table th, .faq-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
}

.faq-table th {
    background: #121d35;
    color: var(--accent);
    font-size: 14px;
}

.faq-table td {
    font-size: 13px;
    color: var(--text-main);
}

.faq-block-item {
    background: var(--bg-solid);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 15px;
    margin-top: 15px;
}

.faq-block-item h3 {
    color: var(--accent);
    font-size: 16px;
    margin-bottom: 8px;
}

.faq-block-item p {
    font-size: 13px;
    color: var(--text-main);
    line-height: 1.6;
}

.testers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 15px;
    margin-top: 15px;
}
.tester-card {
    background: var(--bg-solid);
    border: 1px solid rgba(255,204,71,0.2);
    border-radius: 12px;
    padding: 15px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s ease, transform 0.2s ease;
}
.tester-card:hover {
    border-color: rgba(255,204,71,0.6);
    transform: translateY(-2px);
}
.tester-name {
    font-size: 18px;
    color: var(--text-main);
    margin-bottom: 5px;
}
.tester-status {
    font-size: 12px;
    color: var(--accent);
    background: rgba(255,204,71,0.1);
    padding: 2px 8px;
    border-radius: 4px;
    display: inline-block;
}

.hall-name-link {
    color: var(--accent);
    font-weight: bold;
    cursor: pointer;
    transition: text-shadow 0.2s ease;
}
.hall-name-link:hover {
    text-shadow: 0 0 8px rgba(255,204,71,0.6);
    text-decoration: underline;
}

.step-list {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}
.step-card {
    background: var(--bg-solid);
    border: 1px solid var(--border-color);
    padding: 15px;
    border-radius: 10px;
}
.step-num {
    color: var(--accent);
    font-size: 18px;
    margin-bottom: 5px;
}
.form-template {
    background: rgba(0,0,0,0.2);
    border: 1px dashed rgba(255,204,71,0.3);
    padding: 12px;
    border-radius: 6px;
    margin-top: 10px;
    font-family: monospace;
    font-size: 13px;
    line-height: 1.5;
    color: #a6b2c9;
}

/* ==========================================================================
   ИЗОЛИРОВАННЫЙ РАЗДЕЛ "ВИКИ" (.wiki-grid) — ИСПРАВЛЕНЫ СКРИНШОТЫ И ШРИФТЫ
   ========================================================================== */
.wiki-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 18px;
    margin-top: 15px;
}

.wiki-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 0;
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;
    transition: border-color 0.2s ease;
}

.wiki-card:hover {
    border-color: rgba(255, 204, 71, 0.35);
}

.wiki-title-wrapper {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 18px;
    background: rgba(255, 204, 71, 0.05);
    border-bottom: 1px solid var(--border-color);
}

.wiki-title-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    filter: drop-shadow(0 0 6px rgba(255, 204, 71, 0.35));
    flex-shrink: 0;
}

/* Заголовок кита — крупнее, с разрядкой под капс-стиль оружейной таблички */
.wiki-card h3 {
    color: var(--text-main);
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 0;
    letter-spacing: 1.2px;
    text-transform: uppercase;
}

.wiki-card-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px 18px;
    min-width: 0;
}

/* Блок статов оружия — оформлен как карточка спецификации, а не обычный текст */
.wiki-stats {
    background: rgba(0, 0, 0, 0.18);
    border-left: 3px solid var(--accent);
    border-radius: 0 8px 8px 0;
    padding: 10px 12px;
    font-size: 12px;
    line-height: 1.9;
    color: var(--text-muted);
    letter-spacing: 0.2px;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.wiki-stats strong {
    color: var(--accent);
    font-weight: 700;
}

/* Описание/лор кита */
.wiki-card p {
    font-size: 13px;
    font-weight: normal;
    color: var(--text-muted);
    line-height: 1.65;
    margin-bottom: 0;
    letter-spacing: 0.2px;
    word-wrap: break-word;
    overflow-wrap: break-word;
}

.wiki-card p:last-of-type {
    margin-bottom: 0;
}

/* Блок "Тренирует" — ярлык + компактный список навыков построчно */
.wiki-trains {
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    padding: 12px;
    min-width: 0;
}

.wiki-trains-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1.5px;
}

.skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    min-width: 0;
}

.skill-tag {
    font-size: 11px;
    color: var(--accent);
    background: rgba(255, 204, 71, 0.08);
    border: 1px solid rgba(255, 204, 71, 0.25);
    border-radius: 20px;
    padding: 3px 10px;
    white-space: normal;
    word-break: break-word;
    max-width: 100%;
    line-height: 1.4;
    transition: background 0.2s ease, border-color 0.2s ease;
}

.skill-tag:hover {
    background: rgba(255, 204, 71, 0.16);
    border-color: rgba(255, 204, 71, 0.5);
}

/* Исправленный контейнер инвентаря — картинка больше не сжимается */
.inv-preview-box {
    margin-top: auto; 
    background: rgba(0, 0, 0, 0.15);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    overflow: hidden;
    width: 100%;
}

/* Картинка идеально растягивается на всю ширину без черных полос по бокам */
.inv-preview-box img {
    width: 100%;
    height: auto;
    display: block;
}

/* ==========================================================================
   ИНФО-ЦЕНТР
   ========================================================================== */
.info-section {
    margin-bottom: 35px;
    background: var(--bg-solid);
    border: 1px solid var(--border-color);
    border-radius: 14px;
    padding: 20px;
}

.info-section:last-child {
    margin-bottom: 0;
}

.info-section-title {
    color: var(--accent);
    font-size: 20px;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 204, 71, 0.2);
    display: flex;
    align-items: center;
    gap: 10px;
}

.tier-hierarchy {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 15px;
}

.hierarchy-item {
    display: flex;
    align-items: center;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    padding: 10px 15px;
    border-radius: 8px;
    gap: 15px;
}

.hierarchy-rank {
    font-size: 14px;
    font-weight: bold;
    color: var(--text-muted);
    min-width: 80px;
}

.hierarchy-desc {
    font-size: 13px;
    color: var(--text-main);
    line-height: 1.4;
}

.info-accent-box {
    background: rgba(255, 204, 71, 0.05);
    border-left: 3px solid var(--accent);
    padding: 12px 15px;
    border-radius: 0 8px 8px 0;
    margin: 15px 0;
    font-size: 13px;
    line-height: 1.6;
}

/* Навигация под-вкладок раздела Информация */
.info-nav-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 15px;
}

.info-nav-btn {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 13px;
}

.info-nav-btn:hover {
    border-color: var(--accent);
}

.info-nav-btn.active {
    background: var(--accent);
    color: #070b17;
    border-color: var(--accent);
    font-weight: bold;
}

.info-sub-tab-content {
    animation: fadeInSubTab 0.2s ease;
}

@keyframes fadeInSubTab {
    from { opacity: 0; transform: translateY(2px); }
    to { opacity: 1; transform: translateY(0); }
}

/* ==========================================================================
   ДОСКА ПОЧЕТА
   ========================================================================== */
.honor-grid {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.honor-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 18px;
    border-radius: 14px;
    border: 1px solid var(--border-color);
    background: var(--card-bg);
    cursor: pointer;
    transition: border-color 0.2s ease, transform 0.15s ease;
}

.honor-card:hover,
.honor-card:active {
    border-color: rgba(255, 204, 71, 0.5);
    transform: translateX(2px);
}

.honor-name {
    font-size: 17px;
    font-weight: 700;
    color: var(--text-main);
}

.honor-role {
    font-size: 12px;
    color: var(--text-muted);
    line-height: 1.5;
}

/* ==========================================================================
   БЛОКИ ПРАВИЛ (карточка "Правила проведения тестов")
   ========================================================================== */
.rules-block {
    margin-bottom: 22px;
    border: 1px solid var(--border-color);
    border-radius: 14px;
    overflow: hidden;
    background: var(--card-bg);
}

.rules-block-title {
    padding: 14px 16px;
    font-size: 15px;
    font-weight: 700;
    color: var(--text-main);
    border-bottom: 1px solid var(--border-color);
    background: rgba(255,204,71,.05);
}

.rule-num-row {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border-color);
}

.rule-num-row:last-child {
    border-bottom: none;
}

.rule-num {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: var(--accent);
    background: rgba(255,204,71,.1);
    border: 1px solid rgba(255,204,71,.3);
    margin-top: 1px;
}

.rule-num-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--text-main);
    margin-bottom: 3px;
}

.rule-num-text {
    font-size: 12px;
    line-height: 1.55;
    color: var(--text-muted);
}

/* ==========================================================================
   РАЗДЕЛЫ-ХАБЫ "ТЕСТИРОВАНИЕ" И "ДРУГАЯ ИНФОРМАЦИЯ"
   Пронумерованные карточки-обложки с раскрытием контента по клику
   ========================================================================== */
.hub-intro {
    color: var(--text-muted);
    font-size: 14px;
    line-height: 1.6;
    margin: 4px 0 20px;
}

.hub-grid {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.hub-card {
    position: relative;
    border: 1px solid var(--border-color);
    border-radius: 18px;
    overflow: hidden;
    background: var(--card-bg);
    cursor: pointer;
    min-height: 150px;
    display: flex;
    align-items: flex-end;
}

.hub-card-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-color: #0a1020;
}

.hub-card-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(5,8,22,.35) 0%, rgba(5,8,22,.75) 65%, rgba(5,8,22,.92) 100%);
}

.hub-card-num {
    position: absolute;
    top: 16px;
    left: 16px;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: rgba(0,0,0,.55);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    z-index: 2;
}

.hub-card-heading {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
    z-index: 1;
}

.hub-card-heading span {
    font-size: 26px;
    line-height: 1.15;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: rgba(255,255,255,.14);
    text-shadow: 0 1px 0 rgba(255,255,255,.06);
}

.hub-card-footer {
    position: relative;
    z-index: 2;
    width: 100%;
    padding: 16px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    opacity: 0;
    transition: opacity 0.15s ease;
}

.hub-card:hover .hub-card-footer,
.hub-card:focus-visible .hub-card-footer,
.hub-card.hub-card-pressed .hub-card-footer {
    opacity: 1;
}

.hub-card-title {
    color: #fff;
    font-size: 15px;
    font-weight: 700;
}

.hub-card-link {
    color: var(--accent);
    font-size: 13px;
    font-weight: 700;
    white-space: nowrap;
}

.hub-card:hover {
    border-color: rgba(255,204,71,.5);
}

.hub-card:active {
    border-color: rgba(255,204,71,.5);
}

.hub-card:hover .hub-card-link,
.hub-card:active .hub-card-link {
    text-shadow: 0 0 8px rgba(255,204,71,.6);
}

/* Кастомизация фона под конкретную карточку через data-атрибут в HTML:
   <div class="hub-card" data-bg="assets/hub/tiertest.jpg"> — если картинки ещё
   нет, фон просто остаётся тёмным (background-color из .hub-card-bg). */

.hub-detail {
    display: none;
    animation: fadeInSubTab 0.2s ease;
}

.hub-detail.active {
    display: block;
}

.hub-detail-back {
    display: inline-flex;
    align-items: center;
    line-height: 1;
    background: var(--sidebar-item);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    margin-bottom: 18px;
    vertical-align: middle;
}

.hub-detail-back:hover {
    border-color: var(--accent);
    color: var(--accent);
}

/* ==========================================================================
   АДАПТИВНОСТЬ ДЛЯ МОБИЛЬНЫХ ЭКРАНОВ (max-width: 768px)
   ========================================================================== */
@media(max-width: 768px) {
    .hero h1 { font-size: 26px; }
    .filters, .filters-row-2 { grid-template-columns: 1fr; gap: 8px; }
    
    .player-card-row {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
        padding: 14px;
    }
    
    .player-name-block {
        justify-content: space-between;
        width: 100%;
        min-width: 0;
    }
    
    .player-center-block {
        width: 100%;
    }
    
    .player-right {
        margin-left: 0;
        text-align: right;
        width: 100%;
        border-top: 1px solid var(--border-color);
        padding-top: 10px;
        justify-content: flex-start;
    }
    
    .modal-grid {
        grid-template-columns: 1fr;
    }

    .info-nav-buttons {
        flex-direction: column;
        width: 100%;
    }
    
    .info-nav-btn {
        width: 100%;
        text-align: center;
    }
}

/* ==========================================================================
   УВАЖЕНИЕ К prefers-reduced-motion
   Для пользователей/устройств, которым лишние анимации мешают или
   нагружают слабое железо - отключаем декоративные эффекты, оставляя
   только мгновенные состояния.
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
        scroll-behavior: auto !important;
    }
}

/* ==========================================================================
   ELO
   ========================================================================== */

/* Elo в карточке топа по конкретному киту */
.bust-elo-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    color: var(--accent);
    background: rgba(255, 204, 71, 0.12);
    white-space: nowrap;
}

/* Блок "Elo до → после, изменение, ранг" внутри строки дуэли */
.duel-elo-change {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 6px;
    font-size: 12px;
    font-weight: 700;
    font-family: monospace;
}

.duel-elo-values {
    color: var(--text-main);
}

.duel-elo-delta.elo-up {
    color: #4ade80;
}

.duel-elo-delta.elo-down {
    color: #ff4747;
}

.duel-elo-delta.elo-flat {
    color: var(--text-muted);
}

.duel-elo-tier {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

/* Общий список дуэлей: две строки (победитель и проигравший) под заголовком */
.duel-vs {
    color: var(--text-muted);
    font-size: 12px;
}

.duel-elo-lines {
    margin-top: 2px;
}

.duel-elo-line .duel-elo-who {
    display: inline-block;
    margin-top: 6px;
    color: var(--text-main);
    font-size: 12px;
    cursor: pointer;
}

.duel-elo-line .duel-elo-who:hover {
    color: var(--accent);
}

.duel-elo-line .duel-elo-change {
    margin-top: 2px;
}

/* Пояснение к автопоражению */
.duel-note {
    margin-top: 6px;
    font-size: 11px;
    color: var(--text-muted);
    font-style: italic;
}

/* Состояние загрузки данных: ошибка с кнопкой повтора */
.load-error {
    text-align: center;
    padding: 40px 16px;
    color: #ff9b9b;
}

.load-error p {
    margin-bottom: 14px;
}

.load-retry-btn {
    padding: 10px 22px;
    border-radius: 10px;
    border: 1px solid var(--accent);
    background: transparent;
    color: var(--accent);
    font-weight: 700;
    cursor: pointer;
}

.load-retry-btn:hover {
    background: rgba(255, 204, 71, 0.12);
}


/* ==========================================================================
   ПЕРЕКЛЮЧАТЕЛЬ РЕЖИМОВ: Beta Elo / Classic PTS
   ========================================================================== */
.mode-switch {
    display: flex;
    gap: 4px;
    max-width: 360px;
    margin: -8px auto 22px;
    padding: 4px;
    background: var(--bg-solid);
    border: 1px solid var(--border-color);
    border-radius: 12px;
}

.mode-switch-btn {
    flex: 1;
    text-align: center;
    padding: 11px 10px;
    border-radius: 9px;
    font-size: 14px;
    font-weight: bold;
    text-decoration: none;
    color: var(--text-muted);
    border: 1px solid transparent;
    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.mode-switch-btn:hover {
    color: var(--text-main);
}

.mode-switch-btn.active {
    color: var(--accent);
    background: rgba(255, 204, 71, 0.12);
    border-color: var(--accent);
}

/* Очки PTS рядом с рангом в профиле (Classic PTS) */
.m-pts-box {
    margin-left: 6px;
    font-size: 0.85em;
    color: var(--text-muted);
}


/* ==========================================
   Карточка общего топа (Main / Sub Overall)
   ========================================== */
.ov-card {
    display: flex; align-items: stretch; padding: 0; overflow: hidden; cursor: pointer;
    background: linear-gradient(90deg, rgba(70, 76, 96, .55) 0%, var(--bg-solid) 58%);
}
/* Заливка слева по месту (цвета те же, что у рамок .top-rank-N выше):
   1 - золото, 2 - серебро, 3 - бронза, 4 - серый, 5 - бирюзовый */
.ov-card.top-rank-1 { background: linear-gradient(90deg, rgba(218, 165, 32, .90) 0%, rgba(218, 165, 32, .42) 28%, var(--bg-solid) 64%); }
.ov-card.top-rank-2 { background: linear-gradient(90deg, rgba(169, 169, 169, .85) 0%, rgba(169, 169, 169, .38) 28%, var(--bg-solid) 64%); }
.ov-card.top-rank-3 { background: linear-gradient(90deg, rgba(160, 82, 45, .90) 0%, rgba(160, 82, 45, .42) 28%, var(--bg-solid) 64%); }
.ov-card.top-rank-4 { background: linear-gradient(90deg, rgba(128, 128, 128, .75) 0%, rgba(128, 128, 128, .32) 28%, var(--bg-solid) 64%); }
.ov-card.top-rank-5 { background: linear-gradient(90deg, rgba(0, 128, 128, .80) 0%, rgba(0, 128, 128, .36) 28%, var(--bg-solid) 64%); }

.ov-skin-wrap { flex: 0 0 104px; display: flex; align-items: flex-end; justify-content: center; }
.ov-skin { display: block; width: 100%; height: auto; max-height: 190px; object-fit: contain; object-position: bottom; image-rendering: pixelated; }

.ov-body { flex: 1; min-width: 0; padding: 14px 0 14px 4px; display: flex; flex-direction: column; gap: 8px; }
.ov-title { display: flex; align-items: baseline; gap: 8px; min-width: 0; padding-right: 12px; }
.ov-title .player-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ov-elo { margin-top: -4px; font-size: 14px; color: var(--text-muted); }
.ov-tags { display: flex; gap: 8px; }
.ov-tag {
    box-sizing: border-box; width: 64px; height: 34px; display: inline-flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: bold; color: var(--text-muted);
    border: 1px solid var(--border-color); border-radius: 10px; background: rgba(0, 0, 0, .28);
}

/* Горизонтально листаемый ряд плиток */
.ov-scroll {
    display: flex; gap: 8px; overflow-x: auto; overflow-y: hidden;
    padding: 2px 14px 4px 0; margin-top: 2px;
    scroll-snap-type: x proximity; -webkit-overflow-scrolling: touch; scrollbar-width: none;
    -webkit-mask-image: linear-gradient(90deg, #000 90%, transparent);
            mask-image: linear-gradient(90deg, #000 90%, transparent);
}
.ov-scroll::-webkit-scrollbar { display: none; }
.ov-tile {
    flex: 0 0 56px; height: 66px; box-sizing: border-box; scroll-snap-align: start;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
    border: 1.5px solid; border-radius: 14px;
}
.ov-tile-icon { width: 28px; height: 28px; object-fit: contain; }
.ov-tile-tier { font-size: 14px; font-weight: bold; line-height: 1; }
.ov-tile-empty { border-color: var(--border-color); background: rgba(255, 255, 255, .03); opacity: .6; }
.ov-tile-empty .ov-tile-tier { color: #6b7490; }

/* Retired на плитке */
.ov-tile-retired { opacity: .5; }
.ov-tile-r { margin-left: 2px; font-size: 8px; color: var(--text-muted); vertical-align: super; }
