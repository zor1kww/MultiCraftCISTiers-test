// ==========================================
// 1. БАЗОВЫЕ НАСТРОЙКИ И ЗВУК
// ==========================================

// Звуковое сопровождение интерфейса
const clickSound = new Audio('assets/sounds/click.mp3');

function playInterfaceClick() {
    clickSound.currentTime = 0;
    clickSound.play().catch(err => {});
}

// Глобальный слушатель кликов для эффекта нажатия кнопок
document.addEventListener('click', (e) => {
    const t = e.target;
    if (!t) return;
    if (
        t.tagName === 'BUTTON' || 
        t.tagName === 'A' || 
        t.tagName === 'SELECT' || 
        t.tagName === 'INPUT' ||
        t.closest('.player-card-row') ||
        t.closest('.sidebar a')
    ) {
        playInterfaceClick();
    }
});

// Переключение тем оформления (Dark/Light)
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const targetTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', targetTheme);
    const btn = document.getElementById('themeToggleBtn');
    if (btn) {
        btn.innerHTML = targetTheme === 'light' ? 'Темная тема' : 'Светлая тема';
    }
}

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
// Также защищается от испорченных данных с ДВОЙНОЙ вложенностью
// ({ tier: { tier, date, retired }, date, retired } - баг старой
// версии базы/миграции) - в этом случае разворачивает объект рекурсивно,
// а не печатает "[object Object]" в интерфейсе.
function parseTierInfo(tierData, _depth = 0) {
    if (!tierData) return { tier: "Unranked", isRetired: false, pts: 0 };

    // Защита от бесконечной рекурсии на совсем битых данных
    if (_depth > 5) return { tier: "Unranked", isRetired: false, pts: 0 };

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
        if (tierData.tier && typeof tierData.tier === 'object') {
            // Двойная вложенность: внутренний объект содержит настоящий
            // tier/date/retired - разворачиваем его рекурсивно и берём
            // date/retired снаружи как fallback, если внутри их нет.
            const inner = parseTierInfo(tierData.tier, _depth + 1);
            tier = inner.tier;
            testDate = inner.date || tierData.date || null;
            manualRetired = inner.isRetired || tierData.retired === true;
        } else {
            tier = tierData.tier || "Unranked";
            manualRetired = tierData.retired === true;
            testDate = tierData.date || null;
        }
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
    const testers = ["-999-", "zor1kkqwix", "_xx_deras_xx", "-back-"];
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
        const targetKit = window.currentKitFilter || 'all';
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

        // Общие штрафные очки игрока (сумма по всем китам, только актуальные/не истёкшие)
        const totalPenalty = getTotalEffectivePenalty(player);
        const modalPenaltyTotal = document.getElementById('modalPenaltyTotal');
        if (modalPenaltyTotal) {
            if (totalPenalty > 0) {
                modalPenaltyTotal.innerText = `Штрафные очки: ${totalPenalty}`;
                modalPenaltyTotal.style.display = '';
            } else {
                modalPenaltyTotal.style.display = 'none';
            }
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
                const kitPenalty = getEffectivePenalty(player, kit);
                const penaltyHTML = kitPenalty > 0
                    ? `<span class="m-penalty-box" title="Штрафные очки по этому киту (сброс через ${PENALTY_EXPIRY_DAYS} дней с первого начисления, понижение при ${PENALTY_DEMOTION_THRESHOLD})">⚠ ${kitPenalty}</span>`
                    : '';
                return `<div class="modal-row" style="${ret ? 'opacity:0.6;' : ''}">
                    <div class="modal-kit-left">
                        <img class="modal-kit-icon" src="${iconSrc}" onerror="this.style.opacity='0'" alt="">
                        <span class="m-kit">${kit}</span>
                    </div>
                    <div class="m-right-side">
                        ${getTierBadge(t, ret)} 
                        <span class="m-pts-box">(${activePts[t] || 0} PTS)</span>
                        ${penaltyHTML}
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
                const kitPenalty = getEffectivePenalty(player, kit);
                const penaltyHTML = kitPenalty > 0
                    ? `<span class="m-penalty-box" title="Штрафные очки по этому киту (сброс через ${PENALTY_EXPIRY_DAYS} дней с первого начисления, понижение при ${PENALTY_DEMOTION_THRESHOLD})">⚠ ${kitPenalty}</span>`
                    : '';
                return `<div class="modal-row" style="${ret ? 'opacity:0.6;' : ''}">
                    <div class="modal-kit-left">
                        <img class="modal-kit-icon" src="${iconSrc}" onerror="this.style.opacity='0'" alt="">
                        <span class="m-kit">${kit}</span>
                    </div>
                    <div class="m-right-side">
                        ${getTierBadge(t, ret)} 
                        <span class="m-pts-box">(${activePts[t] || 0} PTS)</span>
                        ${penaltyHTML}
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

function renderPlayers() {
    const list = document.getElementById('playersList');
    if (!list) return;

    // Безопасное получение значений элементов
    const searchInput = document.getElementById('searchInput');
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    
    const region = window.currentRegionFilter || 'all';
    
    const targetKit = window.currentKitFilter || 'all';
    
    const retiredToggle = document.getElementById('retiredToggle');
    const showRetiredInPlace = retiredToggle ? retiredToggle.checked : false;

    if (typeof players === 'undefined' || !Array.isArray(players)) {
        list.innerHTML = '<div style="text-align:center;color:#ffcc47;padding:40px;">Загрузка базы данных игроков...</div>';
        return;
    }

    const subtitleEl = document.getElementById('tableSubtitle');

    if (targetKit === 'all') {
        if (subtitleEl) subtitleEl.innerText = 'MAIN OVERALL LEADERBOARD';
    } else if (targetKit === 'sub-all') {
        if (subtitleEl) subtitleEl.innerText = 'SUB OVERALL LEADERBOARD';
    } else {
        if (subtitleEl) subtitleEl.innerText = `${targetKit.toUpperCase()} LEADERBOARD`;
    }

    const activeSubtiers = (typeof subtiers !== 'undefined') ? subtiers : [];

    const activeMaintiers = (typeof maintiers !== 'undefined') ? maintiers : [];
    const activePts = (typeof tierPoints !== 'undefined') ? tierPoints : {};
    const activeColors = (typeof tierColors !== 'undefined') ? tierColors : {};
    const activeKitImages = (typeof kitImages !== 'undefined') ? kitImages : {};

    let filtered = players.filter(player => {
        const matchesSearch = player.name.toLowerCase().includes(search);
        const matchesRegion = (region === 'all' || player.region === region);
        
        if (targetKit !== 'all' && targetKit !== 'sub-all') {
            const tier = getCleanTier(player, targetKit);
            const ret = isKitRetired(player, targetKit);
            if (!showRetiredInPlace && ret) {
                return false;
            }
            return matchesSearch && matchesRegion && tier !== "Unranked";
        }
        
        if (!showRetiredInPlace && hasAnyRetiredKit(player)) {
            return false;
        }
        
        return matchesSearch && matchesRegion;
    });

    if (targetKit === 'all') {
        filtered.sort((a, b) => {
            return calcPoints(b, activeMaintiers) - calcPoints(a, activeMaintiers);
        });
    } else if (targetKit === 'sub-all') {
        filtered.sort((a, b) => {
            return calcPoints(b, activeSubtiers) - calcPoints(a, activeSubtiers);
        });
    } else {
        filtered.sort((a, b) => {
            const tierA = getCleanTier(a, targetKit);
            const tierB = getCleanTier(b, targetKit);
            return (activePts[tierB] || 0) - (activePts[tierA] || 0);
        });
    }

    list.innerHTML = '';
    
    if (filtered.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:#8892b0;padding:20px;">Игроки не найдены</div>';
        return;
    }

    const filteredJSON = encodeURIComponent(JSON.stringify(filtered));
    let htmlFragment = '';

    filtered.forEach((player, index) => {
        let rightColumnContent = '';
        let rankPrefix = `#${index + 1}`; 
        let topClass = '';
        
        if (index === 0) topClass = 'top-rank-1';
        else if (index === 1) topClass = 'top-rank-2';
        else if (index === 2) topClass = 'top-rank-3';
        else if (index === 3) topClass = 'top-rank-4';
        else if (index === 4) topClass = 'top-rank-5';
        
        let isRet = false;
        if (targetKit !== 'all' && targetKit !== 'sub-all' && isKitRetired(player, targetKit)) {
            isRet = true;
        } else if ((targetKit === 'all' || targetKit === 'sub-all') && hasAnyRetiredKit(player)) {
            isRet = true;
        }
        
        if (isRet) {
            topClass = topClass ? topClass + ' retired-status' : 'retired-status';
        }
        
        if (targetKit === 'all') {
            const mainPts = calcPoints(player, activeMaintiers);
            rightColumnContent = `<span style="color: var(--accent); font-size:15px; white-space:nowrap;">${mainPts} PTS</span>`;
        } else if (targetKit === 'sub-all') {
            const subPts = calcPoints(player, activeSubtiers);
            rightColumnContent = `<span style="color: var(--accent); font-size:15px; white-space:nowrap;">${subPts} PTS</span>`;
        } else {
            const currentTier = getCleanTier(player, targetKit);
            const ret = isKitRetired(player, targetKit);
            const kitPenalty = getEffectivePenalty(player, targetKit);
            const penaltyBadge = kitPenalty > 0
                ? `<span class="m-penalty-box" title="Штрафные очки по этому киту">⚠ ${kitPenalty}</span>`
                : '';
            rightColumnContent = getTierBadge(currentTier, ret) + penaltyBadge;
        }

        let quickTiersHTML = '';
        if (targetKit === 'all' || targetKit === 'sub-all') {
            const kitsForRow = (targetKit === 'sub-all') ? activeSubtiers : activeMaintiers;
            let playerKitsObjects = kitsForRow.map(kit => {
                const tier = getCleanTier(player, kit);
                const ret = isKitRetired(player, kit);
                
                let sortWeight = -1000;
                if (tier !== "Unranked") {
                    const pts = activePts[tier] || 0;
                    if (!ret) {
                        sortWeight = pts;
                    } else {
                        sortWeight = pts - 5000;
                    }
                } else {
                    sortWeight = -10000;
                }
                
                return { kit, tier, ret, sortWeight };
            });

            playerKitsObjects.sort((a, b) => b.sortWeight - a.sortWeight);

            quickTiersHTML = `<div class="player-tiers-row">`;
            playerKitsObjects.forEach(item => {
                const kit = item.kit;
                const tier = item.tier;
                const ret = item.ret;
                const clr = activeColors[tier] || '#444b66';
                const iconSrc = activeKitImages[kit] || "";
                const labelText = (ret && tier !== "Unranked") ? `R${tier}` : tier;
                
                if (tier !== "Unranked") {
                    if (!showRetiredInPlace && ret) {
                        quickTiersHTML += `
                        <div class="tier-item-box" style="opacity: 0.25;">
                            <div class="tier-icon-circle unranked">
                                <img src="${iconSrc}" onerror="this.style.opacity=0" alt="">
                            </div>
                            <div class="tier-label-under" style="color: #444b66;">-</div>
                        </div>`;
                    } else {
                        quickTiersHTML += `
                        <div class="tier-item-box" style="${ret ? 'opacity:0.4;' : ''}">
                            <div class="tier-icon-circle" style="border-color: ${clr}cc; box-shadow: 0 0 6px ${clr}22;">
                                <img src="${iconSrc}" onerror="this.style.opacity=0" alt="">
                            </div>
                            <div class="tier-label-under" style="color: ${clr};">${labelText}</div>
                        </div>`;
                    }
                } else {
                    quickTiersHTML += `
                    <div class="tier-item-box">
                        <div class="tier-icon-circle unranked">
                            <img src="${iconSrc}" onerror="this.style.opacity=0" alt="">
                        </div>
                        <div class="tier-label-under" style="color: #444b66;">-</div>
                    </div>`;
                }
            });
            quickTiersHTML += `</div>`;
        }

        let displayProfileRetiredTag = hasAnyRetiredKit(player);

        // Формирование тегов мета-информации для карточки игрока
        let metaTagsHTML = '';
        if (player.region) {
            metaTagsHTML += `<span class="player-meta-tag">${player.region}</span>`;
        }
        
        // ВЫВОДИМ ТИР СРАЗУ ПОСЛЕ УСТРОЙСТВА:
        if (targetKit !== 'all' && targetKit !== 'sub-all') {
            const currentTier = getCleanTier(player, targetKit);
            const ret = isKitRetired(player, targetKit);
            if (currentTier !== "Unranked") {
                metaTagsHTML += getMetaTierTag(currentTier, ret);
            }
        } else {
            const avgTier = calcAverageTier(player);
            if (avgTier !== "Unranked") {
                metaTagsHTML += getMetaTierTag(avgTier, displayProfileRetiredTag);
            }
        }

        htmlFragment += `
        <div class="player-container ${topClass}">
            <div class="player-card-row" onclick="openProfile(${index}, '${filteredJSON}')">

                <div class="player-portrait">
                    <img src="assets/skins/${encodeURIComponent(player.name)}.png" onerror="this.onerror=null; this.src='assets/default_skin.png';" alt="">
                </div>

                <div class="player-info-column">
                    <div class="player-info-top">
                        <div class="player-name-block">
                            <span class="player-rank">${rankPrefix}</span>
                            <span class="player-name">${player.name}</span>
                        </div>
                        <div class="player-right">
                            ${rightColumnContent}
                        </div>
                    </div>

                    <div class="player-meta-box">
                        ${metaTagsHTML}
                    </div>
                    ${quickTiersHTML}
                </div>

            </div>
        </div>`;
    });
    
    list.innerHTML = htmlFragment;
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
// 6. НАВИГАЦИЯ И ИНИЦИАЛИЗАЦИЯ
// ==========================================

// Переключение вкладок
function switchTab(tabId) {
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.remove('active');
    
    const mp = document.getElementById('mainPage');
    if (mp) mp.style.display = 'none';
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    if (tabId === 'mainPage') {
        if (mp) mp.style.display = 'block';
        renderPlayers();
    } else {
        const target = document.getElementById(tabId);
        if (target) target.style.display = 'block';

        // При входе в "Тестирование" / "Другую информацию" всегда
        // показываем сетку карточек, а не ранее открытую деталь
        if (tabId === 'testingTab') resetHubGrid('testingHubGrid');
        if (tabId === 'otherInfoTab') resetHubGrid('otherInfoHubGrid');
        if (tabId === 'duelsTab') renderGlobalDuels();
    }
    window.scrollTo(0, 0);
}

function backHome() {
    switchTab('mainPage');
}

// ==========================================
// ХАБ-КАРТОЧКИ ("Тестирование" / "Другая информация")
// ==========================================

// Соответствие id сетки → id заголовка и вводного текста над ней,
// которые нужно прятать при открытии конкретной карточки
const HUB_HEADER_IDS = {
    testingHubGrid: ['testingHubTitle', 'testingHubIntro'],
    otherInfoHubGrid: ['otherInfoHubTitle', 'otherInfoHubIntro']
};

// Скрывает все открытые hub-detail внутри вкладки и возвращает сетку карточек
function resetHubGrid(gridId) {
    const grid = document.getElementById(gridId);
    if (grid) grid.style.display = 'flex';

    (HUB_HEADER_IDS[gridId] || []).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = '';
    });

    const tab = grid ? grid.closest('.tab-content') : null;
    if (!tab) return;

    tab.querySelectorAll('.hub-detail').forEach(detail => {
        detail.classList.remove('active');
    });
}

// Открывает конкретную карточку (по data-target), пряча сетку
function openHubDetail(gridId, detailId) {
    const grid = document.getElementById(gridId);
    if (grid) grid.style.display = 'none';

    (HUB_HEADER_IDS[gridId] || []).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    const tab = grid ? grid.closest('.tab-content') : null;
    if (tab) {
        tab.querySelectorAll('.hub-detail').forEach(d => d.classList.remove('active'));
    }

    const detail = document.getElementById(detailId);
    if (detail) detail.classList.add('active');

    // PTS-таблица собирается динамически — на случай если карточку открыли впервые
    if (detailId === 'hubPoints' && typeof buildFaqTable === 'function') {
        buildFaqTable();
    }

    window.scrollTo(0, 0);
}

// Возврат из детали к сетке карточек внутри той же вкладки
function closeHubDetail(gridId, detailId) {
    const detail = document.getElementById(detailId);
    if (detail) detail.classList.remove('active');

    const grid = document.getElementById(gridId);
    if (grid) grid.style.display = 'flex';

    (HUB_HEADER_IDS[gridId] || []).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = '';
    });

    window.scrollTo(0, 0);
}

