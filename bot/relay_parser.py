# -*- coding: utf-8 -*-
r"""
Разбор сообщений из Discord-ветки #релей (вебхук MultiCraft).

Зафиксированные форматы (из переписки с администратором):

  Старт дуэли - ДВА отдельных сообщения подряд, без кавычек у ников:
      UHC: У игрока {ник} началась дуэль на наборе «{Кит}»
      UHC: С игроком {ник}
  Из-за бага MultiCraft строки иногда приходят В ОБРАТНОМ ПОРЯДКЕ, а
  короткая строка может выглядеть как "UHC: У игрока {ник}" (без
  "началась дуэль ..."):
      UHC: У игрока {ник}
      UHC: У игрока {ник} началась дуэль на наборе «{Кит}»
  Парсер собирает дуэль в любом порядке. Если в обеих строках один и тот
  же ник - это дуэль с самим собой, её отсекает handlers.py.
  "UHC" - ник администратора, который ставит командные блоки; сам по
  себе текст "UHC:" ничего не значит (админ может писать так и вживую),
  поэтому матчим ТОЛЬКО по полной фразе целиком, не по префиксу.

  Смерть - ОДНО сообщение, ник в кавычках-ёлочках, БЕЗ тега:
      🪦 Игрок «{ник}» <любая причина - падение/бой/лава/вода/...>
  Причина смерти не влияет на исход (кто умер - тот проиграл) и список
  формулировок не полный и будет расти, поэтому матчим по общему
  признаку (🪦 + «ник»), а не по конкретным фразам. Есть "дубликат" без
  кавычек и без эмодзи ("{ник} погиб") - чисто декоративное сообщение
  для чтения в Discord, который НЕ содержит отдельной информации и
  должен игнорироваться, иначе смерть обработается дважды.

  Коннект/дисконнект - с тегом в квадратных скобках, БЕЗ кавычек:
      ↪ [{тег}] {ник} подключился к серверу
      ↩ [{тег}] {ник} отключился от сервера
      ↩ [{тег}] {ник} отключился от сервера (тайм-аут)
  Тег ([RLT2][Tester] и т.п. - средний ранг + роль) для матчмейкинга не
  нужен и не разбирается, нужен только ник. Обычный дисконнект и
  тайм-аут одинаково запускают 3-минутный таймер автопоражения -
  разница есть только в поле timeout (на будущее/для логов).

  Обычный чат формата "[тег] ник: текст" (включая тестовое "relay") -
  НЕ событие, должен игнорироваться. Он отличается от коннекта тем, что
  сразу после ника идёт ":", а не русский глагол.

  Единственное исключение из чата - команда игрока:
      [тег] ник: \set_region RU
  (тег необязателен, регистр команды и региона не важен). Админы могут
  указать цель: "[тег] админ: \set_region ник KZ". Парсер только
  вытаскивает ники и слово региона; права и допустимость региона
  проверяет handlers.py.

  Остальные админские команды чата (формат тот же, "[тег] админ: ..."):
      \set_device ник PC | MOBILE
      \remove_player ник
      \restore_player ник
      \tiertest КИТ   (запуск тиртеста, см. tiertest.py)
"""

import re
import time
from dataclasses import dataclass
from typing import Optional, Union


# Ники в примерах: буквы, цифры, подчёркивания, дефисы (включая ведущие/
# конечные, как у "-BaCk-" и "_-XKakTakX-_"). Не включает пробел и ":",
# чтобы не захватить случайно хвост обычного чат-сообщения.
_NICK = r'[A-Za-z0-9_\-]+'

# Один или несколько тег-групп вида [RLT2][Tester] подряд, без пробела
# между собой. Содержимое тега не разбираем - оно боту не нужно.
_TAGS = r'(?:\[[^\]\[]+\])+'

