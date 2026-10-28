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
// ДАННЫЕ ИГРОКОВ
// ==========================================
// Список игроков приходит с сервера бота (GET /api/players), а не из файла.
// players === undefined, пока данные не загружены. Объявлено здесь, до
// остального кода: чтение переменной до её объявления вызывает ошибку.
let players;
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
// РЕЖИМЫ: Kits (киты) / Games (мини-игры)
// ==========================================

window.eloMode = 'kits';
window.currentGameFilter = 'all';

function setEloMode(mode) {
    window.eloMode = (mode === 'games') ? 'games' : 'kits';
    document.querySelectorAll('[data-elo-mode]').forEach(btn => {
        const active = btn.getAttribute('data-elo-mode') === window.eloMode;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    renderChips();
    renderPlayers();
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
    const icon = iconSrc ? `<img src="${escapeHTML(iconSrc)}" onerror="this.style.display='none'" alt="">` : '';
    return `<button type="button" class="chip${active ? ' active' : ''}" data-v="${escapeHTML(value)}" onclick="${handler}">${icon}<span>${escapeHTML(label)}</span></button>`;
}

function renderChips() {
    const row = document.getElementById('chipsRow');
    if (!row) return;
    let html;
    if (window.eloMode === 'games') {
        const games = (typeof miniGames !== 'undefined') ? miniGames : [];
        const images = (typeof gameImages !== 'undefined') ? gameImages : {};
        const active = window.currentGameFilter || 'all';
        html = chipHTML('all', 'All Games', '', active === 'all', 'setBoardFilter(this.dataset.v)') +
            games.map(g => chipHTML(g, g, images[g], active === g, 'setBoardFilter(this.dataset.v)')).join('');
    } else {
        const kits = (typeof maintiers !== 'undefined') ? maintiers : [];
        const subs = (typeof subtiers !== 'undefined') ? subtiers : [];
        const images = (typeof kitImages !== 'undefined') ? kitImages : {};
        const active = window.currentKitFilter || 'all';
        html = chipHTML('all', 'Overall', '', active === 'all', 'setBoardFilter(this.dataset.v)') +
            chipHTML('sub-all', 'Sub Overall', '', active === 'sub-all', 'setBoardFilter(this.dataset.v)') +
            kits.concat(subs).map(k => chipHTML(k, k, images[k], active === k, 'setBoardFilter(this.dataset.v)')).join('');
    }
    row.innerHTML = html;
    const activeChip = row.querySelector('.chip.active');
    if (activeChip) row.scrollLeft = Math.max(0, activeChip.offsetLeft - (row.clientWidth - activeChip.offsetWidth) / 2);
}

function setBoardFilter(value) {
    if (window.eloMode === 'games') window.currentGameFilter = value;
    else window.currentKitFilter = value;
    renderChips();
    renderPlayers();
}

function toggleSearch() {
    const row = document.getElementById('searchRow');
    const input = document.getElementById('searchInput');
    const btn = document.getElementById('searchToggle');
    if (!row) return;
    const open = row.hasAttribute('hidden');
    if (open) {
        row.removeAttribute('hidden');
        if (input) input.focus();
    } else {
        row.setAttribute('hidden', '');
        if (input) { input.value = ''; renderPlayers(); }
    }
    if (btn) btn.classList.toggle('active', open);
}

function updateFilterBadge() {
    const badge = document.getElementById('filterBadge');
    const retired = document.getElementById('retiredToggle');
    const count = ((window.currentRegionFilter || 'all') !== 'all' ? 1 : 0) + ((retired && !retired.checked) ? 1 : 0);
    if (badge) { badge.textContent = String(count); badge.hidden = count === 0; }
}

function renderRegionChips() {
    const box = document.getElementById('regionChips');
    if (!box) return;
    const active = window.currentRegionFilter || 'all';
    box.innerHTML = chipHTML('all', '\u0412\u0441\u0435', '', active === 'all', 'setRegionFilter(this.dataset.v)') +
        REGION_CODES.map(r => chipHTML(r, r, '', active === r, 'setRegionFilter(this.dataset.v)')).join('');
}

function setRegionFilter(value) {
    window.currentRegionFilter = value;
    renderRegionChips();
    updateFilterBadge();
    renderPlayers();
}

function openFilterSheet() {
    renderRegionChips();
    const sheet = document.getElementById('filterSheet');
    const back = document.getElementById('filterBackdrop');
    if (sheet) sheet.removeAttribute('hidden');
    if (back) back.removeAttribute('hidden');
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

// Скин в общем топе: файл с прозрачными полями обрезается до самого скина,
// чтобы он занимал всё отведённое место, а не маленький кусочек.
const DEFAULT_SKIN_SRC = 'assets/skins/default_bust.png';
window.overallSkinSrc = DEFAULT_SKIN_SRC;

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
                resolve(out.toDataURL('image/png'));
            } catch (e) {
                resolve(src);   // например, файл недоступен для чтения - берём как есть
            }
        };
        img.onerror = () => resolve(src);
        img.src = src;
    });
}

