"""Genera iconos PNG de SafeLink para la extensión Chrome."""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "extension" / "icons"

SIZES = (16, 32, 48, 128)

STATUS = {
    "default": None,
    "seguro": "#22c55e",
    "precaucion": "#eab308",
    "peligro": "#ef4444",
    "unknown": "#64748b",
}


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def gradient_bg(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = img.load()
    c1 = (0, 229, 255)
    c2 = (0, 255, 135)
    for y in range(size):
        for x in range(size):
            t = (x + y) / max(1, (size - 1) * 2)
            px[x, y] = (
                int(lerp(c1[0], c2[0], t)),
                int(lerp(c1[1], c2[1], t)),
                int(lerp(c1[2], c2[2], t)),
                255,
            )
    return img


def rounded_mask(size: int, radius: int) -> Image.Image:
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, size - 1, size - 1), radius=radius, fill=255)
    return mask


def draw_shield(draw: ImageDraw.ImageDraw, size: int, fill: tuple[int, int, int, int]) -> None:
    cx = size / 2
    top = size * 0.17
    left = size * 0.27
    right = size * 0.73
    bottom = size * 0.82
    mid_y = size * 0.36

    shield = [
        (cx, top),
        (left, mid_y),
        (left, bottom * 0.72),
        (cx, bottom),
        (right, bottom * 0.72),
        (right, mid_y),
    ]
    draw.polygon(shield, fill=fill)


def draw_check(draw: ImageDraw.ImageDraw, size: int, fill: tuple[int, int, int, int]) -> None:
    s = size / 128
    points = [
        (56 * s, 62.5 * s),
        (50 * s, 68.5 * s),
        (54 * s, 72.5 * s),
        (64 * s, 62.5 * s),
        (82 * s, 44.5 * s),
        (78 * s, 40.5 * s),
        (64 * s, 54.5 * s),
    ]
    draw.polygon(points, fill=fill)


def hex_to_rgba(hex_color: str) -> tuple[int, int, int, int]:
    hex_color = hex_color.lstrip("#")
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return (r, g, b, 255)


def render_icon(size: int, status_color: str | None) -> Image.Image:
    radius = max(4, int(size * 0.22))
    base = gradient_bg(size)
    mask = rounded_mask(size, radius)
    icon = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    icon.paste(base, (0, 0), mask)

    draw = ImageDraw.Draw(icon)
    shield_fill = (5, 8, 17, 255)
    check_fill = (0, 255, 135, 255)

    if size >= 24:
        draw_shield(draw, size, shield_fill)
        draw_check(draw, size, check_fill)
    else:
        draw.ellipse((size * 0.22, size * 0.22, size * 0.78, size * 0.78), fill=shield_fill)
        dot = size * 0.18
        draw.ellipse((size * 0.52, size * 0.48, size * 0.52 + dot, size * 0.48 + dot), fill=check_fill)

    if status_color:
        rgba = hex_to_rgba(status_color)
        dot_size = max(4, int(size * 0.28))
        margin = max(1, int(size * 0.06))
        x1 = size - dot_size - margin
        y1 = size - dot_size - margin
        draw.ellipse((x1, y1, x1 + dot_size, y1 + dot_size), fill=rgba)
        ring = max(1, int(size * 0.04))
        draw.ellipse(
            (x1 - ring, y1 - ring, x1 + dot_size + ring, y1 + dot_size + ring),
            outline=(5, 8, 17, 255),
            width=ring,
        )

    return icon


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    for name, color in STATUS.items():
        suffix = "" if name == "default" else f"-{name}"
        for size in SIZES:
            img = render_icon(size, color)
            img.save(OUT / f"icon{suffix}-{size}.png")

    # Alias estándar para manifest
    for size in SIZES:
        render_icon(size, None).save(OUT / f"icon{size}.png")

    print(f"Iconos generados en {OUT}")


if __name__ == "__main__":
    main()
