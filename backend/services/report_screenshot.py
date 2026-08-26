"""Capturas adjuntas a un reporte (jpg/png/webp, máx. 5 MB)."""

from __future__ import annotations

import time
from io import BytesIO
from pathlib import Path

from fastapi import HTTPException, status
from PIL import Image, UnidentifiedImageError

REPORTS_DIR = Path(__file__).resolve().parent.parent / "uploads" / "reports"
MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}
_FORMAT_TO_EXT = {"JPEG": "jpg", "PNG": "png", "WEBP": "webp"}


def ensure_reports_dir() -> None:
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)


def save_report_screenshot(
    report_id: int,
    content: bytes,
    *,
    filename: str | None = None,
    content_type: str | None = None,
) -> str:
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo de captura esta vacio",
        )
    if len(content) > MAX_SCREENSHOT_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La captura supera el limite de 5 MB",
        )

    ext = Path(filename or "").suffix.lower()
    if ext and ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato no permitido. Usa JPG, JPEG, PNG o WebP",
        )
    if content_type and content_type.lower() not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato no permitido. Usa JPG, JPEG, PNG o WebP",
        )

    try:
        img = Image.open(BytesIO(content))
        img.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo no es una imagen valida",
        ) from exc

    stored_ext = _FORMAT_TO_EXT.get(img.format or "")
    if not stored_ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato no permitido. Usa JPG, JPEG, PNG o WebP",
        )

    ensure_reports_dir()
    name = f"{report_id}_{int(time.time())}.{stored_ext}"
    path = REPORTS_DIR / name
    path.write_bytes(content)
    return f"/uploads/reports/{name}"
