#!/usr/bin/env node
/**
 * check-links.mjs — kiểm mọi liên kết nội bộ, neo (#heading) và ảnh trong nội dung Starlight
 * và trong các component trang chủ (`src/components/Home*.astro`).
 *
 * Bắt các lớp lỗi:
 *  1. Link trỏ tới trang không tồn tại.
 *  2. Link tương đối — dễ vỡ khi trang bị di chuyển; luật của repo là dùng đường dẫn tuyệt đối có `/` cuối.
 *  3. Neo `#…` không khớp tiêu đề nào của trang đích.
 *  4. Ảnh tương đối (trong `src/assets/`) không có file; ảnh tuyệt đối (`/…`) không có trong `public/`.
 *  5. Thư mục có nội dung nhưng thiếu trang gốc (route khu vực trả 404).
 *  Với `--orphans`: liệt kê trang không trang nào trong nội dung liên kết tới (chỉ thông tin, không làm fail;
 *  trang vẫn truy cập được qua sidebar).
 *
 * Dùng:  node scripts/check-links.mjs [--json] [--orphans]
 * Exit:  0 sạch · 1 có lỗi
 */
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const docsDir = path.join(root, 'src/content/docs');
const publicDir = path.join(root, 'public');

async function walk(dir, filter, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, filter, acc);
    else if (filter(entry.name)) acc.push(full);
  }
  return acc;
}

/** src/content/docs/a/b.md → /a/b/ · .../a/index.md → /a/ · .../index.mdx → / */
function routeOf(file) {
  let rel = path.relative(docsDir, file).replace(/\\/g, '/').replace(/\.mdx?$/, '');
  if (rel === 'index') return '/';
  if (rel.endsWith('/index')) rel = rel.slice(0, -'/index'.length);
  return `/${rel}/`;
}

/** Route do endpoint của Astro phục vụ (không phải trang nội dung). */
const EXTRA_ROUTES = ['/llms.txt'];

const files = await walk(docsDir, (name) => /\.mdx?$/.test(name));
const routes = new Set([...files.map(routeOf), ...EXTRA_ROUTES.map((route) => `${route}/`)]);

// Route do `redirects` trong astro.config.mjs phục vụ (thư mục nhóm sidebar không có trang riêng):
// trả chuyển hướng chứ không phải 404.
const astroConfig = await readFile(path.join(root, 'astro.config.mjs'), 'utf8');
const redirectBlock = astroConfig.match(/redirects\s*:\s*\{([\s\S]*?)\n\s*\}/);
for (const m of redirectBlock?.[1].matchAll(/['"](\/[^'"]*)['"]\s*:/g) ?? []) routes.add(m[1]);

/** Bỏ khối code để không quét link trong ví dụ. */
const stripCodeBlocks = (src) => src.replace(/^```[\s\S]*?^```/gm, '').replace(/`[^`\n]*`/g, '');

/** Cách github-slugger (Astro/Starlight) sinh id tiêu đề: chữ thường, bỏ dấu câu, khoảng trắng → `-`. */
function headingId(text) {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}_\- ]/gu, '')
    .replace(/ /g, '-');
}

function anchorsOf(raw) {
  const ids = new Set();
  for (const line of stripCodeBlocks(raw).split('\n')) {
    const m = line.match(/^#{1,6}\s+(.+?)\s*#*$/);
    if (m) ids.add(headingId(m[1]));
  }
  return ids;
}

const rawByRoute = new Map();
for (const file of files) rawByRoute.set(routeOf(file), await readFile(file, 'utf8'));

const findings = [];
const linkGraph = new Map(); // route → Set(route được trỏ tới)

const MD_LINK = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const HTML_HREF = /\b(?:href|src)=["']([^"']+)["']/g;
/** `href: '/x/'` trong frontmatter (heroChips) và trong dữ liệu của component. */
const DATA_HREF = /\bhref:\s*["']?(\/[^\s"',]+)/g;
const ASSET_EXT = /\.(png|jpe?g|gif|svg|webp|avif|pdf|txt|ico|mp4|webm)$/i;

/** Kiểm một đích liên kết; trả route đích (đã chuẩn hoá) nếu là link nội bộ hợp lệ. */
async function checkTarget(target, ctx) {
  const { file, raw, report } = ctx;
  if (/^(https?:|mailto:|tel:|data:)/.test(target)) return null;

  const [pathPart, ...hashParts] = target.split('#');
  const hash = hashParts.join('#');
  const clean = pathPart.split('?')[0];

  // Neo trong cùng trang.
  if (!clean) {
    if (hash && !anchorsOf(raw).has(decodeURIComponent(hash))) {
      report('broken-anchor', target, `Không có tiêu đề nào ứng với #${hash} trong trang này.`);
    }
    return null;
  }

  // Ảnh và tệp tĩnh.
  if (ASSET_EXT.test(clean)) {
    const resolved = clean.startsWith('/') ? path.join(publicDir, clean) : path.resolve(path.dirname(file), clean);
    try {
      await access(resolved);
    } catch {
      report('missing-asset', target, `Không có file ${path.relative(root, resolved)}`);
    }
    return null;
  }

  if (!clean.startsWith('/')) {
    report('relative-link', target, 'Link tương đối — luật của repo là đường dẫn tuyệt đối có dấu / ở cuối.');
    return null;
  }

  const normalized = clean.endsWith('/') ? clean : `${clean}/`;
  if (!routes.has(normalized)) {
    report('broken-link', target, `Không có trang nào ứng với ${normalized}`);
    return normalized;
  }
  if (!clean.endsWith('/') && !EXTRA_ROUTES.includes(clean)) {
    report('missing-trailing-slash', target, `Thiếu dấu / ở cuối — viết ${normalized}`);
  }
  if (hash) {
    const destRaw = rawByRoute.get(normalized);
    if (destRaw && !anchorsOf(destRaw).has(decodeURIComponent(hash))) {
      report('broken-anchor', target, `Trang ${normalized} không có tiêu đề ứng với #${hash}`);
    }
  }
  return normalized;
}

