# Quy trình sản xuất hình ảnh cho cms.kdigi.vn

Dành cho đội KDIGI và trợ lý AI. Phạm vi: **ảnh OG từng trang**, **ảnh đại diện bài blog** (`featuredImage` của KDIGI CMS, tenant 1 `opencms`), **minh hoạ Codex** và **ảnh chụp màn hình thật**. Phong cách minh hoạ: [art-direction.md](art-direction.md). Quy trình thumbnail này là bản chuyển thể từ playbook của khoi.pro (cùng renderer), đổi logo, bảng màu, font và nguồn chữ sang KDIGI CMS.

Nguyên tắc:

1. **Brief trước, dựng sau.** Chữ trên ảnh lấy từ nguồn, không gõ tay lại tiêu đề.
2. **Text từ nguồn thật**: bài blog từ CMS (`https://app.cms.kdigi.vn/api`, tenant 1); trang từ frontmatter `h1`/`title` của `content/pages/**/index.md`.
3. **Renderer chỉ dựng**; AI mở ảnh thật để review 9 tiêu chí; **chủ site duyệt** trước khi dùng cho bài blog đăng chính thức.
4. **Mọi thành phẩm có provenance** (nguồn, SHA-256, ai dựng, khi nào) và review gắn với đúng SHA-256.
5. **Ảnh chụp sản phẩm là chụp thật**, minh hoạ AI không giả làm giao diện sản phẩm, không có chữ trong ảnh AI.

```
brief → dựng (card / page) → review AI Vision (full + 384 + 1.91:1 + 2:1) → chủ site duyệt
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

## 2. Vùng an toàn (đổi so với khoi.pro)

Một file 1920×1080 được dùng ở các chỗ sau, **không chỗ nào cắt vuông**:

| Chỗ dùng | Code | Hiển thị |
| --- | --- | --- |
| Thẻ bài ở `/blog`, chuyên mục, bài liên quan | `components/site/post-card.tsx` | `aspect-video` + `object-cover`: nguyên khung 16:9 |
| Đầu bài viết | `app/blog/[slug]/page.tsx` | nguyên khung 16:9 |
| `og:image` / `twitter:image` | metadata của trang | mạng xã hội cắt giữa: 1.91:1 (1920×1008, y 36–1044) hoặc 2:1 của X (1920×960, y 60–1020) |
| JSON-LD `BlogPosting.image` | trang bài | nguyên file |

khoi.pro có thẻ nổi bật cắt vuông nên safe zone ở đó gồm khung vuông 1080×1080 (x 444–1476); với site này crop đó **không xảy ra**, và giữ nó chỉ làm chữ co lại thành hộp nhỏ giữa khung trống. Vì vậy `safe.square` trong `_style.json` đặt `null` và vùng an toàn là **1.91:1 ∩ 2:1, lề ngang 72 px + lề trong 24 px: x 96–1824, y 84–996**. Renderer từ chối dựng nếu chip, tiêu đề, logo hoặc tên miền vượt vùng này (`safeBox` trong `template.mjs`); `--debug-safe` vẽ các khung 1.91:1, 2:1 và vùng chữ lên ảnh. Hình học và minh hoạ nền được tràn ra ngoài.

## 3. Dựng

Yêu cầu: Node ≥ 22, `google-chrome` (hoặc `CHROME_PATH`), `sharp` (devDependency của `apps/web`).

```bash
cd apps/web

# OG mọi trang (đọc content/pages/**/index.md; giữ chữ nguyên theo h1, tự rơi về title nếu h1 quá dài)
node scripts/images/compose.mjs page --all
node scripts/images/compose.mjs page --route tinh-nang/seo-json-ld          # một trang
node scripts/images/compose.mjs page --route ""                              # trang chủ

# Thumbnail blog từ CMS (title + chuyên mục đầu tiên làm eyebrow)
node scripts/images/compose.mjs card --name <slug>-card-solid --post <slug> --treatment solid
node scripts/images/compose.mjs card --ab --name <slug>-card --post <slug>   # A/B solid + glass (không mặc định)
node scripts/images/compose.mjs card --name <slug>-card --post <slug> --debug-safe

# Lô cho mọi bài đã đăng của tenant 1 (chạy sau khi writer tạo bài)
curl -s 'https://app.cms.kdigi.vn/api/posts?where%5Btenant%5D%5Bequals%5D=1&where%5Bstatus%5D%5Bequals%5D=published&limit=100&depth=0' \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>JSON.parse(s).docs.forEach(d=>console.log(d.slug)))" \
  | while read slug; do node scripts/images/compose.mjs card --name "$slug-card-solid" --post "$slug" --treatment solid || true; done
