---
title: "CMS cho website doanh nghiệp chuẩn SEO"
description: "Website doanh nghiệp chuẩn SEO với trang giới thiệu, dịch vụ, tin tức, FAQ và JSON-LD tự động; tự host để kiểm soát dữ liệu và chi phí dài hạn."
h1: "Giải pháp KDIGI CMS cho website doanh nghiệp"
navTitle: "Doanh nghiệp"
primaryKeyword: "website doanh nghiệp chuẩn SEO"
updated: 2026-11-03
heroImage: /images/art/giai-phap-doanh-nghiep-hero.webp
heroAlt: "Toà tháp kính mờ ba tầng với mái xanh, đại diện cho website doanh nghiệp"
schema: WebPage
faq:
  - q: "KDIGI CMS có phù hợp làm website giới thiệu công ty không?"
    a: "Có, nếu bạn chấp nhận mô hình headless. CMS cung cấp trang quản trị và API cho pages, landings, products (trang sản phẩm hoặc dịch vụ), FAQ và menu. Giao diện công khai phải được dựng riêng bằng Next.js, Astro hoặc framework khác. Khi chỉ cần một website đơn giản dựng sẵn, giải pháp này có thể là quá mức."
  - q: "Quy trình duyệt bài hoạt động thế nào?"
    a: "Người dùng vai trò author tạo và sửa bản nháp của chính mình nhưng không thể xuất bản. Editor, admin hoặc super-admin xem lại rồi chuyển trạng thái sang published. Mô hình chỉ có hai trạng thái draft và published (landing thêm archived), nên không có chuỗi duyệt nhiều bước hay trạng thái chờ duyệt riêng."
  - q: "Dữ liệu doanh nghiệp được lưu ở đâu và sao lưu ra sao?"
    a: "Bạn tự host: dữ liệu nằm trong PostgreSQL của bạn, media nằm trên volume cục bộ hoặc bucket Cloudflare R2 của bạn. Sao lưu database bằng pg_dump và sao lưu thêm volume media. Tài liệu triển khai có sẵn lệnh pg_dump, pg_restore và quy trình sao lưu trước mỗi lần nâng cấp."
  - q: "Có chính sách báo lỗi bảo mật không?"
    a: "Có, trong file SECURITY.md của kho mã: báo lỗi riêng tư qua GitHub Security Advisories, không mở issue công khai. Dự án cam kết phản hồi trong 3 ngày làm việc, cập nhật trạng thái trong 10 ngày làm việc, và hướng tới công bố trong tối đa 90 ngày. Bản sửa lỗi dành cho phiên bản 1.x mới nhất."
  - q: "Website song ngữ Việt - Anh được hỗ trợ đến mức nào?"
    a: "Nội dung có hai locale vi và en, mặc định vi. Tiêu đề, nội dung, tóm tắt và văn bản SEO có thể nhập theo từng ngôn ngữ; nếu thiếu giá trị en, API lấy giá trị vi. Truyền tham số locale để chọn ngôn ngữ. Thêm ngôn ngữ thứ ba cần sửa cấu hình mã nguồn."
related:
  - /tinh-nang/quy-trinh-bien-tap
  - /tinh-nang/phan-quyen-nguoi-dung
  - /tinh-nang/seo-json-ld
  - /tu-host
  - /tinh-nang/noi-dung-va-cau-truc
  - /thuc-hanh-tot/seo-onpage
docs: https://docs.opencms.kdigi.vn/tham-khao/deploy/
---

KDIGI CMS phù hợp với website doanh nghiệp cần trang giới thiệu, landing page, trang dịch vụ, tin tức và FAQ do nhiều người biên tập, có phân quyền, lịch sử phiên bản và dữ liệu tự lưu trên hạ tầng của chính bạn. Đây là CMS headless: bạn dựng giao diện công khai riêng.

> **Tóm tắt nhanh**
> - Nội dung công ty nằm trong `pages`, `landings`, `products` (trang sản phẩm/dịch vụ), `posts`, `faqs` và `menus`.
> - Hai ngôn ngữ `vi` và `en`; giá trị `en` bị thiếu sẽ lấy từ `vi`.
> - Vai trò `author` không thể xuất bản; `editor` trở lên duyệt và xuất bản.
> - Mỗi tài liệu giữ tối đa 30 phiên bản, có thùng rác và hẹn giờ đăng qua `publishedAt`.
> - Tự host bằng Docker Compose hoặc Coolify; dữ liệu ở PostgreSQL và media của bạn.

