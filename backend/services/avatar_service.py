from io import BytesIO
from pathlib import Path

from fastapi import HTTPException, status
from PIL import Image, UnidentifiedImageError

AVATAR_DIR = Path(__file__).resolve().parent.parent / "uploads" / "avatars"
MAX_AVATAR_BYTES = 2 * 1024 * 1024
OUTPUT_SIZE = (256, 256)
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}


def ensure_avatar_dir() -> None:
    AVATAR_DIR.mkdir(parents=True, exist_ok=True)


def _avatar_path(user_id: int) -> Path:
    return AVATAR_DIR / f"{user_id}.webp"


def delete_avatar_file(user_id: int) -> None:
    path = _avatar_path(user_id)
    if path.exists():
        path.unlink()


def process_and_save_avatar(user_id: int, content: bytes, content_type: str | None) -> str:
    if len(content) > MAX_AVATAR_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La imagen supera el limite de 2 MB",
        )

    if content_type and content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato no permitido. Usa JPG, PNG o WebP",
        )

    ensure_avatar_dir()

    try:
        img = Image.open(BytesIO(content))
        img.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo no es una imagen valida",
        ) from exc

    if img.format not in ("JPEG", "PNG", "WEBP"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato no permitido. Usa JPG, PNG o WebP",
        )

    width, height = img.size
    side = min(width, height)
    left = (width - side) // 2
    top = (height - side) // 2
    img = img.crop((left, top, left + side, top + side))
    img = img.resize(OUTPUT_SIZE, Image.Resampling.LANCZOS)

    if img.mode in ("RGBA", "LA", "P"):
        background = Image.new("RGB", img.size, (255, 255, 255))
        if img.mode == "P":
            img = img.convert("RGBA")
        alpha = img.split()[-1] if img.mode in ("RGBA", "LA") else None
        background.paste(img, mask=alpha)
        img = background
    elif img.mode != "RGB":
        img = img.convert("RGB")

    path = _avatar_path(user_id)
    img.save(path, "WEBP", quality=85)

    return f"/uploads/avatars/{user_id}.webp"
