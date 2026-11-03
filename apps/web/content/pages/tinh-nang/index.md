---
title: "Tính năng KDIGI CMS: đa website, Markdown, SEO, API"
description: "Toàn bộ tính năng KDIGI CMS: quản lý nhiều website, trình soạn Markdown, SEO và JSON-LD, thư viện media, phân quyền, headless API, quy trình biên tập."
h1: "Tính năng của KDIGI CMS"
navTitle: "Tính năng"
primaryKeyword: "tính năng kdigi cms"
updated: 2026-11-03
heroImage: /images/art/tinh-nang-hero.webp
heroAlt: "Lưới các ô kính mờ quanh một ô xanh trung tâm, tượng trưng cho bản đồ tính năng KDIGI CMS"
schema: CollectionPage
faq:
  - q: "KDIGI CMS có những tính năng chính nào?"
    a: "Tính năng chính gồm: quản lý nhiều website trên một bản cài, trình soạn thảo Markdown (Milkdown), SEO tích hợp với JSON-LD, thư viện media, bốn vai trò người dùng, REST và GraphQL, mô hình nội dung phong phú, quy trình biên tập có phiên bản và thùng rác, cùng pipeline chuyển dữ liệu từ WordPress."
  - q: "KDIGI CMS có phải là CMS headless không?"
    a: "Có. KDIGI CMS cung cấp trang quản trị và API REST/GraphQL, không kèm giao diện website công khai. Bạn dựng frontend bằng Next.js, Astro, Nuxt hay ứng dụng di động và lấy nội dung qua API. Khi nội dung đổi, CMS gọi webhook revalidate để frontend làm mới bộ nhớ đệm."
  - q: "KDIGI CMS có hỗ trợ tiếng Việt không?"
    a: "Có. Nội dung hỗ trợ hai ngôn ngữ vi (mặc định) và en với cơ chế fallback, giao diện quản trị có tiếng Việt và tiếng Anh. Trình tạo slug tự bỏ dấu, chữ đ thành d, và bộ chấm điểm SEO được điều chỉnh cho độ dài nội dung tiếng Việt tính theo âm tiết."
  - q: "Tính năng AI SEO có bắt buộc không?"
    a: "Không. AI SEO là tùy chọn và chỉ hoạt động khi bạn cấu hình DEEPSEEK_API_KEY cùng DEEPSEEK_MODEL. Nếu không có khóa, các nút tạo gợi ý vẫn hiển thị nhưng endpoint trả lỗi 502. Mọi tính năng SEO còn lại như mẫu tiêu đề, JSON-LD, kiểm tra SEO đều chạy mà không cần AI."
related:
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/trinh-soan-thao-markdown
  - /tinh-nang/seo-json-ld
  - /chuyen-tu-wordpress
  - /so-sanh
docs: https://docs.opencms.kdigi.vn/
---

KDIGI CMS gồm tám nhóm tính năng: quản lý nhiều website, soạn thảo Markdown, SEO và JSON-LD, thư viện media, phân quyền, API headless, mô hình nội dung và quy trình biên tập. Mọi tính năng dưới đây đều có trong bản MIT 1.1.0 và được mô tả theo đúng tài liệu mã nguồn.

> **Tóm tắt nhanh**
>
> - Một bản cài phục vụ nhiều website; mỗi site có thương hiệu, SEO, menu và (tùy chọn) kho media riêng.
> - Soạn thảo Markdown với Milkdown; API trả HTML đã làm sạch ở đúng khóa gốc.
> - SEO: mẫu tiêu đề kiểu RankMath, JSON-LD `@graph`, kiểm tra SEO, gợi ý liên kết, redirect tự động.
> - Bốn vai trò: `super-admin`, `admin`, `editor`, `author`.
> - REST và GraphQL, webhook revalidate ISR, Docker Compose chạy bằng một lệnh.

## Nhóm 1: Hạ tầng và quản lý website

### Quản lý nhiều website

Collection **Sites** là ranh giới giữa các website: mỗi document là một site với `siteKey`, `domain`, ngôn ngữ mặc định, thương hiệu, thông tin liên hệ, footer, cấu hình SEO và tích hợp GA4/GTM/Clarity. Thêm site mới chỉ là nhập dữ liệu, không cần triển khai lại. Đọc [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website).

![Danh sách website trong KDIGI CMS](/images/shots/sites.webp)

### Phân quyền người dùng

Bốn vai trò xếp từ cao xuống thấp: `super-admin` (toàn quyền mọi site), `admin` (quản lý nội dung và cài đặt trong site được gán), `editor` (biên tập và đăng bài), `author` (viết và sửa bài của mình, không tự đăng). Người dùng được gán vào từng site. Xem [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung).

### Headless API

REST và GraphQL (`/api/graphql`), lọc theo site bằng `where[tenant][equals]=<id>`, Markdown được trả thành HTML đã làm sạch, webhook `POST /api/cms/revalidate` kích hoạt ISR khi nội dung đổi. Xem [Headless API](/tinh-nang/headless-api).

