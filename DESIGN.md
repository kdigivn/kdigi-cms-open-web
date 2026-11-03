---
name: KDIGI CMS Open Web
description: Spec giao diện của site giới thiệu và tài liệu KDIGI CMS (opencms.kdigi.vn), dựng trên Astro Starlight, token "Tech Blue · Liquid Glass"; kính chỉ ở header và hộp tìm kiếm.
status: implemented
---

# KDIGI CMS Open Web — Design spec

Spec này mô tả **trạng thái đã triển khai**. Gốc là template docs-site của skill `khoi-system-design`; khác biệt so với template: trang chủ là landing (`template: splash`, `Hero.astro` có nút hành động + lệnh chạy thử, `HomeFeatures`, `HomeSteps`, `HomeBanners`), logo là dấu SVG + tên bằng chữ HTML, minh hoạ hero là SVG viết tay (`src/assets/illustrations/hero*.svg`), khu "Tham khảo kỹ thuật" là bản sao `docs/` của repo CMS (tiếng Anh).

Mọi thay đổi giao diện đi qua cơ chế sẵn có của Starlight: token `--sl-*`, override component trong `astro.config.mjs`, plugin rehype. Không dựng layout riêng.

## Khác với ứng dụng web

| Quy tắc | Ứng dụng web | Site tài liệu |
|---|---|---|
| Kính (glass) | Sidebar, topbar, popover, dialog, command | **Chỉ header và hộp thoại tìm kiếm.** Sidebar, TOC, nội dung, bảng, ảnh chụp, thẻ luôn là bề mặt đặc. |
| Minh hoạ | Empty state, onboarding, landing | **Chỉ hero và thẻ "Bắt đầu nhanh" của trang chủ.** Ảnh trong bài là ảnh chụp màn hình sản phẩm. |
| Tối đa minh hoạ mỗi màn | 1 | Trang chủ: 1 ở hero + 4 thẻ bắt đầu nhanh. Trang bài viết: 0. |

## 1. Nguyên tắc

| Nguyên tắc | Hệ quả |
|---|---|
| Nội dung trước, kính sau | Kính ở chrome (header, tìm kiếm); nội dung đọc luôn trên nền đặc để đảm bảo tương phản. |
| Một nguồn token | Giá trị màu ở `src/styles/tokens.css`; component chỉ dùng `--hd-*` hoặc `--sl-*` đã ánh xạ. |
| Mỗi khu vực một cây | Người đọc chỉ thấy cây tài liệu của khu mình đang đọc (sidebar, phân trang, breadcrumb). |
| Không nói quá sản phẩm | Trang chưa khớp bản triển khai mang `draft_status` và hiện thông báo; ảnh tạm là bản thiết kế. |
| Tiếng Việt trước | Chuỗi giao diện ở `src/content/i18n/vi.json`, bản tiếng Anh ở `en.json`; Ferry VN Text hỗ trợ tiếng Việt. |

## 2. Token

Nguồn duy nhất: `src/styles/tokens.css`. Starlight mặc định là dark nên giá trị dark ở `:root`; light ở `:root[data-theme='light'], [data-theme='light'] ::backdrop` (để cả hộp tìm kiếm, vốn render ngoài `:root`, nhận token).

| Nhóm | Token | Ghi chú |
|---|---|---|
| Bề mặt | `--hd-background`, `--hd-card`, `--hd-popover`, `--hd-secondary`, `--hd-accent` | Nền trang, thẻ/bảng, tiêu đề bảng và hover, mục đang chọn. |
| Chữ | `--hd-foreground`, `--hd-muted-foreground`, `--hd-subtle-foreground` | `subtle` là cỡ chữ nhỏ nhất được phép (≥ 4.9:1). |
| Nhấn | `--hd-primary` (Tech Blue `#1B55E0` / `#6C9CFF`), `--hd-brand` (cyan), `--hd-brand-text`, `--hd-chart-3` (tím) | `--hd-brand` chỉ cho đồ hoạ; chữ cyan dùng `--hd-brand-text`. |
| Ngữ nghĩa | `--hd-success/warning/destructive/info` + `-tint` + `-ink` | Dùng cho aside và thông báo; luôn kèm nhãn hoặc icon. |
| Đường kẻ | `--hd-border`, `--hd-input` | `input` dùng cho viền điều khiển (≥ 3:1). |
| Kính | `--hd-glass-tint`, `--hd-glass-tint-strong`, `--hd-glass-border`, `--hd-glass-shadow`, `--hd-glass-filter` | Chỉ header (`glass`) và hộp tìm kiếm (`glass-strong`). |
| Phông | `--hd-font-sans` (Ferry VN Text), `--hd-font-mono` (Ferry VN Mono) | Tự lưu trữ WOFF2 từ `public/fonts/ferry-vn/1.0.0/`; không dùng CDN. |

