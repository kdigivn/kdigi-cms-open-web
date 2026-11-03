#!/usr/bin/env node
/**
 * check-readability.mjs — cổng chặn trang khó đọc.
 *
 * Kiểm những thứ người đọc thật sự cần thay vì đếm số dòng (ngưỡng số dòng khiến trang bị độn chữ).
 *
 * Luật:
 *   Mọi trang (trừ trang chủ splash), cả tiếng Việt và `en/` — mở đầu bằng một đoạn văn (không phải tiêu đề, bảng, sơ đồ, callout, danh sách, ảnh).
 *
 * Dùng:  node scripts/check-readability.mjs [--json]
 * Exit:  0 đạt · 1 có trang chưa đạt
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

const body = (source) => source.replace(/^---\n[\s\S]*?\n---\n/, '');

/** Dòng nội dung đầu tiên, bỏ qua dòng trống và dòng import của MDX. */
const firstContentLine = (text) =>
  text.split('\n').find((line) => line.trim() !== '' && !/^import\s/.test(line)) ?? '';

const failures = [];
const report = [];

for (const file of await walk(docsDir)) {
  const rel = path.relative(docsDir, file).replace(/\\/g, '/');
  const source = await readFile(file, 'utf8');
  // Trang chủ là landing (template splash) có hero, không phải bài đọc.
  if (/^template:\s*splash/m.test(source)) continue;

  const text = body(source);
  const withoutFences = text.replace(/^(```|~~~)[\s\S]*?^\1\s*$/gm, '');
  const problems = [];

  const first = firstContentLine(text);
  if (/^(#|\||```|~~~|:::|[-*+]\s|\d+\.\s|!\[|<)/.test(first.trim())) {
    problems.push('không mở đầu bằng đoạn văn giới thiệu');
  }

  report.push({ file: rel, problems });
  if (problems.length) failures.push({ file: rel, problems });
}

if (process.argv.includes('--json')) {
  // exitCode thay vì exit(): exit() cắt ngang stdout khi đang pipe sang tiến trình khác.
  console.log(JSON.stringify({ total: report.length, failures: failures.length, report }, null, 2));
  process.exitCode = failures.length ? 1 : 0;
} else if (failures.length) {
  for (const f of failures) console.error(`${f.file}\n  ${f.problems.join(' · ')}`);
  console.error(`\nReadability check: ${report.length - failures.length}/${report.length} trang đạt. ${failures.length} trang chưa đạt.`);
  process.exitCode = 1;
} else {
  console.log(`Readability check passed: ${report.length} trang.`);
}