function contextFor(file, raw) {
  const lines = raw.split('\n');
  const lineOf = (needle) => {
    const idx = lines.findIndex((l) => l.includes(needle));
    return idx === -1 ? 1 : idx + 1;
  };
  return {
    file,
    raw,
    report: (kind, target, message) =>
      findings.push({ file: path.relative(root, file), line: lineOf(target), kind, target, message }),
  };
}

for (const file of files) {
  const raw = rawByRoute.get(routeOf(file));
  const ctx = contextFor(file, raw);
  const body = stripCodeBlocks(raw);
  const targets = new Set();

  for (const re of [MD_LINK, HTML_HREF, DATA_HREF]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(body))) {
      const dest = await checkTarget(m[1], ctx);
      if (dest) targets.add(dest);
    }
  }
  linkGraph.set(routeOf(file), targets);
}

// Dữ liệu liên kết nằm trong component trang chủ.
const components = await walk(path.join(root, 'src/components'), (name) => /^Home.*\.astro$/.test(name));
for (const file of components) {
  const raw = await readFile(file, 'utf8');
  const ctx = contextFor(file, raw);
  DATA_HREF.lastIndex = 0;
  let m;
  while ((m = DATA_HREF.exec(raw))) await checkTarget(m[1], ctx);
}

// Thư mục có nội dung nhưng thiếu trang gốc → route khu vực trả 404.
const dirsWithContent = new Set();
for (const file of files) {
  let dir = path.dirname(path.relative(docsDir, file)).replace(/\\/g, '/');
  while (dir && dir !== '.') {
    dirsWithContent.add(dir);
    const parent = path.dirname(dir);
    dir = parent === dir ? '' : parent;
  }
}
for (const dir of [...dirsWithContent].sort()) {
  if (!routes.has(`/${dir}/`)) {
    findings.push({
      file: `src/content/docs/${dir}/`,
      line: 0,
      kind: 'missing-section-index',
      target: `/${dir}/`,
      message: `Thư mục có nội dung nhưng thiếu index.md — route /${dir}/ trả 404.`,
    });
  }
}

const inbound = new Set();
for (const targets of linkGraph.values()) for (const t of targets) inbound.add(t);
const orphans = [...routes].filter((r) => r !== '/' && !r.endsWith('.txt/') && !inbound.has(r));

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ pages: files.length, findings, orphans }, null, 2));
  process.exit(findings.length ? 1 : 0);
}

if (findings.length) {
  const byFile = new Map();
  for (const f of findings) {
    if (!byFile.has(f.file)) byFile.set(f.file, []);
    byFile.get(f.file).push(f);
  }
  for (const [file, list] of byFile) {
    console.error(`\n${file}`);
    for (const f of list) console.error(`  ${String(f.line).padStart(4)}  [${f.kind}] ${f.target}\n        ${f.message}`);
  }
}

if (orphans.length && process.argv.includes('--orphans')) {
  console.error(`\nTrang không trang nội dung nào liên kết tới (vẫn có trong sidebar): ${orphans.length}`);
  for (const o of orphans) console.error(`  ${o}`);
}

if (findings.length) {
  console.error(`\nLink check FAILED: ${findings.length} lỗi (đã quét ${files.length} trang, ${routes.size} route).`);
  process.exit(1);
}

console.log(
  `Link check passed: ${files.length} trang, ${routes.size} route${
    orphans.length ? `, ${orphans.length} trang chỉ truy cập qua sidebar (chạy --orphans để xem)` : ''
  }.`,
);
