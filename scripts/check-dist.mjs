#!/usr/bin/env node
/**
 * check-dist.mjs — kiểm bản build (`dist/`) sau `pnpm build`.
 *
 *  - File bắt buộc: index.html, 404.html, sitemap-index.xml, llms.txt, robots.txt, favicon.svg, pagefind/.
 *  - Sitemap có URL của site thật; llms.txt liệt kê trang của mọi khu vực, cả bản tiếng Anh, và trỏ tới file `.md` có thật.
 *  - Mọi trang HTML nội dung có markdown thô tương ứng (`/a/b/index.html` → `/a/b.md`, `/index.html` → `/index.md`)
 *    cho nút "Sao chép markdown" / "Xem markdown".
 *  - Tìm kiếm Pagefind không phân biệt dấu: "dang nhap lan dau" phải ra trang có "Đăng nhập lần đầu"
 *    (cả khi gõ có dấu, và với chữ đ). Xem DESIGN.md §Tìm kiếm. Đổi SITE và SEARCH_CASES theo nội dung thật.
 *
 * Dùng:  node scripts/check-dist.mjs
 * Exit:  0 sạch · 1 có lỗi
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = path.join(process.cwd(), 'dist');
const SITE = 'https://opencms.kdigi.vn/';
const problems = [];

for (const name of ['index.html', '404.html', 'sitemap-index.xml', 'llms.txt', 'robots.txt', 'favicon.svg']) {
  if (!existsSync(path.join(dist, name))) problems.push(`thiếu dist/${name}`);
}
if (!existsSync(path.join(dist, 'pagefind/pagefind.js'))) problems.push('thiếu dist/pagefind/pagefind.js (chỉ mục tìm kiếm)');

if (problems.length === 0) {
  const sitemap = readdirSync(dist)
    .filter((f) => /^sitemap-\d+\.xml$/.test(f))
    .map((f) => readFileSync(path.join(dist, f), 'utf8'))
    .join('\n');
  if (!sitemap.includes(SITE)) problems.push(`sitemap không chứa URL ${SITE}`);

  const llms = readFileSync(path.join(dist, 'llms.txt'), 'utf8');
  for (const heading of ['## Hướng dẫn', '## Di chuyển WordPress', '## API', '# English', '## Guides', '## Technical reference']) {
    if (!llms.includes(heading)) problems.push(`llms.txt thiếu mục "${heading}"`);
  }
  for (const [, mdPath] of llms.matchAll(/\]\(https?:\/\/[^/]+(\/[^)]+\.md)\)/g)) {
    if (!existsSync(path.join(dist, mdPath))) problems.push(`llms.txt trỏ tới ${mdPath} nhưng dist không có file đó`);
  }

  // Trang nội dung = mọi index.html trừ trang redirect của Astro (có <meta http-equiv="refresh">) và 404.
  const htmlPages = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) {
        if (!['_astro', 'pagefind'].includes(name)) walk(full);
      } else if (name === 'index.html' && !readFileSync(full, 'utf8').includes('http-equiv="refresh"')) {
        htmlPages.push(path.relative(dist, path.dirname(full)).replace(/\\/g, '/'));
      }
    }
  };
  walk(dist);
  for (const route of htmlPages) {
    const md = route === '' ? 'index.md' : `${route}.md`;
    if (!existsSync(path.join(dist, md))) problems.push(`/${route ? `${route}/` : ''} thiếu markdown thô dist/${md}`);
  }
  if (htmlPages.length === 0) problems.push('không tìm thấy trang HTML nào trong dist');
  else console.log(`ok   ${htmlPages.length} trang HTML đều có file .md`);
}

/**
 * [truy vấn, URL kết quả phải nằm trong top 5] theo ngôn ngữ: Pagefind tách chỉ mục theo `<html lang>`.
 * Tiếng Việt gồm cả từ có "đ" (Pagefind không tự đổi đ → d).
 */
const SEARCH_CASES = {
  vi: [
    ['bat dau nhanh', '/huong-dan/bat-dau-nhanh/'],
    ['Di chuyển từ WordPress', '/wordpress/di-chuyen-tu-wordpress/'],
    ['soan thao markdown', '/huong-dan/soan-thao-markdown/'],
    ['vai tro phan quyen', '/huong-dan/vai-tro-phan-quyen/'],
  ],
  en: [
    ['quick start docker compose', '/en/huong-dan/bat-dau-nhanh/'],
    ['rest graphql headless', '/en/api/rest-graphql/'],
    ['media storage', '/en/tham-khao/media-storage/'],
  ],
};

if (problems.length === 0) {
  const pagefind = await import(pathToFileURL(path.join(dist, 'pagefind/pagefind.js')).href);
  // Node không có `fetch` tới đường dẫn tương đối; trỏ Pagefind vào hệ thống tệp của dist.
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url.startsWith('/pagefind/')) {
      const file = path.join(dist, url.split('?')[0]);
      const buf = readFileSync(file);
      return new Response(buf, { status: 200 });
    }
    return realFetch(input, init);
  };

  for (const [lang, cases] of Object.entries(SEARCH_CASES)) {
    // Pagefind chọn chỉ mục theo `document.querySelector('html').getAttribute('lang')`; Node không có DOM
    // nên giả lập đúng thuộc tính đó cho từng ngôn ngữ.
    globalThis.document = { querySelector: () => ({ getAttribute: () => lang }) };
    const search = pagefind.createInstance({ basePath: '/pagefind/', baseUrl: '/' });
    await search.init();
    for (const [query, expected] of cases) {
      const { results } = await search.search(query);
      const urls = [];
      for (const result of results.slice(0, 5)) urls.push((await result.data()).url);
      const hit = urls.some((url) => url === expected || url === expected.replace(/\/$/, ''));
      console.log(`${hit ? 'ok  ' : 'FAIL'} [${lang}] "${query}" → ${urls[0] ?? '(không có kết quả)'}`);
      if (!hit) problems.push(`[${lang}] tìm "${query}" không ra ${expected} trong top 5 (nhận: ${urls.join(', ') || 'không có'})`);
    }
    await search.destroy();
  }
  delete globalThis.document;
}

if (problems.length) {
  console.error(`\n✗ ${problems.length} vấn đề:`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log('✓ dist hợp lệ: tệp bắt buộc, sitemap, llms.txt, markdown thô, tìm kiếm vi (không dấu) và en.');
