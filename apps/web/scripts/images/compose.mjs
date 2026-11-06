#!/usr/bin/env node
// cms.kdigi.vn thumbnail + OG renderer. See scripts/images/README.md and docs/image-production-playbook.md.
// Renders HTML (template.mjs) with headless Chrome, converts to WebP with sharp, records provenance.
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir, userInfo } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { parseArgs } from "node:util";
import sharp from "sharp";
import { renderPage } from "./chrome.mjs";
import { missingGlyphs } from "./fonts.mjs";
import { buildHtml, markPaths, safeBox } from "./template.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const IMG = join(ROOT, "assets/images");
const P = {
  style: join(IMG, "_style.json"),
  manifest: join(IMG, "_manifest.json"),
  sources: join(IMG, "sources/_sources.json"),
  testDir: join(IMG, "sources/_test"),
  composed: join(IMG, "composed"),
  reviews: join(IMG, "_reviews"),
  preview: join(IMG, "_reviews/_preview"),
};
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const RIGHTS = ["publish", "publish-credit", "pending"];
const REVIEW_CHECKS = {
  diacritics: "Dấu tiếng Việt và chính tả đúng, khớp CMS/brief",
  legibility: "Tương phản đủ, chữ không tràn, không bị cắt",
  "fit-384": "Đọc được ở ~384 px rộng (thẻ blog)",
  "safe-wide": "Vùng an toàn 1.91:1 ∩ 2:1 (x 96–1824, y 84–996): chữ, logo và tên miền không bị cắt ở crop OG và X",
  "safe-191": "Crop 1.91:1 (1200×630, OG) giữ nguyên chữ và logo",
  logo: "Logo đúng luật (màu theo nền, clear space, không méo, đủ cỡ tối thiểu)",
  brief: "Đúng brief: kind, treatment, chủ đề; không có nội dung bịa",
  rights:
    "Nguồn và quyền: photo publish/publish-credit; card không dùng ảnh ngoài",
  "ab-parity":
    "A/B cùng chữ và cùng ảnh, chỉ khác treatment (N/A nếu chỉ một bản)",
};

const HELP = `khoi.pro thumbnail renderer (Node >= 22, Chrome headless, sharp)

Usage: node scripts/images/compose.mjs <command> [options]

Commands
  card   --name <n> (--post <slug> | --title <t> --eyebrow <e>) [--treatment solid|glass | --ab]
         Brand title card: abstract K geometry, eyebrow, title, logo lockup, domain.
  photo  --name <n> (--source <id> | --test-source <file>) (--post <slug> | --title ... --eyebrow ...)
         [--focus 50,40] [--treatment solid|glass | --ab]   Registered photo + title panel.
  source add <file> --id <id> --rights publish|publish-credit|pending [--credit <t>] [--subject <t>] [--note <t>]
  source list
  check  [--strict]      Verify manifest: files, SHA-256, sources, rights, reviews.
  review <name>          Write review crops (384 px, 1:1, 1.91:1) and print the SHA-256 to review.
  review <name> --save <review.json> [--reviewer <who>]
                         Store the AI Vision review under the file's current SHA-256 (owner: pending).
  review <name> --owner approved|rejected|pending --by <person> [--note <t>]
                         Record the owner decision for the current SHA-256.
  help

Render options
  --name <n>          Output name, a-z0-9 and "-" only. With --ab it is a base: <n>-solid, <n>-glass.
  --post <slug>       Title and eyebrow from the live CMS (tenant 29). Overriding them needs --reason.
  --title / --eyebrow Manual text (without --post), or overrides with --reason "<brief ref>".
  --treatment <t>     solid (default) | glass.   --ab renders both from identical text and image.
  --geometry <0-2>    card only: geometry preset from _style.json (default 0).
  --focus <x,y>       photo only: object-position in percent (default 50,50).
  --by <who>          Recorded in the manifest (default: $USER).
  --debug-safe        Draw the crop zones, write assets/images/_reviews/_preview/<name>-safe.png, no WebP, no manifest.
  --api <url>, --tenant <id>   CMS source (env IMAGES_CMS_API, IMAGES_CMS_TENANT; default https://cms.kdigi.vn/api, 29).

Exit codes: 0 ok, 1 error / failed check, 2 usage.`;

// ---------- small helpers ----------