Ánh xạ sang Starlight (`--sl-color-*`) nằm cùng file, tường minh cho **cả hai** theme. `--sl-color-accent*` ← `--hd-primary`, `--hd-accent`, `--hd-accent-foreground`.

Ba cơ chế giảm kính, đồng bộ với tokens của ứng dụng: `prefers-reduced-transparency`, `prefers-contrast: more` và thuộc tính `[data-transparency='reduced']` đều đổi `--hd-glass-tint*` thành nền đặc `--hd-popover` và tắt `backdrop-filter`. Trình duyệt không hỗ trợ `backdrop-filter` cũng rơi về nền đặc.

## 3. Bố cục và chữ

| Vùng | Số đo |
|---|---|
| Header | Cao 64px (`--sl-nav-height: 4rem`); kính. |
| Sidebar | 276px (`--sl-sidebar-width: 17.25rem`), nền đặc, viền phải 1px. |
| Cột nội dung | 800px (`--sl-content-width: 50rem`). |
| TOC phải | Cột còn lại của Starlight, danh sách rộng 244px, rail trái 2px. |
| Mốc chia tab khu vực | `64rem`: trên mốc là pill ở header, dưới mốc là danh sách đầu sidebar (trong menu trượt trên mobile). |

Thang chữ: H1 2.5rem (mobile 1.875rem) · H2 1.75rem · H3 1.3125rem · thân 1rem/1.7. Tiêu đề Ferry VN Text 700 (H3 600), `letter-spacing` âm nhẹ. Đoạn đầu trang là lead 1.0625rem, dịu màu. Số tiền, mã số, ngày dùng class `.num` (Ferry VN Mono, tabular + `zero`). Ferry VN Text chứa đủ dấu tiếng Việt.

## 4. Component

### 4.1 Header (`chrome.css`, `Header.astro`, `SiteTitle.astro`)

Một hàng flex: logo + vạch ngăn + nhãn "Docs" · tab khu vực (pill) · khoảng trống · ô tìm kiếm pill · chọn ngôn ngữ (Tiếng Việt / English) · chọn giao diện sáng/tối. Nền kính (`--hd-glass-tint` + `backdrop-filter`), viền dưới và bóng kính. Logo SVG có hai biến thể (`src/assets/brand/logo.svg`, `logo-dark.svg`) đổi theo `data-theme`. Dưới `md`, chọn ngôn ngữ và giao diện nằm ở chân menu trượt.

### 4.2 Tab khu vực (`SectionNav.astro`)

Các khu vực theo `src/sidebar.mjs` (mẫu: **Hướng dẫn**, **API**, **Nhật ký thay đổi**). Dữ liệu từ `Astro.locals.starlightSidebarTopics`. Tab hiện tại nền `--hd-primary` 12% + chữ `--hd-accent-foreground`, đậm.

### 4.3 Sidebar (`chrome.css`, `Sidebar.astro`)

- Nhóm cấp một là tiêu đề IN HOA 12px/700, luôn mở (không bấm thu gọn).
- Nhóm lồng bên trong (module có trang con) có mũi tên, thu gọn mặc định (`collapsed: true`); Starlight tự mở nhóm chứa trang đang đọc.
- Mục hiện tại: nền `--hd-accent`, chữ `--hd-accent-foreground`, đậm.
- Cây sidebar tường minh trong `src/sidebar.mjs`, nhãn tiếng Việt kèm `translations.en`; `scripts/check-docs.mjs` báo trang mồ côi, slug thừa và trang thiếu bản tiếng Anh.

