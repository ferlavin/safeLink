"""Safe Browsing no debe mover el semáforo en los tests de calibración."""

import pytest

SB_OFF = {
    "disponible": False,
    "en_lista": False,
    "amenazas": [],
    "score": 0,
    "alertas": [],
}


@pytest.fixture(autouse=True)
def mute_safe_browsing(monkeypatch):
    monkeypatch.setattr(
        "services.url_analyzer.check_safe_browsing",
        lambda url: dict(SB_OFF),
    )