// Клик по самой карточке (делегирование на весь .hub-grid)
document.querySelectorAll('.hub-grid').forEach(grid => {
    grid.addEventListener('click', (e) => {
        const card = e.target.closest('.hub-card');
        if (!card) return;
        const targetId = card.getAttribute('data-target');
        if (targetId) openHubDetail(grid.id, targetId);
    });

    // Долгое нажатие (удержание) на touch-устройствах показывает подпись
    // карточки ("Читать →"), не открывая раздел — как на десктопном hover.
    let pressTimer = null;
    const LONG_PRESS_MS = 250;

    grid.addEventListener('touchstart', (e) => {
        const card = e.target.closest('.hub-card');
        if (!card) return;
        pressTimer = setTimeout(() => {
            card.classList.add('hub-card-pressed');
        }, LONG_PRESS_MS);
    }, { passive: true });

    grid.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
        grid.querySelectorAll('.hub-card-pressed').forEach(c => c.classList.remove('hub-card-pressed'));
    });

    grid.addEventListener('touchmove', () => {
        clearTimeout(pressTimer);
        grid.querySelectorAll('.hub-card-pressed').forEach(c => c.classList.remove('hub-card-pressed'));
    }, { passive: true });
});

// Работа с боковым меню (Sidebar)
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('active');
    });

    window.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && e.target !== menuBtn) {
            sidebar.classList.remove('active');
        }
    });
}

