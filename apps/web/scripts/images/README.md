# scripts/images — thumbnail + OG renderer

Renders blog thumbnails and per-page OG images (1920×1080 WebP, plus 1200×630 JPEG for pages) for opencms.kdigi.vn. Quy trình đầy đủ: [`docs/image-production-playbook.md`](../../docs/image-production-playbook.md). Needs Node ≥ 22, `sharp` (devDependency), Chrome (`/usr/bin/google-chrome` or `CHROME_PATH`).

```bash
node scripts/images/compose.mjs --help
node scripts/images/compose.mjs page --all                          # OG for every content/pages/**/index.md
node scripts/images/compose.mjs page --route tinh-nang/seo-json-ld  # one page ("" = home)
node scripts/images/compose.mjs card --ab --name <slug>-card --post <slug>   # blog thumbnail from CMS tenant 1
node scripts/images/compose.mjs check [--strict]
node scripts/images/compose.mjs review <name> [--save review.json | --owner approved --by "..."]
```

| File | Role |
| --- | --- |
| `compose.mjs` | CLI: `page`, `card`, `photo`, `source`, `check`, `review`; CMS fetch, manifest |
| `template.mjs` | HTML/CSS of the card (wide layout, solid by default), safe zone, no-break phrases (`NOBREAK`), title fit script |
| `chrome.mjs` | Headless Chrome over the DevTools protocol, PNG screenshot |
| `fonts.mjs` | TrueType `cmap` reader: refuses text the font (Ferry VN) cannot draw |

Data: `assets/images/{_style.json,_manifest.json,composed/,_reviews/}`; page OG JPEGs go to `public/images/og/<route-key>.jpg`. Env: `IMAGES_CMS_API` (default `https://app.opencms.kdigi.vn/api`), `IMAGES_CMS_TENANT` (default `1`), `CHROME_PATH`. Exit codes: `0` ok, `1` error / failed check, `2` usage. `photo` (registered source photos) is inherited from the khoi.pro renderer and unused here: no photo source is registered.