class Usage extends Error {}
const die = (msg, code = 1) => {
  console.error(`error: ${msg}`);
  process.exit(code);
};
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const sha256File = (file) => sha256(readFileSync(file));
const rel = (file) => relative(ROOT, file).split(sep).join("/");
const readJson = (file, fallback) => {
  if (!existsSync(file)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`missing ${rel(file)}`);
  }
  return JSON.parse(readFileSync(file, "utf8"));
};
const writeJson = (file, data) => {
  mkdirSync(resolve(file, ".."), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
};
const clean = (s) => s.normalize("NFC").replace(/\s+/g, " ").trim();
const byWho = (v) =>
  v || process.env.USER || userInfo().username || "compose.mjs";

function opts(argv, options) {
  try {
    return parseArgs({
      args: argv,
      options,
      allowPositionals: true,
      strict: true,
    });
  } catch (e) {
    throw new Usage(e.message);
  }
}

// ---------- CMS ----------

async function fetchPost(slug, { api, tenant }) {
  const q = new URLSearchParams({
    "where[tenant][equals]": tenant,
    "where[slug][equals]": slug,
    "where[status][equals]": "published",
    depth: "1",
    limit: "1",
  });
  let res;
  try {
    res = await fetch(`${api}/posts?${q}`, {
      signal: AbortSignal.timeout(20000),
    });
  } catch (e) {
    throw new Error(`CMS unreachable (${api}): ${e.message}`);
  }
  if (!res.ok) throw new Error(`CMS answered ${res.status} for post "${slug}"`);
  const doc = (await res.json()).docs?.[0];
  if (!doc) throw new Error(`no published post "${slug}" in tenant ${tenant}`);
  const cat = (doc.categories ?? []).find(
    (c) => c && typeof c === "object" && c.type === "category" && c.name
  );
  return {
    id: doc.id,
    slug: doc.slug,
    title: clean(doc.title ?? ""),
    eyebrow: cat ? clean(cat.name) : "",
    updatedAt: doc.updatedAt ?? null,
    hasCover: Boolean(doc.featuredImage),
    categorySlug: cat?.slug ?? "",
  };
}

// ---------- render ----------

function resolveText(o, style) {
  const reason = o.reason?.trim();
  if (o.post) {
    const overrides = o.title || o.eyebrow;
    if (overrides && !reason)
      throw new Usage(
        '--title/--eyebrow with --post is an override: add --reason "<brief ref>"'
      );
    return { post: o.post, reason };
  }
  if (!o.title || !o.eyebrow)
    throw new Usage("give --post <slug>, or both --title and --eyebrow");
  return {
    post: null,
    reason: null,
    manual: { title: clean(o.title), eyebrow: clean(o.eyebrow) },
  };
}

function loadPhotoSource(o, style) {
  if (o.source && o["test-source"])
    throw new Usage("use --source or --test-source, not both");
  if (!o.source && !o["test-source"])
    throw new Usage(
      "photo needs --source <registered id> (or --test-source <file> for a demo)"
    );
  let entry;
  if (o.source) {
    const reg = readJson(P.sources, { sources: [] }).sources;
    const s = reg.find((x) => x.id === o.source);
    if (!s)
      throw new Error(
        `source "${o.source}" is not in sources/_sources.json (node scripts/images/compose.mjs source add ...)`
      );
    if (s.rights === "pending")
      throw new Error(
        `source "${s.id}" has rights: pending, owner clearance required before it can be rendered`
      );
    if (!["publish", "publish-credit"].includes(s.rights))
      throw new Error(`source "${s.id}": invalid rights "${s.rights}"`);
    if (s.rights === "publish-credit" && !s.credit)
      throw new Error(
        `source "${s.id}" is publish-credit but has no credit text`
      );
    entry = { ...s, file: join(IMG, s.file), publishable: true };
    if (!existsSync(entry.file))
      throw new Error(`source file missing: ${rel(entry.file)}`);
    if (sha256File(entry.file) !== s.sha256)
      throw new Error(
        `source "${s.id}": file changed since registration (SHA-256 mismatch)`
      );
  } else {
    const file = resolve(o["test-source"]);
    if (!file.startsWith(P.testDir + sep))
      throw new Error(
        `--test-source must live in ${rel(P.testDir)}/ (test material is never a registered source)`
      );
    if (!existsSync(file)) throw new Error(`test source missing: ${rel(file)}`);
    entry = {
      id: `test:${basename(file)}`,
      file,
      rights: "test",
      credit: "",
      sha256: sha256File(file),
      publishable: false,
    };
  }
  return entry;
}

async function assertPhotoSize(entry, style) {
  const m = await sharp(entry.file).metadata();
  const swap = (m.orientation ?? 1) >= 5;
  const w = swap ? m.height : m.width;
  const h = swap ? m.width : m.height;
  if (w < style.photo.minWidth || w <= h)
    throw new Error(
      `photo ${rel(entry.file)} is ${w}×${h}: need landscape, at least ${style.photo.minWidth}px wide`
    );
  return { width: w, height: h };
}

function loadAssets(style) {
  const abs = (f) => join(ROOT, f);
  const out = { refs: [] };
  const take = (key, file, role) => {
    out[key] = readFileSync(abs(file), "utf8");
    out.refs.push({ role, ref: file, sha256: sha256File(abs(file)) });
  };
  take("lockup", style.logo.lockup, "logo");
  take("lockupMono", style.logo.lockupMono, "logo");
  take("dot", style.logo.dot, "logo");
  take("dotMono", style.logo.dotMono, "logo");
  take("mark", style.logo.mark, "geometry");
  out.markPaths = markPaths(out.mark);
  out.fontRegular = abs(style.fonts.regular);
  out.fontBold = abs(style.fonts.bold);
  for (const f of [style.fonts.regular, style.fonts.bold]) {
    if (!existsSync(abs(f))) throw new Error(`font file missing: ${f}`);
    out.refs.push({ role: "font", ref: f, sha256: sha256File(abs(f)) });
  }
  return out;
}

function usedRefs(assets, treatment, style) {
  const t = style.treatments[treatment];
  const used = new Set([
    style.logo[t.logo === "lockup" ? "lockup" : "lockupMono"],
    style.logo[t.dot],
    style.logo.mark,
    style.fonts.regular,
    style.fonts.bold,
  ]);
  return assets.refs.filter((r) => used.has(r.ref));
}

/** Category/page art from the existing Codex heroes (public/images/art). `seed` only picks among several candidates. */
function pickArt(style, keys, seed) {
  const pool = keys?.length ? keys : style.categoryArt.fallback;
  const key = pool[[...seed].reduce((a, c) => a + c.charCodeAt(0), 0) % pool.length];
  const file = join(ROOT, "public/images/art", `${key}.webp`);
  if (!existsSync(file)) throw new Error(`art missing: ${rel(file)}`);
  return { key, file, ref: rel(file), sha256: sha256File(file) };
}

async function renderOne({
  kind,
  name,
  treatment,
  text,
  post,
  photo,
  photoDims,
  o,
  style,
  assets,
}) {
  const { width, height } = style.canvas;
  const geometry = Number(o.geometry ?? 0);
  if (
    kind === "card" &&
    !(Number.isInteger(geometry) && style.geometry[geometry])
  )
    throw new Usage(`--geometry must be 0..${style.geometry.length - 1}`);
  const focus = (o.focus ?? "50,50").split(",").map(Number);
  if (focus.length !== 2 || focus.some((n) => !(n >= 0 && n <= 100)))
    throw new Usage("--focus must be x,y in percent, e.g. 50,40");

  const html = buildHtml({
    style,
    kind,
    treatment,
    text,
    assets,
    layout: o.layout,
    art: o.art ?? null,
    geometry,
    photo: photo ? { file: photo.file, focus } : null,
    debugSafe: Boolean(o["debug-safe"]),
    testTag: photo ? !photo.publishable : false,
  });
  const tmp = mkdtempSync(join(tmpdir(), "khoi-html-"));
  const htmlPath = join(tmp, "thumb.html");
  writeFileSync(htmlPath, html);
  let shot;
  try {
    shot = await renderPage(htmlPath, { width, height });
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  const info = shot.result;
  if (!info.fits)
    throw new Error(
      `title does not fit at ${style.layout.titleMinSize}px in ${style.layout.titleMaxLines} lines: shorten the title (a --title override needs --reason)`
    );
  if (!info.eyebrowFits)
    throw new Error(
      `eyebrow "${text.eyebrow}" is wider than the panel: shorten it (an --eyebrow override needs --reason)`
    );
  const safe = safeBox(style);
  for (const [k, r] of Object.entries(info.rects)) {
    if (
      r.x0 < safe.x0 - 0.5 ||
      r.x1 > safe.x1 + 0.5 ||
      r.y0 < safe.y0 - 0.5 ||
      r.y1 > safe.y1 + 0.5
    )
      throw new Error(
        `${k} box [${r.x0 | 0},${r.y0 | 0}–${r.x1 | 0},${r.y1 | 0}] leaves the safe zone [${safe.x0},${safe.y0}–${safe.x1},${safe.y1}]`
      );
  }

  if (o["debug-safe"]) {
    mkdirSync(P.preview, { recursive: true });
    const file = join(P.preview, `${name}-safe.png`);
    writeFileSync(file, shot.png);
    console.log(
      `debug-safe  ${rel(file)}  (title ${info.titleSize}px, ${info.lines} lines)`
    );
    return null;
  }

  const webp = await sharp(shot.png)
    .webp({ quality: style.webp.quality })
    .toBuffer();
  const meta = await sharp(webp).metadata();
  if (meta.width !== width || meta.height !== height)
    throw new Error(
      `output is ${meta.width}×${meta.height}, expected ${width}×${height}`
    );
  mkdirSync(P.composed, { recursive: true });
  const file = join(P.composed, `${name}.webp`);
  writeFileSync(file, webp);
  if (o.ogOut) {
    // 1.91:1 centre crop (1920×1005) → 1200×630 JPEG: the format every social crawler accepts.
    mkdirSync(dirname(o.ogOut), { recursive: true });
    await sharp(shot.png)
      .extract({ left: 0, top: Math.round((height - 1005) / 2), width: 1920, height: 1005 })
      .resize(1200, 630)
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(o.ogOut);
  }

  const sources = [];
  if (o.art && kind === "card" && o.layout !== "panel")
    sources.push({ role: "art", ref: o.art.ref, sha256: o.art.sha256 });
  if (photo)
    sources.push({
      role: photo.publishable ? "photo" : "test-photo",
      ref: rel(photo.file),
      id: photo.id,
      sha256: photo.sha256,
      rights: photo.rights,
      ...(photo.credit && { credit: photo.credit }),
      width: photoDims.width,
      height: photoDims.height,
      focus,
    });
  sources.push(...usedRefs(assets, treatment, style));

  const entry = {
    file: `composed/${name}.webp`,
    kind,
    text: {
      eyebrow: text.eyebrow,
      title: text.title,
      treatment,
      footer: style.footerText,
      source: post ? (text.overridden ? "override" : "cms") : "manual",
      ...(text.reason && { reason: text.reason }),
      ...(kind === "card" && { geometry }),
      titleSize: info.titleSize,
      titleMode: info.mode,
      lines: info.lines,
    },
    ...(post && {
      post: {
        slug: post.slug,
        id: post.id,
        updatedAt: post.updatedAt,
        cmsTitle: post.title,
        cmsEyebrow: post.eyebrow,
      },
    }),
    publishable: photo ? photo.publishable : true,
    sources,
    created: new Date().toISOString(),
    ...(o.extra ?? {}),
    by: byWho(o.by),
    width,
    height,
    bytes: webp.length,
    sha256: sha256(webp),
  };
  const manifest = readJson(P.manifest, { version: 1, items: [] });
  manifest.items = manifest.items.filter((e) => e.file !== entry.file);
  manifest.items.push(entry);
  manifest.items.sort((a, b) => a.file.localeCompare(b.file));
  writeJson(P.manifest, manifest);
  console.log(
    `${rel(file)}  ${(webp.length / 1024).toFixed(0)} KB  title ${info.titleSize}px/${info.lines} lines  sha256 ${entry.sha256.slice(0, 12)}…${entry.publishable ? "" : "  [TEST – not publishable]"}`
  );
  return entry;
}

async function cmdRender(kind, argv) {
  const { values: o } = opts(argv, {
    name: { type: "string" },
    post: { type: "string" },
    title: { type: "string" },
    eyebrow: { type: "string" },
    reason: { type: "string" },
    treatment: { type: "string" },
    ab: { type: "boolean" },
    layout: { type: "string" },
    geometry: { type: "string" },
    focus: { type: "string" },
    source: { type: "string" },
    "test-source": { type: "string" },
    by: { type: "string" },
    "debug-safe": { type: "boolean" },
    api: { type: "string" },
    tenant: { type: "string" },
  });
  if (!o.name) throw new Usage("--name is required");
  if (!NAME_RE.test(o.name))
    throw new Usage(`--name "${o.name}": use a-z, 0-9 and "-" only`);
  const style = readJson(P.style);
  const treatments = o.ab ? ["solid", "glass"] : [o.treatment ?? "solid"];
  if (o.ab && o.treatment)
    throw new Usage("--ab and --treatment are exclusive");
  for (const t of treatments)
    if (!style.treatments[t])
      throw new Usage(
        `--treatment must be ${Object.keys(style.treatments).join("|")}`
      );
  if (kind === "card" && (o.source || o["test-source"] || o.focus))
    throw new Usage(
      "card has no photo: use `photo` for --source/--test-source/--focus"
    );

  const req = resolveText(o, style);
  let post = null;
  let text;
  if (req.post) {
    post = await fetchPost(req.post, {
      api: o.api ?? process.env.IMAGES_CMS_API ?? "https://app.cms.kdigi.vn/api",
      tenant: o.tenant ?? process.env.IMAGES_CMS_TENANT ?? "1",
    });
    text = {
      title: o.title ? clean(o.title) : post.title,
      eyebrow: o.eyebrow
        ? clean(o.eyebrow)
        : post.eyebrow || style.eyebrowFallback,
      overridden: Boolean(o.title || o.eyebrow),
      reason: req.reason,
    };
    if (!post.eyebrow && !o.eyebrow)
      console.error(
        `note: post "${post.slug}" has no category, eyebrow falls back to "${style.eyebrowFallback}"`
      );
  } else {
    text = { ...req.manual, overridden: false, reason: null };
  }

  const photo = kind === "photo" ? loadPhotoSource(o, style) : null;
  if (photo && !photo.publishable && !o.name.startsWith("test-"))
    throw new Usage(
      'a render from --test-source must be named "test-…" so it cannot be mistaken for a deliverable'
    );
  const photoDims = photo ? await assertPhotoSize(photo, style) : null;

  // Fonts: refuse to draw text the typeface does not cover (Vietnamese diacritics are mandatory).
  const sample = `${text.title}${text.eyebrow}${style.footerText}`;
  for (const f of [style.fonts.regular, style.fonts.bold]) {
    const miss = missingGlyphs(join(ROOT, f), sample);
    if (miss.length)
      throw new Error(`${f} has no glyph for: ${miss.join(" ")}`);
  }
  const assets = loadAssets(style);

  for (const treatment of treatments) {
    const name = o.ab ? `${o.name}-${treatment}` : o.name;
    await renderOne({
      kind,
      name,
      treatment,
      text,
      post,
      photo,
      photoDims,
      o: {
        ...o,
        art: kind === "card" ? pickArt(style, style.categoryArt[post?.categorySlug], o.name) : null,
        extra: { layout: o.layout ?? "wide" },
      },
      style,
      assets,
    });
  }
}

// ---------- page (per-page OG from content files) ----------

const PAGES_DIR = join(ROOT, "content/pages");
const OG_DIR = join(ROOT, "public/images/og");
const SECTION_EYEBROW = {
  "tinh-nang": "Tính năng",
  "chuyen-tu-wordpress": "Chuyển từ WordPress",
  "tu-host": "Tự host",
  "giai-phap": "Giải pháp",
  "so-sanh": "So sánh",
  "thuc-hanh-tot": "Thực hành tốt",
  demo: "Demo trực tuyến",
  "ma-nguon-mo": "Mã nguồn mở",
  "phat-hanh": "Phát hành",
  blog: "Blog",
  "tac-gia": "Tác giả",
  "gioi-thieu": "Giới thiệu",
  "lien-he": "Liên hệ",
  "dieu-khoan": "Pháp lý",
  "quyen-rieng-tu": "Pháp lý",
};

function frontmatter(file) {
  const m = readFileSync(file, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const fm = {};
  for (const line of (m?.[1] ?? "").split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    fm[kv[1]] = kv[2].replace(/^(["'])([\s\S]*)\1$/, "$2");
  }
  return fm;
}

function listRoutes(dir = PAGES_DIR, prefix = "") {
  const out = [];
  if (existsSync(join(dir, "index.md"))) out.push(prefix);
  for (const d of readdirSync(dir, { withFileTypes: true }))
    if (d.isDirectory()) out.push(...listRoutes(join(dir, d.name), prefix ? `${prefix}/${d.name}` : d.name));
  return out;
}

async function renderRoute(route, o, style, assets) {
  const file = join(PAGES_DIR, route, "index.md");
  if (!existsSync(file)) throw new Usage(`no content file for route "/${route}": ${rel(file)}`);
  const fm = frontmatter(file);
  const key = route === "" ? "home" : route.replaceAll("/", "-");
  const section = route.split("/")[0];
  const eyebrow = clean(o.eyebrow ?? fm.eyebrow ?? SECTION_EYEBROW[section] ?? (route === "" ? "Mã nguồn mở" : style.eyebrowFallback));
  // Title candidates, longest first: the first that fits the panel wins (all come from the content file).
  const candidates = [o.title, fm.ogTitle, fm.h1, fm.title].filter(Boolean).map(clean);
  if (!candidates.length) throw new Error(`${rel(file)} has no title/h1 in its frontmatter`);
  const treatments = o.ab ? ["solid", "glass"] : [o.treatment ?? "solid"];
  const geometry = [...key].reduce((a, c) => a + c.charCodeAt(0), 0) % style.geometry.length;
  let lastErr;
  for (const title of candidates) {
    const sample = `${title}${eyebrow}${style.footerText}`;
    for (const f of [style.fonts.regular, style.fonts.bold]) {
      const miss = missingGlyphs(join(ROOT, f), sample);
      if (miss.length) throw new Error(`${f} has no glyph for: ${miss.join(" ")}`);
    }
    try {
      for (const treatment of treatments) {
        const name = `page-${key}${o.ab ? `-${treatment}` : ""}`;
        await renderOne({
          kind: "card",
          name,
          treatment,
          text: { title, eyebrow, overridden: false, reason: null },
          post: null,
          photo: null,
          photoDims: null,
          o: {
            ...o,
            art: pickArt(style, [`${key}-hero`, `${section}-hero`].filter((k) => existsSync(join(ROOT, "public/images/art", `${k}.webp`))).slice(0, 1), key),
            layout: "wide",
            geometry,
            ogOut: o["debug-safe"] ? null : join(OG_DIR, `${key}${o.ab ? `-${treatment}` : ""}.jpg`),
            extra: { page: { route: `/${route}`, source: rel(file), titleFrom: title === fm.title ? "title" : title === fm.h1 ? "h1" : "override" } },
          },
          style,
          assets,
        });
      }
      return;
    } catch (e) {
      lastErr = e;
      if (!/does not fit|wider than the panel/.test(e.message)) throw e;
    }
  }
  throw lastErr;
}

async function cmdPage(argv) {
  const { values: o } = opts(argv, {
    route: { type: "string" },
    all: { type: "boolean" },
    title: { type: "string" },
    eyebrow: { type: "string" },
    treatment: { type: "string" },
    ab: { type: "boolean" },
    by: { type: "string" },
    "debug-safe": { type: "boolean" },
  });
  if (!o.all && o.route === undefined) throw new Usage("give --route <route-without-leading-slash> (\"\" = home) or --all");
  const style = readJson(P.style);
  const assets = loadAssets(style);
  const routes = o.all ? listRoutes() : [o.route.replace(/^\/+|\/+$/g, "")];
  let failed = 0;
  for (const route of routes) {
    try {
      await renderRoute(route, o.all ? { ...o, title: undefined, eyebrow: undefined } : o, style, assets);
    } catch (e) {
      failed++;
      console.error(`FAIL /${route}: ${e.message}`);
    }
  }
  if (failed) throw new Error(`${failed} of ${routes.length} pages failed`);
}

// ---------- sources ----------

async function cmdSource(argv) {
  const sub = argv[0];
  if (sub === "list") {
    const reg = readJson(P.sources, { sources: [] }).sources;
    if (!reg.length) console.log("no registered photo sources");
    for (const s of reg)
      console.log(
        `${s.id}\t${s.rights}\t${s.file}\t${s.credit || "-"}\t${s.subject || ""}`
      );
    return;
  }
  if (sub !== "add") throw new Usage("source add|list");
  const { values: o, positionals } = opts(argv.slice(1), {
    id: { type: "string" },
    rights: { type: "string" },
    credit: { type: "string" },
    subject: { type: "string" },
    note: { type: "string" },
  });
  const [input] = positionals;
  if (!input) throw new Usage("source add <file> --id <id> --rights ...");
  if (!o.id || !NAME_RE.test(o.id))
    throw new Usage("--id is required (a-z0-9 and -)");
  if (!RIGHTS.includes(o.rights ?? ""))
    throw new Usage(`--rights must be ${RIGHTS.join("|")}`);
  if (o.rights === "publish-credit" && !o.credit)
    throw new Usage("publish-credit needs --credit");
  const src = resolve(input);
  if (!existsSync(src)) throw new Error(`no such file: ${input}`);
  if (src.startsWith(P.testDir + sep))
    throw new Error(
      "files in sources/_test are test material and cannot be registered"
    );
  const srcDir = join(IMG, "sources");
  const insideSources = src.startsWith(srcDir + sep);
  const dest = insideSources
    ? src
    : join(
        srcDir,
        basename(src)
          .toLowerCase()
          .replace(/[^a-z0-9.]+/g, "-")
      );
  // Validate everything before touching the sources folder.
  let m;
  try {
    m = await sharp(src).metadata();
  } catch {
    throw new Error(`${input} is not a readable image`);
  }
  const reg = readJson(P.sources, { version: 1, sources: [] });
  if (reg.sources.some((s) => s.id === o.id))
    throw new Error(`source id "${o.id}" already exists`);
  const hash = sha256File(src);
  const dup = reg.sources.find((s) => s.sha256 === hash);
  if (dup) throw new Error(`same file already registered as "${dup.id}"`);
  if (!insideSources && existsSync(dest) && sha256File(dest) !== hash)
    throw new Error(
      `${rel(dest)} already exists with different content: rename the file before adding it`
    );
  if (!insideSources && !existsSync(dest)) {
    mkdirSync(srcDir, { recursive: true });
    copyFileSync(src, dest);
  }
  reg.sources.push({
    id: o.id,
    file: relative(IMG, dest).split(sep).join("/"),
    rights: o.rights,
    credit: o.credit ?? "",
    subject: o.subject ?? "",
    note: o.note ?? "",
    width: m.width,
    height: m.height,
    sha256: hash,
    added: new Date().toISOString().slice(0, 10),
  });
  writeJson(P.sources, reg);
  console.log(
    `registered ${o.id} (${m.width}×${m.height}, rights ${o.rights}) ${rel(dest)}`
  );
  if (m.width < 1920 || m.width <= m.height)
    console.error(
      "warning: not landscape ≥ 1920 px wide, `photo` will refuse it"
    );
}

// ---------- check ----------

function reviewState(entry) {
  const f = join(P.reviews, `${basename(entry.file, ".webp")}.json`);
  const rec = readJson(f, null);
  const cur = rec?.reviews?.[entry.sha256];
  if (!rec) return { ai: "none", owner: "-" };
  if (!cur) return { ai: "stale", owner: "-" };
  return { ai: cur.result, owner: cur.owner?.status ?? "pending" };
}

function cmdCheck(argv) {
  const { values: o } = opts(argv, { strict: { type: "boolean" } });
  const errors = [];
  const warns = [];
  const manifest = readJson(P.manifest, { items: [] });
  const registry = readJson(P.sources, { sources: [] }).sources;
  const rows = [];
  for (const e of manifest.items) {
    const where = e.file;
    const file = join(IMG, e.file);
    if (!/^composed\/[a-z0-9]+(-[a-z0-9]+)*\.webp$/.test(e.file))
      errors.push(`${where}: bad file name`);
    if (!existsSync(file)) {
      errors.push(`${where}: file missing`);
      continue;
    }
    const buf = readFileSync(file);
    if (sha256(buf) !== e.sha256)
      errors.push(
        `${where}: SHA-256 differs from the manifest (file changed after render: re-render or fix the manifest)`
      );
    for (const s of e.sources ?? []) {
      const ref = join(ROOT, s.ref);
      if (!existsSync(ref)) {
        errors.push(`${where}: source missing ${s.ref}`);
        continue;
      }
      if (sha256File(ref) !== s.sha256)
        errors.push(
          `${where}: source ${s.ref} changed since render (SHA-256 mismatch): re-render`
        );
      if (s.role === "photo") {
        const reg = registry.find((r) => r.id === s.id);
        if (!reg)
          errors.push(
            `${where}: photo source "${s.id}" is not registered in _sources.json`
          );
        else if (reg.sha256 !== s.sha256)
          errors.push(
            `${where}: photo source "${s.id}" differs from its registration`
          );
        if (
          !RIGHTS.slice(0, 2).includes(s.rights) ||
          (reg && reg.rights === "pending")
        )
          errors.push(
            `${where}: photo source "${s.id}" is not cleared for publication (rights ${reg?.rights ?? s.rights})`
          );
      }
      if (s.role === "test-photo" && e.publishable !== false)
        errors.push(`${where}: test photo but publishable is not false`);
    }
    if (e.sources?.some((s) => s.role === "test-photo"))
      warns.push(`${where}: uses a TEST source, not publishable`);
    const st = reviewState(e);
    if (st.ai === "none") warns.push(`${where}: no AI Vision review`);
    else if (st.ai === "stale")
      warns.push(`${where}: review belongs to an older SHA-256, review again`);
    else if (st.ai !== "pass")
      warns.push(`${where}: AI review result is ${st.ai}`);
    if (e.publishable && st.owner !== "approved")
      warns.push(
        `${where}: owner approval is ${st.owner === "-" ? "missing" : st.owner}: do not upload to the CMS`
      );
    rows.push([
      e.file,
      e.kind,
      e.text?.treatment ?? "-",
      e.publishable ? "yes" : "NO",
      st.ai,
      st.owner,
    ]);
  }
  if (existsSync(P.composed)) {
    const known = new Set(manifest.items.map((e) => e.file));
    for (const f of readdirSync(P.composed))
      if (f.endsWith(".webp") && !known.has(`composed/${f}`))
        warns.push(`composed/${f}: not in the manifest`);
  }
  console.log("file\tkind\ttreatment\tpublishable\tai-review\towner");
  for (const r of rows) console.log(r.join("\t"));
  for (const w of warns) console.log(`warn: ${w}`);
  for (const e of errors) console.error(`ERROR: ${e}`);
  console.log(
    `${manifest.items.length} item(s), ${errors.length} error(s), ${warns.length} warning(s)`
  );
  if (errors.length || (o.strict && warns.length)) process.exit(1);
}

// ---------- review ----------

async function cmdReview(argv) {
  const { values: o, positionals } = opts(argv, {
    save: { type: "string" },
    reviewer: { type: "string" },
    owner: { type: "string" },
    by: { type: "string" },
    note: { type: "string" },
  });
  const [name] = positionals;
  if (!name || !NAME_RE.test(name)) throw new Usage("review <name>");
  const manifest = readJson(P.manifest, { items: [] });
  const entry = manifest.items.find((e) => e.file === `composed/${name}.webp`);
  if (!entry) throw new Error(`"${name}" is not in the manifest`);
  const file = join(IMG, entry.file);
  const sha = sha256File(file);
  if (sha !== entry.sha256)
    throw new Error(
      `${entry.file} no longer matches the manifest SHA-256: re-render before review`
    );
  const reviewFile = join(P.reviews, `${name}.json`);

  if (o.save) {
    const input = readJson(resolve(o.save));
    const missing = Object.keys(REVIEW_CHECKS).filter(
      (k) => typeof input.checks?.[k]?.pass !== "boolean"
    );
    if (missing.length)
      throw new Error(
        `review.json lacks boolean pass for: ${missing.join(", ")}`
      );
    const failed = Object.keys(REVIEW_CHECKS).filter(
      (k) => !input.checks[k].pass
    );
    const rec = readJson(reviewFile, { name, file: entry.file, reviews: {} });
    rec.file = entry.file;
    rec.reviews[sha] = {
      result: failed.length ? "fail" : "pass",
      reviewer: o.reviewer ?? input.reviewer ?? "AI Vision",
      reviewed: new Date().toISOString(),
      viewed: input.viewed ?? ["full", "384", "191", "2to1"],
      summary: input.summary ?? "",
      checks: Object.fromEntries(
        Object.keys(REVIEW_CHECKS).map((k) => [
          k,
          { pass: input.checks[k].pass, note: input.checks[k].note ?? "" },
        ])
      ),
      owner: { status: "pending" },
    };
    writeJson(reviewFile, rec);
    console.log(
      `review stored for ${name} sha256 ${sha.slice(0, 12)}…: ${failed.length ? `FAIL (${failed.join(", ")})` : "pass"}; owner pending`
    );
    return;
  }

  if (o.owner) {
    if (!["approved", "rejected", "pending"].includes(o.owner))
      throw new Usage("--owner approved|rejected|pending");
    if (!o.by) throw new Usage("--by <person> is required");
    const rec = readJson(reviewFile, null);
    const cur = rec?.reviews?.[sha];
    if (!cur)
      throw new Error(
        "no AI review for the current SHA-256: review the file first"
      );
    if (o.owner === "approved" && cur.result !== "pass")
      throw new Error(
        "the AI review failed: fix and re-render before approval"
      );
    if (o.owner === "approved" && !entry.publishable)
      throw new Error("test material cannot be approved");
    cur.owner = {
      status: o.owner,
      by: o.by,
      at: new Date().toISOString(),
      ...(o.note && { note: o.note }),
    };
    writeJson(reviewFile, rec);
    console.log(`owner ${o.owner} recorded for ${name} (${sha.slice(0, 12)}…)`);
    return;
  }

  // Default: review crops.
  const style = readJson(P.style);
  const { width, height } = style.canvas;
  const [ow, oh] = style.safe.ogRatio;
  const ogH = Math.round((width * oh) / ow);
  const [wr, hr] = style.safe.wideRatio;
  const wideH = Math.round((width * hr) / wr);
  mkdirSync(P.preview, { recursive: true });
  const out = {
    full: join(P.preview, `${name}-full.png`),
    w384: join(P.preview, `${name}-384.png`),
    og: join(P.preview, `${name}-191.png`),
    wide: join(P.preview, `${name}-2to1.png`),
  };
  await sharp(file).png().toFile(out.full);
  await sharp(file).resize({ width: 384 }).png().toFile(out.w384);
  await sharp(file)
    .extract({ left: 0, top: Math.round((height - wideH) / 2), width, height: wideH })
    .png()
    .toFile(out.wide);
  await sharp(file)
    .extract({
      left: 0,
      top: Math.round((height - ogH) / 2),
      width,
      height: ogH,
    })
    .resize(ow, oh, { fit: "fill" })
    .png()
    .toFile(out.og);
  console.log(`sha256 ${sha}`);
  for (const [k, v] of Object.entries(out))
    console.log(`${k.padEnd(7)} ${rel(v)}`);
  console.log(
    `checks to answer in review.json: ${Object.keys(REVIEW_CHECKS).join(", ")}`
  );
}

// ---------- main ----------

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  switch (cmd) {
    case undefined:
    case "help":
    case "--help":
    case "-h":
      console.log(HELP);
      return;
    case "page":
      return cmdPage(rest);
    case "card":
    case "photo":
      return cmdRender(cmd, rest);
    case "source":
      return cmdSource(rest);
    case "check":
      return cmdCheck(rest);
    case "review":
      return cmdReview(rest);
    default:
      throw new Usage(`unknown command "${cmd}" (try --help)`);
  }
}

main().catch((e) => {
  console.error(`error: ${e.message}`);
  process.exit(e instanceof Usage ? 2 : 1);
});
