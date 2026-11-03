---
title: "KDIGI CMS vs Ghost: nền tảng nào cho blog?"
description: "So sánh KDIGI CMS và Ghost cho blog, trang tin: soạn thảo, thành viên, SEO, đa website, tự host, giấy phép. Có bảng và gợi ý khi nào Ghost phù hợp hơn."
h1: "KDIGI CMS vs Ghost: so sánh cho blog và newsletter"
primaryKeyword: "ghost cms"
updated: 2026-11-03
heroImage: /images/shots/editor.webp
heroAlt: "Trình soạn thảo Markdown Milkdown trong KDIGI CMS khi viết một bài blog"
schema: TechArticle
faq:
  - q: "Ghost hay KDIGI CMS tốt hơn cho blog?"
    a: "Nếu bạn muốn một nền tảng xuất bản có sẵn newsletter, thành viên và thanh toán đăng ký, Ghost phù hợp hơn. Nếu bạn muốn quản lý nhiều blog và website bằng một admin, dùng frontend riêng và cần JSON-LD, redirect, mẫu SEO kiểu RankMath trong CMS, KDIGI CMS phù hợp hơn."
  - q: "KDIGI CMS có newsletter và membership như Ghost không?"
    a: "Không. KDIGI CMS không có newsletter, gói thành viên hay thanh toán đăng ký. Nó có bình luận (reCAPTCHA tùy chọn), đánh giá sao và quy trình biên tập. Nếu xuất bản dựa vào thuê bao trả phí hoặc email, hãy chọn Ghost hoặc kết hợp dịch vụ email riêng với frontend của bạn."
  - q: "Ghost có quản lý nhiều website trong một bản cài không?"
    a: "Tài liệu hosting của Ghost mô tả cách chạy và mở rộng một site Ghost (CDN, cache; clustering không được hỗ trợ) và không nêu tính năng quản lý nhiều site trong một bản cài. Muốn nhiều site, thực tế bạn chạy nhiều instance hoặc dùng nhiều site Ghost(Pro). KDIGI CMS gom nhiều website vào một bản cài, mỗi website là một tenant."
  - q: "Ghost và KDIGI CMS cần cơ sở dữ liệu gì?"
    a: "Ghost khuyến nghị MySQL 8.0 hoặc 8.4 cho môi trường production (các cấu hình khác không được hỗ trợ chính thức). KDIGI CMS dùng PostgreSQL, ví dụ image postgres:16-alpine trong file Compose. Hai hệ thống không dùng chung được cơ sở dữ liệu, nên chuyển đổi là chuyển nội dung qua API hoặc xuất nhập."
  - q: "Chuyển nội dung từ Ghost sang KDIGI CMS thế nào?"
    a: "Chưa có công cụ nhập Ghost tự động. Bạn xuất bài viết từ Admin API hoặc tệp xuất JSON của Ghost, chuyển HTML sang Markdown, tạo site, tác giả và chuyên mục tương ứng rồi nhập qua REST của KDIGI CMS, kèm redirect 301 cho URL cũ. Bộ chuyển HTML sang Markdown của repo có thể tái sử dụng."
related:
  - /so-sanh/kdigi-cms-vs-wordpress
  - /giai-phap/blog-tin-tuc
  - /tinh-nang/trinh-soan-thao-markdown
  - /tinh-nang/quy-trinh-bien-tap
  - /so-sanh
docs: https://docs.opencms.kdigi.vn/huong-dan/soan-thao-markdown/
---

Ghost CMS là nền tảng xuất bản độc lập cho blog, newsletter, thành viên và thuê bao trả phí. KDIGI CMS là headless CMS quản lý nhiều website, soạn Markdown, SEO/JSON-LD tích hợp. Chọn Ghost để kinh doanh nội dung bằng thuê bao; chọn KDIGI CMS cho nhiều website và frontend riêng.

