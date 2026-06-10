"""Google Safe Browsing API v4."""

from __future__ import annotations

import httpx

from config import settings

SB_API = "https://safebrowsing.googleapis.com/v4/threatMatches:find"
THREAT_TYPES = [
    "MALWARE",
    "SOCIAL_ENGINEERING",
    "UNWANTED_SOFTWARE",
    "POTENTIALLY_HARMFUL_APPLICATION",
]

THREAT_LABELS = {
    "MALWARE": "Malware",
    "SOCIAL_ENGINEERING": "Phishing",
    "UNWANTED_SOFTWARE": "Software no deseado",
    "POTENTIALLY_HARMFUL_APPLICATION": "App potencialmente danina",
}


def check_safe_browsing(url: str) -> dict:
    api_key = settings.GOOGLE_SAFE_BROWSING_API_KEY
    if not api_key:
        return {
            "disponible": False,
            "en_lista": False,
            "amenazas": [],
            "score": 0,
            "alertas": [],
        }

    payload = {
        "client": {"clientId": "safelink", "clientVersion": "1.0.0"},
        "threatInfo": {
            "threatTypes": THREAT_TYPES,
            "platformTypes": ["ANY_PLATFORM"],
            "threatEntryTypes": ["URL"],
            "threatEntries": [{"url": url}],
        },
    }

    try:
        with httpx.Client(timeout=8.0) as client:
            response = client.post(SB_API, params={"key": api_key}, json=payload)
            response.raise_for_status()
            data = response.json()
    except Exception as exc:
        return {
            "disponible": True,
            "en_lista": False,
            "amenazas": [],
            "score": 0,
            "alertas": [f"Error consultando Safe Browsing: {exc}"],
            "error": str(exc),
        }

    matches = data.get("matches") or []
    if not matches:
        return {
            "disponible": True,
            "en_lista": False,
            "amenazas": [],
            "score": 0,
            "alertas": [],
        }

    threat_types = list({m.get("threatType") for m in matches if m.get("threatType")})
    labels = [THREAT_LABELS.get(t, t) for t in threat_types]
    return {
        "disponible": True,
        "en_lista": True,
        "amenazas": threat_types,
        "score": 90,
        "alertas": [f"Google Safe Browsing: {', '.join(labels)}"],
    }
