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
    if (t.closest && t.closest('[data-no-sound]')) return;
    if (t.closest && t.closest(
        'button, a[href], select, input, label, [onclick], [role="button"], .chip, .ov-card, ' +
        '.player-card-row, .home-leader-row, .home-result-row, .home-mode-card, .home-search-hit, .sidebar a'
    )) {
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
// ДАННЫЕ ИГРОКОВ
// ==========================================
// Список игроков приходит с сервера бота (GET /api/players), а не из файла.
// eloPlayers === undefined, пока данные не загружены. Объявлено здесь, до
// остального кода: чтение переменной до её объявления вызывает ошибку.
let eloPlayers;
let playersUpdatedAt = null;     // время последнего снимка на сервере (чтобы не перерисовывать зря)
let playersLoadStarted = false;
let playersLoading = false;
let playersLoadError = false;    // первая загрузка не удалась
let playersSlowHint = false;     // сервер отвечает долго (на бесплатном хостинге он "просыпается")
let playersLoadedAt = 0;

// Что показывать вместо списка, пока данных нет: загрузка или ошибка с кнопкой
function loadStatusHTML() {
    if (playersLoadError) {
        return `<div class="load-error">
            <p>Не удалось загрузить данные. Проверьте соединение и попробуйте ещё раз.</p>
            <button class="load-retry-btn" onclick="retryLoadPlayers()">Повторить</button>
        </div>`;
    }
    const hint = playersSlowHint
        ? '<div style="font-size:12px; color:#8892b0; margin-top:8px;">Сервер просыпается, это может занять до минуты.</div>'
        : '';
    return `<div style="text-align:center;color:#ffcc47;padding:40px;">Загрузка базы данных игроков...${hint}</div>`;
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

// Рейтинг игрока на ките: { elo, tier }. Ранг всегда считается из Elo
// (tiers[kit] = { elo, ... } в ответе API); если игрок кит не играл или Elo
// нет - { elo: null, tier: 'Unranked' }.
function getKitRating(player, kit) {
    const data = (player && player.tiers) ? player.tiers[kit] : null;
    if (data && typeof data.elo === 'number') {
        // retired приходит с бота отдельным флагом (по киту)
        return { elo: data.elo, tier: getTierByElo(data.elo), retired: !!data.retired };
    }
    return { elo: null, tier: 'Unranked', retired: false };
}

// Хелпер: чистое название ранга игрока на ките ("Unranked", если не играл)
function getCleanTier(player, kit) {
    return getKitRating(player, kit).tier;
}

// Elo для сортировки и усреднения; null - если игрок кит не играл
function getEffectiveElo(rating) {
    return (rating && rating.elo !== null) ? rating.elo : null;
}

// Elo для показа пользователю ("—", если рейтинга нет)
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
function getTierBadge(tier, appendR = false) {
    const color = tierColorOf(tier, '#fff');
    if (appendR && tier !== 'Unranked') {
        return `<span class="tier-badge" style="border: 1px solid ${color}44; background: ${color}11;">
            <span style="color: #ff4a4a; font-weight: bold;">R</span><span style="color: ${color};">${tier}</span>
        </span>`;
    }
    return `<span class="tier-badge" style="color: ${color}; border: 1px solid ${color}44; background: ${color}11;">${tier}</span>`;
}

// Генерация маленького тега ранга (среднего или конкретного)
function getMetaTierTag(tier, isRetired = false) {
    const color = tierColorOf(tier, '#8892b0');
    if (isRetired && tier !== 'Unranked') {
        return `
        <span class="player-meta-tag" style="border-color: ${color}55; background: ${color}11; padding: 2px 6px;">
            <span style="color: #ff4a4a; font-weight: bold; margin-right: 1px;">R</span><span style="color: ${color}; font-weight: bold;">${tier}</span>
        </span>`;
    }
    return `<span class="player-meta-tag" style="color: ${color}; border-color: ${color}55; background: ${color}11; font-weight: bold;">${tier}</span>`;
}

// Retired-статус кита (флаг приходит с бота отдельно по каждому киту)
function isKitRetired(player, kit) {
    const r = getKitRating(player, kit);
    return r.tier !== 'Unranked' && r.retired === true;
}

// Есть ли у игрока ХОТЯ БЫ ОДИН main-кит в Retired (в режиме Games - хотя бы
// одна игра). От этого общий средний ранг тоже считается Retired.
function hasAnyRetiredKit(player, kitsList) {
    const list = kitsList || ((typeof maintiers !== 'undefined') ? maintiers : []);
    return list.some(kit => isKitRetired(player, kit));
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
    if (typeof eloPlayers === 'undefined' || !Array.isArray(eloPlayers)) {
        console.warn('База игроков ещё не загружена.');
        return;
    }
    const found = eloPlayers.find(p => p.name && p.name.toLowerCase() === String(playerName).toLowerCase());
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
    const activeKitImages = (typeof miniGames !== 'undefined' && miniGames.includes(kit))
        ? ((typeof gameImages !== 'undefined') ? gameImages : {})
        : ((typeof kitImages !== 'undefined') ? kitImages : {});
    const rating = getKitRating(player, kit);
    const eloText = rating.elo !== null ? `${formatElo(rating)} Elo` : '';
    return `<div class="modal-row">
        <div class="modal-kit-left">
            <img class="modal-kit-icon" src="${activeKitImages[kit] || ''}" onerror="this.style.opacity='0'" alt="">
            <span class="m-kit">${kit}</span>
        </div>
        <div class="m-right-side">
            ${getTierBadge(rating.tier, rating.retired)}
            <span class="m-elo-box">${eloText}</span>
        </div>
    </div>`;
}

// Открытие детального профиля игрока в модальном окне
function showProfile(player) {
    try {
        const mainBlock = document.getElementById('modalMainBlock');
        const subBlock = document.getElementById('modalSubBlock');
        if (mainBlock) mainBlock.style.display = '';
        if (subBlock) subBlock.style.display = '';
        const mainTitle = document.getElementById('modalMainTitle');
        const subTitle = document.getElementById('modalSubTitle');
        if (mainTitle) mainTitle.textContent = 'Main Tiers';
        if (subTitle) subTitle.textContent = 'Sub Tiers';
        const modalName = document.getElementById('modalPlayerName');
        if (modalName) modalName.textContent = player.name;

        // Теги профиля: регион и ранг (общий средний - в общих топах, иначе
        // ранг по выбранному киту)
        let metaHTML = `<span class="player-meta-tag">${escapeHTML(player.region || '?')}</span>`;

        const targetKit = window.currentKitFilter || 'all';
        const shownTier = (targetKit === 'all' || targetKit === 'sub-all')
            ? calcAverageTier(player)
            : getCleanTier(player, targetKit);
        if (shownTier !== 'Unranked') {
            const isOverallView = (targetKit === 'all' || targetKit === 'sub-all');
            const profRetired = isOverallView ? hasAnyRetiredKit(player) : isKitRetired(player, targetKit);
            metaHTML += getMetaTierTag(shownTier, profRetired);
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

function openGameProfileByName(playerName) {
    if (!Array.isArray(eloPlayers)) return;
    const found = eloPlayers.find(p => p.name && p.name.toLowerCase() === String(playerName).toLowerCase());
    if (!found) return;
    showGameProfile(found);
}

function showGameProfile(player) {
    const view = toGameView(player);
    const games = (typeof miniGames !== 'undefined') ? miniGames : [];
    document.getElementById('modalPlayerName').textContent = player.name;
    const target = window.currentGameFilter || 'all';
    const tier = target === 'all' ? calcAverageTierOver(view, games) : getCleanTier(view, target);
    const retired = target === 'all' ? hasAnyRetiredKit(view, games) : isKitRetired(view, target);
    const meta = `<span class="player-meta-tag">${escapeHTML(player.region || '?')}</span>${tier !== 'Unranked' ? getMetaTierTag(tier, retired) : ''}`;
    document.getElementById('modalPlayerMeta').innerHTML = `<div class="player-meta-box" style="justify-content:flex-start;margin-top:5px;gap:6px;">${meta}</div>`;
    document.getElementById('modalRoleContainer').innerHTML = isTester(player.name) ? '<span class="custom-role-badge">Tester</span>' : '';
    document.getElementById('modalMainTitle').textContent = 'Games';
    document.getElementById('modalMainRows').innerHTML = games.map(game => buildKitRowHTML(view, game)).join('');
    document.getElementById('modalMainTotal').textContent = `Всего Elo за Games: ${calcOverallElo(view, games)}`;
    document.getElementById('modalSubBlock').style.display = 'none';
    document.getElementById('modalDuelsRows').innerHTML = renderDuelsList(player.matchHistory, { showKit: true });
    document.getElementById('profileModal').classList.add('active');
}

// Закрытие модального окна профиля
function closeModal() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.classList.remove('active');
}

// ==========================================
// 4. ГЛАВНАЯ ФУНКЦИЯ РЕНДЕРИНГА ТАБЛИЦЫ
// ==========================================

// Плитка кита для общего топа: квадрат со скруглением, иконка и ранг под ней.
// Retired - приглушённая плитка с буквой R, нет рейтинга - прочерк.
function ovTileHTML(kit, rating, kitImagesMap) {
    const iconSrc = escapeHTML(kitImagesMap[kit] || '');
    if (rating.tier === 'Unranked') {
        return `<div class="ov-tile ov-tile-empty" title="${escapeHTML(kit)}">
            <img class="ov-tile-icon" src="${iconSrc}" onerror="this.style.opacity=0" alt="">
            <span class="ov-tile-tier">\u2014</span>
        </div>`;
    }
    const clr = tierColorOf(rating.tier, '#444b66');
    const retiredMark = rating.retired ? '<span class="ov-r">R</span>' : '';
    return `<div class="ov-tile${rating.retired ? ' ov-tile-retired' : ''}" style="border-color: ${clr}99; background: ${clr}26;" title="${escapeHTML(kit)}: ${formatElo(rating)} Elo${rating.retired ? ' (Retired)' : ''}">
        <img class="ov-tile-icon" src="${iconSrc}" onerror="this.style.opacity=0" alt="">
        <span class="ov-tile-tier" style="color: ${clr};">${retiredMark}${rating.tier}</span>
    </div>`;
}

// Порядок плиток в карточке: сначала активные ранги от лучшего к худшему,
// затем Retired от лучшего к худшему, в конце киты без рейтинга (прочерк).
function sortedKitRatings(player, kits) {
    const group = (r) => r.tier === 'Unranked' ? 2 : (r.retired ? 1 : 0);
    return kits
        .map((kit, order) => ({ kit, rating: getKitRating(player, kit), order }))
        .sort((a, b) =>
            (group(a.rating) - group(b.rating)) ||
            ((b.rating.elo || 0) - (a.rating.elo || 0)) ||
            (a.order - b.order));
}

// ==========================================
// ГЛОБАЛЬНАЯ НАВИГАЦИЯ: Kits = PTS, Games = Elo
// ==========================================

window.activeRating = 'kits';
window.currentGameFilter = 'all';
window.currentGameRegion = 'all';
window.gameSearch = '';
window.gameShowRetired = true;

function crownSVG(className = 'chip-crown') {
    return `<svg class="${className}" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3 7 4 4 5-7 5 7 4-4-2 11H5L3 7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M5 21h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;
}

function rankHTML(position) {
    return `<span class="player-rank${position <= 5 ? ' player-rank-premium' : ''} player-rank-${Math.min(position, 6)}"><span>#${position}</span></span>`;
}

function openRating(system, filter = 'all') {
    const target = system === 'games' ? 'games' : 'kits';
    window.activeRating = target;
    if (target === 'games') window.currentGameFilter = filter;
    else if (window.PTS) window.PTS.setKitFilter(filter, false);
    navigate(target);
}

function setRatingSystem(system) {
    const target = system === 'games' ? 'games' : 'kits';
    const filter = target === 'games' ? (window.currentGameFilter || 'all') : (window.PTS ? window.PTS.getKitFilter() : 'all');
    openRating(target, filter);
}

function pluralPlayers(n) {
    const a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return '\u0438\u0433\u0440\u043e\u043a';
    if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return '\u0438\u0433\u0440\u043e\u043a\u0430';
    return '\u0438\u0433\u0440\u043e\u043a\u043e\u0432';
}

// ==========================================
// Лента чипов (киты или игры), поиск, шторка фильтров
// ==========================================

const REGION_CODES = ['RU', 'UA', 'BY', 'KZ', 'UZ', 'KG', 'AM', 'AZ', 'MD', 'TJ'];

function chipHTML(value, label, iconSrc, active, handler) {
    const icon = iconSrc === 'crown'
        ? crownSVG()
        : (iconSrc ? `<img src="${escapeHTML(iconSrc)}" onerror="this.style.display='none'" alt="">` : '');
    return `<button type="button" role="tab" aria-selected="${active}" class="chip${active ? ' active' : ''}" data-v="${escapeHTML(value)}" onclick="${handler}">${icon}<span>${escapeHTML(label)}</span></button>`;
}

// Плитка кита/игры справа в карточке отдельного топа: иконка и ранг
function ovSingleTileHTML(iconSrc, tier, retired, title) {
    const clr = tierColorOf(tier, '#8892b0');
    const retiredMark = retired ? '<span class="ov-r">R</span>' : '';
    return `<div class="ov-single-tile${retired ? ' ov-tile-retired' : ''}" style="border-color:${clr}99;background:${clr}26;" title="${escapeHTML(title || '')}">
        <img class="ov-tile-icon" src="${escapeHTML(iconSrc || '')}" alt="" onerror="this.style.visibility='hidden';">
        <span class="ov-tile-tier" style="color:${clr};">${retiredMark}${tier}</span>
    </div>`;
}

// Строка игрока в топе на главной (PTS и мини-игры). unit - подпись под числом
function homeLeaderRowHTML(player, index, tierHTML, value, unit, onclick) {
    return `<button type="button" class="home-leader-row home-leader-row-${index + 1}" onclick="${onclick}">
        <span class="home-leader-position home-leader-position-${index + 1}">${index + 1}</span>
        <span class="home-leader-avatar">${skinImgHTML(player, 'home-leader-skin')}</span>
        <span class="home-leader-info"><strong>${escapeHTML(player.name)}</strong><span class="home-region-tag">${escapeHTML(player.region || '?')}</span></span>
        <span class="home-leader-tier">${tierHTML}</span>
        <span class="home-leader-score"><strong>${value}</strong><span>${unit}</span></span>
    </button>`;
}

// Тег ранга (тот же размер, что у тега региона); Retired - красная R
function ovTierTagHTML(tier, retired) {
    if (tier === 'Unranked') return '<span class="ov-tag" style="color:#8892b0;">\u2014</span>';
    const clr = tierColorOf(tier, '#8892b0');
    return `<span class="ov-tag" style="color:${clr};border-color:${tierColorOf(tier, '#444b66')}99;">${retired ? '<span class="ov-r">R</span>' : ''}${tier}</span>`;
}

function renderChips() {
    const row = document.getElementById('gamesChipsRow');
    if (!row) return;
    const games = (typeof miniGames !== 'undefined') ? miniGames : [];
    const images = (typeof gameImages !== 'undefined') ? gameImages : {};
    const active = window.currentGameFilter || 'all';
    row.innerHTML = chipHTML('all', 'All Games', 'crown', active === 'all', 'setBoardFilter(this.dataset.v)') +
        games.map(g => chipHTML(g, g, images[g], active === g, 'setBoardFilter(this.dataset.v)')).join('');
    const activeChip = row.querySelector('.chip.active');
    if (activeChip) row.scrollLeft = Math.max(0, activeChip.offsetLeft - (row.clientWidth - activeChip.offsetWidth) / 2);
}

function setBoardFilter(value) {
    window.currentGameFilter = value;
    renderChips();
    renderPlayers();
}

function toggleSearch() {
    const row = document.getElementById('searchRow');
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('searchToggle');
    if (!row) return;
    const open = row.hasAttribute('hidden');
    row.toggleAttribute('hidden', !open);
    if (open && input) input.focus();
    if (!open && input) {
        input.value = '';
        setActiveSearch('');
    }
    if (btn) btn.classList.toggle('active', open);
}

function setActiveSearch(value) {
    if (window.activeRating === 'games') {
        window.gameSearch = value;
        renderPlayers();
    } else if (window.PTS) {
        window.PTS.setSearch(value);
    }
}

function currentActiveRegion() {
    return window.activeRating === 'games'
        ? (window.currentGameRegion || 'all')
        : (window.PTS ? window.PTS.getRegion() : 'all');
}

function updateFilterBadge() {
    const badge = document.getElementById('filterBadge');
    const retired = document.getElementById('retiredToggle');
    const count = (currentActiveRegion() !== 'all' ? 1 : 0) + ((retired && !retired.checked) ? 1 : 0);
    if (badge) { badge.textContent = String(count); badge.hidden = count === 0; }
}

function renderRegionChips() {
    const box = document.getElementById('regionChips');
    if (!box) return;
    const active = currentActiveRegion();
    const codes = window.activeRating === 'games' ? GAME_REGION_CODES : KIT_REGION_CODES;
    box.innerHTML = chipHTML('all', 'Все', '', active === 'all', 'setRegionFilter(this.dataset.v)') +
        codes.map(r => chipHTML(r, r, '', active === r, 'setRegionFilter(this.dataset.v)')).join('');
    const label = document.getElementById('regionSheetLabel');
    if (label) label.textContent = window.activeRating === 'games' ? 'Регион мира' : 'Регион СНГ';
}

function setRegionFilter(value) {
    if (window.activeRating === 'games') {
        window.currentGameRegion = value;
        renderPlayers();
    } else if (window.PTS) {
        window.PTS.setRegion(value);
    }
    renderRegionChips();
    updateFilterBadge();
}

function syncRatingUI() {
    const games = window.activeRating === 'games';
    document.querySelectorAll('[data-rating]').forEach(btn => {
        const active = btn.dataset.rating === window.activeRating;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', String(active));
    });
    const kitsPanel = document.getElementById('kitsPanel');
    const gamesPanel = document.getElementById('gamesPanel');
    if (kitsPanel) kitsPanel.hidden = games;
    if (gamesPanel) gamesPanel.hidden = !games;
    const input = document.getElementById('searchInput');
    if (input) input.value = games ? window.gameSearch : (window.PTS ? window.PTS.getSearch() : '');
    const retired = document.getElementById('retiredToggle');
    if (retired) retired.checked = games ? window.gameShowRetired : (window.PTS ? window.PTS.getRetired() : true);
    if (games) { renderChips(); renderPlayers(); }
    else if (window.PTS) window.PTS.renderAll();
    renderRegionChips();
    updateFilterBadge();
}

function openFilterSheet() {
    renderRegionChips();
    const sheet = document.getElementById('filterSheet');
    const back = document.getElementById('filterBackdrop');
    if (sheet) sheet.removeAttribute('hidden');
    if (back) back.removeAttribute('hidden');
    const done = sheet && sheet.querySelector('.sheet-done');
    if (done) done.focus();
}

function closeFilterSheet() {
    const sheet = document.getElementById('filterSheet');
    const back = document.getElementById('filterBackdrop');
    if (sheet) sheet.setAttribute('hidden', '');
    if (back) back.setAttribute('hidden', '');
}

// Игрок "в разрезе игр": те же поля, но рейтинги берутся из player.games.
// Так все расчёты (getKitRating, calcOverallElo...) работают без изменений.
function toGameView(player) {
    return { name: player.name, region: player.region, tiers: player.games || {} };
}

// Средний ранг по заданному списку китов/игр (в режиме Games - по играм)
function calcAverageTierOver(player, kits) {
    const values = kits.map(k => getEffectiveElo(getKitRating(player, k))).filter(v => v !== null);
    if (values.length === 0) return 'Unranked';
    return getTierByElo(Math.round(values.reduce((a, b) => a + b, 0) / values.length));
}

// ==========================================
// СКИНЫ ИГРОКОВ
// Файл assets/skins/default_bust.png обрезается до самого скина (без прозрачных
// полей), чтобы он занимал всё место, и подставляется во ВСЕ экраны сразу после
// готовности. Личные скины игроков (когда появятся): player.skin = "путь или ссылка".
// ==========================================
const DEFAULT_SKIN_SRC = 'assets/skins/default_bust.png';
window.overallSkinSrc = DEFAULT_SKIN_SRC;

function skinSrcFor(player) {
    return (player && player.skin) ? player.skin : window.overallSkinSrc;
}

function skinImgHTML(player, cls) {
    const custom = !!(player && player.skin);
    return `<img class="skin-img ${cls || ''}" data-skin="${custom ? 'custom' : 'default'}" src="${escapeHTML(skinSrcFor(player))}" alt="" decoding="async" onerror="this.style.visibility='hidden';">`;
}

// Подменяет скин по умолчанию во всех уже нарисованных карточках
function refreshDefaultSkins() {
    document.querySelectorAll('img.skin-img[data-skin="default"]').forEach(img => {
        if (img.getAttribute('src') !== window.overallSkinSrc) img.src = window.overallSkinSrc;
    });
}

function trimTransparentImage(src) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            try {
                const w = img.naturalWidth, h = img.naturalHeight;
                const canvas = document.createElement('canvas');
                canvas.width = w; canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const data = ctx.getImageData(0, 0, w, h).data;
                let minX = w, minY = h, maxX = -1, maxY = -1;
                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        if (data[(y * w + x) * 4 + 3] > 8) {
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }
                if (maxX < 0 || (minX === 0 && minY === 0 && maxX === w - 1 && maxY === h - 1)) { resolve(src); return; }
                const cw = maxX - minX + 1, ch = maxY - minY + 1;
                const out = document.createElement('canvas');
                out.width = cw; out.height = ch;
                out.getContext('2d').drawImage(img, minX, minY, cw, ch, 0, 0, cw, ch);
                // Короткая blob-ссылка вместо огромной data:-строки в каждой карточке
                if (out.toBlob && window.URL && URL.createObjectURL) {
                    out.toBlob(blob => resolve(blob ? URL.createObjectURL(blob) : out.toDataURL('image/png')), 'image/png');
                } else {
                    resolve(out.toDataURL('image/png'));
                }
            } catch (e) {
                resolve(src);   // файл нельзя прочитать - берём как есть
            }
        };
        img.onerror = () => resolve(src);
        img.src = src;
    });
}