// Привязка обработчиков событий ввода
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const retiredToggle = document.getElementById('retiredToggle');

    if (searchInput) searchInput.addEventListener('input', renderPlayers);
    if (retiredToggle) retiredToggle.addEventListener('change', renderPlayers);

    // Универсальная инициализация кастомного выпадающего списка.
    // onChangeCallback по умолчанию renderPlayers (главная страница);
    // передаётся отдельно для фильтров на других вкладках (напр. "Дуэли").
    function initCustomDropdown(prefix, stateKey, defaultValue, onChangeCallback) {
        window[stateKey] = defaultValue;
        const callback = onChangeCallback || renderPlayers;

        const customEl = document.getElementById(prefix + 'Custom');
        const triggerEl = document.getElementById(prefix + 'Trigger');
        const panelEl = document.getElementById(prefix + 'Panel');
        const labelEl = document.getElementById(prefix + 'Label');

        if (!customEl || !triggerEl || !panelEl || !labelEl) return;

        triggerEl.addEventListener('click', (e) => {
            e.stopPropagation();
            customEl.classList.toggle('open');
        });

        const options = panelEl.querySelectorAll('.custom-select-option');
        options.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = opt.getAttribute('data-value');
                window[stateKey] = value;

                options.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');

                labelEl.textContent = opt.textContent;
                customEl.classList.remove('open');

                callback();
            });
        });

        window.addEventListener('click', (e) => {
            if (!customEl.contains(e.target)) {
                customEl.classList.remove('open');
            }
        });
    }

    // Фильтр китов (Main/Sub Overall)
    initCustomDropdown('kitFilter', 'currentKitFilter', 'all');

    // Фильтр региона
    initCustomDropdown('regionFilter', 'currentRegionFilter', 'all');

    // Фильтр китов во вкладке "Дуэли"
    initCustomDropdown('duelsKitFilter', 'currentDuelsKitFilter', 'all', renderGlobalDuels);

    // Поиск во вкладке "Дуэли"
    const duelsSearchInput = document.getElementById('duelsSearchInput');
    if (duelsSearchInput) duelsSearchInput.addEventListener('input', renderGlobalDuels);

    // Первичный запуск отрисовки
    initSite();
});