function renderPlayers() {
    const list = document.getElementById('playersList');
    if (!list) return;

    const searchInput = document.getElementById('searchInput');
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const region = window.currentRegionFilter || 'all';
    const retiredToggle = document.getElementById('retiredToggle');
    const showRetiredInPlace = retiredToggle ? retiredToggle.checked : true;
    const gamesMode = window.eloMode === 'games';
    const targetKit = gamesMode ? (window.currentGameFilter || 'all') : (window.currentKitFilter || 'all');
    const isOverall = gamesMode ? (targetKit === 'all') : (targetKit === 'all' || targetKit === 'sub-all');

    if (typeof players === 'undefined' || !Array.isArray(players)) {
        list.innerHTML = loadStatusHTML();
        return;
    }

    // В режиме Games работаем с "играми" вместо китов
    const sourcePlayers = gamesMode ? players.map(toGameView) : players;

    // Название списка (число игроков дописывается ниже, когда список отфильтрован)
    let boardLabel;
    if (gamesMode && targetKit === 'all') boardLabel = 'Games Overall';
    else if (targetKit === 'all') boardLabel = 'Main Overall';
    else if (targetKit === 'sub-all') boardLabel = 'Sub Overall';
    else boardLabel = targetKit;

    const activeSubtiers = (typeof subtiers !== 'undefined') ? subtiers : [];
    const activeMaintiers = (typeof maintiers !== 'undefined') ? maintiers : [];
    const activeKitImages = gamesMode
        ? ((typeof gameImages !== 'undefined') ? gameImages : {})
        : ((typeof kitImages !== 'undefined') ? kitImages : {});
    const overallKits = gamesMode
        ? ((typeof miniGames !== 'undefined') ? miniGames : [])
        : ((targetKit === 'sub-all') ? activeSubtiers : activeMaintiers);

    // В топ попадают только игроки, у которых есть рейтинг в выбранном ките
    // (или хотя бы в одном ките выбранной группы Main/Sub).
    let filtered = sourcePlayers.filter(player => {
        const matchesSearch = (player.name || '').toLowerCase().includes(search);
        const matchesRegion = (region === 'all' || player.region === region);
        if (!matchesSearch || !matchesRegion) return false;

        if (!isOverall) {
            if (!showRetiredInPlace && isKitRetired(player, targetKit)) return false;
            return getCleanTier(player, targetKit) !== 'Unranked';
        }
        // Общий топ: игрок с Retired-китом (main / игры) без тумблера скрыт, как в Classic PTS
        if (!showRetiredInPlace && hasAnyRetiredKit(player, gamesMode ? overallKits : null)) return false;
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
        if (gamesMode && !players.some(p => p.games && Object.keys(p.games).length)) {
            list.innerHTML = '<div style="text-align:center;color:#8892b0;padding:30px 20px;line-height:1.5;">Рейтинг мини-игр появится позже.<br>Здесь будут ранги за BedWars, SkyWars, Sumo и другие игры.</div>';
            return;
        }
        list.innerHTML = players.length === 0
            ? '<div style="text-align:center;color:#8892b0;padding:30px 20px;line-height:1.5;">Elo-система только запущена.<br>Игроки появятся после первых ранговых дуэлей.</div>'
            : '<div style="text-align:center;color:#8892b0;padding:20px;">Игроки не найдены</div>';
        return;
    }

    const subtitleEl = document.getElementById('tableSubtitle');
    if (subtitleEl) subtitleEl.textContent = `${boardLabel} \u00b7 ${filtered.length} ${pluralPlayers(filtered.length)}`;

    let htmlFragment = '';

    filtered.forEach((player, index) => {
        const rankPrefix = `#${index + 1}`;
        const nameHTML = escapeHTML(player.name);
        const regionHTML = `<span class="player-meta-tag">${escapeHTML(player.region || '?')}</span>`;

        let topClass = '';
        if (index < 5) topClass = `top-rank-${index + 1}`;

        // Retired: карточка приглушается (кроме топ-5), как в Classic PTS
        const isRet = isOverall
            ? hasAnyRetiredKit(player, gamesMode ? overallKits : null)
            : isKitRetired(player, targetKit);
        if (isRet) topClass = topClass ? topClass + ' retired-status' : 'retired-status';

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
                            ${getTierBadge(rating.tier, rating.retired)}
                            <span class="bust-elo-badge" title="Elo на этом ките">${formatElo(rating)} Elo</span>
                        </div>
                    </div>
                </div>
            </div>`;
            return;
        }

        // Общий топ (Main/Sub): слева скин, справа место и ник, ниже регион и
        // средний ранг, ниже плитки рангов открытой вкладки (Main или Sub) -
        // их можно листать по горизонтали.
        const totalElo = calcOverallElo(player, overallKits);
        const avgTier = gamesMode ? calcAverageTierOver(player, overallKits) : calcAverageTier(player);
        const avgClr = tierColorOf(avgTier, '#8892b0');
        const avgTierHTML = avgTier !== 'Unranked'
            ? `<span class="ov-tag" style="color:${avgClr};border-color:${tierColorOf(avgTier, '#444b66')}99;">${isRet ? '<span class="ov-r">R</span>' : ''}${avgTier}</span>`
            : `<span class="ov-tag" style="color:#8892b0;">-</span>`;
        const tilesHTML = sortedKitRatings(player, overallKits)
            .map(x => (!showRetiredInPlace && x.rating.retired)
                ? ovTileHTML(x.kit, { elo: null, tier: 'Unranked', retired: false }, activeKitImages)
                : ovTileHTML(x.kit, x.rating, activeKitImages)).join('');

        htmlFragment += `
        <div class="player-container ov-card ${topClass}" ${profileOnClick(player.name)}>
            <div class="ov-skin-wrap">
                <img class="ov-skin" src="${window.overallSkinSrc}" alt="" onerror="this.style.display='none';">
            </div>
            <div class="ov-body">
                <div class="ov-title">
                    <span class="player-rank">${rankPrefix}</span>
                    <span class="player-name">${nameHTML}</span>
                </div>
                <div class="ov-elo">${totalElo} Elo</div>
                <div class="ov-tags">
                    ${avgTierHTML}
                    <span class="ov-tag">${escapeHTML(player.region || '?')}</span>
                </div>
                <div class="ov-scroll" aria-label="Ранги по китам, листайте вправо">${tilesHTML}</div>
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

    // Тумблер Retired
    const retiredToggleEl = document.getElementById('retiredToggle');
    if (retiredToggleEl) retiredToggleEl.addEventListener('change', () => { updateFilterBadge(); renderPlayers(); });

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
    const activeKitImages = (typeof kitImages !== 'undefined') ? kitImages : {};
    return `<div class="duel-kit">
        <img class="duel-kit-icon" src="${activeKitImages[kit] || ''}" onerror="this.style.display='none';" alt="">
        <span>${escapeHTML(kit)}</span>
    </div>`;
}

// Собирает уникальный список дуэлей со всех игроков: у каждой дуэли в
// данных две записи (по одной у каждого участника) - склеиваем их по id
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

    if (typeof players === 'undefined' || !Array.isArray(players)) {
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

function renderAllViews() {
    renderPlayers();
    renderGlobalDuels();
}

// Загружает данные. isInitial - первая загрузка (длинный таймаут, при сбое
// показывается ошибка). Фоновое обновление при сбое ничего не ломает:
// на экране остаются последние полученные данные.
async function loadPlayers(isInitial) {
    if (playersLoading) return false;

    // Демо-режим макета: показываем игроков из js/demo-data.js, к API не обращаемся
    if (typeof DEMO_MODE !== 'undefined' && DEMO_MODE && typeof demoPlayers !== 'undefined') {
        players = demoPlayers;
        playersLoadedAt = Date.now();
        playersLoadError = false;
        renderAllViews();
        return true;
    }

    // Beta Elo пока закрыта (см. BETA_SHOW_PLAYERS в config.js): список пустой,
    // к API не обращаемся.
    if (typeof BETA_SHOW_PLAYERS !== 'undefined' && !BETA_SHOW_PLAYERS) {
        if (typeof players === 'undefined') {
            players = [];
            playersLoadedAt = Date.now();
            renderAllViews();
        }
        return true;
    }

    playersLoading = true;

    let hintTimer = null;
    if (isInitial) {
        hintTimer = setTimeout(() => {
            if (typeof players === 'undefined') {
                playersSlowHint = true;
                renderAllViews();
            }
        }, SLOW_LOAD_HINT_MS);
    }

    try {
        const data = await fetchPlayersFromApi(isInitial ? FIRST_LOAD_TIMEOUT_MS : REFRESH_TIMEOUT_MS);
        const changed = (data.updatedAt || null) !== playersUpdatedAt;
        players = data.players;
        playersUpdatedAt = data.updatedAt || null;
        playersLoadedAt = Date.now();
        playersLoadError = false;
        playersSlowHint = false;
        if (changed || isInitial) renderAllViews();
        return true;
    } catch (e) {
        console.warn('Не удалось загрузить данные игроков:', e);
        if (typeof players === 'undefined') {
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
        if (!document.hidden && typeof players !== 'undefined') loadPlayers(false);
    }, seconds * 1000);

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && typeof players !== 'undefined' && Date.now() - playersLoadedAt > seconds * 1000) {
            loadPlayers(false);
        }
    });
}

// Запуск сайта (может вызываться дважды - из DOMContentLoaded и сразу,
// если DOM уже готов; загрузка стартует один раз)
function initSite() {
    // Обрезаем прозрачные поля у скина и перерисовываем список
    trimTransparentImage(DEFAULT_SKIN_SRC).then(src => {
        if (src !== window.overallSkinSrc) { window.overallSkinSrc = src; renderPlayers(); }
    });
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
