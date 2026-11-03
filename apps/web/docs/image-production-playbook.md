# Quy trình sản xuất hình ảnh cho opencms.kdigi.vn

Dành cho đội KDIGI và trợ lý AI. Phạm vi: **ảnh OG từng trang**, **ảnh đại diện bài blog** (`featuredImage` của KDIGI CMS, tenant 1 `opencms`), **minh hoạ Codex** và **ảnh chụp màn hình thật**. Phong cách minh hoạ: [art-direction.md](art-direction.md). Quy trình thumbnail này là bản chuyển thể từ playbook của khoi.pro (cùng renderer), đổi logo, bảng màu, font và nguồn chữ sang KDIGI CMS.

Nguyên tắc:

1. **Brief trước, dựng sau.** Chữ trên ảnh lấy từ nguồn, không gõ tay lại tiêu đề.
2. **Text từ nguồn thật**: bài blog từ CMS (`https://app.opencms.kdigi.vn/api`, tenant 1); trang từ frontmatter `h1`/`title` của `content/pages/**/index.md`.
3. **Renderer chỉ dựng**; AI mở ảnh thật để review 9 tiêu chí; **chủ site duyệt** trước khi dùng cho bài blog đăng chính thức.
4. **Mọi thành phẩm có provenance** (nguồn, SHA-256, ai dựng, khi nào) và review gắn với đúng SHA-256.
5. **Ảnh chụp sản phẩm là chụp thật**, minh hoạ AI không giả làm giao diện sản phẩm, không có chữ trong ảnh AI.

```
brief → dựng (card / page) → review AI Vision (full + 384 + vuông + 1.91:1) → chủ site duyệt
      → (blog) upload CMS + alt → gắn bài → revalidate → kiểm trên trang thật
```

## 1. Bốn nhóm hình ảnh

| Nhóm | Công cụ | Đầu ra | Provenance |
| --- | --- | --- | --- |
| Minh hoạ 3D clay + glass | `node scripts/art/generate.mjs` (Codex `image_gen`) | `public/images/art/<page-key>-hero.webp` (1600×1067), `-sec1.webp` (1200×800), nền trong suốt | `public/images/art/_manifest.json` (prompt, công cụ + phiên bản, ngày, sha256 raw/output, alt) |
| Ảnh chụp thật | Playwright, `/root/khoi-workspace/kdigi/opencms-seed/shots.mjs` | `public/images/shots/<tên>.webp` (rộng 1920) | `public/images/shots/_manifest.json` (nội dung, URL, ngày chụp, sha256) |
| OG từng trang | `node scripts/images/compose.mjs page --all` | `public/images/og/<page-key>.jpg` (1200×630) + `assets/images/composed/page-<page-key>.webp` (1920×1080) | `assets/images/_manifest.json` + `assets/images/_reviews/*.json` |
| Thumbnail blog | `node scripts/images/compose.mjs card --post <slug>` | `assets/images/composed/<slug>-card.webp` (1920×1080) | như trên |

`page-key` = route đổi `/` thành `-` (`/tinh-nang/seo-json-ld` → `tinh-nang-seo-json-ld`, trang chủ → `home`).

## 2. Vùng an toàn

Một file 1920×1080 được dùng với nhiều khung cắt: thẻ blog 16:9 (~384 px), thẻ nổi bật gần vuông, `og:image`/`twitter:image` (1.91:1, X dùng 2:1), JSON-LD (nguyên file). Vùng an toàn cho chữ và logo: **x 444–1476, y 84–996** (vuông giữa ∩ 1.91:1 ∩ 2:1, lề 24 px). Renderer từ chối dựng nếu panel, tiêu đề hoặc logo vượt vùng này (`safeBox` trong `template.mjs`); `--debug-safe` vẽ ba khung lên ảnh. Hình học nền được tràn ra ngoài.

## 3. Dựng

Yêu cầu: Node ≥ 22, `google-chrome` (hoặc `CHROME_PATH`), `sharp` (devDependency của `apps/web`).

```bash
cd apps/web

# OG mọi trang (đọc content/pages/**/index.md; giữ chữ nguyên theo h1, tự rơi về title nếu h1 quá dài)
node scripts/images/compose.mjs page --all
node scripts/images/compose.mjs page --route tinh-nang/seo-json-ld          # một trang
node scripts/images/compose.mjs page --route "" --ab                         # home, A/B solid + glass

# Thumbnail blog từ CMS (title + chuyên mục đầu tiên làm eyebrow)
node scripts/images/compose.mjs card --ab --name <slug>-card --post <slug>
node scripts/images/compose.mjs card --name <slug>-card --post <slug> --treatment glass --geometry 1
node scripts/images/compose.mjs card --name <slug>-card --post <slug> --debug-safe

# Lô cho mọi bài đã đăng của tenant 1 (chạy sau khi writer tạo bài)
curl -s 'https://app.opencms.kdigi.vn/api/posts?where%5Btenant%5D%5Bequals%5D=1&where%5Bstatus%5D%5Bequals%5D=published&limit=100&depth=0' \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>JSON.parse(s).docs.forEach(d=>console.log(d.slug)))" \
  | while read slug; do node scripts/images/compose.mjs card --name "$slug-card" --post "$slug" || true; done
```

