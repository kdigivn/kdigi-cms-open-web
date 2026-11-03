#!/usr/bin/env node
/**
 * sync-docs.mjs — sao chép tài liệu `docs/` của repo kdigi-cms-open vào khu "Tham khảo kỹ thuật".
 *
 * Nguồn (tiếng Anh, `# H1` đầu trang, không frontmatter, link tương đối giữa các file) →
 * `src/content/docs/en/tham-khao/<slug>.md` + `src/reference.json` (thứ tự sidebar).
 * Bản sao được commit, nên build (Docker/CI) không cần repo nguồn. Chạy lại khi docs nguồn đổi:
 *
 *   pnpm sync:docs                       # nguồn mặc định: ../kdigi-cms-open/docs
 *   node scripts/sync-docs.mjs <đường-dẫn-tới-docs>
 *
 * Quy tắc chuyển đổi:
 *  - Tiêu đề lấy từ `# H1` (bỏ khỏi thân vì Starlight tự vẽ tiêu đề); mô tả = đoạn văn đầu tiên.
 *  - Link tới file .md khác trong docs → `/en/tham-khao/<slug>/`; link tới file/thư mục khác của repo
 *    (mã nguồn, .env.example…) → URL GitHub; link http(s), mailto và neo `#` giữ nguyên.
 *  - Khối code rào (```) không bị đụng tới.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const REPO_URL = 'https://github.com/kdigivn/kdigi-cms-open';
const BRANCH = 'main';
const root = process.cwd();
const sourceDir = path.resolve(process.argv[2] ?? path.join(root, '../kdigi-cms-open/docs'));
const outDir = path.join(root, 'src/content/docs/en/tham-khao');
const ORDER = [
  'readme',
  'getting-started',
  'configuration',
  'deploy',
  'architecture',
  'multi-site',
  'collections',
  'content-markdown',
  'seo',
  'media-storage',
  'rest-api',
  'roles-and-permissions',
  'admin-theming',
  'wordpress-migration',
  'upgrading',
];

if (!existsSync(sourceDir)) {
  console.error(`Không thấy thư mục docs nguồn: ${sourceDir}`);
  process.exit(1);
}

/** Danh sách file .md (đường dẫn tương đối, dùng `/`). */
function walk(dir, base = '') {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    if (statSync(full).isDirectory()) return walk(full, rel);
    return name.endsWith('.md') ? [rel] : [];
  });
}

/** `README.md` → `overview`; `a/README.md` → `a`; `a/b.md` → `a/b`. Chữ thường, kebab-case. */
function slugOf(rel) {
  const noExt = rel.replace(/\.md$/, '');
  if (noExt.toLowerCase() === 'readme') return 'overview';
  return noExt.replace(/\/readme$/i, '').toLowerCase().replace(/[^a-z0-9/]+/g, '-');
}

const files = walk(sourceDir);
const slugByFile = new Map(files.map((rel) => [rel, slugOf(rel)]));

/** Áp `fn` lên từng đoạn ngoài khối code rào. */
function outsideFences(text, fn) {
  let fenced = false;
  return text
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        fenced = !fenced;
        return line;
      }
      return fenced ? line : fn(line);
    })
    .join('\n');
}

function rewriteLink(target, fromRel) {
  if (/^([a-z][a-z0-9+.-]*:|#|\/\/)/i.test(target)) return target;
  const [pathPart, hash = ''] = target.split(/(?=#)/);
  if (!pathPart) return target;
  const fromDir = path.posix.dirname(fromRel);
  const resolved = path.posix.normalize(path.posix.join(fromDir === '.' ? '' : fromDir, pathPart));
  if (slugByFile.has(resolved)) return `/en/tham-khao/${slugByFile.get(resolved)}/${hash}`;
  // Trỏ ra ngoài docs/ → repo gốc (`docs/` + đường dẫn đã chuẩn hoá).
  const repoPath = path.posix.normalize(path.posix.join('docs', fromDir === '.' ? '' : fromDir, pathPart)).replace(/\/$/, '');
  if (repoPath.startsWith('..')) return target;
  const kind = path.posix.extname(repoPath) ? 'blob' : 'tree';
  return `${REPO_URL}/${kind}/${BRANCH}/${repoPath}${hash}`;
}

function description(body) {
  for (const block of body.split(/\n\s*\n/)) {
    const text = block.trim();
    if (!text || /^(#|```|~~~|[-*+]\s|\d+\.\s|\||>|<|!\[)/.test(text)) continue;
    const plain = text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/[`*_]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return plain.length > 180 ? `${plain.slice(0, 177).replace(/\s+\S*$/, '')}…` : plain;
  }
  return '';
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const pages = [];
for (const rel of files) {
  const raw = readFileSync(path.join(sourceDir, rel), 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '');
  const h1 = raw.match(/^#\s+(.+)$/m);
  const slug = slugByFile.get(rel);
  const title = (h1 ? h1[1] : slug).replace(/`/g, '').trim();
  let body = h1 ? raw.replace(h1[0], '').replace(/^\s+/, '') : raw;
  // Không viết lại link ngoài code rào, và bỏ qua code inline là mẫu link (ví dụ `[Title](path)`), không phải link thật.
  body = outsideFences(body, (line) =>
    line
      .split(/(`!?\[[^\]`]*\]\([^)`]*\)`)/)
      .map((part, i) =>
        i % 2 === 1
          ? part
          : part.replace(/(!?\[[^\]]*\])\(([^)\s]+)((?:\s+"[^"]*")?)\)/g, (_, text, target, titleAttr) => `${text}(${rewriteLink(target, rel)}${titleAttr})`),
      )
      .join(''),
  );
  const desc = description(body) || title;
  const out = path.join(outDir, `${slug}.md`);
  mkdirSync(path.dirname(out), { recursive: true });
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(desc)}`,
    `editUrl: ${REPO_URL}/edit/${BRANCH}/docs/${rel}`,
    '---',
    '',
    '',
  ].join('\n');
  writeFileSync(out, `${frontmatter}${body.trimEnd()}\n`);
  pages.push({ slug, title });
}

const rank = (slug) => {
  const base = slug === 'overview' ? 'readme' : slug.split('/')[0];
  const i = ORDER.indexOf(base);
  return i === -1 ? ORDER.length : i;
};
pages.sort((a, b) => rank(a.slug) - rank(b.slug) || a.slug.localeCompare(b.slug));
writeFileSync(
  path.join(root, 'src/reference.json'),
  `${JSON.stringify(
    pages.map(({ slug, title }) => ({ slug: `tham-khao/${slug}`, title: slug === 'overview' ? 'Overview' : title })),
    null,
    2,
  )}\n`,
);
console.log(`sync-docs: ${pages.length} trang từ ${sourceDir}`);