## Cấu trúc nội dung cho website công ty

Các loại nội dung được mô tả ở [nội dung và cấu trúc](/tinh-nang/noi-dung-va-cau-truc):

| Nhu cầu | Collection | Ghi chú |
| --- | --- | --- |
| Giới thiệu, liên hệ, chính sách | `pages` | Slug `gioi-thieu`, `lien-he` được nhận là AboutPage, ContactPage trong JSON-LD |
| Landing chiến dịch | `landings` | Dạng block: hero, content, imageGallery, testimonials, cta, faq, stats, pricingTable, blogFeed, offerCards, embed, divider |
| Dịch vụ, sản phẩm | `products` | Trang sản phẩm hoặc dịch vụ với một dòng giá, đơn vị VND mặc định; không có giỏ hàng hay thanh toán |
| Tin tức, bài chuyên môn | `posts` | Loại `blog`, `news` hoặc `guide` |
| Câu hỏi thường gặp | `faqs` | Nhúng vào tài liệu để sinh FAQPage JSON-LD |
| Điều hướng | `menus` | Cây nhiều cấp |

Phần thân dùng Markdown, xem [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown). Các đoạn dùng lại như thông báo pháp lý có thể đặt trong `shortcodes`.

![Trình soạn thảo bài viết trong KDIGI CMS](/images/shots/editor.webp)

## Quy trình duyệt bài đề xuất

1. **Tạo tài khoản**: super-admin tạo người dùng và gán site ở trường `tenants`.
2. **Phân vai trò**: nhân viên nội dung là `author`; trưởng bộ phận truyền thông là `editor`; người phụ trách website là `admin`.
3. **Soạn thảo**: author tạo `pages`, `posts`, `products` hoặc `landings` ở trạng thái `draft`. Hệ thống ghi `createdBy` và author chỉ sửa được tài liệu của mình.
4. **Duyệt**: editor mở bản nháp, sửa nếu cần, đặt `status = published`. Muốn hẹn giờ, đặt `publishedAt` ở tương lai; tài liệu bị ẩn với truy vấn ẩn danh cho tới thời điểm đó.
5. **Sửa bài đang live**: author không thể sửa tại chỗ hay khôi phục bản đã xuất bản. Editor sửa, hoặc dùng History để xem so sánh và Restore một phiên bản cũ.
6. **Dọn dẹp**: xóa trong admin là chuyển vào thùng rác; chỉ `admin` và `super-admin` được xóa vĩnh viễn.

Chi tiết xem [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap) và [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung).

![Danh sách phiên bản của một bài viết theo thời gian trong trang quản trị](/images/shots/versions-list.webp "Mỗi tài liệu giữ tối đa 30 phiên bản")

![Bảng vai trò và phân quyền](/images/shots/roles.webp)

## Song ngữ vi/en

Cấu hình là `locales: ['vi', 'en']`, mặc định `vi`, `fallback: true`. Tiêu đề, nội dung, tóm tắt, văn bản SEO, câu hỏi FAQ và nhãn menu có thể nhập theo từng ngôn ngữ. Frontend gọi API với `?locale=vi` hoặc `?locale=en`. Trường `defaultLanguage` của site quyết định ngôn ngữ của JSON-LD sinh ra.

## Dữ liệu cho tìm kiếm: knowledgeGraph và JSON-LD

Trong cài đặt site, nhóm `knowledgeGraph` mô tả doanh nghiệp để sinh JSON-LD: `businessType` (`Organization`, `LocalBusiness`, `ProfessionalService`, `Store` hoặc `Restaurant`), tên, tên pháp lý, mô tả, logo, email, điện thoại (chuẩn hóa sang E.164), địa chỉ, tọa độ, giờ mở cửa, năm thành lập, `areaServed`, cùng `socialProfiles` xuất ra `sameAs`. Mỗi văn phòng trong `additionalOffices[]` được phát thành một node `LocalBusiness` trên trang `pages`.

Khi lưu tài liệu, hook sinh một `@graph` lưu vào `seo.jsonLd.raw` để frontend chèn nguyên văn. Mẫu title và description theo `seoTitles` chỉ điền khi trường để trống. Xem [SEO và JSON-LD](/tinh-nang/seo-json-ld). JSON-LD không đảm bảo thứ hạng; nó chỉ cung cấp dữ liệu có cấu trúc.

## Checklist chuẩn SEO