function gameProfileOnClick(name) {
    const encoded = encodeURIComponent(String(name)).replace(/'/g, '%27');
    return `onclick="openGameProfileByName(decodeURIComponent('${encoded}'))"`;
}

function renderPlayers() {
    const list = document.getElementById('gamesPlayersList');
    if (!list) return;

    const search = String(window.gameSearch || '').toLowerCase();
    const region = window.currentGameRegion || 'all';
    const showRetiredInPlace = window.gameShowRetired !== false;
    const targetGame = window.currentGameFilter || 'all';
    const isOverall = targetGame === 'all';
    const games = (typeof miniGames !== 'undefined') ? miniGames : [];
    const images = (typeof gameImages !== 'undefined') ? gameImages : {};
    const subtitleEl = document.getElementById('gamesTableSubtitle');
    const countEl = document.querySelector('#gamesPlayerCount strong');
    const boardLabel = isOverall ? 'Games Overall' : targetGame;
    if (subtitleEl) subtitleEl.textContent = boardLabel;

    if (typeof eloPlayers === 'undefined' || !Array.isArray(eloPlayers)) {
        list.innerHTML = loadStatusHTML();
        if (countEl) countEl.textContent = '0';
        return;
    }

    const sourcePlayers = eloPlayers.map(toGameView);
    let filtered = sourcePlayers.filter(player => {
        const matchesSearch = (player.name || '').toLowerCase().includes(search);
        const matchesRegion = region === 'all' || player.region === region;
        if (!matchesSearch || !matchesRegion) return false;
        if (!isOverall) {
            if (!showRetiredInPlace && isKitRetired(player, targetGame)) return false;
            return getCleanTier(player, targetGame) !== 'Unranked';
        }
        if (!showRetiredInPlace && hasAnyRetiredKit(player, games)) return false;
        return games.some(game => getCleanTier(player, game) !== 'Unranked');
    });

    if (isOverall) {
        filtered.sort((a, b) => (calcOverallElo(b, games) - calcOverallElo(a, games)) || a.name.localeCompare(b.name));
    } else {
        const eloOf = p => getEffectiveElo(getKitRating(p, targetGame)) || 0;
        filtered.sort((a, b) => (eloOf(b) - eloOf(a)) || a.name.localeCompare(b.name));
    }

    if (countEl) countEl.textContent = String(filtered.length);
    if (filtered.length === 0) {
        const hasAnyGames = eloPlayers.some(p => p.games && Object.keys(p.games).length);
        list.innerHTML = !hasAnyGames
            ? '<div class="board-empty">Рейтинг мини-игр появится после первых матчей.</div>'
            : '<div class="board-empty">Игроки не найдены</div>';
        return;
    }

    let htmlFragment = '';
    filtered.forEach((player, index) => {
        const position = index + 1;
        const nameHTML = escapeHTML(player.name);
        const regionHTML = `<span class="player-meta-tag">${escapeHTML(player.region || '?')}</span>`;
        let topClass = index < 5 ? `top-rank-${position}` : '';
        const isRet = isOverall ? hasAnyRetiredKit(player, games) : isKitRetired(player, targetGame);
        if (isRet) topClass = `${topClass} retired-status`.trim();

        if (!isOverall) {
            const rating = getKitRating(player, targetGame);
            htmlFragment += `
                <div class="player-container ov-card ov-card-single premium-game-card ${topClass}" ${gameProfileOnClick(player.name)}>
                    <div class="ov-skin-wrap">${skinImgHTML(player, 'ov-skin')}</div>
                    <div class="ov-body">
                        <div class="ov-title">${rankHTML(position)}<span class="player-name">${nameHTML}</span></div>
                        <div class="ov-elo"><strong>${formatElo(rating)} Elo</strong></div>
                        <div class="ov-tags"><span class="ov-tag">${escapeHTML(player.region || '?')}</span></div>
                    </div>
                    ${ovSingleTileHTML(images[targetGame], rating.tier, rating.retired, targetGame)}
                </div>`;
            return;
        }

        const totalElo = calcOverallElo(player, games);
        const avgTier = calcAverageTierOver(player, games);
        const avgClr = tierColorOf(avgTier, '#8892b0');
        const avgTierHTML = avgTier !== 'Unranked'
            ? `<span class="ov-tag" style="color:${avgClr};border-color:${tierColorOf(avgTier, '#444b66')}99;">${isRet ? '<span class="ov-r">R</span>' : ''}${avgTier}</span>`
            : `<span class="ov-tag" style="color:#8892b0;">—</span>`;
        const tilesHTML = sortedKitRatings(player, games)
            .map(x => (!showRetiredInPlace && x.rating.retired)
                ? ovTileHTML(x.kit, { elo: null, tier: 'Unranked', retired: false }, images)
                : ovTileHTML(x.kit, x.rating, images)).join('');
        htmlFragment += `
        <div class="player-container ov-card ${topClass}" ${gameProfileOnClick(player.name)}>
            <div class="ov-skin-wrap">${skinImgHTML(player, 'ov-skin')}</div>
            <div class="ov-body">
                <div class="ov-title">${rankHTML(position)}<span class="player-name">${nameHTML}</span></div>
                <div class="ov-elo">${totalElo} Elo</div>
                <div class="ov-tags">${avgTierHTML}<span class="ov-tag">${escapeHTML(player.region || '?')}</span></div>
                <div class="ov-scroll" aria-label="Ранги по играм">${tilesHTML}</div>
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
function showTab(tabId) {
    const sb = document.getElementById('sidebar');
    if (sb) sb.classList.remove('active');
    
    const mp = document.getElementById('mainPage');
    if (mp) mp.style.display = 'none';
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    if (tabId === 'mainPage' || tabId === 'boardTab') {
        if (mp) mp.style.display = 'block';
        // Внутри главной страницы два экрана: главная и рейтинг
        const homeScreen = document.getElementById('homeScreen');
        const boardScreen = document.getElementById('boardScreen');
        const isBoard = tabId === 'boardTab';
        if (homeScreen) homeScreen.hidden = isBoard;
        if (boardScreen) boardScreen.hidden = !isBoard;
        if (isBoard) syncRatingUI();
        renderHome();
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

// ==========================================
// МАРШРУТЫ: адрес после # -> экран. Работает кнопка "Назад" браузера.
// "" - главная, #rating - рейтинг, #duels, #start, #info - разделы
// ==========================================
const ROUTE_TO_TAB = { '': 'mainPage', kits: 'boardTab', games: 'boardTab', rating: 'boardTab', duels: 'duelsTab', start: 'testingTab', info: 'otherInfoTab' };
const TAB_TO_ROUTE = { mainPage: '', boardTab: 'kits', duelsTab: 'duels', testingTab: 'start', otherInfoTab: 'info' };

function currentRoute() {
    return location.hash.replace(/^#\/?/, '');
}

function applyRoute() {
    const route = currentRoute();
    if (route === 'games') window.activeRating = 'games';
    if (route === 'kits' || route === 'rating') window.activeRating = 'kits';
    showTab(ROUTE_TO_TAB.hasOwnProperty(route) ? ROUTE_TO_TAB[route] : 'mainPage');
}

// Переход на маршрут: меняет адрес (запись в истории браузера) и показывает экран
function navigate(route) {
    if (currentRoute() === route) { applyRoute(); return; }
    location.hash = route;   // пустой маршрут оставляет "#" - это главная
}

function switchTab(tabId) {
    navigate(TAB_TO_ROUTE.hasOwnProperty(tabId) ? TAB_TO_ROUTE[tabId] : '');
}

function backHome() {
    navigate('');
}

window.addEventListener('hashchange', applyRoute);


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

    if (searchInput) searchInput.addEventListener('input', () => setActiveSearch(searchInput.value));

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

    // Тумблер Retired
    const retiredToggleEl = document.getElementById('retiredToggle');
    if (retiredToggleEl) retiredToggleEl.addEventListener('change', () => {
        if (window.activeRating === 'games') { window.gameShowRetired = retiredToggleEl.checked; renderPlayers(); }
        else if (window.PTS) window.PTS.setRetired(retiredToggleEl.checked);
        updateFilterBadge();
    });

    // Фильтры на чипах: состояние по умолчанию и первая отрисовка ленты
    window.currentKitFilter = 'all';
    window.currentGameFilter = 'all';
    window.currentRegionFilter = 'all';
    renderChips();
    updateFilterBadge();

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
    const activeKitImages = (typeof miniGames !== 'undefined' && miniGames.includes(kit))
        ? ((typeof gameImages !== 'undefined') ? gameImages : {})
        : ((typeof kitImages !== 'undefined') ? kitImages : {});
    return `<div class="duel-kit">
        <img class="duel-kit-icon" src="${activeKitImages[kit] || ''}" onerror="this.style.display='none';" alt="">
        <span>${escapeHTML(kit)}</span>
    </div>`;
}

// Собирает уникальный список дуэлей со всех игроков: у каждой дуэли в
// данных две записи (по одной у каждого участника) - склеиваем их по id
// в одну, где известны обе стороны.
function collectGlobalDuels() {
    if (typeof eloPlayers === 'undefined' || !Array.isArray(eloPlayers)) return [];

    const byKey = new Map();

    eloPlayers.forEach(player => {
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

    if (typeof eloPlayers === 'undefined' || !Array.isArray(eloPlayers)) {
        container.innerHTML = loadStatusHTML();
        return;
    }

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

// ==========================================
// ЗАГРУЗКА ДАННЫХ С СЕРВЕРА
// ==========================================

// Первый запрос может ждать долго: на бесплатном хостинге сервер
// "просыпается" почти минуту. Фоновые обновления ждут меньше.
const FIRST_LOAD_TIMEOUT_MS = 60000;
const REFRESH_TIMEOUT_MS = 20000;
const SLOW_LOAD_HINT_MS = 8000;

function getPlayersApiUrl() {
    const base = (typeof API_BASE_URL !== 'undefined') ? String(API_BASE_URL).replace(/\/+$/, '') : '';
    return `${base}/api/players`;
}

async function fetchPlayersFromApi(timeoutMs) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(getPlayersApiUrl(), { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data || !Array.isArray(data.players)) throw new Error('неожиданный формат ответа');
        return data;
    } finally {
        clearTimeout(timer);
    }
}

// ==========================================
// ГЛАВНАЯ СТРАНИЦА: обзор Elo, последние дуэли и переходы к режимам
// ==========================================

function scrollToLeaderboard() {
    navigate('rating');
}

// Поиск на главной: список подсказок под полем; нажатие открывает профиль игрока.
// Ищем и среди игроков PTS (киты), и среди игроков Elo (мини-игры).
function findHomePlayers(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const found = new Map();
    const add = (player, source) => {
        const key = String(player.name).toLowerCase();
        if (!key.includes(q)) return;
        const entry = found.get(key) || { name: player.name, region: player.region, sources: [] };
        if (!entry.sources.includes(source)) entry.sources.push(source);
        if (source === 'kits') entry.region = player.region || entry.region;
        found.set(key, entry);
    };
    (window.PTS ? window.PTS.getPlayers() : []).forEach(p => add(p, 'kits'));
    (Array.isArray(eloPlayers) ? eloPlayers : []).forEach(p => { if (p.games && Object.keys(p.games).length) add(p, 'games'); });
    return [...found.values()]
        .sort((a, b) => (String(b.name).toLowerCase().startsWith(q) - String(a.name).toLowerCase().startsWith(q)) || a.name.localeCompare(b.name))
        .slice(0, 6);
}

function openFoundPlayer(name, source) {
    const results = document.getElementById('homeSearchResults');
    if (results) results.hidden = true;
    if (source === 'games' && !(window.PTS && window.PTS.getPlayers().some(p => p.name === name))) openGameProfileByName(name);
    else if (window.PTS) window.PTS.openProfileByName(name);
}

function renderHomeSearchResults(query) {
    const box = document.getElementById('homeSearchResults');
    if (!box) return;
    const q = query.trim();
    if (!q) { box.hidden = true; box.innerHTML = ''; return; }
    const hits = findHomePlayers(q);
    box.innerHTML = hits.length ? hits.map(hit => {
        const encoded = encodeURIComponent(hit.name).replace(/'/g, '%27');
        const source = hit.sources.includes('kits') ? 'kits' : 'games';
        const badges = hit.sources.map(s => `<span class="home-search-badge">${s === 'kits' ? 'PTS' : 'Elo'}</span>`).join('');
        return `<button type="button" class="home-search-hit" onclick="openFoundPlayer(decodeURIComponent('${encoded}'), '${source}')">
            <span class="home-search-hit-name">${escapeHTML(hit.name)}</span>
            <span class="home-search-hit-meta">${badges}<span class="home-region-tag">${escapeHTML(hit.region || '?')}</span></span>
        </button>`;
    }).join('') : '<div class="home-search-empty">Игрок не найден</div>';
    box.hidden = false;
}

function homeSearchTyping(value) {
    const clear = document.getElementById('homeSearchClear');
    if (clear) clear.hidden = !value;
    renderHomeSearchResults(value);
}

function clearHomeSearch() {
    const input = document.getElementById('homeSearchInput');
    if (input) { input.value = ''; input.focus(); }
    homeSearchTyping('');
}

function submitHomeSearch(event) {
    if (event) event.preventDefault();
    const input = document.getElementById('homeSearchInput');
    const query = input ? input.value.trim() : '';
    const hits = findHomePlayers(query);
    if (!query) return;
    const exact = hits.find(h => String(h.name).toLowerCase() === query.toLowerCase()) || hits[0];
    if (exact) openFoundPlayer(exact.name, exact.sources.includes('kits') ? 'kits' : 'games');
    else renderHomeSearchResults(query);
}

function openHomeMode(mode, value) {
    openRating(mode === 'games' ? 'games' : 'kits', value);
}

function homeModeCardHTML(mode, value, label, iconSrc) {
    const icon = iconSrc
        ? `<img src="${escapeHTML(iconSrc)}" alt="" onerror="this.style.display='none';">`
        : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    return `<button type="button" class="home-mode-card" onclick="openHomeMode('${mode}', '${escapeHTML(value)}')">${icon}<span>${escapeHTML(label)}</span></button>`;
}

function renderHomeModeCards() {
    const kitsGrid = document.getElementById('homeKitsGrid');
    const gamesGrid = document.getElementById('homeGamesGrid');
    const images = (typeof kitImages !== 'undefined') ? kitImages : {};
    const gamesImages = (typeof gameImages !== 'undefined') ? gameImages : {};
    const kits = [...((typeof maintiers !== 'undefined') ? maintiers : []), ...((typeof subtiers !== 'undefined') ? subtiers : [])];
    const games = (typeof miniGames !== 'undefined') ? miniGames : [];
    if (kitsGrid) kitsGrid.innerHTML = homeModeCardHTML('kits', 'all', 'Overall', '') + kits.map(kit => homeModeCardHTML('kits', kit, kit, images[kit])).join('');
    if (gamesGrid) gamesGrid.innerHTML = homeModeCardHTML('games', 'all', 'All Games', '') + games.map(game => homeModeCardHTML('games', game, game, gamesImages[game])).join('');
}

function renderHome() {
    const recentContainer = document.getElementById('homeRecentDuels');
    const leadersContainer = document.getElementById('homeTopPlayers');
    const playersCount = document.getElementById('homePlayersCount');
    const duelsCount = document.getElementById('homeDuelsCount');
    const ptsPlayers = window.PTS ? window.PTS.getPlayers() : [];
    if (playersCount) playersCount.textContent = String(ptsPlayers.length);

    if (!Array.isArray(eloPlayers)) {
        if (recentContainer) recentContainer.innerHTML = '<div class="home-empty">Загрузка Elo-дуэлей…</div>';
        if (duelsCount) duelsCount.textContent = '0';
    } else {
        const duels = collectGlobalDuels().sort((a, b) => duelSortKey(b).localeCompare(duelSortKey(a)));
        if (duelsCount) duelsCount.textContent = String(duels.length);
        if (recentContainer) {
            recentContainer.innerHTML = duels.length ? duels.slice(0, 5).map(duel => {
                const rating = duel.winnerSide && typeof duel.winnerSide.eloAfter === 'number' ? getTierByElo(duel.winnerSide.eloAfter) : 'Unranked';
                const color = tierColorOf(rating, '#8892b0');
                const delta = duel.winnerSide ? formatDelta(duel.winnerSide.delta) : '';
                const kitIcon = (typeof kitImages !== 'undefined' && kitImages[duel.kit]) || (typeof gameImages !== 'undefined' && gameImages[duel.kit]) || '';
                return `<article class="home-result-row">
                    <div class="home-result-kit"><img src="${escapeHTML(kitIcon)}" alt="" onerror="this.style.display='none';"></div>
                    <div class="home-result-main">
                        <div class="home-result-names"><button type="button" class="home-player-link" ${profileOnClick(duel.winnerName)}>${escapeHTML(duel.winnerName)}</button><span>→</span><button type="button" class="home-player-link home-player-link-muted" ${profileOnClick(duel.loserName)}>${escapeHTML(duel.loserName)}</button></div>
                        <div class="home-result-meta">${escapeHTML(duel.kit)} · ${escapeHTML(formatDuelTime(duel))}</div>
                    </div>
                    <div class="home-result-rank" style="color:${color};border-color:${color}55;background:${color}11;"><strong>${rating}</strong><span>${delta}</span></div>
                </article>`;
            }).join('') : '<div class="home-empty">Пока нет Elo-дуэлей</div>';
        }
    }

    const leaders = ptsPlayers
        .filter(player => KIT_REGION_CODES.includes(player.region) && PTS.calcPoints(player, maintiers) > 0)
        .sort((a, b) => (PTS.calcPoints(b, maintiers) - PTS.calcPoints(a, maintiers)) || a.name.localeCompare(b.name))
        .slice(0, 5);
    if (leadersContainer) {
        leadersContainer.innerHTML = leaders.length ? leaders.map((player, index) => {
            const encoded = encodeURIComponent(player.name).replace(/'/g, '%27');
            return homeLeaderRowHTML(player, index, PTS.getTierBadge(PTS.calcAverageTier(player), PTS.hasAnyRetiredKit(player)),
                PTS.calcPoints(player, maintiers), 'PTS', `PTS.openProfileByName(decodeURIComponent('${encoded}'))`);
        }).join('') : '<div class="home-empty">Пока нет игроков</div>';
    }

    // Топ мини-игр (Elo)
    const gamesContainer = document.getElementById('homeTopGames');
    if (gamesContainer) {
        const gameList = (typeof miniGames !== 'undefined') ? miniGames : [];
        const gameLeaders = Array.isArray(eloPlayers) ? eloPlayers
            .map(toGameView)
            .filter(player => gameList.some(game => getCleanTier(player, game) !== 'Unranked'))
            .sort((a, b) => (calcOverallElo(b, gameList) - calcOverallElo(a, gameList)) || a.name.localeCompare(b.name))
            .slice(0, 5) : [];
        gamesContainer.innerHTML = gameLeaders.length ? gameLeaders.map((player, index) => {
            const encoded = encodeURIComponent(player.name).replace(/'/g, '%27');
            return homeLeaderRowHTML(player, index, getTierBadge(calcAverageTierOver(player, gameList), hasAnyRetiredKit(player, gameList)),
                calcOverallElo(player, gameList), 'Elo', `openGameProfileByName(decodeURIComponent('${encoded}'))`);
        }).join('') : '<div class="home-empty">Пока нет игроков</div>';
    }
}

function renderAllViews() {
    renderPlayers();
    renderGlobalDuels();
    renderHome();
}

// Загружает данные. isInitial - первая загрузка (длинный таймаут, при сбое
// показывается ошибка). Фоновое обновление при сбое ничего не ломает:
// на экране остаются последние полученные данные.
async function loadPlayers(isInitial) {
    if (playersLoading) return false;

    // Демо-режим макета: показываем игроков из js/demo-data.js, к API не обращаемся
    if (typeof DEMO_MODE !== 'undefined' && DEMO_MODE && typeof demoPlayers !== 'undefined') {
        eloPlayers = demoPlayers;
        playersLoadedAt = Date.now();
        playersLoadError = false;
        renderAllViews();
        return true;
    }

    // Beta Elo пока закрыта (см. BETA_SHOW_PLAYERS в config.js): список пустой,
    // к API не обращаемся.
    if (typeof BETA_SHOW_PLAYERS !== 'undefined' && !BETA_SHOW_PLAYERS) {
        if (typeof eloPlayers === 'undefined') {
            eloPlayers = [];
            playersLoadedAt = Date.now();
            renderAllViews();
        }
        return true;
    }

    playersLoading = true;

    let hintTimer = null;
    if (isInitial) {
        hintTimer = setTimeout(() => {
            if (typeof eloPlayers === 'undefined') {
                playersSlowHint = true;
                renderAllViews();
            }
        }, SLOW_LOAD_HINT_MS);
    }

    try {
        const data = await fetchPlayersFromApi(isInitial ? FIRST_LOAD_TIMEOUT_MS : REFRESH_TIMEOUT_MS);
        const changed = (data.updatedAt || null) !== playersUpdatedAt;
        eloPlayers = data.players;
        playersUpdatedAt = data.updatedAt || null;
        playersLoadedAt = Date.now();
        playersLoadError = false;
        playersSlowHint = false;
        if (changed || isInitial) renderAllViews();
        return true;
    } catch (e) {
        console.warn('Не удалось загрузить данные игроков:', e);
        if (typeof eloPlayers === 'undefined') {
            playersLoadError = true;
            playersSlowHint = false;
            renderAllViews();
        }
        return false;
    } finally {
        if (hintTimer) clearTimeout(hintTimer);
        playersLoading = false;
    }
}

// Кнопка "Повторить" после неудачной первой загрузки
function retryLoadPlayers() {
    playersLoadError = false;
    playersSlowHint = false;
    renderAllViews();
    loadPlayers(true);
}

// Пока вкладка открыта, раз в минуту подтягиваем свежие данные (и сразу,
// когда пользователь возвращается на вкладку). Перерисовка - только если
// на сервере действительно появился новый снимок.
function startPlayersAutoRefresh() {
    const seconds = (typeof PLAYERS_REFRESH_SECONDS !== 'undefined') ? PLAYERS_REFRESH_SECONDS : 60;

    setInterval(() => {
        if (!document.hidden && typeof eloPlayers !== 'undefined') loadPlayers(false);
    }, seconds * 1000);

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && typeof eloPlayers !== 'undefined' && Date.now() - playersLoadedAt > seconds * 1000) {
            loadPlayers(false);
        }
    });
}

// Запуск сайта (может вызываться дважды - из DOMContentLoaded и сразу,
// если DOM уже готов; загрузка стартует один раз)
function initSite() {
    // Обрезаем прозрачные поля у скина и перерисовываем список
    // Пока скин обрезается, изображения скрыты (иначе мелькает маленький необрезанный)
    trimTransparentImage(DEFAULT_SKIN_SRC).then(src => {
        window.overallSkinSrc = src;
        refreshDefaultSkins();
        document.body.classList.add('skin-ready');
    });
    setTimeout(() => document.body.classList.add('skin-ready'), 2500);
    renderHomeModeCards();
    applyRoute();          // экран по адресу (#rating и т.д.)
    renderHome();
    renderPlayers();   // покажет "Загрузка..." до прихода данных
    if (!playersLoadStarted) {
        playersLoadStarted = true;
        loadPlayers(true);
        startPlayersAutoRefresh();

        // Ссылки из Classic PTS ведут сюда сразу на нужную вкладку (?tab=...)
        const tab = new URLSearchParams(location.search).get('tab');
        if (['duelsTab', 'testingTab', 'otherInfoTab'].includes(tab)) switchTab(tab);
    }
}