> **Tóm tắt nhanh**
> - **Giống nhau:** cả hai là mã nguồn mở giấy phép MIT, chạy Node.js, có API để dùng như headless CMS, có thể tự host.
> - **Ghost mạnh ở:** newsletter, thành viên, thuê bao trả phí, theme, trải nghiệm viết và xuất bản tích hợp; có dịch vụ Ghost(Pro) quản lý sẵn.
> - **KDIGI CMS mạnh ở:** đa website trong một bản cài, Markdown, JSON-LD/mẫu SEO, redirect tự động, lịch nội dung, pipeline chuyển từ WordPress.
> - **Cơ sở dữ liệu:** Ghost khuyến nghị MySQL 8; KDIGI CMS dùng PostgreSQL.
> - **Không có ở KDIGI CMS:** newsletter, membership, thanh toán đăng ký, theme dựng sẵn.
> - **Trưởng thành:** Ghost là sản phẩm lâu năm có cộng đồng lớn; KDIGI CMS phát hành công khai 1.0.0 ngày 2026-11-03.

## Hai sản phẩm, hai bài toán

**Ghost** mô tả mình là công nghệ độc lập cho xuất bản, thành viên, thuê bao và newsletter. Bạn nhận về một sản phẩm khép kín: trình soạn thảo, theme, quản lý thành viên, gửi email và thanh toán. Ghost cũng có Content API và Admin API nên dùng được ở dạng headless.

**KDIGI CMS** không cố làm trọn vòng đời xuất bản kiểu thuê bao. Nó là admin + API để một đội biên tập quản lý nội dung của nhiều website, còn website công khai là frontend riêng (Next.js, Astro, Nuxt…). Với blog, nó có bài viết, chuyên mục, thẻ, tác giả, FAQ, bình luận và đánh giá sao, cùng [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap) gồm lịch nội dung, phiên bản và thùng rác.

## Bảng so sánh

Thông tin Ghost lấy từ README và tài liệu chính thức (mục Nguồn, kiểm tra 2026-11-03).

| Tiêu chí | KDIGI CMS | Ghost |
| --- | --- | --- |
| Định vị | Headless CMS đa website | Nền tảng xuất bản, thành viên, newsletter |
| Giấy phép | MIT | MIT |
| Nền tảng | Payload 3.90, Next.js 15, TypeScript | Node.js |
| Cơ sở dữ liệu | PostgreSQL | MySQL 8.0 hoặc 8.4 là cấu hình được hỗ trợ chính thức |
| Số website mỗi bản cài | Nhiều (collection `sites`) | Tài liệu hosting không nêu tính năng nhiều site; thường chạy mỗi site một instance |
| Giao diện công khai | Không có, tự xây frontend | Theme của Ghost (hoặc headless) |
| Soạn thảo | Markdown (Milkdown), slash menu, shortcode | Trình soạn thảo dạng khối của Ghost |
| API | REST + GraphQL | Content API + Admin API |
| Newsletter / thành viên / thuê bao | Không có | Có sẵn |
| SEO | Mẫu RankMath, JSON-LD `@graph`, audit, link nội bộ, redirect tự động | Có sẵn các trường SEO cơ bản cho theme |
| Bình luận | Có, kèm reCAPTCHA tùy chọn và duyệt | Có tính năng bình luận cho thành viên |
| Mô hình nội dung | Pages, posts, products, landings, taxonomies, authors, FAQs… | Bài viết, trang, thẻ, tác giả |
| Phân quyền | 4 vai trò theo site | Vai trò theo staff của site |
| Tự host | Docker Compose, Coolify, VPS | Ghost-CLI trên Ubuntu hoặc Docker Compose (bản preview cho tính năng mới) |
| Dịch vụ quản lý | Không | Ghost(Pro) |
| Mở rộng quy mô | Một instance; chạy jobs trên đúng một bản | CDN + cache; không hỗ trợ clustering/sharding |

## SEO: khác nhau ở đâu

Ghost cung cấp trường SEO cơ bản và chủ yếu để theme của Ghost xuất ra HTML. Với KDIGI CMS bạn nhận dữ liệu có cấu trúc để frontend dùng: tiêu đề/mô tả theo mẫu cấp site, Open Graph có fallback (ảnh OG → ảnh đại diện → ảnh mặc định của site), robots, canonical, breadcrumbs và một `@graph` JSON-LD gồm `BlogPosting`, `Person`, `WebPage`, `BreadcrumbList`, `WebSite`, `Organization`. Đổi slug tạo redirect 301 tự động. Xem [SEO và JSON-LD](/tinh-nang/seo-json-ld).

Nếu SEO của bạn dựa vào theme Ghost và không cần tùy biến sâu, Ghost cho kết quả nhanh. Nếu bạn muốn kiểm soát đầy đủ HTML và cấu trúc dữ liệu ở frontend riêng, KDIGI CMS cung cấp nhiều "nguyên liệu" hơn.