// Дополнительная инициализация на случай, если DOM уже загружен
if (document.readyState === "complete" || document.readyState === "interactive") {
    initSite();
}

// Функция автоматического копирования инвайт-кода
function copyInviteCode() {
    const inviteCode = "UA75LL01";
    const btn = document.getElementById('inviteBtn');
    
    navigator.clipboard.writeText(inviteCode).then(() => {
        if (btn) {
            btn.innerHTML = "Скопировано!";
            btn.style.borderColor = "var(--accent)";
            btn.style.color = "var(--accent)";
            
            setTimeout(() => {
                btn.innerHTML = `${inviteCode}`;
                btn.style.borderColor = "";
                btn.style.color = "";
            }, 1500);
        }
    }).catch(err => {
        const el = document.createElement('textarea');
        el.value = inviteCode;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        
        if (btn) {
            btn.innerHTML = "Скопировано!";
            setTimeout(() => {
                btn.innerHTML = `${inviteCode}`;
            }, 1500);
        }
    });
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
// СИММЕТРИЧНО в matchHistory обоих участников (см. main.py на боте), но
// с ПРОТИВОПОЛОЖНЫМ tierBefore/tierAfter - у тестируемого (того, кто
// реально сдавал тест на этой дуэли) ранг меняется, у соперника обычно
// нет. Поэтому среди двух симметричных записей выбираем ту, где
// tierBefore !== tierAfter - её "playerName" и есть тестируемый, что
// сохраняет порядок "игрок, затем оппонент" из исходного шаблона
// результата. Если обе записи имеют tierBefore === tierAfter (обычная
// дуэль без изменения ранга ни у кого) - порядок не принципиален, берём
// первую попавшуюся по порядку players.js.
function collectGlobalDuels() {
    if (typeof players === 'undefined' || !Array.isArray(players)) return [];

    const groups = new Map();

    players.forEach(player => {
        const history = Array.isArray(player.matchHistory) ? player.matchHistory : [];
        history.forEach(raw => {
            if (!raw || raw.opponent === 'система' || raw.tester === 'система') return;
            const entry = normalizeDuelEntry(raw);
            if (!entry.opponent) return;

            const namesKey = [player.name, entry.opponent].sort().join('|');
            const key = `${entry.kit}|${entry.date}|${namesKey}|${[entry.scorePlayer, entry.scoreOpponent].sort().join('-')}`;

            const candidate = { ...entry, playerName: player.name };
            const existing = groups.get(key);

            if (!existing) {
                groups.set(key, candidate);
                return;
            }

            // Предпочитаем запись тестируемого (у кого ранг реально менялся)
            const candidateIsTested = candidate.tierBefore !== candidate.tierAfter;
            const existingIsTested = existing.tierBefore !== existing.tierAfter;
            if (candidateIsTested && !existingIsTested) {
                groups.set(key, candidate);
            }
        });
    });

    return Array.from(groups.values());
}

// Строит HTML-блок с рангами дуэли (предыдущий → полученный), если они
// зафиксированы в записи. Показывается только когда тир реально менялся
// в контексте этого результата (в самой дуэли, а не когда tierBefore
// просто равен tierAfter - тогда это не несёт информации).
// Строит HTML-блок с рангами дуэли. Всегда показывает актуальный
// ранг игрока на этом ките - если он изменился в рамках дуэли (обычно
// у тестируемого), показывает "было → стало"; если нет (обычная дуэль
// без теста, ранг уже был таким), показывает его одним значением, без
// стрелки - но никогда не оставляет блок пустым.
function buildDuelTierChangeHTML(entry) {
    const activeColors = (typeof tierColors !== 'undefined') ? tierColors : {};
    const before = entry.tierBefore || 'Unranked';
    const after = entry.tierAfter || before;
    const colorAfter = activeColors[after] || 'var(--accent)';

    if (before === after) {
        return `<div class="duel-tier-change">
            <span style="color:${colorAfter}; font-weight:700;">${after}</span>
        </div>`;
    }

    const colorBefore = activeColors[before] || 'var(--text-muted)';
    return `<div class="duel-tier-change">
        <span style="color:${colorBefore};">${before}</span>
        <span class="duel-tier-arrow">→</span>
        <span style="color:${colorAfter}; font-weight:700;">${after}</span>
    </div>`;
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

    if (kitFilter !== 'all') {
        duels = duels.filter(d => d.kit === kitFilter);
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
        const tierChangeHTML = buildDuelTierChangeHTML(entry);
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
                <span class="duel-opponent-name" onclick="openProfileByName('${playerSafe}')">${entry.playerName}</span>
                <span class="duel-score">${entry.scorePlayer}:${entry.scoreOpponent}</span>
                <span class="duel-opponent-name" onclick="openProfileByName('${opponentSafe}')">${entry.opponent}</span>
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
            <span class="duel-opponent-name" onclick="openProfileByName('${opponentSafe}')">${entry.opponent}</span>
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

// Запуск сайта
function initSite() {
    renderPlayers();
}

// Хук: вызывается из index.html, когда players.js загрузился (асинхронно, после этого файла)
window.onPlayersLoaded = function() {
    renderPlayers();
};