### 4.4 Tìm kiếm (`chrome.css`, Pagefind của Starlight)

- Nút ở header: pill cao 40px. Trang chủ có thêm ô tìm kiếm lớn trong hero, mở cùng hộp thoại.
- Hộp thoại: kính đặc (`--hd-glass-tint-strong`), bo 24px, nền mờ `--hd-scrim` + blur 4px.
- **Tìm không dấu.** Pagefind bỏ dấu thanh và dấu mũ nhưng không đổi `đ` thành `d`, nên "dang nhap" không khớp "Đăng nhập". Khắc phục: `src/plugins/rehype-search-alias.mjs` thêm một `<span hidden>` cuối bài chứa mọi từ có `đ` đã bỏ dấu, và `SearchAlias.astro` làm tương tự cho tiêu đề (trọng số cao). Hệ quả: khi gõ không dấu, đoạn trích của kết quả có thể hiện từ khoá không dấu đó. `scripts/check-dist.mjs` kiểm các truy vấn mẫu trên bản build.
- Chuỗi giao diện của Pagefind (kết quả, không có kết quả…) khai ở `vi.json`/`en.json` (`pagefind.*`). Pagefind tách chỉ mục theo `<html lang>`: trang tiếng Việt chỉ tìm trong bài tiếng Việt, `/en/` chỉ tìm trong bài tiếng Anh.

### 4.5 Breadcrumb và thông báo nháp (`Breadcrumb.astro`, `PageTitle.astro`)

- Breadcrumb: "Tài liệu" (icon sách, về trang chủ) › nhãn khu vực (nếu không phải Hướng dẫn) › nhóm cha › tiêu đề trang. Nhãn nhóm trùng tiêu đề thì bỏ. Có `data-pagefind-ignore` để không lọt vào đoạn trích tìm kiếm.
- Trang có `draft_status: awaiting-implementation` hiện khối cảnh báo vàng dưới tiêu đề: nội dung mô tả theo thiết kế, ảnh là bản thiết kế.
- Dưới tiêu đề (và trong hero trang chủ) có hai nút pill "Sao chép markdown" · "Xem markdown" (`MarkdownActions.astro`), lấy từ `/<slug>.md` do `src/pages/[...slug].md.ts` sinh lúc build.

### 4.6 TOC, aside, bảng, ảnh, code (`content.css`)

- **TOC**: H2–H3; rail trái 2px, mục đang đọc màu `--hd-primary` + vạch trái.
- **Aside**: nền `-tint`, viền 1px cùng sắc, không viền trái dày; `note` ← info, `tip` ← success, `caution` ← warning, `danger` ← destructive.
- **Bảng**: bọc trong `div.hd-table-scroll` bằng `rehype-table-scroll.mjs`; khung bo 14px, tiêu đề nền `--hd-secondary`, chữ nhỏ 13px/650. Hộp cuộn ngang nhận `tabindex="0"` khi thực sự tràn (script ở `Head.astro`).
- **Ảnh**: đứng riêng một dòng thành `<figure class="hd-figure">` có chú thích từ alt text (`rehype-figure.mjs`); khung bo 14px, bóng nhẹ; bấm ảnh mở bản đầy đủ ở tab mới.
- **Code**: Expressive Code, một theme tối cố định (nền `#07112B`, viền `#1E3160`) cho cả hai theme.
- **Mermaid**: tải lười (`public/mermaid-init.js`), màu theo token, nút phóng to.

### 4.7 Trang chủ (`Hero.astro`, `Home*.astro`, `landing.css`)

Hero hai cột (eyebrow tên miền docs, câu hỏi lớn, mô tả, nút markdown, ô tìm kiếm lớn, "Hay tìm:" từ `heroChips`, minh hoạ) → ba thẻ vai trò → bốn thẻ bắt đầu nhanh có minh hoạ → thẻ chủ đề → giới thiệu ngắn. Chữ và link của `Home*.astro` khai theo từng locale (`vi`, `en`) trong chính component. Số "N bài hướng dẫn" của thẻ vai trò **đếm từ collection** theo locale nên không lệch.