```

- Chữ: **Ferry VN** (Display Bold cho tiêu đề, Text Regular cho eyebrow/domain), phủ đủ dấu tiếng Việt. Renderer kiểm cmap của font và từ chối dựng nếu thiếu glyph.
- Tiêu đề tự co theo mục "Layout mặc định" bên dưới; quá dài thì sửa trong CMS/frontmatter, không cắt tay.
- `--post` đọc `title` và chuyên mục đầu tiên từ API công khai (tenant 1, bài `published`). Override chữ chỉ khi brief ghi rõ: `--title "..." --reason "brief ngày ..."`.
- Màu, logo, font, lề: `assets/images/_style.json`. Bảng màu lấy từ logo KDIGI: `#4767EC` (xanh), `#0A1020` (navy), cyan `#22D3EE` cho viền sáng của minh hoạ.
- Layout mặc định `wide` (toàn khung, nền sáng, không hộp nổi; chủ site chốt): **logo KDIGI góc trên trái** (lockup xanh, cao 64 px, trong vùng an toàn x ≥ 96, y ≥ 84), chip eyebrow ngay trên tiêu đề, tiêu đề căn trái trong cột x 96 → 1180, cỡ lớn nhất vừa khung trong 84–132 px (tối đa 3 dòng; nếu không vừa thì cho phép 4 dòng, xuống tới 72 px), khối chip + tiêu đề cân giữa theo chiều dọc phần còn lại. **Cột phải là minh hoạ Codex theo chuyên mục**, cao vừa cỡ, nguyên vật thể, cân giữa theo chiều dọc, chỉ được tràn nhẹ mép phải (bảng `categoryArt` trong `_style.json`: SEO → `tinh-nang-seo-json-ld-hero`, WordPress → `chuyen-tu-wordpress-hero`, Headless & API → `tinh-nang-headless-api-hero`, Tự host / Kỹ thuật & Tự host → `tu-host-hero`, So sánh CMS → `so-sanh-hero`, Kiến thức CMS / Hướng dẫn → `tinh-nang-hero`, Bản phát hành → `phat-hanh-hero`; SHA-256 của ảnh ghi vào `sources` của manifest). OG trang dùng chính hero của trang (`<page-key>-hero`) nếu có.
- Không có: hình học chữ K (đã bỏ hẳn), ánh kính mờ, pill tên miền, thứ gì ở góc dưới trái.
- Không ngắt dòng giữa tên thương hiệu/sản phẩm và cặp số + đơn vị (`white-space: nowrap` trong `template.mjs`, biểu thức `NOBREAK`): `KDIGI CMS` (kể cả số phiên bản), cặp `X vs Y`, `Payload CMS`, `headless CMS`, `Core Web Vitals`, `Docker Compose`, `Next.js`, `JSON-LD`, `llms.txt`, `sitemap.xml`, `WordPress`, `15 cách`… Thêm tên mới bằng cách sửa `NOBREAK`.
- Bộ co chữ thử hai kiểu ngắt: `block` (xuống dòng sau dấu `:`, vế sau tô xanh) và `inline` (một đoạn liền); giữ `block` nếu ≥ 96 px và ≥ 80% cỡ của `inline`, ngược lại giữ kiểu cho chữ lớn hơn. Cỡ chữ và kiểu ngắt được ghi vào manifest (`text.titleSize`, `text.titleMode`).
- Treatment mặc định là `solid` (sáng). `glass` (nền navy, logo trắng) vẫn còn trong mã nhưng không dựng mặc định; muốn dựng thì thêm `--treatment glass`. Bố cục cũ có hộp nổi còn dưới `--layout panel`. Dựng một bản sáng: `card --name <slug>-card-solid --post <slug> --treatment solid`.

## 4. Review AI Vision (bắt buộc)

```bash
node scripts/images/compose.mjs review <name>                 # ghi crop vào assets/images/_reviews/_preview/ (gitignore)
node scripts/images/compose.mjs review <name> --save review.json   # { summary, checks: { <tiêu chí>: { pass, note } } }
```

AI **mở đúng file thành phẩm** (`-full`, `-384`, `-191`, `-2to1`) rồi trả lời chín tiêu chí: `diacritics`, `legibility`, `fit-384`, `safe-wide`, `safe-191`, `logo`, `brief`, `rights`, `ab-parity`. Review khoá theo SHA-256, nên dựng lại thì review cũ tự thành lịch sử. **AI pass không phải sự đồng ý của chủ site.** Quyết định của chủ site: `review <name> --owner approved --by "<tên>" --note "..."`.

Với OG từng trang: chủ site duyệt theo lô (ghi `--owner approved` cho từng tên sau khi xem). Chưa duyệt thì `check --strict` báo cảnh báo; `check` thường vẫn xanh.

## 5. Kiểm tra

```bash
node scripts/images/compose.mjs check          # exit 1 nếu thiếu file, sai SHA-256, font/logo nguồn đổi
node scripts/images/compose.mjs check --strict # cảnh báo (thiếu review, stale, chưa duyệt) cũng thành lỗi
```

## 6. Upload thumbnail blog lên CMS

1. Vào https://app.cms.kdigi.vn/admin, chọn website `opencms`, mở **Media**.
2. Kéo thả đúng file đã duyệt trong `assets/images/composed/` (không dùng "Nhập từ URL" cho ảnh nội bộ).
3. Điền **Alt** tiếng Việt, ≤ 125 ký tự, không mở đầu bằng "hình ảnh/ảnh". Với `card`, alt là chữ trên thẻ.
4. Mở bài, chọn media ở **featuredImage**, lưu (kích hoạt revalidate). Trang `/blog/<slug>` dùng ảnh này cho `og:image` và JSON-LD `BlogPosting.image`.
5. Kiểm: `curl -s https://cms.kdigi.vn/blog/<slug> | grep -o '<meta property="og:image"[^>]*>'`.

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