## Biên tập và nội dung

- **Ghost:** viết, xuất bản, gửi newsletter trong một giao diện; trải nghiệm tối ưu cho người viết độc lập.
- **KDIGI CMS:** nhiều người biên tập, nhiều site. `author` chỉ viết và sửa bài của mình, không được tự đăng (bị chặn ở hook phía server); `editor` đăng bài; `admin` quản lý cài đặt; `super-admin` tạo site và người dùng. Lịch sử phiên bản giữ tối đa 30 bản mỗi bài, có thùng rác và hẹn giờ qua `publishedAt`.

Xem [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung) và [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown).

## Chi phí và vận hành

Tài liệu hosting của Ghost cho biết tính năng sản phẩm giống nhau giữa Ghost(Pro) và tự host; Ghost(Pro) từ 15 USD/tháng, còn tự host có chi phí hosting cơ sở từ 10 USD/tháng cộng thêm các dịch vụ email, CDN, sao lưu nếu cần (giá do Ghost công bố, có thể đã thay đổi). KDIGI CMS không có dịch vụ quản lý; bạn tự host một container Node.js và PostgreSQL, hoặc dùng Coolify. Xem [tự host KDIGI CMS](/tu-host).

## Khi nào chọn Ghost?

1. Bạn kinh doanh bằng **newsletter, thuê bao trả phí hoặc cộng đồng thành viên**.
2. Bạn là **một nhà xuất bản độc lập** với một publication, cần giao diện viết và xuất bản gọn.
3. Bạn muốn **theme sẵn** và dịch vụ **Ghost(Pro)** quản lý hạ tầng.
4. Bạn không cần quản lý nhiều site trong cùng một admin.

## Khi nào chọn KDIGI CMS?

1. Bạn có **nhiều blog/website** và muốn một nơi biên tập chung.
2. Bạn cần **mô hình nội dung rộng hơn blog**: trang, landing, sản phẩm/dịch vụ, FAQ, menu cây.
3. Bạn xây **frontend riêng** và muốn nhận JSON-LD, SEO fields, redirect từ CMS.
4. Bạn ưu tiên **PostgreSQL** và **Markdown** làm nguồn nội dung.
5. Bạn đang **rời WordPress** và cần pipeline nhập.

## Lộ trình chuyển từ Ghost sang KDIGI CMS

Chưa có công cụ nhập Ghost tự động. Quy trình đề xuất:

1. **Xuất dữ liệu** từ Ghost (Admin API hoặc tính năng xuất nội dung của Ghost): bài viết, trang, thẻ, tác giả, ảnh.
2. **Chuẩn bị site đích:** tạo `sites` với `siteKey` và `domain`, tạo tác giả và chuyên mục.
3. **Chuyển HTML sang Markdown** và lưu vào trường `contentMd`.
4. **Nhập** qua REST với API key của người dùng gắn đúng site, truyền `tenant` rõ ràng.
5. **Tạo redirect 301** cho từng URL cũ, giữ `publishedAt` gốc.
6. **Xử lý newsletter/thành viên riêng:** KDIGI CMS không có tính năng này, hãy giữ Ghost hoặc dùng dịch vụ email khác cho phần đó.

Nội dung nhập sẽ không mang theo theme, danh sách thành viên hay lịch sử gửi newsletter.

## Nguồn

Kiểm tra ngày 2026-11-03:

- Ghost, kho mã và README (giấy phép MIT, Ghost(Pro), Content API): <https://github.com/TryGhost/Ghost>
- Ghost Docs, "Hosting Ghost" (MySQL 8.0/8.4, Ghost(Pro) so với tự host, không hỗ trợ clustering): <https://docs.ghost.org/hosting>
- Ghost Docs, "Content API": <https://docs.ghost.org/content-api>
- Ghost, bảng giá Ghost(Pro): <https://ghost.org/pricing/>

KDIGI CMS: [kho mã](https://github.com/kdigivn/kdigi-cms-open), [tài liệu](https://docs.opencms.kdigi.vn), CHANGELOG 1.1.0 (2026-11-03). Sản phẩm thay đổi theo thời gian; hãy đối chiếu trang chính thức trước khi quyết định.
