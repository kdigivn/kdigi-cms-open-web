"""Single source of truth for the cms.kdigi.vn illustration set: style lock, per-key subject prompts, ratios, sizes, budgets, alt text.

Style lock = the Khoi design system "3D clay + glass" (matte warm-white clay, frosted glass, brand blue, cyan rim) on a flat chroma
background that process.py keys out. Images are generated with the Codex built-in `image_gen` tool (gen.sh -> `codex exec`).

CLI (used by gen.sh):
    python3 keys.py list            -> all keys, one per line
    python3 keys.py prompt <key>    -> full prompt (STYLE + subject + NOTEXT)
"""
from __future__ import annotations

import os
import sys

BG = os.environ.get("BG", "#00B140")

NOTEXT = "Absolutely no text, no letters, no numbers, no logos, no trademarks, no watermark, no people."

STYLE = (
    "Premium miniature 3D render in one consistent clay-and-glass style: matte warm-white clay (#F4F0EA) with soft rounded "
    "pillow-like extrusions and gentle bevels, frosted translucent milky glass parts with a faint cyan tint that are dense enough "
    "that the background never shows through them, chamfered glass blocks and satin blocks like a modern tech icon, "
    "brand blue #4767EC and deep navy #0A1020 clay accents, small glowing cyan #22D3EE rim-light strips and inner glow, "
    "soft diffused studio light from the upper left with gentle shading and clean subtle reflections, "
    "viewed from the same three-quarter isometric angle about 35 degrees above, "
    "the object centred with generous empty margin and nothing touching or cropped by the image border, "
    "no cast shadow, no ground shadow, no floor, no reflection on the ground, no horizon line, "
    f"plain seamless flat background of exactly {BG} with no gradient, no vignette, no texture, no glow on the background "
    f"and no {BG} colour cast or reflection on the object"
)

SCENE = (
    "The platform is a clean smooth rounded-square slab like a collectible figurine base with plain continuous side walls, "
    "no bumpers, no side pads, no clips, no handles; one thin glowing cyan light strip along a lower edge is allowed; "
    "every object on it is clearly readable at small size"
)

K: dict[str, dict] = {}


def add(key, ratio, size, limit_kb, subject, alt, shadow=False):
    assert len(alt) <= 120, (key, len(alt))
    K[key] = dict(ratio=ratio, size=size, limit=limit_kb * 1024, shadow=shadow, subject=subject, alt=alt)


# --- scene (display 720x480) ----------------------------------------------------------------------------------------------
add("hero-scene", "3:2", (1440, 960), 150,
    "a rounded-square warm-white clay platform with a smooth plain flat top that runs flush to the edge (no raised rim); "
    "at its centre a chunky brand-blue clay block in the shape of a sturdy hub cube with a thin glowing cyan rim strip, "
    "three upright frosted-glass browser-window cards of different sizes standing around it, each with a blank pale glass "
    "title bar and a few rounded blank glass content bars (no readable text), connected to the cube by short flat glowing cyan "
    "ribbon rails lying on the platform top, plus a small deep-navy clay document tile and a few tiny floating blue and cyan cubes",
    "Một khối trung tâm xanh nối với ba cửa sổ website kính mờ trên đế đất sét",
    shadow=True)

add("scene-migrate", "3:2", (1200, 800), 120,
    "a rounded-square warm-white clay platform with a smooth flat top; on the left a stack of three pale frosted-glass document "
    "sheets standing in a clay tray, on the right a chunky brand-blue clay cube with a thin glowing cyan rim strip, "
    "between them a flat glowing cyan ribbon conveyor with a few small glass tiles travelling along it from the sheets to the cube",
    "Tài liệu kính mờ chuyển qua băng chuyền sang khối xanh KDIGI CMS",
    shadow=True)

add("scene-selfhost", "3:2", (1200, 800), 120,
    "a rounded-square warm-white clay platform with a smooth flat top; on it a satin deep-navy clay shipping-container-like crate "
    "with rounded edges and a glowing cyan seam, a small frosted-glass database cylinder beside it, "
    "and a brand-blue clay cube resting on top of the crate, linked by a thin flat glowing cyan ribbon rail",
    "Khối container và cơ sở dữ liệu kính mờ, đại diện cho tự host bằng Docker",
    shadow=True)

add("scene-opensource", "3:2", (1200, 800), 120,
    "a rounded-square warm-white clay platform with a smooth flat top; on it a branching tree of three small round clay nodes "
    "joined by flat glowing cyan ribbons, one node brand-blue, one frosted glass, one warm white, "
    "and a chunky open frosted-glass padlock with a brand-blue clay shackle standing beside the tree",
    "Cây nhánh mã nguồn mở và ổ khoá mở bằng kính mờ trên đế đất sét",
    shadow=True)

# --- icons (display 160x160) ----------------------------------------------------------------------------------------------
add("icon-demo", "1:1", (320, 320), 25,
    "a single floating frosted-glass laptop open at an angle with a brand-blue clay play-triangle button glowing on the screen",
    "Laptop kính mờ với nút phát xanh cho bản demo trực tuyến")

add("icon-key", "1:1", (320, 320), 25,
    "a single floating chunky brand-blue clay key with a frosted-glass bow and a thin glowing cyan rim strip",
    "Chiếc chìa khoá xanh bằng đất sét và kính mờ")


def prompt(key: str) -> str:
    spec = K[key]
    scene = f" {SCENE}." if spec["shadow"] else ""
    return f"{STYLE}. Subject: {spec['subject']}.{scene} {NOTEXT}"


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "list":
        print("\n".join(K))
    elif cmd == "prompt":
        print(prompt(sys.argv[2]))
    else:
        sys.exit(__doc__)