Các mục dưới đây đều là thiết lập có sẵn trong CMS; kết quả xếp hạng còn phụ thuộc nội dung và frontend. Xem thêm [thực hành SEO on-page](/thuc-hanh-tot/seo-onpage).

1. Điền `seoTitles` cho `homepage`, `pages`, `posts`, `products`, `landings` trong cài đặt site.
2. Điền `knowledgeGraph` đầy đủ: tên, logo, điện thoại, địa chỉ, giờ mở cửa, `businessType`.
3. Ánh xạ `pageGroup` cho `ABOUT`, `CONTACT`, `PRIVACY_POLICY` và tạo các trang tương ứng.
4. Mỗi trang có `seo.title`, `seo.description`; để trống thì hệ thống điền từ mẫu.
5. Gắn `faqs` vào trang dịch vụ để sinh FAQPage JSON-LD.
6. Dùng gợi ý liên kết nội bộ và bảng phân tích SEO trong trình soạn thảo.
7. Frontend chèn nguyên văn `seo.jsonLd.raw` vào `<head>`.
8. Đổi slug thì kiểm tra `redirects`: hệ thống tự tạo 301 cho cùng site. Chuyển từ WordPress thì xem [chuyển từ WordPress](/chuyen-tu-wordpress).

Chi tiết các trường ở [SEO và JSON-LD](/tinh-nang/seo-json-ld).

## Sở hữu dữ liệu và vận hành

KDIGI CMS là một server Next.js (cổng 3000) cùng PostgreSQL, chạy bằng Docker Compose, Coolify hoặc VPS bất kỳ ([tự host](/tu-host)). Giấy phép MIT.

- **Sao lưu**: dùng `pg_dump` định kỳ và sao lưu cả volume media. Trong Coolify, database nằm trong Docker Compose không dùng được sao lưu có sẵn; tài liệu hướng dẫn chạy `pg_dump` bằng Scheduled Task hoặc cron trên host.

  ```bash
  docker compose exec -T db pg_dump -U kdigi --format=custom kdigi > kdigi-$(date +%F).dump
  docker compose exec -T db pg_restore -U kdigi -d kdigi --clean --if-exists < kdigi-2026-01-01.dump
  ```

- **Nâng cấp**: đọc CHANGELOG, sao lưu, rồi `git pull && docker compose up -d --build`. Khôi phục bản lỗi bằng cách deploy lại image cũ (nếu hiểu schema hiện tại) hoặc restore bản sao lưu.
- **Media**: ổ đĩa cục bộ mặc định, hoặc Cloudflare R2 theo từng site ([thư viện media](/tinh-nang/thu-vien-media)).

## Chính sách bảo mật

File `SECURITY.md` quy định: báo lỗi riêng qua GitHub Security Advisories, phản hồi trong 3 ngày làm việc, cập nhật trong 10 ngày làm việc, mục tiêu công bố tối đa 90 ngày, sửa lỗi cho `1.x` mới nhất. Danh sách việc cần làm cho người vận hành gồm:

- `PAYLOAD_SECRET` ngẫu nhiên từ 32 ký tự trở lên (môi trường production không khởi động nếu thiếu);
- chạy sau HTTPS, giới hạn truy cập database trong mạng ứng dụng;
- tạo người dùng đầu tiên (tự thành `super-admin`) ngay sau khi triển khai, trước khi mở admin ra internet;
- không chạy demo seed (`SEED_DEMO`) trên bản cài thật.

Giới hạn tốc độ yêu cầu (rate limit) được kỳ vọng đặt ở reverse proxy. Vai trò `super-admin` được tin cậy theo thiết kế.

## Khi nào KDIGI CMS không phù hợp với doanh nghiệp

- **Cần website dựng sẵn ngay.** Không có theme hay giao diện công khai; phải có đội dựng frontend.
- **Cần quy trình duyệt nhiều cấp.** Chỉ có `draft`/`published` và phân quyền theo vai trò; không có bước "chờ duyệt" hay chuỗi phê duyệt tùy biến.
- **Cần bán hàng trực tuyến.** `products` chỉ có một dòng giá; không có giỏ hàng hay thanh toán.
- **Không có người vận hành.** Tự host nghĩa là bạn chịu trách nhiệm sao lưu, cập nhật và bảo mật máy chủ.
- **Cần nhiều hơn hai ngôn ngữ.** Cấu hình hiện có `vi` và `en`.

Dùng thử trang quản trị ở [demo](/demo), hoặc triển khai bản của bạn theo [tự host](/tu-host).
