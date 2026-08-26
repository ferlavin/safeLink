from io import BytesIO

import pytest
from fastapi import HTTPException
from PIL import Image

from services.report_screenshot import save_report_screenshot
from services.reporte_service import ORIGIN_TYPES, normalize_origin_message, normalize_origin_type


def _image_bytes(fmt: str = "PNG") -> bytes:
    buf = BytesIO()
    Image.new("RGB", (4, 4), (10, 20, 30)).save(buf, fmt)
    return buf.getvalue()


def test_origin_type_vacio_es_none():
    assert normalize_origin_type(None) is None
    assert normalize_origin_type("  ") is None


def test_origin_type_acepta_valores():
    for value in ORIGIN_TYPES:
        assert normalize_origin_type(value) == value
        assert normalize_origin_type(value.upper()) == value


def test_origin_type_rechaza_otro_valor():
    with pytest.raises(HTTPException) as exc:
        normalize_origin_type("telegram")
    assert exc.value.status_code == 400


def test_origin_message_recorta_espacios():
    assert normalize_origin_message("  hola  ") == "hola"
    assert normalize_origin_message("   ") is None


def test_screenshot_png_ok(tmp_path, monkeypatch):
    monkeypatch.setattr("services.report_screenshot.REPORTS_DIR", tmp_path)
    path = save_report_screenshot(9, _image_bytes(), filename="cap.png", content_type="image/png")
    assert path.startswith("/uploads/reports/9_")
    assert path.endswith(".png")
    assert (tmp_path / path.rsplit("/", 1)[-1]).exists()


def test_screenshot_rechaza_extension(tmp_path, monkeypatch):
    monkeypatch.setattr("services.report_screenshot.REPORTS_DIR", tmp_path)
    with pytest.raises(HTTPException) as exc:
        save_report_screenshot(1, _image_bytes(), filename="cap.gif", content_type="image/gif")
    assert exc.value.status_code == 400


def test_screenshot_rechaza_peso(tmp_path, monkeypatch):
    monkeypatch.setattr("services.report_screenshot.REPORTS_DIR", tmp_path)
    monkeypatch.setattr("services.report_screenshot.MAX_SCREENSHOT_BYTES", 10)
    with pytest.raises(HTTPException) as exc:
        save_report_screenshot(1, _image_bytes(), filename="cap.png", content_type="image/png")
    assert exc.value.status_code == 400
    assert "5 MB" in exc.value.detail or "limite" in exc.value.detail.lower()
