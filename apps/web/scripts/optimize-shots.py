#!/usr/bin/env python3
"""Turn the PNG screenshots of the live KDIGI CMS admin into the WebP files the homepage ships.

Usage:  python3 scripts/optimize-shots.py [SRC_DIR] [name ...]
        SRC_DIR defaults to /root/khoi-workspace/kdigi/opencms-shots; with no names only the shots the homepage uses (USED) are converted.
Output: public/screenshots/<name>.webp (max 1800 px wide) + public/screenshots/manifest.json = { name: { w, h } }.
The manifest gives <Shot> the real pixel size, so the image box is reserved before it loads (no layout shift).
Short lists leave a blank lower half in the capture; CROP_KEEP is the share of the height kept from the top for those.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "screenshots"
MAX_WIDTH = 1800
USED = ["dashboard", "sites", "editor", "seo", "media", "roles", "api"]
CROP_KEEP = {"sites": 0.5, "media": 0.64}


def convert(src: Path) -> tuple[int, int]:
    with Image.open(src) as im:
        im = im.convert("RGB")
        if src.stem in CROP_KEEP:
            im = im.crop((0, 0, im.width, round(im.height * CROP_KEEP[src.stem])))
        if im.width > MAX_WIDTH:
            im = im.resize((MAX_WIDTH, round(im.height * MAX_WIDTH / im.width)), Image.LANCZOS)
        im.save(OUT / f"{src.stem}.webp", "WEBP", quality=82, method=6)
        return im.size


def main(argv: list[str]) -> None:
    src_dir = Path(argv[0]) if argv else Path("/root/khoi-workspace/kdigi/opencms-shots")
    names = argv[1:]
    OUT.mkdir(parents=True, exist_ok=True)
    files = [src_dir / f"{n}.png" for n in (names or USED)]
    manifest_path = OUT / "manifest.json"
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() and names else {}
    for f in files:
        w, h = convert(f)
        manifest[f.stem] = {"w": w, "h": h}
        print(f"{f.stem:16s} {w}x{h} {(OUT / (f.stem + '.webp')).stat().st_size / 1024:.0f} KB")
    manifest_path.write_text(json.dumps(dict(sorted(manifest.items())), indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main(sys.argv[1:])