## Nhóm 2: Soạn thảo và nội dung

### Trình soạn thảo Markdown

Milkdown/Crepe với slash menu, chọn liên kết nội bộ bằng `@`, tìm và thay thế, dán nội dung từ Google Docs hoặc Word và chuyển thành Markdown, shortcode dùng lại theo site. Xem [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown).

![Trình soạn thảo Markdown với slash menu](/images/shots/editor-slash.webp)

### Nội dung và cấu trúc

Trang, bài viết, sản phẩm/dịch vụ, landing page dạng block, chuyên mục và thẻ, tác giả, menu dạng cây, FAQ, shortcode, redirect, bình luận (có reCAPTCHA) và đánh giá sao. Nội dung có hai ngôn ngữ `vi` và `en`. Xem [nội dung và cấu trúc](/tinh-nang/noi-dung-va-cau-truc).

### Thư viện media

Thư mục, trình sửa ảnh, nhập ảnh từ URL có chống SSRF, chuyển WebP khi tải lên (site dùng R2). Mặc định lưu trên ổ đĩa, tùy chọn Cloudflare R2 riêng cho từng site. Xem [thư viện media](/tinh-nang/thu-vien-media).

### Quy trình biên tập

Lịch nội dung và bảng điều khiển biên tập, hẹn giờ đăng, lịch sử phiên bản, thùng rác. Xem [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap).

## Nhóm 3: SEO

### SEO và JSON-LD

Mẫu tiêu đề và mô tả theo từng loại nội dung (`%title% %sep% %sitename%`…), trường `seo.*` chuẩn hóa, đồ thị JSON-LD `@graph` sinh khi lưu, Open Graph có fallback, kiểm tra SEO `GET /api/seo/audit`, gợi ý liên kết nội bộ và AI SEO tùy chọn. Xem [SEO và JSON-LD](/tinh-nang/seo-json-ld).

![Tab SEO của bài viết trong KDIGI CMS](/images/shots/seo.webp)

## Nhóm 4: Di chuyển và vận hành

### Chuyển từ WordPress

Pipeline nhập ba giai đoạn (thô → chuẩn hóa → nhập) có cổng duyệt và sao lưu, giữ lại cấu trúc SEO, redirect và gallery. Xem [chuyển từ WordPress](/chuyen-tu-wordpress).

### Tự host

`docker compose up` là chạy; có sẵn `docker-compose.coolify.yml` cho Coolify; container tự áp dụng migration khi khởi động. Xem [tự host](/tu-host).

## Bảng tổng hợp nhanh

| Tính năng | Chi tiết chính | Trang |
| --- | --- | --- |
| Đa website | Sites: `siteKey`, `domain`, thương hiệu, SEO, R2 riêng | [Xem](/tinh-nang/quan-ly-nhieu-website) |
| Markdown | Milkdown, slash menu, shortcode, dán từ Docs/Word | [Xem](/tinh-nang/trinh-soan-thao-markdown) |
| SEO | Mẫu RankMath-style, JSON-LD, audit, AI tùy chọn | [Xem](/tinh-nang/seo-json-ld) |
| Media | Thư mục, sửa ảnh, từ URL, WebP, local/R2 | [Xem](/tinh-nang/thu-vien-media) |
| Phân quyền | 4 vai trò, gán theo site | [Xem](/tinh-nang/phan-quyen-nguoi-dung) |
| API | REST, GraphQL, revalidate | [Xem](/tinh-nang/headless-api) |
| Nội dung | Pages, posts, products, landings, taxonomies, menu | [Xem](/tinh-nang/noi-dung-va-cau-truc) |
| Biên tập | Lịch, phiên bản, thùng rác, hẹn giờ | [Xem](/tinh-nang/quy-trinh-bien-tap) |

## Song ngữ Việt/Anh

Nội dung được lưu theo hai locale `vi` (mặc định) và `en`, có fallback khi bản dịch chưa có. Giao diện quản trị cũng có tiếng Việt và tiếng Anh; đây là hai thiết lập độc lập. Mỗi site còn có `defaultLanguage`, quyết định ngôn ngữ của JSON-LD được sinh ra.

## Khi nào nên chọn KDIGI CMS?

KDIGI CMS hợp với bạn nếu cần quản lý **nhiều website bằng một hệ thống**, ưu tiên SEO có cấu trúc, muốn tự host và kiểm soát dữ liệu, hoặc đang rời WordPress. Nếu bạn cần một giao diện website dựng sẵn và hệ sinh thái theme/plugin, KDIGI CMS không phù hợp vì nó là CMS headless: phần hiển thị bạn tự xây. Để so sánh có nguồn dẫn, xem [trang so sánh](/so-sanh).

## Thử ngay

- [Demo trực tuyến](/demo) với tài khoản biên tập công khai.
- [Tự host bằng Docker](/tu-host) trong vài phút.
- [Tài liệu kỹ thuật](https://docs.opencms.kdigi.vn/) cho từng tính năng.
- Quay lại [trang chủ KDIGI CMS](/) để xem tổng quan dự án.