Minh hoạ: template dùng SVG placeholder (`src/assets/illustrations/placeholder*.svg`). Thay bằng ảnh thật nền phẳng, mỗi thẻ một cặp ảnh sáng/tối đổi theo `data-theme`; `alt=""` vì tiêu đề kề bên đã đủ nghĩa.

Mọi khối trang chủ mang class `not-content` để thoát khỏi luật `* + *` của markdown Starlight.

## 5. Dark mode

Giữ cả light và dark. Mọi token dùng bởi component có giá trị cho cả hai theme; không hard-code `#fff`/`#000` cho nền. Chữ phụ trên nền tint đã được chọn từ cặp token có tỉ lệ ≥ 4.5:1 ở cả hai theme.

## 6. Accessibility

- Ngưỡng: 4.5:1 cho chữ thường, 3:1 cho chữ lớn và viền/đồ hoạ có nghĩa (theo token).
- Focus ring dùng chung: `outline: 3px solid color-mix(in oklab, var(--hd-primary) 80%, white)`.
- Mọi mục điều hướng đang đọc có `aria-current` (`page` cho sidebar, breadcrumb và tab; `true` cho TOC).
- `prefers-reduced-motion: reduce` tắt chuyển động; `forced-colors: active` giữ viền hệ thống cho thẻ và nút.
- Ảnh trang trí `alt=""`; ảnh chụp màn hình có chú thích mô tả nội dung.

## 7. Nội dung và trạng thái triển khai

| Cơ chế | Chi tiết |
|---|---|
| `draft_status: awaiting-implementation` | Frontmatter tuỳ biến (schema ở `src/content.config.ts`). Đánh dấu trang mô tả theo thiết kế, chưa khớp bản triển khai. |
| Ảnh tạm | Ảnh chụp wireframe ở `src/assets/interim/`. Thay bằng ảnh chụp thật ở `src/assets/screenshots/<module>/` trước khi phát hành. |
| `pnpm docs:check` | `check-docs` (cấu trúc, sidebar), `check-mermaid`, `check-links` (liên kết, neo, ảnh), `check-readability`, `check-drafts` (liệt kê). |
| `pnpm docs:check:release` | `check-drafts --release`: **fail** nếu còn trang nháp hoặc ảnh tạm — cổng trước khi phát hành chính thức. |
| `pnpm docs:check:dist` | Sau `pnpm build`: tệp bắt buộc, sitemap, `llms.txt`, tìm kiếm không dấu. |

Quy tắc viết: đoạn đầu trang là đoạn văn; không H1 trong thân; `title`/`description` chứa `: ` phải bọc nháy; `.md` không dùng component (đổi `.mdx`); liên kết nội bộ dùng đường dẫn tuyệt đối có `/` cuối; không bảng endpoint trong khu API (tra cứu ở Scalar).

## 8. Những gì KHÔNG dùng

| Không dùng | Lý do |
|---|---|
| Tailwind (kể cả `@astrojs/starlight-tailwind`) | Khi thiếu `@tailwindcss/vite`, plugin này làm rỗng token `--sl-color-*` của Starlight. Token được ánh xạ tay. |
| Kính trên sidebar, TOC, nội dung, bảng | Dữ liệu và chữ đọc dài luôn trên bề mặt đặc. |
| Minh hoạ trong bài viết | Ảnh trong bài là ảnh chụp sản phẩm; minh hoạ chỉ ở trang chủ. |
| Gradient chữ (`background-clip: text`) | Khó kiểm tương phản. |
| Google Fonts / CDN phông | Tự lưu trữ Ferry VN trong `public/fonts/` để không chặn render và không phụ thuộc origin khác. |
| Nút liên hệ nổi, widget đánh giá bài | Cần backend hoặc kênh hỗ trợ chính thức — ngoài phạm vi. |

## 9. Triển khai

Build tĩnh `astro build` → `dist/` → nginx trong Docker (`Dockerfile`, `nginx.conf`), chạy trên Coolify, tên miền `opencms.kdigi.vn`. Pagefind chạy sau build (Starlight tự gọi).
