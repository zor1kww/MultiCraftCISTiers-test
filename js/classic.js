window.PTS = (() => {
'use strict';

let players;
let currentKitFilter = 'all';
let currentKitRegion = 'all';
let kitSearch = '';
let showKitRetired = true;

const tierPoints = {
    HT1: 60, LT1: 45,
    HT2: 30, LT2: 20,
    HT3: 10, LT3: 6,
    HT4: 4, LT4: 3,
    HT5: 2, LT5: 1,
    Unranked: 0
};
const tierColors = {
    HT1: '#DAA520', LT1: '#DAA520',
    HT2: '#A9A9A9', LT2: '#A9A9A9',
    HT3: '#A0522D', LT3: '#8B4513',
    HT4: '#808080', LT4: '#696969',
    HT5: '#008080', LT5: '#2F4F4F',
    Unranked: '#444b66'
};

// ==========================================
// 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ И ПАРСИНГ ТИРОВ
// ==========================================

// Порядок тиров от старшего к младшему. Единый источник правды для
// сравнений тиров и для определения, какие тиры вообще могут быть Retired.
const TIER_ORDER = ['HT1', 'LT1', 'HT2', 'LT2', 'HT3', 'LT3', 'HT4', 'LT4', 'HT5', 'LT5'];

// Retired-статус (ручной или автоматический по сроку) возможен только
// начиная с HT3 и выше: HT1, LT1, HT2, LT2, HT3.
const RETIRED_ELIGIBLE_TIERS = TIER_ORDER.slice(0, TIER_ORDER.indexOf('HT3') + 1);

// Через сколько дней без пересдачи кит автоматически считается Retired
const RETIRED_AUTO_DAYS = 60;

// Проверка: истёк ли срок с даты последнего теста по киту (>60 дней)
function isDateExpired(dateStr) {
    if (!dateStr) return false;
    const testDate = new Date(dateStr);
    if (isNaN(testDate.getTime())) return false;

    const diffMs = Date.now() - testDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > RETIRED_AUTO_DAYS;
}

// ==========================================
// ШТРАФНЫЕ ОЧКИ (только для HT3+ тестов, см. penalty_logic.py на боте)
// ==========================================

// Через сколько дней с даты ПЕРВОГО начисления в текущем цикле весь
// накопленный штраф по киту истекает целиком (обнуляется). Должно совпадать
// с PENALTY_EXPIRY_DAYS в bot_config.py.
const PENALTY_EXPIRY_DAYS = 30;

// Порог автопонижения - должен совпадать с PENALTY_DEMOTION_THRESHOLD в bot_config.py
const PENALTY_DEMOTION_THRESHOLD = 2.0;

// Та же проверка истечения цикла штрафов, что и isDateExpired, но со своим
// порогом (30 дней вместо 60) - вынесена отдельно для ясности читаемого кода
function isPenaltyCycleExpired(dateStr) {
    if (!dateStr) return false;
    const startDate = new Date(dateStr);
    if (isNaN(startDate.getTime())) return false;

    const diffMs = Date.now() - startDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays > PENALTY_EXPIRY_DAYS;
}

// Возвращает актуальные (не истёкшие) штрафные очки игрока по одному киту.
// penaltyEntry - { points, firstPenaltyDate } или undefined/null.
// Порт effective_penalty_points() из penalty_logic.py - истёкший цикл
// показывает 0, даже если бот ещё не записал это явно в players.js
// (обнуление на боте происходит лениво, только при следующем начислении).
function getEffectivePenalty(player, kit) {
    if (!player || !player.penaltyByKit) return 0;
    const entry = player.penaltyByKit[kit];
    if (!entry) return 0;
    if (isPenaltyCycleExpired(entry.firstPenaltyDate)) return 0;
    return entry.points || 0;
}

// Суммарные актуальные штрафные очки игрока по ВСЕМ китам сразу
// (для отображения общего числа в шапке профиля)
function getTotalEffectivePenalty(player) {
    if (!player || !player.penaltyByKit) return 0;
    let total = 0;
    for (const kit in player.penaltyByKit) {
        total += getEffectivePenalty(player, kit);
    }
    return total;
}

// Универсальный парсер данных тира.
// Поддерживает новый формат { tier, date, retired } и, для обратной
// совместимости, старый формат в виде строки ("HT3" / "RHT3").
function parseTierInfo(tierData) {
    if (!tierData) return { tier: "Unranked", isRetired: false, pts: 0 };

    let tier = "Unranked";
    let manualRetired = false;
    let testDate = null;

    if (typeof tierData === 'string') {
        // Старый формат-строка (данные до миграции) - поддерживаем на всякий случай
        if (tierData.startsWith('R') && tierData.length > 1) {
            manualRetired = true;
            tier = tierData.substring(1);
        } else {
            tier = tierData;
        }
    } else if (typeof tierData === 'object') {
        tier = tierData.tier || "Unranked";
        manualRetired = tierData.retired === true;
        testDate = tierData.date || null;
    }

    // Retired ниже HT3 невозможен в принципе, независимо от того, что
    // записано в базе (защита от рассинхрона/старых данных)
    const eligibleForRetired = RETIRED_ELIGIBLE_TIERS.includes(tier);

    const autoRetiredByDate = eligibleForRetired && isDateExpired(testDate);
    const isRetired = eligibleForRetired && (manualRetired || autoRetiredByDate);

    // Безопасное получение очков
    const activePts = (typeof tierPoints !== 'undefined') ? tierPoints : {};
    return {
        tier: tier,
        isRetired: isRetired,
        date: testDate,
        pts: activePts[tier] || 0
    };
}

// Хелпер для получения чистого названия тира (без префикса R)
function getCleanTier(player, kit) {
    if (!player || !player.tiers) return "Unranked";
    return parseTierInfo(player.tiers[kit]).tier;
}

// Хелпер для определения, является ли конкретный кит игрока "Retired"
function isKitRetired(player, kit) {
    if (!player || !player.tiers) return false;
    return parseTierInfo(player.tiers[kit]).isRetired;
}

// Проверка: есть ли у игрока ХОТЯ БЫ ОДИН кит со статусом retired (Только для Main китов)
function hasAnyRetiredKit(player) {
    if (!player) return false;
    if (player.retired === true) return true;
    
    const activeMaintiers = (typeof maintiers !== 'undefined') ? maintiers : [];
    const allKits = [...activeMaintiers];
    
    for (let i = 0; i < allKits.length; i++) {
        if (isKitRetired(player, allKits[i])) {
            const tier = getCleanTier(player, allKits[i]);
            if (tier !== "Unranked") {
                return true;
            }
        }
    }
    return false;
}

// Расчет общих очков игрока по массиву китов (Main или Sub)
function calcPoints(player, kits) {
    if (!player || !kits) return 0;
    return kits.reduce((total, kit) => total + parseTierInfo(player.tiers[kit]).pts, 0);
}

// Расчет среднего тира игрока по всем его Main и Sub китам (исключая Unranked)
function calcAverageTier(player) {
    if (!player || !player.tiers) return "Unranked";
    
    // Получаем оба массива китов (если subtiers не задан, используем пустой массив)
    const activeMaintiers = (typeof maintiers !== 'undefined') ? maintiers : [];
    const activeSubtiers = (typeof subtiers !== 'undefined') ? subtiers : [];
    
    // Объединяем их в один общий список для расчёта
    const allKits = [...activeMaintiers, ...activeSubtiers];
    
    const tierWeights = {
        'HT1': 10, 'LT1': 9,
        'HT2': 8,  'LT2': 7,
        'HT3': 6,  'LT3': 5,
        'HT4': 4,  'LT4': 3,
        'HT5': 2,  'LT5': 1
    };
    
    const reverseWeights = {
        10: 'HT1', 9: 'LT1',
        8: 'HT2',  7: 'LT2',
        6: 'HT3',  5: 'LT3',
        4: 'HT4',  3: 'LT4',
        2: 'HT5',  1: 'LT5'
    };

    let totalWeight = 0;
    let count = 0;

    // Пробегаемся по абсолютно всем китам (Main + Sub)
    allKits.forEach(kit => {
        const tier = getCleanTier(player, kit);
        if (tier !== "Unranked" && tierWeights[tier] !== undefined) {
            totalWeight += tierWeights[tier];
            count++;
        }
    });

    if (count === 0) return "Unranked";
    
    const avgWeight = Math.round(totalWeight / count);
    return reverseWeights[avgWeight] || "Unranked";
}

// Генерация HTML-бейдж-тиров для правой стороны (список в один тон или с R)
function getTierBadge(tier, appendR = false) {
    const activeColors = (typeof tierColors !== 'undefined') ? tierColors : {};
    const color = activeColors[tier] || '#fff';
    
    if (appendR && tier !== "Unranked") {
        return `<span class="tier-badge" style="border: 1px solid ${color}44; background: ${color}11;">
            <span style="color: #ff4a4a; font-weight: bold;">R</span><span style="color: ${color};">${tier}</span>
        </span>`;
    }
    return `<span class="tier-badge" style="color: ${color}; border: 1px solid ${color}44; background: ${color}11;">${tier}</span>`;
}

// Генерация маленького тега тира (среднего или конкретного) после устройства.
function getMetaTierTag(tier, isRetired = false) {
    const activeColors = (typeof tierColors !== 'undefined') ? tierColors : {};
    const color = activeColors[tier] || '#8892b0';
    
    if (isRetired && tier !== "Unranked") {
        return `
        <span class="player-meta-tag" style="border-color: ${color}55; background: ${color}11; padding: 2px 6px;">
            <span style="color: #ff4a4a; font-weight: bold; margin-right: 1px;">R</span><span style="color: ${color}; font-weight: bold;">${tier}</span>
        </span>`;
    }
    
    return `<span class="player-meta-tag" style="color: ${color}; border-color: ${color}55; background: ${color}11; font-weight: bold;">${tier}</span>`;
}

// Проверка, является ли игрок тестером
function isTester(playerName) {
    if (!playerName) return false;
    const nameLower = playerName.toLowerCase();
    const testers = ["-999-", "dzila_editsmob", "-back-"];
    return testers.includes(nameLower);
}

// Открытие профиля игрока по имени (используется в Доске почета и вкладке Тестеры,
// где нет отфильтрованного списка карточек, а есть просто статичное имя)
function openProfileByName(playerName) {
    if (typeof players === 'undefined' || !Array.isArray(players)) {
        console.warn('База игроков ещё не загружена.');
        return;
    }
    const found = players.find(p => p.name && p.name.toLowerCase() === playerName.toLowerCase());
    if (!found) {
        console.warn(`Игрок "${playerName}" не найден в базе.`);
        return;
    }
    const encoded = encodeURIComponent(JSON.stringify([found]));
    openProfile(0, encoded);
}

// ==========================================
// 3. ОКНА ПРОФИЛЕЙ (МОДАЛЬНЫЕ ОКНА)
// ==========================================

// Открытие детального профиля игрока в модальном окне
function openProfile(idx, filteredPlayersJSON) {
    try {
        const mainBlock = document.getElementById('modalMainBlock');
        const subBlock = document.getElementById('modalSubBlock');
        if (mainBlock) mainBlock.style.display = '';
        if (subBlock) subBlock.style.display = '';
        const mainTitle = document.getElementById('modalMainTitle');
        const subTitle = document.getElementById('modalSubTitle');
        if (mainTitle) mainTitle.textContent = 'Main Tiers';
        if (subTitle) subTitle.textContent = 'Sub Tiers';
        const localFiltered = JSON.parse(decodeURIComponent(filteredPlayersJSON));
        const player = localFiltered[idx];
        if (!player) return;
        
        const modalName = document.getElementById('modalPlayerName');
        if (modalName) modalName.innerHTML = player.name;
        
        // Генерация красивых тегов оформления для профиля в ряд
        let metaHTML = '';
        if (player.region) {
            metaHTML += `<span class="player-meta-tag">${player.region}</span>`;
        }

        // Сбор и отображение объединенного тира в модальном окне
        const targetKit = currentKitFilter || 'all';
        const displayProfileRetiredTag = hasAnyRetiredKit(player);
        
        if (targetKit === 'all' || targetKit === 'sub-all') {
            const avgTier = calcAverageTier(player);
            if (avgTier !== "Unranked") {
                metaHTML += getMetaTierTag(avgTier, displayProfileRetiredTag);
            }
        } else {
            const currentTier = getCleanTier(player, targetKit);
            const ret = isKitRetired(player, targetKit);
            if (currentTier !== "Unranked") {
                metaHTML += getMetaTierTag(currentTier, ret);
            }
        }

        const modalMeta = document.getElementById('modalPlayerMeta');
        if (modalMeta) {
            modalMeta.innerHTML = `<div class="player-meta-box" style="justify-content: flex-start; margin-top: 5px; gap: 6px;">${metaHTML}</div>`;
        }
        
        const roleContainer = document.getElementById('modalRoleContainer');
        if (roleContainer) {
            if (isTester(player.name)) {
                roleContainer.innerHTML = `<span class="custom-role-badge">Tester</span>`;
            } else {
                roleContainer.innerHTML = '';
            }
        }

        // Штрафные очки убраны из профиля игрока по требованию: теперь
        // они видны только в топе, отфильтрованном по конкретному киту
        // (см. renderPlayers, ветка targetKit !== 'all'/'sub-all').
        const modalPenaltyTotal = document.getElementById('modalPenaltyTotal');
        if (modalPenaltyTotal) {
            modalPenaltyTotal.style.display = 'none';
        }

        const activeMaintiers = (typeof maintiers !== 'undefined') ? maintiers : [];
        const activeSubtiers = (typeof subtiers !== 'undefined') ? subtiers : [];
        const activePts = (typeof tierPoints !== 'undefined') ? tierPoints : {};
        const activeKitImages = (typeof kitImages !== 'undefined') ? kitImages : {};
        
        const mainRows = document.getElementById('modalMainRows');
        if (mainRows) {
            mainRows.innerHTML = activeMaintiers.map(kit => {
                const t = getCleanTier(player, kit);
                const iconSrc = activeKitImages[kit] || "";
                const ret = isKitRetired(player, kit);
                return `<div class="modal-row" style="${ret ? 'opacity:0.6;' : ''}">
                    <div class="modal-kit-left">
                        <img class="modal-kit-icon" src="${iconSrc}" onerror="this.style.opacity='0'" alt="">
                        <span class="m-kit">${kit}</span>
                    </div>
                    <div class="m-right-side">
                        ${getTierBadge(t, ret)} 
                        <span class="m-pts-box">(${activePts[t] || 0} PTS)</span>
                    </div>
                </div>`;
            }).join('');
        }
        
        const subRows = document.getElementById('modalSubRows');
        if (subRows) {
            subRows.innerHTML = activeSubtiers.map(kit => {
                const t = getCleanTier(player, kit);
                const iconSrc = activeKitImages[kit] || "";
                const ret = isKitRetired(player, kit);
                return `<div class="modal-row" style="${ret ? 'opacity:0.6;' : ''}">
                    <div class="modal-kit-left">
                        <img class="modal-kit-icon" src="${iconSrc}" onerror="this.style.opacity='0'" alt="">
                        <span class="m-kit">${kit}</span>
                    </div>
                    <div class="m-right-side">
                        ${getTierBadge(t, ret)} 
                        <span class="m-pts-box">(${activePts[t] || 0} PTS)</span>
                    </div>
                </div>`;
            }).join('');
        }
        
        const modalMainTotal = document.getElementById('modalMainTotal');
        if (modalMainTotal) modalMainTotal.innerText = `Всего за Main: ${calcPoints(player, activeMaintiers)} PTS`;
        
        const modalSubTotal = document.getElementById('modalSubTotal');
        if (modalSubTotal) modalSubTotal.innerText = `Всего за Sub: ${calcPoints(player, activeSubtiers)} PTS`;

        const modalDuelsRows = document.getElementById('modalDuelsRows');
        if (modalDuelsRows) {
            modalDuelsRows.innerHTML = renderDuelsList(player.matchHistory, { showKit: true });
        }
        
        const profileModal = document.getElementById('profileModal');
        if (profileModal) profileModal.classList.add('active');
    } catch (e) {
        console.error("Ошибка открытия профиля:", e);
    }
}

// Закрытие модального окна профиля
function closeModal() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.remove('active');
}

// ==========================================
// 4. ГЛАВНАЯ ФУНКЦИЯ РЕНДЕРИНГА ТАБЛИЦЫ
// ==========================================

function renderKitChips() {
    const row = document.getElementById('kitsChipsRow');
    if (!row) return;
    const active = currentKitFilter || 'all';
    const main = (typeof maintiers !== 'undefined') ? maintiers : [];
    const sub = (typeof subtiers !== 'undefined') ? subtiers : [];
    const html = [chipHTML('all', 'Overall', 'crown', active === 'all', 'PTS.setKitFilter(this.dataset.v)')]
        .concat(main.map(kit => chipHTML(kit, kit, kitImages[kit], active === kit, 'PTS.setKitFilter(this.dataset.v)')))
        .concat([chipHTML('sub-all', 'Sub Overall', 'crown', active === 'sub-all', 'PTS.setKitFilter(this.dataset.v)')])
        .concat(sub.map(kit => chipHTML(kit, kit, kitImages[kit], active === kit, 'PTS.setKitFilter(this.dataset.v)')));
    row.innerHTML = html.join('');
    const activeChip = row.querySelector('.chip.active');
    if (activeChip) row.scrollLeft = Math.max(0, activeChip.offsetLeft - (row.clientWidth - activeChip.offsetWidth) / 2);
}

function setKitFilter(value, shouldRender = true) {
    currentKitFilter = value || 'all';
    if (shouldRender) renderAll();
}

function quickTiersFor(player, targetKit, showRetiredInPlace) {
    const kits = targetKit === 'sub-all' ? subtiers : maintiers;
    const items = kits.map((kit, order) => {
        const tier = getCleanTier(player, kit);
        const ret = isKitRetired(player, kit);
        const pts = tierPoints[tier] || 0;
        const weight = tier === 'Unranked' ? -10000 : (ret ? pts - 5000 : pts);
        return { kit, tier, ret, weight, order };
    }).sort((a, b) => b.weight - a.weight || a.order - b.order);
    return items.map(item => {
        const color = tierColors[item.tier] || '#444b66';
        const hiddenRetired = !showRetiredInPlace && item.ret;
        const empty = item.tier === 'Unranked' || hiddenRetired;
        const label = empty ? '—' : `${item.ret ? 'R' : ''}${item.tier}`;
        return `<div class="ov-tile${empty ? ' ov-tile-empty' : ''}${item.ret && !empty ? ' ov-tile-retired' : ''}" style="${empty ? '' : `border-color:${color}99;background:${color}26;`}" title="${escapeHTML(item.kit)}">
            <img class="ov-tile-icon" src="${kitImages[item.kit] || ''}" onerror="this.style.opacity=0" alt="">
            <span class="ov-tile-tier" style="color:${empty ? '#6b7490' : color};">${label}</span>
        </div>`;
    }).join('');
}

function renderPlayers() {
    const list = document.getElementById('kitsPlayersList');
    if (!list) return;
    const subtitleEl = document.getElementById('kitsTableSubtitle');
    const countEl = document.querySelector('#kitsPlayerCount strong');
    const targetKit = currentKitFilter || 'all';
    const isOverall = targetKit === 'all' || targetKit === 'sub-all';
    const showRetiredInPlace = showKitRetired !== false;
    const boardLabel = targetKit === 'all' ? 'Main Overall' : (targetKit === 'sub-all' ? 'Sub Overall' : targetKit);
    if (subtitleEl) subtitleEl.textContent = boardLabel;

    if (!Array.isArray(players)) {
        list.innerHTML = '<div class="board-empty">Загрузка PTS-рейтинга…</div>';
        if (countEl) countEl.textContent = '0';
        return;
    }

    const kitsForSorting = targetKit === 'sub-all' ? subtiers : maintiers;
    let filtered = players.filter(player => {
        const matchesSearch = (player.name || '').toLowerCase().includes(kitSearch.toLowerCase());
        const cisPlayer = KIT_REGION_CODES.includes(player.region);
        const matchesRegion = cisPlayer && (currentKitRegion === 'all' || player.region === currentKitRegion);
        if (!matchesSearch || !matchesRegion) return false;
        if (!isOverall) {
            if (!showRetiredInPlace && isKitRetired(player, targetKit)) return false;
            return getCleanTier(player, targetKit) !== 'Unranked';
        }
        if (!showRetiredInPlace && hasAnyRetiredKit(player)) return false;
        return kitsForSorting.some(kit => getCleanTier(player, kit) !== 'Unranked');
    });

    filtered.sort((a, b) => {
        if (isOverall) return (calcPoints(b, kitsForSorting) - calcPoints(a, kitsForSorting)) || a.name.localeCompare(b.name);
        return ((tierPoints[getCleanTier(b, targetKit)] || 0) - (tierPoints[getCleanTier(a, targetKit)] || 0)) || a.name.localeCompare(b.name);
    });

    if (countEl) countEl.textContent = String(filtered.length);
    if (!filtered.length) {
        list.innerHTML = '<div class="board-empty">Игроки не найдены</div>';
        return;
    }

    const filteredJSON = encodeURIComponent(JSON.stringify(filtered));
    list.innerHTML = filtered.map((player, index) => {
        const position = index + 1;
        const onClick = `onclick="PTS.openProfile(${index}, '${filteredJSON}')"`;
        const isRet = isOverall ? hasAnyRetiredKit(player) : isKitRetired(player, targetKit);
        const topClass = `${index < 5 ? `top-rank-${position}` : ''}${isRet ? ' retired-status' : ''}`;
        const regionHTML = `<span class="player-meta-tag">${escapeHTML(player.region || '?')}</span>`;
        const pts = isOverall ? calcPoints(player, kitsForSorting) : null;
        const avgTier = isOverall ? calcAverageTier(player) : null;
        const avgTag = isOverall && avgTier !== 'Unranked' ? getMetaTierTag(avgTier, isRet) : '';
        const avgTagOv = isOverall && avgTier !== 'Unranked' ? ovTierTagHTML(avgTier, isRet) : '';
        const penalty = !isOverall ? getEffectivePenalty(player, targetKit) : 0;
        const penaltyHTML = penalty > 0 ? `<span class="bust-penalty-badge" title="Штрафные очки по этому киту">⚠ ${penalty}</span>` : '';

        // Общий топ: первые пять - большие карточки. Топ отдельного кита: большие карточки
        // для всех мест (с 6-го фон нейтральный, без цветной заливки).
        if (index < 5 || !isOverall) {
            const tiles = isOverall ? `<div class="ov-scroll" aria-label="Ранги по китам">${quickTiersFor(player, targetKit, showRetiredInPlace)}</div>` : '';
            const ratingLine = isOverall
                ? `<div class="ov-elo"><strong>${pts} PTS</strong></div><div class="ov-tags">${avgTagOv}<span class="ov-tag">${escapeHTML(player.region || '?')}</span></div>`
                : `<div class="ov-tags">${ovTierTagHTML(getCleanTier(player, targetKit), isRet)}<span class="ov-tag">${escapeHTML(player.region || '?')}</span></div>${penaltyHTML ? `<div class="ov-elo premium-rating-line">${penaltyHTML}</div>` : ''}`;
            return `<div class="player-container ov-card premium-kit-card ${topClass}" ${onClick}>
                <div class="ov-skin-wrap"><img class="ov-skin" src="${window.overallSkinSrc}" alt="" onerror="this.style.display='none';"></div>
                <div class="ov-body">
                    <div class="ov-title">${rankHTML(position)}<span class="player-name">${escapeHTML(player.name)}</span></div>
                    ${ratingLine}${tiles}
                </div>
            </div>`;
        }

        return `<div class="player-container ${topClass}">
            <div class="player-card-row" ${onClick}>
                <div class="player-name-block">${rankHTML(position)}<span class="player-name">${escapeHTML(player.name)}</span></div>
                <div class="player-center-block"><div class="player-meta-box">${regionHTML}${avgTag}</div><div class="ov-scroll compact-overall-tiles">${quickTiersFor(player, targetKit, showRetiredInPlace)}</div></div>
                <div class="player-right"><span class="pts-total">${pts} PTS</span></div>
            </div>
        </div>`;
    }).join('');
}

function renderAll() {
    renderKitChips();
    renderPlayers();
}

// ==========================================
// 5. ИНФОРМАЦИОННЫЙ ЦЕНТР И FAQ
// ==========================================

// Автоматическая сборка таблицы начисления PTS
function buildFaqTable() {
    const tbody = document.getElementById('faqTableBody');
    if (!tbody) return;
    const order = ['HT1', 'LT1', 'HT2', 'LT2', 'HT3', 'LT3', 'HT4', 'LT4', 'HT5', 'LT5', 'Unranked'];
    const activeColors = (typeof tierColors !== 'undefined') ? tierColors : {};
    const activePts = (typeof tierPoints !== 'undefined') ? tierPoints : {};
    
    tbody.innerHTML = order.map(tier => {
        const color = activeColors[tier] || '#fff';
        return `<tr>
            <td><span class="tier-badge" style="color: ${color}; border: 1px solid ${color}44; background:${color}11;">${tier}</span></td>
            <td><span style="color: var(--accent); font-weight:bold;">${activePts[tier] || 0} PTS</span></td>
        </tr>`;
    }).join('');
}

// ==========================================
// ДУЭЛИ (matchHistory) - используется и в профиле игрока, и во
// вкладке "Дуэли" (глобальный список по всем игрокам)
// ==========================================

// Приводит запись matchHistory к единому виду, независимо от того, какой
// версией бота она была записана: старые записи используют поля
// tester/scoreTester (реликт до перехода на терминологию "Оппонент",
// когда соперником всегда был тестер), новые - opponent/scoreOpponent.
// Аналогично winner: старое значение "tester" равнозначно "opponent".
function normalizeDuelEntry(entry) {
    const opponent = entry.opponent !== undefined ? entry.opponent : entry.tester;
    const scoreOpponent = entry.scoreOpponent !== undefined ? entry.scoreOpponent : entry.scoreTester;
    const winner = entry.winner === 'tester' ? 'opponent' : entry.winner;
    return { ...entry, opponent, scoreOpponent, winner };
}

// Собирает уникальный список дуэлей со всех игроков. Каждая дуэль хранится
// СИММЕТРИЧНО в matchHistory обоих участников (см. main.py на боте) -
// поэтому здесь дедуплицируем по ключу (кит+дата+счёт+пара имён без учёта
// порядка), оставляя одну запись на дуэль, показанную "от лица" игрока,
// которого реально тестировали. Старые записи (до перехода на
// симметричную запись) есть только у одной стороны - для них
// дедупликация просто не найдёт пары, и они всё равно покажутся один
// раз, что корректно.
function collectGlobalDuels() {
    if (typeof players === 'undefined' || !Array.isArray(players)) return [];

    // Собираем ВСЕ стороны всех дуэлей (обе копии - и "Игрока", и
    // "Оппонента" из шаблона бота), группируя по уникальному ключу
    // дуэли. Затем для каждой дуэли выбираем ОДНУ сторону для показа -
    // ту, что соответствует "Игроку" (тестируемому).
    //
    // Новые записи несут явный флаг isPlayerSide (см. tier_logic.py) -
    // по нему выбор однозначен. У старых записей (до этого поля) флага
    // нет - для них используется запасная эвристика "тир реально
    // менялся" (tierBefore !== tierAfter), как и раньше. У этой
    // эвристики есть известный слепой случай - "закрепление" (тест
    // подтвердил тот же тир), когда тир не меняется ни у одной из
    // сторон; тогда для старой записи она не может различить стороны
    // и оставляет первую встреченную. Это неизбежно без флага и
    // касается только записей, сделанных до его появления.
    const byKey = new Map();

    players.forEach(player => {
        const history = Array.isArray(player.matchHistory) ? player.matchHistory : [];
        history.forEach(raw => {
            if (!raw || raw.opponent === 'система' || raw.tester === 'система') return;
            const entry = normalizeDuelEntry(raw);
            if (!entry.opponent) return;

            const namesKey = [player.name, entry.opponent].sort().join('|');
            const key = `${entry.kit}|${entry.date}|${namesKey}|${[entry.scorePlayer, entry.scoreOpponent].sort().join('-')}`;

            const candidate = { ...entry, playerName: player.name };

            if (!byKey.has(key)) {
                byKey.set(key, candidate);
                return;
            }

            const existing = byKey.get(key);

            // Если у обеих копий есть явный флаг - он и решает, без
            // всякого угадывания по тиру.
            if (typeof candidate.isPlayerSide === 'boolean' && typeof existing.isPlayerSide === 'boolean') {
                if (candidate.isPlayerSide && !existing.isPlayerSide) {
                    byKey.set(key, candidate);
                }
                return;
            }

            // Запасная эвристика для старых записей без флага: сторона
            // "Игрока" - та, где тир реально менялся, включая
            // квалификационные тесты (tierBefore пуст/Unranked, но
            // tierAfter заполнен).
            const candidateIsTested = candidate.tierBefore !== candidate.tierAfter && !!candidate.tierAfter;
            const existingIsTested = existing.tierBefore !== existing.tierAfter && !!existing.tierAfter;

            if (candidateIsTested && !existingIsTested) {
                byKey.set(key, candidate);
            }
            // Если обе или ни одна сторона не показывают смену тира -
            // оставляем ту, что уже есть (первая встреченная): без флага
            // у старой записи иначе не разобрать, менять смысла нет.
        });
    });

    return Array.from(byKey.values());
}

// Строит HTML-блок с рангами дуэли (предыдущий → полученный), если они
// зафиксированы в записи. В профиле игрока неизменившийся тир
// (tierBefore === tierAfter) скрывается; во вкладке "Дуэли" блок
// показывается всегда (opts.showUnchanged), включая случаи вроде HT4 → HT4.
function buildDuelTierChangeHTML(entry, opts = {}) {
    if (!entry.tierBefore || !entry.tierAfter) return '';
    if (!opts.showUnchanged && entry.tierBefore === entry.tierAfter) return '';

    const activeColors = (typeof tierColors !== 'undefined') ? tierColors : {};
    const colorBefore = activeColors[entry.tierBefore] || 'var(--text-muted)';
    const colorAfter = activeColors[entry.tierAfter] || 'var(--accent)';

    return `<div class="duel-tier-change">
        <span style="color:${colorBefore};">${entry.tierBefore}</span>
        <span class="duel-tier-arrow">→</span>
        <span style="color:${colorAfter}; font-weight:700;">${entry.tierAfter}</span>
    </div>`;
}

// Тир из записи дуэли без возможного префикса R (Retired) и без пробелов.
function cleanDuelTier(t) {
    if (!t) return '';
    return String(t).trim().replace(/^R(?=[HL]T)/, '');
}

// Квалификация: у игрока до дуэли не было ранга, после - первый ранг получен
// (та же логика, что в collectGlobalDuels для "стороны Игрока").
function isQualificationDuel(d) {
    const before = cleanDuelTier(d.tierBefore);
    const after = cleanDuelTier(d.tierAfter);
    return (!before || before === 'Unranked') && !!after && after !== 'Unranked';
}

// Высокий результат: полученный тир HT3 и выше (HT3, LT2, HT2, LT1, HT1) -
// тот же порог, что RETIRED_ELIGIBLE_TIERS.
function isHighResultDuel(d) {
    return RETIRED_ELIGIBLE_TIERS.includes(cleanDuelTier(d.tierAfter));
}

// Рендер вкладки "Дуэли" — применяет поиск (по игроку/оппоненту) и фильтр
// по киту, показывает имя ОБОИХ участников в строке (в отличие от профиля,
// где "я" подразумевается контекстом модалки).
function renderGlobalDuels() {
    const container = document.getElementById('globalDuelsList');
    if (!container) return;

    const searchInput = document.getElementById('duelsSearchInput');
    const search = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const kitFilter = window.currentDuelsKitFilter || 'all';

    let duels = collectGlobalDuels();

    if (kitFilter === 'main-all') {
        const mainKits = (typeof maintiers !== 'undefined') ? maintiers : [];
        duels = duels.filter(d => mainKits.includes(d.kit));
    } else if (kitFilter === 'sub-all') {
        const subKits = (typeof subtiers !== 'undefined') ? subtiers : [];
        duels = duels.filter(d => subKits.includes(d.kit));
    } else if (kitFilter !== 'all') {
        duels = duels.filter(d => d.kit === kitFilter);
    }
    const qualToggle = document.getElementById('duelsQualToggle');
    const highToggle = document.getElementById('duelsHighToggle');
    if (qualToggle && qualToggle.checked) {
        duels = duels.filter(isQualificationDuel);
    }
    if (highToggle && highToggle.checked) {
        duels = duels.filter(isHighResultDuel);
    }
    if (search) {
        duels = duels.filter(d =>
            d.playerName.toLowerCase().includes(search) ||
            String(d.opponent).toLowerCase().includes(search)
        );
    }

    duels.sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    if (duels.length === 0) {
        container.innerHTML = `<p class="duels-empty">Дуэли не найдены.</p>`;
        return;
    }

    const activeKitImages = (typeof kitImages !== 'undefined') ? kitImages : {};
    container.innerHTML = duels.map(entry => {
        const won = entry.winner === 'player';
        const resultClass = won ? 'duel-win' : 'duel-loss';
        const commentHTML = entry.comment ? `<div class="duel-comment">${entry.comment}</div>` : '';
        const tierChangeHTML = buildDuelTierChangeHTML(entry, { showUnchanged: true });
        const playerSafe = String(entry.playerName).replace(/'/g, "\\'");
        const opponentSafe = String(entry.opponent).replace(/'/g, "\\'");

        return `<div class="duel-row ${resultClass}">
            <div class="duel-row-top">
                <div class="duel-kit">
                    <img class="duel-kit-icon" src="${activeKitImages[entry.kit] || ''}" onerror="this.style.display='none';" alt="">
                    <span>${entry.kit}</span>
                </div>
                <span class="duel-date">${entry.date || ''}</span>
            </div>
            <div class="duel-row-main">
                <span class="duel-opponent-name" onclick="PTS.openProfileByName('${playerSafe}')">${entry.playerName}</span>
                <span class="duel-score">${entry.scorePlayer}:${entry.scoreOpponent}</span>
                <span class="duel-opponent-name" onclick="PTS.openProfileByName('${opponentSafe}')">${entry.opponent}</span>
            </div>
            ${tierChangeHTML}
            ${commentHTML}
        </div>`;
    }).join('');
}

// Одна запись дуэли -> HTML-строка. showKit=true добавляет иконку/название
// кита (нужно во вкладке "Дуэли", где записи вперемешку по разным китам;
// в профиле игрока кит и так виден из контекста блока Main/Sub Tiers выше,
// но параметр всё равно поддерживается на будущее).
function renderDuelRow(rawEntry, showKit) {
    const entry = normalizeDuelEntry(rawEntry);
    const activeKitImages = (typeof kitImages !== 'undefined') ? kitImages : {};
    const won = entry.winner === 'player';
    const resultClass = won ? 'duel-win' : 'duel-loss';
    const resultLabel = won ? 'Победа' : 'Поражение';

    const kitHTML = showKit
        ? `<div class="duel-kit">
                <img class="duel-kit-icon" src="${activeKitImages[entry.kit] || ''}" onerror="this.style.display='none';" alt="">
                <span>${entry.kit}</span>
           </div>`
        : '';

    const commentHTML = entry.comment
        ? `<div class="duel-comment">${entry.comment}</div>`
        : '';

    const tierChangeHTML = buildDuelTierChangeHTML(entry);
    const opponentSafe = String(entry.opponent).replace(/'/g, "\\'");

    return `<div class="duel-row ${resultClass}">
        <div class="duel-row-top">
            ${kitHTML}
            <span class="duel-date">${entry.date || ''}</span>
        </div>
        <div class="duel-row-main">
            <span class="duel-opponent-label">против</span>
            <span class="duel-opponent-name" onclick="PTS.openProfileByName('${opponentSafe}')">${entry.opponent}</span>
            <span class="duel-score">${entry.scorePlayer}:${entry.scoreOpponent}</span>
            <span class="duel-result-badge">${resultLabel}</span>
        </div>
        ${tierChangeHTML}
        ${commentHTML}
    </div>`;
}

// Список дуэлей игрока (используется в профиле). Системные записи
// автопонижения (opponent/tester === "система") сюда не относятся - это
// не дуэль, а служебное событие, поэтому исключаются из списка.
function renderDuelsList(matchHistory, opts = {}) {
    const showKit = !!opts.showKit;
    const list = Array.isArray(matchHistory) ? matchHistory : [];
    const duels = list.filter(e => e && e.opponent !== 'система' && e.tester !== 'система');

    if (duels.length === 0) {
        return `<p class="duels-empty">Дуэлей пока нет.</p>`;
    }

    const sorted = [...duels].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return sorted.map(entry => renderDuelRow(entry, showKit)).join('');
}

function setPlayers(data) {
    players = Array.isArray(data) ? data : [];
    renderAll();
    if (typeof renderHome === 'function') renderHome();
}

function setSearch(value) { kitSearch = String(value || ''); renderPlayers(); }
function getSearch() { return kitSearch; }
function setRegion(value) {
    currentKitRegion = value === 'all' || KIT_REGION_CODES.includes(value) ? value : 'all';
    renderPlayers();
}
function getRegion() { return currentKitRegion; }
function setRetired(value) { showKitRetired = !!value; renderPlayers(); }
function getRetired() { return showKitRetired; }
function getKitFilter() { return currentKitFilter; }
function getPlayers() { return Array.isArray(players) ? players : []; }

return {
    setPlayers,
    setSearch,
    getSearch,
    setRegion,
    getRegion,
    setRetired,
    getRetired,
    setKitFilter,
    getKitFilter,
    getPlayers,
    renderAll,
    renderPlayers,
    openProfile,
    openProfileByName,
    calcPoints,
    calcAverageTier,
    hasAnyRetiredKit,
    getTierBadge,
    normalizeDuelEntry,
    collectGlobalDuels
};
})();