- Chữ: **Ferry VN** (Display Bold cho tiêu đề, Text Regular cho eyebrow/domain), phủ đủ dấu tiếng Việt. Renderer kiểm cmap của font và từ chối dựng nếu thiếu glyph.
- Tiêu đề tự co 44–88 px, tối đa 4 dòng. Quá dài thì sửa trong CMS/frontmatter, không cắt tay.
- `--post` đọc `title` và chuyên mục đầu tiên từ API công khai (tenant 1, bài `published`). Override chữ chỉ khi brief ghi rõ: `--title "..." --reason "brief ngày ..."`.
- Màu, logo, font, lề, preset hình học: `assets/images/_style.json`. Bảng màu lấy từ logo KDIGI: `#4767EC` (xanh), `#0A1020` (navy), cyan `#22D3EE` cho hình học.
- Hình học nền là ba mảnh trừu tượng tách từ chữ K của logo (`assets/logo/mark.svg`), cắt quá khung, không bao giờ hiện nguyên chữ K và không thay logo (logo thật luôn ở footer panel).
- Hai treatment: `solid` (panel trắng xanh, logo xanh) và `glass` (kính mờ tối, logo trắng); `--ab` dựng cả hai cùng chữ.

## 4. Review AI Vision (bắt buộc)

```bash
node scripts/images/compose.mjs review <name>                 # ghi crop vào assets/images/_reviews/_preview/ (gitignore)
node scripts/images/compose.mjs review <name> --save review.json   # { summary, checks: { <tiêu chí>: { pass, note } } }
```

AI **mở đúng file thành phẩm** (`-full`, `-384`, `-square`, `-191`) rồi trả lời chín tiêu chí: `diacritics`, `legibility`, `fit-384`, `safe-square`, `safe-191`, `logo`, `brief`, `rights`, `ab-parity`. Review khoá theo SHA-256, nên dựng lại thì review cũ tự thành lịch sử. **AI pass không phải sự đồng ý của chủ site.** Quyết định của chủ site: `review <name> --owner approved --by "<tên>" --note "..."`.

Với OG từng trang: chủ site duyệt theo lô (ghi `--owner approved` cho từng tên sau khi xem). Chưa duyệt thì `check --strict` báo cảnh báo; `check` thường vẫn xanh.

## 5. Kiểm tra

```bash
node scripts/images/compose.mjs check          # exit 1 nếu thiếu file, sai SHA-256, font/logo nguồn đổi
node scripts/images/compose.mjs check --strict # cảnh báo (thiếu review, stale, chưa duyệt) cũng thành lỗi
```

## 6. Upload thumbnail blog lên CMS

1. Vào https://app.opencms.kdigi.vn/admin, chọn website `opencms`, mở **Media**.
2. Kéo thả đúng file đã duyệt trong `assets/images/composed/` (không dùng "Nhập từ URL" cho ảnh nội bộ).
3. Điền **Alt** tiếng Việt, ≤ 125 ký tự, không mở đầu bằng "hình ảnh/ảnh". Với `card`, alt là chữ trên thẻ.
4. Mở bài, chọn media ở **featuredImage**, lưu (kích hoạt revalidate). Trang `/blog/<slug>` dùng ảnh này cho `og:image` và JSON-LD `BlogPosting.image`.
5. Kiểm: `curl -s https://opencms.kdigi.vn/blog/<slug> | grep -o '<meta property="og:image"[^>]*>'`.

## 7. Minh hoạ Codex

```bash
node scripts/art/generate.mjs                    # mọi key trong scripts/art/specs.json chưa có raw
node scripts/art/generate.mjs <key> --force      # sinh lại một key (đổi prompt hoặc ảnh lỗi)
node scripts/art/generate.mjs --no-gen           # chỉ xử lý lại raw đã có (đổi kích thước/ngân sách)
```

`codex exec` chạy `image_gen` dựng PNG nền chroma phẳng vào `scripts/art/raw/` (gitignore); `scripts/art/keyer.py` tách nền, thêm bóng tiếp xúc, căn khung và xuất WebP trong ngân sách (hero ≤ 200 KB). **Mỗi ảnh phải được mở xem** trước khi dùng: loại ảnh có chữ méo, chữ K nguyên vẹn, UI giả, vật thể bị cắt, mép chroma còn sót; ảnh hỏng thì `--force`. Alt tiếng Việt nằm trong `specs.json` và được chép vào manifest; trang dùng ảnh phải đưa alt đó vào `heroAlt`.

## 8. Ảnh chụp thật

`shots.mjs` đăng nhập bằng phiên owner, ẩn email tài khoản, theme sáng, viewport 1440×900 @2x; PNG chuyển WebP (rộng ≤ 1920, < 260 KB) vào `public/images/shots/`. Mỗi ảnh có dòng trong `_manifest.json` (what, url, captured, sha256, `emailMasked`). Chụp lại khi UI đổi; không dùng ảnh AI thay ảnh chụp.

## 9. Bản đồ thư mục

```
apps/web/
  assets/images/_style.json        style OG/thumbnail (màu, logo, font, bố cục, hình học)
  assets/images/_manifest.json     provenance thành phẩm thumbnail/OG
  assets/images/composed/*.webp    1920×1080
  assets/images/_reviews/*.json    review AI theo SHA-256 + quyết định chủ site
  assets/logo, assets/fonts        logo KDIGI, font Ferry VN (OFL)
  scripts/images/                  compose.mjs, template.mjs, chrome.mjs, fonts.mjs
  scripts/art/                     generate.mjs, keyer.py, specs.json, raw/ (gitignore)
  public/images/art|shots|og/      minh hoạ, ảnh chụp thật, OG 1200×630
```
