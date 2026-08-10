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
        btn.innerHTML = targetTheme === 'light' ? '🌙 Темная тема' : '☀️ Светлая тема';
    }
}

// ==========================================
// 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ И ПАРСИНГ ТИРОВ
// ==========================================

// Универсальный парсер данных тира
function parseTierInfo(tierData) {
    if (!tierData) return { tier: "Unranked", isRetired: false, pts: 0 };
    
    let tier = "Unranked";
    let isRetired = false;

    if (typeof tierData === 'string') {
        if (tierData.startsWith('R') && tierData.length > 1) {
            isRetired = true;
            tier = tierData.substring(1);
        } else {
            tier = tierData;
        }
    } else if (typeof tierData === 'object') {
        tier = tierData.tier || "Unranked";
        isRetired = tierData.retired === true;
    }

    // Безопасное получение очков
    const activePts = (typeof tierPoints !== 'undefined') ? tierPoints : {};
    return {
        tier: tier,
        isRetired: isRetired,
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
    const testers = ["-999-", "zor1kkqwix", "_xx_deras_xx"];
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
    
    const regionFilter = document.getElementById('regionFilter');
    const region = regionFilter ? regionFilter.value : 'all';
    
    const targetKit = window.currentKitFilter || 'all';
    
    const retiredToggle = document.getElementById('retiredToggle');
    const showRetiredInPlace = retiredToggle ? retiredToggle.checked : false;

    if (typeof players === 'undefined' || !Array.isArray(players)) {
        list.innerHTML = '<div style="text-align:center;color:#ffcc47;padding:40px;">Загрузка базы данных игроков...</div>';
        return;
    }

    const titleEl = document.getElementById('leaderboardTitle');
    const subtitleEl = document.getElementById('tableSubtitle');

    if (targetKit === 'all') {
        if (titleEl) titleEl.innerText = 'MAIN OVERALL PVP TOP';
        if (subtitleEl) subtitleEl.innerText = 'MAIN OVERALL LEADERBOARD';
    } else if (targetKit === 'sub-all') {
        if (titleEl) titleEl.innerText = 'SUB OVERALL PVP TOP';
        if (subtitleEl) subtitleEl.innerText = 'SUB OVERALL LEADERBOARD';
    } else {
        if (titleEl) titleEl.innerText = `${targetKit.toUpperCase()} TOP`;
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
            rightColumnContent = getTierBadge(currentTier, ret);
        }

        let quickTiersHTML = '';
        if (targetKit === 'all' || targetKit === 'sub-all') {
            let playerKitsObjects = activeMaintiers.map(kit => {
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
                
                <div class="player-name-block">
                    <span class="player-rank">${rankPrefix}</span>
                    <span class="player-name">${player.name}</span>
                </div>

                <div class="player-center-block">
                    <div class="player-meta-box">
                        ${metaTagsHTML}
                    </div>
                    ${quickTiersHTML}
                </div>

                <div class="player-right">
                    ${rightColumnContent}
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

// Навешивание кастомных цветов на тиры внутри FAQ текста
function applyFaqTierColors() {
    const tiersToColor = ['HT1', 'HT2', 'LT1', 'LT2', 'LT3'];
    const activeColors = (typeof tierColors !== 'undefined') ? tierColors : {};
    
    tiersToColor.forEach(tier => {
        const color = activeColors[tier] || 'var(--accent)';
        for (let i = 1; i <= 4; i++) {
            const element = document.getElementById(`faqColor${tier}_${i}`);
            if (element) {
                element.style.color = color;
                element.style.fontWeight = 'bold';
            }
        }
    });
}

// Навигация по под-вкладкам внутри Информации
function switchInfoSubTab(subTabId, btnElement) {
    document.querySelectorAll('.info-sub-tab-content').forEach(subTab => {
        subTab.style.display = 'none';
    });
    document.querySelectorAll('.info-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const targetSubTab = document.getElementById(subTabId);
    if (targetSubTab) {
        targetSubTab.style.display = 'block';
    }
    if (btnElement) {
        btnElement.classList.add('active');
    }
    
    if (subTabId === 'ptsSubTab') {
        buildFaqTable();
    }
    if (subTabId === 'faqSubTab') {
        applyFaqTierColors();
    }
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
        
        if (tabId === 'infoCenterTab') {
            const firstNavBtn = document.querySelector('.info-nav-btn');
            switchInfoSubTab('tierTestSubTab', firstNavBtn);
        }
    }
    window.scrollTo(0, 0);
}

function backHome() {
    switchTab('mainPage');
}

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
    const regionFilter = document.getElementById('regionFilter');
    const retiredToggle = document.getElementById('retiredToggle');

    if (searchInput) searchInput.addEventListener('input', renderPlayers);
    if (regionFilter) regionFilter.addEventListener('change', renderPlayers);
    if (retiredToggle) retiredToggle.addEventListener('change', renderPlayers);

    // Инициализация кастомного выпадающего списка фильтра китов (Main/Sub Overall)
    window.currentKitFilter = 'all';

    const kitFilterCustom = document.getElementById('kitFilterCustom');
    const kitFilterTrigger = document.getElementById('kitFilterTrigger');
    const kitFilterPanel = document.getElementById('kitFilterPanel');
    const kitFilterLabel = document.getElementById('kitFilterLabel');

    if (kitFilterCustom && kitFilterTrigger && kitFilterPanel && kitFilterLabel) {
        kitFilterTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            kitFilterCustom.classList.toggle('open');
        });

        const options = kitFilterPanel.querySelectorAll('.custom-select-option');
        options.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = opt.getAttribute('data-value');
                window.currentKitFilter = value;

                options.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');

                kitFilterLabel.textContent = opt.textContent;
                kitFilterCustom.classList.remove('open');

                renderPlayers();
            });
        });

        window.addEventListener('click', (e) => {
            if (!kitFilterCustom.contains(e.target)) {
                kitFilterCustom.classList.remove('open');
            }
        });
    }

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

// Запуск сайта
function initSite() {
    renderPlayers();
}