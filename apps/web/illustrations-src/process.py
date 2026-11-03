"""Post-process the Gemini renders in illustrations-src/raw/*.png into web assets (Pillow only).

Run:  /root/.venvs/ai-mm/bin/python illustrations-src/process.py [key ...]     (no args = every raw PNG)
      /root/.venvs/ai-mm/bin/python illustrations-src/process.py --manifest    (rebuild manifest.json only)
      /root/.venvs/ai-mm/bin/python illustrations-src/process.py --sheet       (rebuild contact-sheet.png, light + dark)

Per key (sizes, byte budgets, shadow flag and Vietnamese alt text live in keys.py):
  1. The flat studio background (colour sampled from the raw border) is removed with a border flood fill, so glass interiors
     that happen to be close to the background colour stay opaque; the fringe is soft-keyed, colour-decontaminated and
     despilled (background-colour cast removed from the anti-aliased edge).
  2. Scene keys (shadow=True) get one consistent soft contact shadow synthesised from the object's own footprint
     (navy, semi-transparent alpha). The model is told not to render shadows, so the keyer never has to separate them.
  3. Cropped to the alpha bounding box and centred on a transparent canvas of the contract size (2x of display) with a fixed margin.
  4. Saved as lossy WebP with alpha; quality is lowered until the key's byte budget is met.
  5. public/illustrations/manifest.json = { key: { w, h, alt, bytes } } for every webp present.
"""
from __future__ import annotations

import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

import keys

HERE = Path(__file__).resolve().parent
RAW = HERE / "raw"
OUT = HERE.parent / "public" / "illustrations"
MARGIN = {"scene": 0.05, "icon": 0.07}
SHADOW_NAVY = (10, 16, 32)


