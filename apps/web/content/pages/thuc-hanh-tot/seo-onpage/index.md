---
title: "SEO on-page với KDIGI CMS: checklist từng bước"
description: "Checklist SEO on-page thực hành trong KDIGI CMS: title, meta description, heading, canonical, internal link, JSON-LD, sitemap và kiểm tra SEO có sẵn."
h1: "SEO on-page với KDIGI CMS: checklist từng bước"
navTitle: "SEO on-page"
icon: search
lead: "Đặt mẫu tiêu đề một lần cho cả site, điền knowledgeGraph, chạy SEO audit định kỳ. CMS tự làm phần còn lại khi lưu."
primaryKeyword: "seo onpage"
updated: 2026-11-03
heroImage: /images/shots/seo.webp
heroAlt: "Tab SEO của một bài viết trong KDIGI CMS với trường tiêu đề, mô tả, từ khóa chính và bảng chấm điểm SEO"
schema: TechArticle
faq:
  - q: "Vì sao seo.title của bài viết trong API thường để trống?"
    a: "KDIGI CMS dùng mô hình mẫu kiểu Rank Math: tiêu đề và mô tả ghép lúc hiển thị. seo.title trống nghĩa là dùng mẫu của site (Sites.seoTitles), đổi mẫu một lần là mọi bài chưa ghi đè cập nhật."
  - q: "Điểm SEO trong editor có được lưu không?"
    a: "Không. Điểm 0–100 do computeSeoScore tính ở editor và công cụ audit rồi bỏ đi. Nó chỉ là checklist, không phải thứ hạng."
  - q: "Đổi slug có làm mất thứ hạng không?"
    a: "CMS tự tạo redirect 301 từ đường dẫn cũ sang mới. Frontend phải áp danh sách redirect lấy từ /api/redirects; script đổi slug ngoài admin phải tự tạo redirect."
  - q: "JSON-LD có cần plugin hay code thêm không?"
    a: "Không cần plugin. CMS dựng một @graph schema.org mỗi lần lưu, để ở seo.jsonLd.raw. Frontend chỉ chèn nguyên văn vào head."
  - q: "Có bắt buộc dùng AI để viết tiêu đề không?"
    a: "Không. AI SEO chỉ bật khi đặt DEEPSEEK_API_KEY và DEEPSEEK_MODEL. Bạn luôn có thể gõ thủ công hoặc để mẫu của site tự điền."
related:
  - /tinh-nang/seo-json-ld
  - /tinh-nang/noi-dung-va-cau-truc
  - /thuc-hanh-tot/cau-truc-noi-dung
  - /chuyen-tu-wordpress
  - /thuc-hanh-tot/hieu-nang-va-cache
docs: https://docs.cms.kdigi.vn/huong-dan/seo-json-ld/
---

Mẫu tiêu đề và mô tả đặt ở cấp site; từng bài chỉ ghi đè khi cần. Breadcrumb, JSON-LD và redirect khi đổi slug do CMS tự sinh mỗi lần lưu.

> **Tóm tắt nhanh**
> - Tiêu đề và mô tả là mẫu `Sites.seoTitles`, ghép lúc render.
> - Mỗi lần lưu sinh `@graph` JSON-LD vào `seo.jsonLd.raw`.
> - Ảnh OG: ảnh OG riêng → ảnh đại diện → ảnh mặc định.
> - `GET /api/seo/audit` liệt kê tài liệu yếu.

![Tab Trang và SEO của site trong KDIGI CMS với mẫu tiêu đề](/images/shots/site-seo.webp "Mẫu tiêu đề và mô tả cấu hình một lần ở tab Trang & SEO của site")

## :wand-sparkles: Mẫu tiêu đề và mô tả

`Sites.seoTitles` có `separator` và sáu nhóm: `homepage`, `posts`, `pages`, `products`, `landings`, `taxonomies`, mỗi nhóm có `titleTemplate` và `descriptionTemplate`.

| Nhóm | Mẫu tiêu đề mặc định | Mẫu mô tả |
| --- | --- | --- |
| `homepage` | `%sitename%` | `%excerpt%` |
| `posts`, `pages`, `products`, `landings` | `%title% %sep% %sitename%` | `%excerpt%` |
| `taxonomies` | `%term% %sep% %sitename%` | `%excerpt%` |

:::check
- Giữ tiêu đề 40–60 ký tự; rút gọn tên site nếu mẫu quá dài
- Chỉ ghi đè `seo.title` ở trang quan trọng
- Đừng viết script điền `seo.title` cho mọi bài: nó đóng băng giá trị lẽ ra theo mẫu
:::

> **Lưu ý** `seo.title` trống khiến audit báo `missing-title`; hãy đọc là “chưa ghi đè”, không phải “không có title”.

## :tags: Từ khóa chính và slug

Từ khóa đầu tiên trong `seo.focusKeywords` quyết định điểm SEO. Bảng chấm điểm trong editor kiểm tra:

:::check
- Từ khóa trong tiêu đề, mô tả, slug
- Từ khóa trong 10% đầu nội dung
- Mật độ 1–1,5%
- Tiêu đề ≤ 60, mô tả ≤ 160, URL ≤ 75 ký tự
- Có ít nhất một liên kết nội bộ
:::