# Украшения перед ником у премиум-игроков: эмодзи-значок (⚜ и т.п.),
# например «⚜️ -999-». Это любые символы, кроме букв/цифр, пробелов,
# дефиса (он часть ников), скобок, кавычек «» и двоеточия, с необязательным
# пробелом после. Буквы сюда НЕ входят, иначе кириллическая часть ника
# "Вася123" была бы принята за украшение, а ником стало бы "123".
_DECOR = r'(?:[^\w\s\-\[\]«»:]+\s*)*'

# Эмодзи-стрелки иногда идут с вариативным селектором (↪️/↩️ с U+FE0F),
# иногда без (↪/↩) - нормализуем, вырезая селектор перед матчингом.
_VARIATION_SELECTOR = '\ufe0f'

_RE_DUEL_START_A = re.compile(
    r'^UHC:\s*У игрока\s+' + _DECOR + r'(?P<player>' + _NICK + r')\s+'
    r'началась дуэль на наборе\s*«(?P<kit>[^»]+)»\s*$'
)
# Короткая строка-партнёр: "С игроком X" (обычный вид) либо "У игрока X"
# (так она выглядит при перевёрнутом порядке). От первой строки её
# отличает отсутствие "началась дуэль на наборе".
_RE_DUEL_START_B = re.compile(
    r'^UHC:\s*(?:С игроком|У игрока)\s+' + _DECOR + r'(?P<player>' + _NICK + r')\s*$'
)

_RE_DEATH = re.compile(
    r'^\U0001FAA6\s*Игрок\s*«\s*' + _DECOR + r'(?P<player>' + _NICK + r')\s*»'
)

_RE_CONNECT = re.compile(
    r'^\u21aa\s*' + _DECOR + _TAGS + r'\s*' + _DECOR + r'(?P<player>' + _NICK + r')\s+'
    r'подключился к серверу\s*$'
)
_RE_DISCONNECT = re.compile(
    r'^\u21a9\s*' + _DECOR + _TAGS + r'\s*' + _DECOR + r'(?P<player>' + _NICK + r')\s+'
    r'отключился от сервера(?P<timeout>\s*\(тайм-аут\))?\s*$'
)

# ВСЕ команды чата начинаются с обратной косой черты: "\set_region RU".
# Принимаем одну или несколько "\" подряд: если релей/Discord экранирует символ
# (превращает "\" в "\\"), команда всё равно работает. Без "\" слово - обычный чат.
_CMD_SLASH = r'\\+'

# Команда игрока в чате: "[тег] ник: \set_region RU". Тег необязателен.
# Строго целое сообщение: "\set_region RU пожалуйста" командой не считается.
_RE_SET_REGION = re.compile(
    r'^' + _DECOR + r'(?:' + _TAGS + r'\s*' + _DECOR + r')?(?P<player>' + _NICK + r')\s*:\s*' +
    _CMD_SLASH + r'set_region\s+(?:(?P<target>' + _NICK + r')\s+)?(?P<region>\S+)\s*$',
    re.IGNORECASE,
)


_CMD_PREFIX = (
    r'^' + _DECOR + r'(?:' + _TAGS + r'\s*' + _DECOR + r')?(?P<player>' + _NICK + r')\s*:\s*'
)
_RE_SET_DEVICE = re.compile(
    _CMD_PREFIX + _CMD_SLASH + r'set_device\s+(?P<target>' + _NICK + r')\s+(?P<device>\S+)\s*$',
    re.IGNORECASE,
)
_RE_REMOVE_PLAYER = re.compile(
    _CMD_PREFIX + _CMD_SLASH + r'remove_player\s+(?P<target>' + _NICK + r')\s*$', re.IGNORECASE,
)
# \tiertest КИТ (название кита может состоять из нескольких слов: "Emerald Pot")
_RE_TIERTEST = re.compile(
    _CMD_PREFIX + _CMD_SLASH + r'tiertest\s+(?P<kit>\S.*?)\s*$', re.IGNORECASE,
)
_RE_RESTORE_PLAYER = re.compile(
    _CMD_PREFIX + _CMD_SLASH + r'restore_player\s+(?P<target>' + _NICK + r')\s*$', re.IGNORECASE,
)


