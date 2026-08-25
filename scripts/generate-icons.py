#!/usr/bin/env python3
"""Regenerates the app icons in public/.

The mark is a clock face: the survey is about what a whole day looks like.
Run with `python3 scripts/generate-icons.py` after changing the colours below.
"""
import math
import os

from PIL import Image, ImageDraw

NAVY = (14, 17, 22, 255)
GOLD = (227, 176, 62, 255)
GOLD_DIM = (168, 126, 40, 255)
SIZE = 1024
OUT = os.path.join(os.path.dirname(__file__), "..", "public")


def draw_mark(bg, inset_ratio):
    """inset_ratio leaves room for Android's maskable safe zone."""
    img = Image.new("RGBA", (SIZE, SIZE), bg)
    d = ImageDraw.Draw(img)
    c = SIZE / 2
    r = SIZE * inset_ratio / 2
    ring = SIZE * 0.055

    d.ellipse([c - r, c - r, c + r, c + r], outline=GOLD, width=int(ring))
    # Hour ticks.
    for hour in range(12):
        angle = math.radians(hour * 30 - 90)
        outer = r - ring * 1.5
        inner = outer - (SIZE * 0.05 if hour % 3 == 0 else SIZE * 0.028)
        d.line(
            [
                c + math.cos(angle) * inner,
                c + math.sin(angle) * inner,
                c + math.cos(angle) * outer,
                c + math.sin(angle) * outer,
            ],
            fill=GOLD_DIM if hour % 3 else GOLD,
            width=int(SIZE * 0.018),
        )
    # Hands at ten past ten — the friendliest time on a clock face.
    for angle_deg, length, width in ((-60, r * 0.5, 0.032), (60, r * 0.66, 0.024)):
        angle = math.radians(angle_deg - 90)
        d.line(
            [c, c, c + math.cos(angle) * length, c + math.sin(angle) * length],
            fill=GOLD,
            width=int(SIZE * width),
        )
    dot = SIZE * 0.028
    d.ellipse([c - dot, c - dot, c + dot, c + dot], fill=GOLD)
    return img


def save(img, name, size):
    img.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, name))
    print("wrote", name)


standard = draw_mark(NAVY, 0.82)
maskable = draw_mark(NAVY, 0.62)

save(standard, "icon-192.png", 192)
save(standard, "icon-512.png", 512)
save(standard, "apple-touch-icon.png", 180)
save(maskable, "icon-maskable-512.png", 512)
save(standard, "favicon-32.png", 32)