Slug tự sinh từ tiêu đề (bỏ dấu, `đ` → `d`), không dịch theo ngôn ngữ; hãy chốt slug ngắn trước khi đăng.

## :eye: Open Graph và Twitter Card

Ảnh OG điền lúc đọc qua REST: `seo.openGraph.image` → `featuredImage` → `Sites.seoDefaults.ogImage`, không ghi ngược vào database. `twitterMeta.card` mặc định `summary_large_image`.

> **Mẹo** Đặt `seoDefaults.ogImage` ngay từ đầu để không bài nào chia sẻ thiếu ảnh.

## :code: JSON-LD

Hook sinh `seo.jsonLd.raw`: một thẻ `<script type="application/ld+json">` chứa `@graph`, đã escape `<`.

| Loại tài liệu | Node chính |
| --- | --- |
| Bài viết | `BlogPosting`, `Person`, `WebPage`, `ImageObject`, `BreadcrumbList`, `WebSite`, `Organization` |
| Trang | `WebPage` (`ContactPage`/`AboutPage` cho slug quen thuộc), `FAQPage`, `BreadcrumbList` |
| Sản phẩm / landing | `Product` + `Offer`, `ItemPage`, `FAQPage` |
| Chuyên mục/thẻ | `CollectionPage`, `BreadcrumbList` |

Điền `knowledgeGraph` và `socialProfiles[]` của site để có `Organization` và `sameAs`. Giá trị này rỗng cho đến khi tài liệu được lưu ít nhất một lần. Xem [SEO và JSON-LD](/tinh-nang/seo-json-ld).

## :map: Breadcrumb và redirect

:::cards 2
- :map: **Breadcrumb** Tự sinh khi lưu nếu đang trống: tên site → chuyên mục chính → tài liệu. Chọn taxonomy ở `Sites.breadcrumbs`.
- :refresh-cw: **Redirect 301** Đổi slug tạo dòng `redirects` và job revalidate cho slug cũ. Chuỗi redirect chỉ bị cảnh báo, không bị chặn.
:::

Khi chuyển từ WordPress, permalink cũ được sinh redirect 301 tự động; xem [chuyển từ WordPress](/chuyen-tu-wordpress).

## :link: Liên kết nội bộ

Gõ `@` trong editor để chèn liên kết tới bài/trang/sản phẩm/landing cùng site. Panel gợi ý (`GET /api/seo/internal-link-suggest`) trả tối đa 10 gợi ý. Mục tiêu: mỗi bài có ít nhất 3 liên kết nội bộ có ngữ cảnh, không trang mồ côi. Xem [cấu trúc nội dung](/thuc-hanh-tot/cau-truc-noi-dung).

## :gauge: SEO audit định kỳ

`GET /api/seo/audit` (cần đăng nhập) quét tối đa 200 tài liệu mỗi collection và trả tài liệu yếu nhất trước, kèm `reasons`: `missing-title`, `missing-desc`, `noindex`, `broken-canonical`, `low-score:<n>`.

![Widget SEO audit trên dashboard KDIGI CMS liệt kê tài liệu cần sửa](/images/shots/dashboard-seo-audit.webp "Widget SEO audit ở dashboard: tài liệu yếu nhất hiện trước")

:::steps
- :eye: **Xem widget** Mở dashboard mỗi tuần.
- :x: **Sửa ngay** `noindex` hoặc `broken-canonical`.
- :pen-line: **Làm xanh checklist** Bài `low-score` đang có traffic trước.
- :bot: **Bổ sung trang quan trọng** `missing-title`/`missing-desc`: ghi đè thủ công hoặc dùng AI gợi ý.
:::

## :sparkles: AI SEO (tùy chọn)

Nút AI gọi `POST /api/seo/ai-generate` (đăng nhập, mặc định 20 lần/phút/người) để gợi ý tiêu đề, mô tả, FAQ hoặc alt ảnh bằng DeepSeek. Chỉ bật khi đặt `DEEPSEEK_API_KEY` và `DEEPSEEK_MODEL`; coi đầu ra là bản nháp.

## :list-checks: Checklist trước khi bấm Đăng

:::check
- Từ khóa chính trong `seo.focusKeywords`, tiêu đề, slug, 10% đầu nội dung
- Tiêu đề ≤ 60 ký tự, mô tả ≤ 160 ký tự
- Một H1 duy nhất; mục con H2/H3 theo thứ tự
- Ảnh đại diện và `alt` cho mọi ảnh
- Ít nhất 3 liên kết nội bộ có ngữ cảnh
- Không dính `noindex`; `canonicalOverride` bắt đầu bằng `http`
- FAQ hiển thị ra trang, không chỉ trong JSON-LD
- Sau khi đăng: kiểm tra title, canonical, ảnh OG và JSON-LD trong HTML
:::

Sitemap, `robots.txt` và canonical trong HTML do frontend xuất ra; CMS cung cấp dữ liệu. Thử trên [bản demo](/demo) hoặc [tự host](/tu-host).
