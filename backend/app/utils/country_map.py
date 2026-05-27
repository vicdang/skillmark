COUNTRY_REGION_MAP: dict[str, str] = {
    "US": "Americas", "CA": "Americas", "BR": "Americas", "MX": "Americas",
    "UK": "EMEA", "GB": "EMEA", "DE": "EMEA", "FR": "EMEA", "NL": "EMEA",
    "SE": "EMEA", "AE": "EMEA", "SA": "EMEA", "IL": "EMEA",
    "VN": "APAC", "SG": "APAC", "JP": "APAC", "KR": "APAC", "AU": "APAC",
    "IN": "APAC", "CN": "APAC", "TH": "APAC", "PH": "APAC", "MY": "APAC",
}

SENIORITY_LABELS: dict[int, str] = {
    1: "Beginner",
    2: "Elementary",
    3: "Intermediate",
    4: "Advanced",
    5: "Expert",
}


def get_region(country_code: str | None) -> str | None:
    if not country_code:
        return None
    return COUNTRY_REGION_MAP.get(country_code.upper())
