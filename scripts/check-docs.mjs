#!/usr/bin/env node
/**
 * check-docs.mjs — cổng chặn lỗi cấu trúc nội dung của site tài liệu.
 *
 * Kiểm:
 *  - Frontmatter có `title`, `description`; giá trị chứa ": " phải bọc nháy (nếu không YAML lỗi, build gãy).
 *  - Không có H1 trong thân trang (Starlight đã render `title`).
 *  - `.md` không dùng cú pháp MDX; `<Steps>` không có phần tử rơi ra ngoài danh sách.
 *  - `draft_status` chỉ nhận giá trị `awaiting-implementation`.
 *  - Mọi trang tiếng Việt xuất hiện đúng một lần trong `src/sidebar.mjs` và mọi slug sidebar có trang.
 *  - Mỗi trang tiếng Việt có bản dịch `en/<slug>`, và bản dịch nào cũng có trang gốc.
 *
 * Dùng:  node scripts/check-docs.mjs
 * Exit:  0 sạch · 1 có lỗi
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { topics } from '../src/sidebar.mjs';

const root = process.cwd();
const docsDir = path.join(root, 'src/content/docs');
const failures = [];

async function walk(dir, filter, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, filter, acc);
    else if (filter(entry.name)) acc.push(full);
  }
  return acc;
}

const relative = (filePath) => path.relative(root, filePath);
const fail = (filePath, message) => failures.push(`${relative(filePath)}: ${message}`);

function parseFrontmatter(content) {
  if (!content.startsWith('---\n')) return null;
  const end = content.indexOf('\n---\n', 4);
  return end === -1 ? null : content.slice(4, end).trim();
}

const hasFrontmatterKey = (frontmatter, key) => new RegExp(`^${key}:\\s*\\S`, 'm').test(frontmatter);

/** Thân trang sau frontmatter, bỏ khối code rào và code inline để không bắt nhầm ví dụ. */
function bodyWithoutCode(content) {
  const body = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  return body.replace(/^(```|~~~)[\s\S]*?^\1\s*$/gm, '').replace(/`[^`\n]*`/g, '');
}

// Component Starlight chỉ chạy trong .mdx. Trong .md, dòng `import` hiện ra thành chữ trên trang
// và thẻ <Steps> bị bỏ qua.
const MDX_ONLY =
  /^import\s.+from\s|<(Steps|LinkCard|LinkButton|Card|CardGrid|Tabs|TabItem|Aside|Badge|FileTree|Icon)\b/m;

/**
 * <Steps> chỉ nhận MỘT danh sách có thứ tự. Ảnh/bảng/đoạn văn thụt lề ít hơn độ rộng ký hiệu
 * bước ("1. " = 3, "10. " = 4) sẽ rơi ra ngoài danh sách và làm build gãy.
 */
function stepsBreakouts(content) {
  const problems = [];
  let inside = false;
  let fence = false;
  let need = 0;
  content.split('\n').forEach((line, index) => {
    const trimmed = line.trim();
    if (/^(```|~~~)/.test(trimmed)) fence = !fence;
    if (trimmed === '<Steps>') {
      inside = true;
      need = 0;
      return;
    }
    if (trimmed === '</Steps>') {
      inside = false;
      return;
    }
    if (!inside || trimmed === '') return;
    const marker = !fence && line.match(/^\d+\.\s+/);
    if (marker) {
      need = marker[0].length;
      return;
    }
    const indent = line.length - line.trimStart().length;
    if (need === 0 || indent < need) problems.push({ line: index + 1, text: trimmed.slice(0, 60) });
  });
  return problems;
}

/** `huong-dan/hop-thu/index.md` → `huong-dan/hop-thu`; `index.mdx` → `index`. */
function slugOf(file) {
  const rel = path.relative(docsDir, file).replace(/\\/g, '/').replace(/\.mdx?$/, '');
  if (rel === 'index') return 'index';
  return rel.endsWith('/index') ? rel.slice(0, -'/index'.length) : rel;
}

function sidebarSlugs(items, acc = []) {
  for (const item of items) {
    if (item.slug) acc.push(item.slug);
    if (item.items) sidebarSlugs(item.items, acc);
  }
  return acc;
}

const files = await walk(docsDir, (name) => /\.mdx?$/.test(name));

for (const file of files) {
  const content = await readFile(file, 'utf8');
  const frontmatter = parseFrontmatter(content);

  if (!frontmatter) {
    fail(file, 'thiếu YAML frontmatter');
    continue;
  }

  for (const key of ['title', 'description']) {
    if (!hasFrontmatterKey(frontmatter, key)) {
      fail(file, `thiếu frontmatter: ${key}`);
      continue;
    }
    const match = frontmatter.match(new RegExp(`^${key}:\\s+(.+)$`, 'm'));
    const value = match?.[1].trim() ?? '';
    if (!/^["']/.test(value) && /:\s/.test(value)) {
      fail(file, `frontmatter "${key}" chứa ": " nhưng không bọc nháy — YAML sẽ parse lỗi và build gãy`);
    }
  }

  const draft = frontmatter.match(/^draft_status:\s*(.*)$/m);
  if (draft && draft[1].trim() !== 'awaiting-implementation') {
    fail(file, `draft_status không hợp lệ: "${draft[1].trim()}" (chỉ nhận awaiting-implementation)`);
  }

  const body = bodyWithoutCode(content);

  if (/^#\s/m.test(body)) {
    fail(file, 'thân trang có H1 (# …) — Starlight đã render title, dùng ## trở xuống');
  }

  if (file.endsWith('.md') && MDX_ONLY.test(body)) {
    fail(file, 'file .md dùng cú pháp MDX (import / component) — đổi đuôi thành .mdx');
  }

  if (file.endsWith('.mdx')) {
    for (const { line, text } of stepsBreakouts(content)) {
      fail(file, `dòng ${line} trong <Steps> thụt lề thiếu, rơi ra ngoài danh sách bước (build sẽ gãy): "${text}"`);
    }
  }
}

// Sidebar ↔ trang.
const inSidebar = sidebarSlugs(topics.flatMap((topic) => topic.items));
const allSlugs = files.map(slugOf);
// Bản tiếng Anh nằm dưới `en/`; `en/index.mdx` là trang chủ tiếng Anh (slug `en`).
const pageSlugs = allSlugs.filter((slug) => slug !== 'en' && !slug.startsWith('en/'));
// `tham-khao/*` chỉ có bản tiếng Anh (bản sao docs/ của repo kdigi-cms-open, do `sync-docs` sinh) và vào sidebar bằng link.
const REFERENCE = 'tham-khao/';
const englishSlugs = allSlugs
  .filter((slug) => slug === 'en' || slug.startsWith('en/'))
  .map((slug) => (slug === 'en' ? 'index' : slug.slice('en/'.length)))
  .filter((slug) => !slug.startsWith(REFERENCE));
const seen = new Set();
for (const slug of inSidebar) {
  if (seen.has(slug)) failures.push(`src/sidebar.mjs: slug xuất hiện nhiều lần: ${slug}`);
  seen.add(slug);
  if (!pageSlugs.includes(slug)) failures.push(`src/sidebar.mjs: slug không có trang tương ứng: ${slug}`);
}
for (const slug of pageSlugs) {
  if (!seen.has(slug)) failures.push(`src/content/docs: trang không có trong sidebar: ${slug}`);
  if (!englishSlugs.includes(slug)) failures.push(`src/content/docs/en: thiếu bản tiếng Anh của ${slug}`);
}
for (const slug of englishSlugs) {
  if (!pageSlugs.includes(slug)) failures.push(`src/content/docs/en: bản tiếng Anh không có trang gốc: ${slug}`);
}

if (failures.length > 0) {
  console.error('Docs check failed:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Docs check passed: ${files.length} trang, ${seen.size} mục sidebar.`);