# ==========================================
# СОБЫТИЯ (на выходе парсера)
# ==========================================

@dataclass(frozen=True)
class DuelStarted:
    kit: str
    player_a: str
    player_b: str


@dataclass(frozen=True)
class PlayerDied:
    player: str


@dataclass(frozen=True)
class PlayerConnected:
    player: str


@dataclass(frozen=True)
class PlayerDisconnected:
    player: str
    timeout: bool


@dataclass(frozen=True)
class RegionSet:
    player: str
    region: str  # как написал игрок; проверка по списку - в handlers.py
    target: Optional[str] = None  # ник, которому ставят регион (форма для админов)


@dataclass(frozen=True)
class DeviceSet:
    player: str   # кто ввёл команду (проверка на админа - в handlers.py)
    target: str
    device: str   # как написано; допустимость (PC/MOBILE) - в handlers.py


@dataclass(frozen=True)
class PlayerRemoved:
    player: str
    target: str


@dataclass(frozen=True)
class PlayerRestored:
    player: str
    target: str


@dataclass(frozen=True)
class TierTestRequested:
    player: str
    kit: str      # как написал игрок; кит проверяет tiertest.py


Event = Union[DuelStarted, PlayerDied, PlayerConnected, PlayerDisconnected, RegionSet,
              DeviceSet, PlayerRemoved, PlayerRestored, TierTestRequested]


# ==========================================
# РАЗБОР ОДНОГО СООБЩЕНИЯ (без знания о соседних)
# ==========================================

def _normalize(text: str) -> str:
    return text.strip().replace(_VARIATION_SELECTOR, '')


def parse_death(text: str) -> Optional[PlayerDied]:
    m = _RE_DEATH.match(_normalize(text))
    return PlayerDied(player=m.group('player')) if m else None


def parse_set_region(text: str) -> Optional[RegionSet]:
    m = _RE_SET_REGION.match(_normalize(text))
    if not m:
        return None
    return RegionSet(player=m.group('player'), region=m.group('region'), target=m.group('target'))


def parse_admin_command(text: str):
    """set_device / remove_player / restore_player или None."""
    text = _normalize(text)
    m = _RE_SET_DEVICE.match(text)
    if m:
        return DeviceSet(m.group('player'), m.group('target'), m.group('device'))
    m = _RE_REMOVE_PLAYER.match(text)
    if m:
        return PlayerRemoved(m.group('player'), m.group('target'))
    m = _RE_RESTORE_PLAYER.match(text)
    if m:
        return PlayerRestored(m.group('player'), m.group('target'))
    return None


def parse_tiertest(text: str) -> Optional[TierTestRequested]:
    m = _RE_TIERTEST.match(_normalize(text))
    return TierTestRequested(player=m.group('player'), kit=m.group('kit')) if m else None


def parse_connect(text: str) -> Optional[PlayerConnected]:
    m = _RE_CONNECT.match(_normalize(text))
    return PlayerConnected(player=m.group('player')) if m else None


def parse_disconnect(text: str) -> Optional[PlayerDisconnected]:
    m = _RE_DISCONNECT.match(_normalize(text))
    if not m:
        return None
    return PlayerDisconnected(player=m.group('player'), timeout=bool(m.group('timeout')))


def _parse_duel_start_a(text: str):
    """Первая строка старта дуэли ("У игрока ..."). Внутреннее - не
    самостоятельное событие, возвращает (kit, player) либо None."""
    m = _RE_DUEL_START_A.match(_normalize(text))
    return (m.group('kit'), m.group('player')) if m else None


def _parse_duel_start_b(text: str) -> Optional[str]:
    """Короткая строка старта дуэли ("С игроком ..." / "У игрока ..."). Внутреннее - не
    самостоятельное событие, возвращает ник оппонента либо None."""
    m = _RE_DUEL_START_B.match(_normalize(text))
    return m.group('player') if m else None


