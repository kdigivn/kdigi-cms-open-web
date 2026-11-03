#!/usr/bin/env node
/**
 * check-drafts.mjs — liệt kê trang còn chờ khớp với bản triển khai và ảnh tạm.
 *
 *  - Trang nháp: frontmatter `draft_status: awaiting-implementation`.
 *  - Ảnh tạm: ảnh lấy từ `src/assets/interim/` (bản chụp wireframe) hoặc đường dẫn chứa `wireframes/`.
 *    Trước khi phát hành, thay mọi ảnh tạm bằng ảnh chụp thật ở `src/assets/screenshots/<module>/*.webp`.
 *
 * Mặc định chỉ LIỆT KÊ và thoát 0 (nằm trong `docs:check`, để theo dõi tiến độ).
 * `--release` thoát 1 nếu còn bất kỳ trang nháp hoặc ảnh tạm nào — dùng làm cổng trước khi phát hành
 * tài liệu chính thức.
 *
 * Dùng:  node scripts/check-drafts.mjs [--release] [--json]
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const docsDir = path.join(root, 'src/content/docs');

async function walk(dir, acc = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(full, acc);
    else if (/\.mdx?$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

const INTERIM = /assets\/interim\/[^\s)"']+|[^\s(]*wireframes\/[^\s)"']+/g;

const drafts = [];
const interim = [];

for (const file of await walk(docsDir)) {
  const raw = await readFile(file, 'utf8');
  const rel = path.relative(docsDir, file).replace(/\\/g, '/');
  const frontmatter = raw.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '';
  if (/^draft_status:\s*awaiting-implementation\s*$/m.test(frontmatter)) drafts.push(rel);
  const images = [...raw.matchAll(INTERIM)].map((m) => m[0]);
  if (images.length) interim.push({ file: rel, images });
}

const total = (await walk(docsDir)).length;
const release = process.argv.includes('--release');

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ total, drafts, interim }, null, 2));
} else {
  console.log(`Trang chờ khớp bản triển khai (draft_status: awaiting-implementation): ${drafts.length}/${total}`);
  for (const d of drafts) console.log(`  - ${d}`);
  const imageCount = interim.reduce((n, i) => n + i.images.length, 0);
  console.log(`\nẢnh tạm (wireframe) còn lại: ${imageCount} ảnh trong ${interim.length} trang`);
  for (const i of interim) console.log(`  - ${i.file}: ${[...new Set(i.images)].map((s) => path.basename(s)).join(', ')}`);
}

if (release && (drafts.length || interim.length)) {
  console.error('\nRelease check FAILED: còn trang nháp hoặc ảnh tạm; hoàn tất P17 (ảnh chụp thật) trước khi phát hành.');
  process.exit(1);
}
