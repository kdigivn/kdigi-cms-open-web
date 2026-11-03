#!/usr/bin/env python3
"""Compose the 1200x630 Open Graph images: official KDIGI lockup + title (Ferry VN) + the Codex-generated hero scene.

Usage:  python3 scripts/gen-og.py            writes app/opengraph-image.png, app/twitter-image.png (homepage)
                                              and ../docs/public/og.png (documentation site)
Needs:  Pillow, rsvg-convert (renders the official SVG lockup). Run after illustrations-src/process.py.
"""
from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = Path(__file__).resolve().parent / "og-fonts"
LOGO_SVG = ROOT / "public" / "brand" / "kdigi-logo.svg"
SCENE = ROOT / "public" / "illustrations" / "hero-scene.webp"
W, H = 1200, 630

INK = "#0B1220"
MUTED = "#4B5A74"
BLUE = "#1E5AF0"


def wrap(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, width: int) -> list[str]:
    lines, line = [], ""
    for word in text.split():
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=font) <= width:
            line = trial
        else:
            lines.append(line)
            line = word
    return lines + [line] if line else lines


def background() -> Image.Image:
    base = Image.new("RGB", (W, H), "#F2F6FF")
    glow = Image.new("RGB", (W, H), "#F2F6FF")
    d = ImageDraw.Draw(glow)
    d.ellipse((620, -260, 1380, 420), fill="#BFD3FF")
    d.ellipse((-260, 330, 380, 900), fill="#CDEFFA")
    glow = glow.filter(ImageFilter.GaussianBlur(120))
    return Image.blend(base, glow, 0.9)


def render(title: str, subtitle: str, out: Path) -> None:
    im = background().convert("RGBA")
    d = ImageDraw.Draw(im)

    with tempfile.TemporaryDirectory() as tmp:
        logo_png = Path(tmp) / "logo.png"
        subprocess.run(["rsvg-convert", "-w", "300", str(LOGO_SVG), "-o", str(logo_png)], check=True)
        logo = Image.open(logo_png).convert("RGBA")
    im.alpha_composite(logo, (72, 64))

    scene = Image.open(SCENE).convert("RGBA")
    scene_w = 700
    scene = scene.resize((scene_w, round(scene.height * scene_w / scene.width)), Image.LANCZOS)
    im.alpha_composite(scene, (W - scene_w + 70, H - scene.height + 40))

    title_font = ImageFont.truetype(str(FONTS / "FerryVNDisplay-Bold.ttf"), 58)
    sub_font = ImageFont.truetype(str(FONTS / "FerryVNText-Regular.ttf"), 27)
    chip_font = ImageFont.truetype(str(FONTS / "FerryVNText-SemiBold.ttf"), 22)

    y = 178
    for line in wrap(d, title, title_font, 660):
        d.text((72, y), line, font=title_font, fill=INK)
        y += 70
    y += 14
    for line in wrap(d, subtitle, sub_font, 520):
        d.text((72, y), line, font=sub_font, fill=MUTED)
        y += 38

    chip = "Mã nguồn mở · Giấy phép MIT"
    cw = int(d.textlength(chip, font=chip_font)) + 44
    d.rounded_rectangle((72, H - 96, 72 + cw, H - 48), radius=24, fill=BLUE)
    d.text((72 + 22, H - 86), chip, font=chip_font, fill="#FFFFFF")

    out.parent.mkdir(parents=True, exist_ok=True)
    im.convert("RGB").save(out, optimize=True)
    print(out, out.stat().st_size // 1024, "KB")


def main() -> None:
    render("Một CMS cho tất cả website của bạn", "CMS headless đa website, SEO sẵn có, chuyển được từ WordPress.", ROOT / "app" / "opengraph-image.png")
    render("Một CMS cho tất cả website của bạn", "CMS headless đa website, SEO sẵn có, chuyển được từ WordPress.", ROOT / "app" / "twitter-image.png")
    render("Tài liệu KDIGI CMS", "Cài đặt, vận hành và tích hợp CMS headless mã nguồn mở của KDIGI.", ROOT.parent / "docs" / "public" / "og.png")


if __name__ == "__main__":
    main()