# ==========================================
# СБОРКА СТАРТА ДУЭЛИ ИЗ ДВУХ СООБЩЕНИЙ
# ==========================================

class RelayParser:
    """
    Разбирает поток сообщений из ветки #релей в события.

    Старт дуэли приходит ДВУМЯ строками: полной ("У игрока A началась
    дуэль на наборе «K»") и короткой ("С игроком B"). Порядок бывает
    любым (баг MultiCraft), поэтому парсер хранит две очереди - ждущие
    полные строки и ждущие короткие - и склеивает новую строку с самой
    ранней ждущей строкой другого вида. Обе очереди одновременно
    непустыми не бывают.

    Ждущая строка живёт не дольше pending_ttl секунд (по умолчанию 2):
    обе строки одной дуэли приходят практически разом (одним сообщением
    релея либо подряд), а "осиротевшая" строка (сервер сам сработал
    командным блоком и телепортировал игрока, бот запустился посреди
    пары, одна строка потерялась) иначе склеилась бы с чужой дуэлью и
    сломала следующую настоящую. Протухшие строки не пропадают молча:
    их забирает pop_dropped() для лога.

    ДОПУЩЕНИЕ: если пары двух дуэлей чередуются, сопоставление идёт по
    принципу FIFO (в самих сообщениях ничего, кроме текста, строки одной
    дуэли не связывает). Стоит перепроверить на реальных логах.
    """

    def __init__(self, pending_ttl: float = 2.0, clock=time.monotonic):
        self._pending_full = []     # [(время, kit, player_a)] - ждут короткую строку
        self._pending_short = []    # [(время, player_b)] - ждут полную строку
        self._ttl = pending_ttl
        self._clock = clock
        self._dropped = []          # тексты протухших "осиротевших" строк, для лога

    def _expire(self) -> None:
        limit = self._clock() - self._ttl
        for t, kit, player_a in self._pending_full:
            if t < limit:
                self._dropped.append(f"У игрока {player_a} началась дуэль на наборе «{kit}»")
        for t, player_b in self._pending_short:
            if t < limit:
                self._dropped.append(f"С игроком {player_b}")
        self._pending_full = [x for x in self._pending_full if x[0] >= limit]
        self._pending_short = [x for x in self._pending_short if x[0] >= limit]

    def pop_dropped(self) -> list:
        """Забирает (и очищает) список осиротевших строк старта дуэли,
        которые не дождались пары. Для диагностики в логе."""
        dropped, self._dropped = self._dropped, []
        return dropped

    def feed(self, text: str) -> Optional[Event]:
        """Скармливает одно сообщение, возвращает событие либо None
        (сообщение проигнорировано или это первая половина старта
        дуэли, ожидающая вторую)."""
        self._expire()

        duel_a = _parse_duel_start_a(text)
        if duel_a is not None:
            kit, player_a = duel_a
            if self._pending_short:
                _, player_b = self._pending_short.pop(0)
                return DuelStarted(kit=kit, player_a=player_a, player_b=player_b)
            self._pending_full.append((self._clock(), kit, player_a))
            return None

        duel_b_player = _parse_duel_start_b(text)
        if duel_b_player is not None:
            if self._pending_full:
                _, kit, player_a = self._pending_full.pop(0)
                return DuelStarted(kit=kit, player_a=player_a, player_b=duel_b_player)
            # Короткая строка пришла первой (перевёрнутый порядок) - ждём
            # полную. Если её не будет, запись протухнет по TTL.
            self._pending_short.append((self._clock(), duel_b_player))
            return None

        event = parse_death(text)
        if event is not None:
            return event

        event = parse_connect(text)
        if event is not None:
            return event

        event = parse_disconnect(text)
        if event is not None:
            return event

        event = parse_set_region(text)
        if event is not None:
            return event

        event = parse_admin_command(text)
        if event is not None:
            return event

        event = parse_tiertest(text)
        if event is not None:
            return event

        return None  # обычный чат, "relay"-тест и всё остальное - игнорируем
