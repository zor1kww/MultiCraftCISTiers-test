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
// 2. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ: ELO И РАНГИ
// ==========================================

// Таблица рангов из config.js (от сильного к слабому). Ранг НЕ хранится
// отдельно - он всегда вычисляется из Elo (см. getTierByElo).
const ELO_TIERS = (typeof eloTiers !== 'undefined') ? eloTiers : [];
const TIER_ORDER = ELO_TIERS.map(t => t.tier);

// Экранирование текста перед вставкой в innerHTML (ники приходят из базы)
function escapeHTML(value) {
    return String(value === undefined || value === null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Атрибут onclick, открывающий профиль игрока по нику. Ник кодируется,
// поэтому в разметку не попадают кавычки и спецсимволы.
function profileOnClick(name) {
    const encoded = encodeURIComponent(String(name)).replace(/'/g, '%27');
    return `onclick="openProfileByName(decodeURIComponent('${encoded}'))"`;
}

function tierColorOf(tier, fallback) {
    const colors = (typeof tierColors !== 'undefined') ? tierColors : {};
    return colors[tier] || fallback;
}

// Ранг по Elo: первая ступень таблицы, нижняя граница которой не выше Elo.
function getTierByElo(elo) {
    if (typeof elo !== 'number' || isNaN(elo)) return 'Unranked';
    for (const t of ELO_TIERS) {
        if (elo >= t.min) return t.tier;
    }
    return ELO_TIERS.length ? ELO_TIERS[ELO_TIERS.length - 1].tier : 'Unranked';
}

// Нижняя граница Elo ранга (нужна только для данных старого формата без Elo)
function getTierFloorElo(tier) {
    const found = ELO_TIERS.find(t => t.tier === tier);
    return found ? found.min : null;
}

// Рейтинг игрока на ките: { elo, tier }.
//  - Новый формат: tiers[kit] = { elo, tier, date } -> ранг считается из elo.
//  - Старый формат (до перехода на Elo): есть только ранг, elo = null.
//    Такие данные показываются, пока players.js не заменён экспортом из
//    Elo-системы, но Elo у них нет.
function getKitRating(player, kit) {
    const data = (player && player.tiers) ? player.tiers[kit] : null;
    if (!data) return { elo: null, tier: 'Unranked' };

    if (typeof data === 'object' && typeof data.elo === 'number') {
        return { elo: data.elo, tier: getTierByElo(data.elo) };
    }

    const legacyTier = (typeof data === 'string')
        ? data.replace(/^R(?=[HML]T)/, '')
        : data.tier;
    return { elo: null, tier: TIER_ORDER.includes(legacyTier) ? legacyTier : 'Unranked' };
}

// Хелпер: чистое название ранга игрока на ките ("Unranked", если не играл)
function getCleanTier(player, kit) {
    return getKitRating(player, kit).tier;
}

// Elo для сортировки и усреднения: настоящее Elo, а для данных старого
// формата без Elo - нижняя граница ранга. null - если игрок не играл кит.
function getEffectiveElo(rating) {
    if (!rating || rating.tier === 'Unranked') return null;
    if (rating.elo !== null) return rating.elo;
    return getTierFloorElo(rating.tier);
}

// Elo для показа пользователю ("—", если у старой записи нет Elo)
function formatElo(rating) {
    return (rating && rating.elo !== null) ? String(Math.round(rating.elo)) : '—';
}

function isAverageOverallMode() {
    return (typeof overallEloMode !== 'undefined') && overallEloMode === 'avg';
}

// Elo игрока по группе китов (Main или Sub) для общего топа:
// сумма (прямая замена прежних очков) или среднее - см. overallEloMode в config.js.
// Киты, на которых игрок не играл, не учитываются.
function calcOverallElo(player, kits) {
    if (!player || !kits) return 0;
    const values = kits
        .map(kit => getEffectiveElo(getKitRating(player, kit)))
        .filter(v => v !== null);
    if (values.length === 0) return 0;
    const total = values.reduce((sum, v) => sum + v, 0);
    return Math.round(isAverageOverallMode() ? total / values.length : total);
}

// Среднее Elo игрока по ВСЕМ его китам (Main + Sub), на которых есть рейтинг.
// null - если игрок ещё не играл ни одного кита.
function calcAverageElo(player) {
    if (!player || !player.tiers) return null;
    const activeMaintiers = (typeof maintiers !== 'undefined') ? maintiers : [];
    const activeSubtiers = (typeof subtiers !== 'undefined') ? subtiers : [];
    const values = [...activeMaintiers, ...activeSubtiers]
        .map(kit => getEffectiveElo(getKitRating(player, kit)))
        .filter(v => v !== null);
    if (values.length === 0) return null;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// Средний общий ранг: среднее Elo по всем китам -> ранг по таблице (включая
// подступени MT). Усредняется именно Elo, а не номера рангов: ступени рангов
// неравной ширины (HT5 - 50 Elo, LT1 - 150), поэтому усреднение номеров
// искажало бы результат.
function calcAverageTier(player) {
    const avg = calcAverageElo(player);
    return avg === null ? 'Unranked' : getTierByElo(Math.round(avg));
}

// Генерация HTML-бейджа ранга
function getTierBadge(tier) {
    const color = tierColorOf(tier, '#fff');
    return `<span class="tier-badge" style="color: ${color}; border: 1px solid ${color}44; background: ${color}11;">${tier}</span>`;
}

// Генерация маленького тега ранга (среднего или конкретного)
function getMetaTierTag(tier) {
    const color = tierColorOf(tier, '#8892b0');
    return `<span class="player-meta-tag" style="color: ${color}; border-color: ${color}55; background: ${color}11; font-weight: bold;">${tier}</span>`;
}

// Проверка, является ли игрок тестером
function isTester(playerName) {
    if (!playerName) return false;
    const nameLower = playerName.toLowerCase();
    const testers = ["-999-", "dzila_editsmob", "-back-"];
    return testers.includes(nameLower);
}

// Открытие профиля игрока по имени (карточки в топе, дуэли, Доска почета)
function openProfileByName(playerName) {
    if (typeof players === 'undefined' || !Array.isArray(players)) {
        console.warn('База игроков ещё не загружена.');
        return;
    }
    const found = players.find(p => p.name && p.name.toLowerCase() === String(playerName).toLowerCase());
    if (!found) {
        console.warn(`Игрок "${playerName}" не найден в базе.`);
        return;
    }
    showProfile(found);
}

// ==========================================
// 3. ОКНА ПРОФИЛЕЙ (МОДАЛЬНЫЕ ОКНА)
// ==========================================

// Строка кита в профиле: иконка, название, ранг и Elo
function buildKitRowHTML(player, kit) {
    const activeKitImages = (typeof kitImages !== 'undefined') ? kitImages : {};
    const rating = getKitRating(player, kit);
    const eloText = rating.tier === 'Unranked' ? '' : (rating.elo !== null ? `${formatElo(rating)} Elo` : '—');
    return `<div class="modal-row">
        <div class="modal-kit-left">
            <img class="modal-kit-icon" src="${activeKitImages[kit] || ''}" onerror="this.style.opacity='0'" alt="">
            <span class="m-kit">${kit}</span>
        </div>
        <div class="m-right-side">
            ${getTierBadge(rating.tier)}
            <span class="m-elo-box">${eloText}</span>
        </div>
    </div>`;
}

// Открытие детального профиля игрока в модальном окне
function showProfile(player) {
    try {
        const modalName = document.getElementById('modalPlayerName');
        if (modalName) modalName.textContent = player.name;

        // Теги профиля: регион и ранг (общий средний - в общих топах, иначе
        // ранг по выбранному киту)
        let metaHTML = '';
        if (player.region) {
            metaHTML += `<span class="player-meta-tag">${escapeHTML(player.region)}</span>`;
        }

        const targetKit = window.currentKitFilter || 'all';
        const shownTier = (targetKit === 'all' || targetKit === 'sub-all')
            ? calcAverageTier(player)
            : getCleanTier(player, targetKit);
        if (shownTier !== 'Unranked') {
            metaHTML += getMetaTierTag(shownTier);
        }

        const modalMeta = document.getElementById('modalPlayerMeta');
        if (modalMeta) {
            modalMeta.innerHTML = `<div class="player-meta-box" style="justify-content: flex-start; margin-top: 5px; gap: 6px;">${metaHTML}</div>`;
        }

        const roleContainer = document.getElementById('modalRoleContainer');
        if (roleContainer) {
            roleContainer.innerHTML = isTester(player.name) ? `<span class="custom-role-badge">Tester</span>` : '';
        }

        const activeMaintiers = (typeof maintiers !== 'undefined') ? maintiers : [];
        const activeSubtiers = (typeof subtiers !== 'undefined') ? subtiers : [];

        const mainRows = document.getElementById('modalMainRows');
        if (mainRows) mainRows.innerHTML = activeMaintiers.map(kit => buildKitRowHTML(player, kit)).join('');

        const subRows = document.getElementById('modalSubRows');
        if (subRows) subRows.innerHTML = activeSubtiers.map(kit => buildKitRowHTML(player, kit)).join('');

        const totalLabel = isAverageOverallMode() ? 'Среднее Elo' : 'Всего Elo';
        const modalMainTotal = document.getElementById('modalMainTotal');
        if (modalMainTotal) modalMainTotal.innerText = `${totalLabel} за Main: ${calcOverallElo(player, activeMaintiers)}`;

        const modalSubTotal = document.getElementById('modalSubTotal');
        if (modalSubTotal) modalSubTotal.innerText = `${totalLabel} за Sub: ${calcOverallElo(player, activeSubtiers)}`;

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

    const searchInput = document.getElementById('searchInput');
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const region = window.currentRegionFilter || 'all';
    const targetKit = window.currentKitFilter || 'all';
    const isOverall = (targetKit === 'all' || targetKit === 'sub-all');

    if (typeof players === 'undefined' || !Array.isArray(players)) {
        list.innerHTML = '<div style="text-align:center;color:#ffcc47;padding:40px;">Загрузка базы данных игроков...</div>';
        return;
    }

    const subtitleEl = document.getElementById('tableSubtitle');
    if (subtitleEl) {
        if (targetKit === 'all') subtitleEl.innerText = 'MAIN OVERALL LEADERBOARD';
        else if (targetKit === 'sub-all') subtitleEl.innerText = 'SUB OVERALL LEADERBOARD';
        else subtitleEl.innerText = `${targetKit.toUpperCase()} LEADERBOARD`;
    }

    const activeSubtiers = (typeof subtiers !== 'undefined') ? subtiers : [];
    const activeMaintiers = (typeof maintiers !== 'undefined') ? maintiers : [];
    const activeKitImages = (typeof kitImages !== 'undefined') ? kitImages : {};
    const overallKits = (targetKit === 'sub-all') ? activeSubtiers : activeMaintiers;

    // В топ попадают только игроки, у которых есть рейтинг в выбранном ките
    // (или хотя бы в одном ките выбранной группы Main/Sub).
    let filtered = players.filter(player => {
        const matchesSearch = (player.name || '').toLowerCase().includes(search);
        const matchesRegion = (region === 'all' || player.region === region);
        if (!matchesSearch || !matchesRegion) return false;

        if (!isOverall) return getCleanTier(player, targetKit) !== 'Unranked';
        return overallKits.some(kit => getCleanTier(player, kit) !== 'Unranked');
    });

    if (isOverall) {
        filtered.sort((a, b) =>
            (calcOverallElo(b, overallKits) - calcOverallElo(a, overallKits)) || a.name.localeCompare(b.name));
    } else {
        const eloOf = (p) => getEffectiveElo(getKitRating(p, targetKit)) || 0;
        filtered.sort((a, b) => (eloOf(b) - eloOf(a)) || a.name.localeCompare(b.name));
    }

    list.innerHTML = '';

    if (filtered.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:#8892b0;padding:20px;">Игроки не найдены</div>';
        return;
    }

    let htmlFragment = '';

    filtered.forEach((player, index) => {
        const rankPrefix = `#${index + 1}`;
        const nameHTML = escapeHTML(player.name);
        const regionHTML = player.region ? `<span class="player-meta-tag">${escapeHTML(player.region)}</span>` : '';

        let topClass = '';
        if (index < 5) topClass = `top-rank-${index + 1}`;

        // Карточка топа по конкретному киту: скин слева, справа ранг в топе,
        // ник, ниже - регион, ранг на ките и Elo.
        if (!isOverall) {
            const rating = getKitRating(player, targetKit);
            htmlFragment += `
            <div class="player-container player-container-bust ${topClass}">
                <div class="player-card-row player-card-row-bust" ${profileOnClick(player.name)}>
                    <img class="bust-card-skin" src="assets/skins/default_bust.png" alt="" onerror="this.style.display='none';">

                    <div class="bust-card-info">
                        <div class="bust-card-top">
                            <span class="player-rank">${rankPrefix}</span>
                            <span class="player-name">${nameHTML}</span>
                        </div>
                        <div class="bust-card-bottom">
                            ${regionHTML}
                            ${getTierBadge(rating.tier)}
                            <span class="bust-elo-badge" title="Elo на этом ките">${formatElo(rating)} Elo</span>
                        </div>
                    </div>
                </div>
            </div>`;
            return;
        }

        // Общий топ (Main/Sub): ряд китов с рангами + Elo справа
        const totalElo = calcOverallElo(player, overallKits);
        const rightColumnContent = `<span style="color: var(--accent); font-size:15px; white-space:nowrap;">${totalElo} Elo</span>`;

        const kitItems = overallKits.map(kit => {
            const rating = getKitRating(player, kit);
            const elo = getEffectiveElo(rating);
            return { kit, tier: rating.tier, sortWeight: elo === null ? -1 : elo };
        });
        kitItems.sort((a, b) => b.sortWeight - a.sortWeight);

        let quickTiersHTML = `<div class="player-tiers-row">`;
        kitItems.forEach(item => {
            const iconSrc = activeKitImages[item.kit] || "";
            if (item.tier !== "Unranked") {
                const clr = tierColorOf(item.tier, '#444b66');
                quickTiersHTML += `
                <div class="tier-item-box">
                    <div class="tier-icon-circle" style="border-color: ${clr}cc; box-shadow: 0 0 6px ${clr}22;">
                        <img src="${iconSrc}" onerror="this.style.opacity=0" alt="">
                    </div>
                    <div class="tier-label-under" style="color: ${clr};">${item.tier}</div>
                </div>`;
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

        let metaTagsHTML = regionHTML;
        const avgTier = calcAverageTier(player);
        if (avgTier !== "Unranked") {
            metaTagsHTML += getMetaTierTag(avgTier);
        }

        htmlFragment += `
        <div class="player-container ${topClass}">
            <div class="player-card-row" ${profileOnClick(player.name)}>

                <div class="player-name-block">
                    <span class="player-rank">${rankPrefix}</span>
                    <span class="player-name">${nameHTML}</span>
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
// 5. ИНФОРМАЦИОННЫЙ ЦЕНТР
// ==========================================

// Таблица рангов: ранг, диапазон Elo, K-фактор (собирается из config.js)
function buildEloTable() {
    const tbody = document.getElementById('eloTableBody');
    if (tbody) {
        tbody.innerHTML = ELO_TIERS.map((t, i) => {
            const upper = i === 0 ? null : ELO_TIERS[i - 1].min - 1;
            const range = upper === null ? `${t.min}+` : `${t.min}–${upper}`;
            return `<tr>
                <td>${getTierBadge(t.tier)}</td>
                <td><span style="color: var(--accent); font-weight:bold;">${range}</span></td>
                <td>${t.k}</td>
            </tr>`;
        }).join('');
    }

    const modeText = document.getElementById('overallModeText');
    if (modeText) {
        modeText.textContent = isAverageOverallMode()
            ? 'Место в общем топе (Main Kits и Sub Kits) определяется средним Elo по китам соответствующей группы, на которых вы играли.'
            : 'Место в общем топе (Main Kits и Sub Kits) определяется суммой Elo по китам соответствующей группы, на которых вы играли.';
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
// ХАБ-КАРТОЧКИ ("Как играть" / "Другая информация")
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

    // Таблица рангов собирается динамически — на случай если карточку открыли впервые
    if (detailId === 'hubElo' && typeof buildEloTable === 'function') {
        buildEloTable();
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

    if (searchInput) searchInput.addEventListener('input', renderPlayers);

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
            // Закрываем все остальные выпадающие списки, чтобы два списка
            // (например, киты и регион) не могли быть открыты одновременно
            document.querySelectorAll('.custom-select.open').forEach(el => {
                if (el !== customEl) el.classList.remove('open');
            });
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
//
// Формат записи matchHistory (экспорт из Elo-системы, см. export.py):
//   { id, date, finishedAt, kit, opponent, result: 'win'|'loss',
//     eloBefore, eloAfter, delta, endReason: 'death'|'timeout' }
// Каждая дуэль есть в истории ОБОИХ участников (у каждого - со своей
// стороны), id у них одинаковый. Записи старого формата (со счётом, без
// result) не показываются.

// Сколько последних дуэлей рисовать: список растёт с каждой дуэлью, а
// браузеру не нужно строить тысячи карточек сразу.
const GLOBAL_DUELS_LIMIT = 200;
const PROFILE_DUELS_LIMIT = 100;

// Ключ сортировки: точное время завершения, а если его нет - только дата
function duelSortKey(entry) {
    return entry.finishedAt || entry.date || '';
}

// Дата и время дуэли в часовом поясе зрителя
function formatDuelTime(entry) {
    if (entry.finishedAt) {
        const d = new Date(entry.finishedAt);
        if (!isNaN(d.getTime())) {
            return d.toLocaleString('ru-RU', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }
    }
    return entry.date || '';
}

function formatDelta(delta) {
    if (delta > 0) return `+${delta}`;
    if (delta < 0) return `−${Math.abs(delta)}`;
    return '±0';
}

function isNewFormatDuel(entry) {
    return !!entry && !!entry.opponent && (entry.result === 'win' || entry.result === 'loss');
}

// Блок "Elo до → после, изменение, ранг" для одной стороны дуэли
function buildEloChangeHTML(eloBefore, eloAfter, delta) {
    if (typeof eloBefore !== 'number' || typeof eloAfter !== 'number') return '';

    const tierBefore = getTierByElo(eloBefore);
    const tierAfter = getTierByElo(eloAfter);
    const deltaClass = delta > 0 ? 'elo-up' : (delta < 0 ? 'elo-down' : 'elo-flat');

    const colorAfter = tierColorOf(tierAfter, 'var(--accent)');
    const tierHTML = (tierBefore !== tierAfter)
        ? `<span style="color:${tierColorOf(tierBefore, 'var(--text-muted)')};">${tierBefore}</span>
           <span class="duel-tier-arrow">→</span>
           <span style="color:${colorAfter}; font-weight:700;">${tierAfter}</span>`
        : `<span style="color:${colorAfter}; font-weight:700;">${tierAfter}</span>`;

    return `<div class="duel-elo-change">
        <span class="duel-elo-values">${Math.round(eloBefore)} <span class="duel-tier-arrow">→</span> ${Math.round(eloAfter)}</span>
        <span class="duel-elo-delta ${deltaClass}">${formatDelta(delta)}</span>
        <span class="duel-elo-tier">${tierHTML}</span>
    </div>`;
}

function buildKitHTML(kit) {
    const activeKitImages = (typeof kitImages !== 'undefined') ? kitImages : {};
    return `<div class="duel-kit">
        <img class="duel-kit-icon" src="${activeKitImages[kit] || ''}" onerror="this.style.display='none';" alt="">
        <span>${escapeHTML(kit)}</span>
    </div>`;
}

// Собирает уникальный список дуэлей со всех игроков: у каждой дуэли в
// players.js две записи (по одной у каждого участника) - склеиваем их по id
// в одну, где известны обе стороны.
function collectGlobalDuels() {
    if (typeof players === 'undefined' || !Array.isArray(players)) return [];

    const byKey = new Map();

    players.forEach(player => {
        const history = Array.isArray(player.matchHistory) ? player.matchHistory : [];
        history.forEach(raw => {
            if (!isNewFormatDuel(raw)) return;

            const key = (raw.id !== undefined && raw.id !== null)
                ? `id:${raw.id}`
                : `${raw.kit}|${raw.finishedAt || raw.date}|${[player.name, raw.opponent].sort().join('|')}`;

            let duel = byKey.get(key);
            if (!duel) {
                duel = {
                    kit: raw.kit,
                    date: raw.date,
                    finishedAt: raw.finishedAt || null,
                    endReason: raw.endReason,
                    sides: {}
                };
                byKey.set(key, duel);
            }
            duel.sides[player.name] = {
                name: player.name,
                opponent: raw.opponent,
                result: raw.result,
                eloBefore: raw.eloBefore,
                eloAfter: raw.eloAfter,
                delta: raw.delta
            };
        });
    });

    return Array.from(byKey.values()).map(duel => {
        const sides = Object.values(duel.sides);
        const winnerSide = sides.find(s => s.result === 'win') || null;
        const loserSide = sides.find(s => s.result === 'loss') || null;
        return {
            ...duel,
            winnerName: winnerSide ? winnerSide.name : (loserSide ? loserSide.opponent : ''),
            loserName: loserSide ? loserSide.name : (winnerSide ? winnerSide.opponent : ''),
            winnerSide,
            loserSide
        };
    });
}

// Рендер вкладки "Дуэли": поиск по игроку/сопернику, фильтр по киту,
// в строке видны оба участника и изменение Elo у каждого.
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

    if (search) {
        duels = duels.filter(d =>
            d.winnerName.toLowerCase().includes(search) ||
            d.loserName.toLowerCase().includes(search)
        );
    }

    duels.sort((a, b) => duelSortKey(b).localeCompare(duelSortKey(a)));

    if (duels.length === 0) {
        container.innerHTML = `<p class="duels-empty">Дуэли не найдены.</p>`;
        return;
    }

    const total = duels.length;
    const shown = duels.slice(0, GLOBAL_DUELS_LIMIT);

    const sideLine = (name, side) => `<div class="duel-elo-line">
            <span class="duel-elo-who" ${profileOnClick(name)}>${escapeHTML(name)}</span>
            ${side ? buildEloChangeHTML(side.eloBefore, side.eloAfter, side.delta) : ''}
        </div>`;

    let html = shown.map(d => {
        const timeoutHTML = d.endReason === 'timeout'
            ? `<div class="duel-note">Автопоражение: проигравший не вернулся на сервер за 3 минуты</div>`
            : '';

        return `<div class="duel-row duel-win">
            <div class="duel-row-top">
                ${buildKitHTML(d.kit)}
                <span class="duel-date">${formatDuelTime(d)}</span>
            </div>
            <div class="duel-row-main">
                <span class="duel-opponent-name" ${profileOnClick(d.winnerName)}>${escapeHTML(d.winnerName)}</span>
                <span class="duel-vs">победил</span>
                <span class="duel-opponent-name" ${profileOnClick(d.loserName)}>${escapeHTML(d.loserName)}</span>
            </div>
            <div class="duel-elo-lines">
                ${sideLine(d.winnerName, d.winnerSide)}
                ${sideLine(d.loserName, d.loserSide)}
            </div>
            ${timeoutHTML}
        </div>`;
    }).join('');

    if (total > shown.length) {
        html += `<p class="duels-empty">Показаны последние ${shown.length} из ${total} дуэлей. Уточните поиск или кит, чтобы увидеть остальные.</p>`;
    }
    container.innerHTML = html;
}

// Одна запись дуэли (со стороны игрока, чей профиль открыт) -> HTML-строка.
// showKit=true добавляет иконку и название кита.
function renderDuelRow(entry, showKit) {
    const won = entry.result === 'win';
    const timeoutNote = entry.endReason === 'timeout'
        ? `<div class="duel-note">${won ? 'Соперник не вернулся на сервер за 3 минуты' : 'Автопоражение: не вернулись на сервер за 3 минуты'}</div>`
        : '';

    return `<div class="duel-row ${won ? 'duel-win' : 'duel-loss'}">
        <div class="duel-row-top">
            ${showKit ? buildKitHTML(entry.kit) : ''}
            <span class="duel-date">${formatDuelTime(entry)}</span>
        </div>
        <div class="duel-row-main">
            <span class="duel-opponent-label">против</span>
            <span class="duel-opponent-name" ${profileOnClick(entry.opponent)}>${escapeHTML(entry.opponent)}</span>
            <span class="duel-result-badge">${won ? 'Победа' : 'Поражение'}</span>
        </div>
        ${buildEloChangeHTML(entry.eloBefore, entry.eloAfter, entry.delta)}
        ${timeoutNote}
    </div>`;
}

// Список дуэлей игрока (профиль): новые сверху
function renderDuelsList(matchHistory, opts = {}) {
    const showKit = !!opts.showKit;
    const list = Array.isArray(matchHistory) ? matchHistory.filter(isNewFormatDuel) : [];

    if (list.length === 0) {
        return `<p class="duels-empty">Дуэлей пока нет.</p>`;
    }

    const sorted = [...list].sort((a, b) => duelSortKey(b).localeCompare(duelSortKey(a)));
    const shown = sorted.slice(0, PROFILE_DUELS_LIMIT);
    let html = shown.map(entry => renderDuelRow(entry, showKit)).join('');
    if (sorted.length > shown.length) {
        html += `<p class="duels-empty">Показаны последние ${shown.length} из ${sorted.length} дуэлей.</p>`;
    }
    return html;
}

// Запуск сайта
function initSite() {
    renderPlayers();
}

// Хук: вызывается из index.html, когда players.js загрузился (асинхронно, после этого файла)
window.onPlayersLoaded = function() {
    renderPlayers();
};