def border_background(im: Image.Image) -> tuple[float, float, float]:
    """Trimmed mean colour of a 6 px frame around the image."""
    w, h = im.size
    px = im.load()
    samples = []
    for t in range(6):
        for x in range(0, w, 7):
            samples.append(px[x, t])
            samples.append(px[x, h - 1 - t])
        for y in range(0, h, 7):
            samples.append(px[t, y])
            samples.append(px[w - 1 - t, y])
    samples.sort(key=sum)
    mid = samples[len(samples) // 4 : 3 * len(samples) // 4]
    return tuple(sum(p[i] for p in mid) / len(mid) for i in range(3))  # type: ignore[return-value]


def key_background(im: Image.Image, t0: float = 18.0, t1: float = 48.0) -> Image.Image:
    """Alpha = soft(distance to background) inside the border-connected background region; 255 elsewhere."""
    im = im.convert("RGB")
    w, h = im.size
    bg = border_background(im)
    bg_img = Image.new("RGB", im.size, tuple(round(c) for c in bg))
    r, g, b = ImageChops.difference(im, bg_img).split()
    dist = ImageChops.lighter(ImageChops.lighter(r, g), b)
    dist = dist.filter(ImageFilter.GaussianBlur(0.6))

    # chroma backgrounds (green): the model still paints darker "shadow" greens, which are far from bg in RGB distance but are
    # the only pixels where the background channel dominates -> key them by chromaticity too (objects never are green-dominant)
    dom = max(range(3), key=lambda i: bg[i])
    others = [i for i in range(3) if i != dom]
    chans = im.split()
    spill = bg[dom] - max(bg[i] for i in others) > 60
    if spill:
        score = ImageChops.subtract(chans[dom], ImageChops.lighter(chans[others[0]], chans[others[1]])).filter(ImageFilter.GaussianBlur(0.6))
        chroma_soft = score.point(lambda v: 255 if v <= 14 else 0 if v >= 46 else int(255 * (46 - v) / 32))
    loose = dist.point(lambda v: 0 if v < t1 else 255)
    if spill:
        loose = ImageChops.multiply(loose, chroma_soft.point(lambda v: 255 if v > 128 else 0))
    flood = loose.copy()
    seeds = [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]
    seeds += [(x, 0) for x in range(0, w, 16)] + [(x, h - 1) for x in range(0, w, 16)]
    seeds += [(0, y) for y in range(0, h, 16)] + [(w - 1, y) for y in range(0, h, 16)]
    for sx, sy in seeds:
        if flood.getpixel((sx, sy)) == 0:
            ImageDraw.floodfill(flood, (sx, sy), 128)
    region = flood.point(lambda v: 255 if v == 128 else 0).filter(ImageFilter.MaxFilter(3))

    soft = dist.point(lambda v: 0 if v <= t0 else 255 if v >= t1 else int(255 * (v - t0) / (t1 - t0)))
    # enclosed pockets (between arms, inside rings) only lose pixels that are almost exactly the background colour
    pockets = dist.point(lambda v: 0 if v <= 4 else 255 if v >= 12 else int(255 * (v - 4) / 8))
    if spill:
        soft = ImageChops.darker(soft, chroma_soft)
        # enclosed pockets: only fully saturated background green is removed (spill-tinted glass / clay must survive)
        pockets = ImageChops.darker(pockets, score.point(lambda v: 255 if v <= 50 else 0 if v >= 75 else int(255 * (75 - v) / 25)))
    alpha = Image.composite(soft, pockets, region).filter(ImageFilter.GaussianBlur(0.5))
    # drop speckle / border noise: keep only alpha that survives a 3 px opening (dilated back to keep soft edges)
    core = alpha.point(lambda v: 255 if v > 40 else 0).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    alpha = ImageChops.multiply(alpha, core.filter(ImageFilter.MaxFilter(5)))


    px, ap = im.load(), alpha.load()
    out = Image.new("RGBA", im.size)
    op = out.load()
    for y in range(h):
        for x in range(w):
            a = ap[x, y]
            if a == 0:
                continue
            p = px[x, y]
            if a < 255:
                k = a / 255
                p = tuple(max(0, min(255, round((p[i] - bg[i] * (1 - k)) / k))) for i in range(3))
            if spill:  # clay/glass never need a green-dominant pixel: remove the background colour cast everywhere
                cap = max(p[i] for i in others)
                if p[dom] > cap:
                    p = tuple(cap if i == dom else p[i] for i in range(3))
            op[x, y] = (p[0], p[1], p[2], a)
    return out


def alpha_bbox(im: Image.Image, thr: int = 24):
    return im.getchannel("A").point(lambda v: 255 if v > thr else 0).getbbox()


def add_shadow(im: Image.Image) -> Image.Image:
    """Soft navy contact shadow from the object's lowest band, falling slightly right/down (key light is upper-left)."""
    x0, y0, x1, y1 = alpha_bbox(im)
    bw, bh = x1 - x0, y1 - y0
    padx, pady = round(bw * 0.12), round(bh * 0.14)
    canvas = Image.new("RGBA", (im.width + 2 * padx, im.height + 2 * pady), (0, 0, 0, 0))
    canvas.paste(im, (padx, pady))
    band_h = round(bh * 0.16)
    band = canvas.getchannel("A").crop((0, pady + y1 - band_h, canvas.width, pady + y1))
    layer = Image.new("L", canvas.size, 0)
    soft = Image.new("L", canvas.size, 0)
    soft.paste(band, (round(bw * 0.04), pady + y1 - band_h + round(bh * 0.075)))
    soft = soft.filter(ImageFilter.GaussianBlur(max(bw, bh) * 0.034)).point(lambda v: round(v * 0.42))
    tight = Image.new("L", canvas.size, 0)
    tight.paste(band, (round(bw * 0.008), pady + y1 - band_h + round(bh * 0.018)))
    tight = tight.filter(ImageFilter.GaussianBlur(max(bw, bh) * 0.010)).point(lambda v: round(v * 0.38))
    layer = ImageChops.lighter(soft, tight)
    shadow = Image.new("RGBA", canvas.size, SHADOW_NAVY + (0,))
    shadow.putalpha(layer)
    return Image.alpha_composite(shadow, canvas)


def fit_canvas(im: Image.Image, size: tuple[int, int], margin: float) -> Image.Image:
    bbox = alpha_bbox(im)
    if bbox:
        im = im.crop(bbox)
    cw, ch = size
    inner = (round(cw * (1 - 2 * margin)), round(ch * (1 - 2 * margin)))
    scale = min(inner[0] / im.width, inner[1] / im.height)
    resized = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.paste(resized, ((cw - resized.width) // 2, (ch - resized.height) // 2), resized)
    return canvas


def encode(im: Image.Image, limit: int) -> tuple[bytes, int]:
    buf = io.BytesIO()
    for q in (92, 88, 84, 80, 76, 72, 68, 64, 60, 56, 52, 48, 44, 40, 36, 32, 28):
        buf = io.BytesIO()
        im.save(buf, "WEBP", quality=q, method=6, alpha_quality=70)
        if buf.tell() <= limit:
            return buf.getvalue(), q
    return buf.getvalue(), 28


def write_manifest() -> None:
    manifest: dict[str, dict[str, object]] = {}
    for key, spec in keys.K.items():
        f = OUT / f"{key}.webp"
        if not f.exists():
            continue
        with Image.open(f) as im:
            w, h = im.size
        manifest[key] = {"w": w, "h": h, "alt": spec["alt"], "bytes": f.stat().st_size}
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    missing = [k for k in keys.K if k not in manifest]
    if missing:
        print("manifest: no image yet for", ", ".join(missing))


def process(key: str) -> None:
    spec = keys.K[key]
    keyed = key_background(Image.open(RAW / f"{key}.png"))
    if spec["shadow"]:
        keyed = add_shadow(keyed)
    margin = MARGIN["scene" if spec["shadow"] else "icon"]
    w, h = spec["size"]
    data, q = b"", 0
    for shrink in (1.0, 0.94, 0.88, 0.82):  # last resort when even the lowest quality is over the budget
        canvas = fit_canvas(keyed, (round(w * shrink), round(h * shrink)), margin)
        if shrink != 1.0:  # keep the contract size: pad back to (w, h)
            full = Image.new("RGBA", (w, h), (0, 0, 0, 0))
            full.paste(canvas, ((w - canvas.width) // 2, (h - canvas.height) // 2))
            canvas = full
        data, q = encode(canvas, spec["limit"])
        if len(data) <= spec["limit"]:
            break
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / f"{key}.webp").write_bytes(data)
    flag = "" if len(data) <= spec["limit"] else "  OVER BUDGET"
    print(f"{key:20s} {canvas.width}x{canvas.height} q{q} {len(data) / 1024:.1f}/{spec['limit'] // 1024} KB{flag}")


def contact_sheet() -> None:
    """All keys at display size (webp is 2x) on light #F2F6FF and dark #070C1A panels."""
    from PIL import ImageFont

    width, gap, label_h = 1700, 28, 16
    panels = []
    font = ImageFont.load_default()
    for bg in ("#F2F6FF", "#070C1A"):
        items = []
        for key in keys.K:
            f = OUT / f"{key}.webp"
            if f.exists():
                im = Image.open(f).convert("RGBA")
                items.append((key, im.resize((im.width // 2, im.height // 2), Image.LANCZOS)))
        x = y = gap
        row_h = 0
        placed = []
        prev = None
        for key, im in items:
            group = "scene" if key.endswith("-scene") else key.split("-")[0]
            if x + im.width + gap > width or (prev and group != prev):
                x, y, row_h = gap, y + row_h + label_h + gap, 0
            prev = group
            placed.append((key, im, x, y))
            x += im.width + gap
            row_h = max(row_h, im.height)
        panel = Image.new("RGBA", (width, y + row_h + label_h + gap), bg)
        d = ImageDraw.Draw(panel)
        for key, im, px_, py_ in placed:
            panel.alpha_composite(im, (px_, py_))
            d.text((px_, py_ + im.height + 2), key, fill="#6B7A99", font=font)
        panels.append(panel)
    sheet = Image.new("RGBA", (width, sum(p.height for p in panels)))
    y = 0
    for p in panels:
        sheet.paste(p, (0, y))
        y += p.height
    sheet.convert("RGB").save(HERE / "contact-sheet.png", optimize=True)
    print("contact-sheet.png", sheet.size)


def main(argv: list[str]) -> None:
    if argv == ["--manifest"]:
        write_manifest()
        return
    if argv == ["--sheet"]:
        contact_sheet()
        return
    names = argv or [p.stem for p in sorted(RAW.glob("*.png")) if p.stem in keys.K]
    for key in names:
        if key not in keys.K:
            sys.exit(f"unknown key: {key}")
        if not (RAW / f"{key}.png").exists():
            print(f"skip {key}: no raw render")
            continue
        process(key)
    write_manifest()
    contact_sheet()


if __name__ == "__main__":
    main(sys.argv[1:])
