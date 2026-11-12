r"""
Регионы игроков - части света (одинаковые для китов и мини-игр):
NA - Северная Америка, EU - Европа, AS - Азия, OC - Океания, SA - Южная Америка,
ME - Ближний Восток, AF - Африка, CA - Центральная Америка.

Команды (\set_region и админ-панель) принимают ТОЛЬКО эти коды. Старые коды стран СНГ
нужны лишь для разового переноса данных (pts_migration.py).
"""

WORLD_REGIONS = ("NA", "EU", "AS", "OC", "SA", "ME", "AF", "CA")

# Только для переноса старых данных: код страны -> часть света. Россия - Европа
# (основная часть игроков в европейской части), Центральная Азия - Азия,
# Армения и Азербайджан - Ближний Восток.
LEGACY_REGION_TO_WORLD = {
    "RU": "EU", "UA": "EU", "BY": "EU", "MD": "EU",
    "AM": "ME", "AZ": "ME",
    "KZ": "AS", "UZ": "AS", "KG": "AS", "TJ": "AS",
}


def normalize_region(value):
    """Код части света или None. Принимает только WORLD_REGIONS (без учёта регистра)."""
    if not value:
        return None
    code = str(value).strip().upper()
    return code if code in WORLD_REGIONS else None


def legacy_to_world(value):
    """Для переноса данных: принимает и части света, и старые коды стран СНГ."""
    if not value:
        return None
    code = str(value).strip().upper()
    return code if code in WORLD_REGIONS else LEGACY_REGION_TO_WORLD.get(code)
