---
title: "CMS cho blog tin tức: hẹn giờ, SEO, E-E-A-T | KDIGI CMS"
description: "CMS cho blog tin tức mã nguồn mở: bài blog/news/guide, hẹn giờ đăng, tác giả có sameAs, JSON-LD BlogPosting, bình luận kiểm duyệt, ISR. Giấy phép MIT."
h1: "CMS cho blog và trang tin tức: từ biên tập đến xuất bản"
primaryKeyword: "CMS cho blog tin tức"
updated: 2026-11-03
heroImage: /images/art/giai-phap-blog-tin-tuc-hero.webp
heroAlt: "Minh họa quy trình biên tập blog và trang tin nhiều tác giả trên KDIGI CMS"
navTitle: "Blog và tin tức"
order: 1
schema: WebPage
faq:
  - q: "KDIGI CMS có hẹn giờ đăng bài không?"
    a: "Có. Đặt trạng thái published và điền publishedAt ở tương lai; API công khai ẩn bài cho đến thời điểm đó. Lưu ý giới hạn: bộ nhớ đệm của frontend chỉ được làm mới khi có lượt lưu, không theo đồng hồ, nên bạn cần làm mới trang theo thời gian hoặc revalidate thủ công khi bài đến giờ."
  - q: "Bình luận trên bài viết được kiểm duyệt thế nào?"
    a: "Mọi bình luận gửi qua POST /api/comments/create đều được lưu ở trạng thái pending, chỉ hiện khi biên tập viên chuyển sang approved. Endpoint kiểm tra reCAPTCHA nếu bạn đặt RECAPTCHA_SECRET; điểm thấp chỉ được ghi log chứ không chặn. Có thể gắn MODERATION_WEBHOOK_URL để nhận thông báo bình luận mới."
  - q: "Hệ thống có tự tạo JSON-LD BlogPosting cho bài viết không?"
    a: "Có. Mỗi lần lưu bài, CMS dựng một @graph gồm BlogPosting, Person (tác giả), WebPage, ImageObject, BreadcrumbList và các node của site, rồi lưu vào seo.jsonLd.raw. FAQ gắn vào bài được lồng trong BlogPosting. Frontend chỉ việc chèn chuỗi này vào trang."
  - q: "Đổi slug bài đã đăng có mất thứ hạng không?"
    a: "CMS tự tạo redirect 301 từ đường dẫn cũ sang mới khi bạn đổi slug của bài, trang, sản phẩm hoặc landing, và gửi yêu cầu làm mới cache cho slug cũ. Frontend phải đọc bảng redirects và áp dụng chúng; bản thân CMS không phục vụ trang công khai."
  - q: "Có dán nội dung từ Google Docs hoặc Word được không?"
    a: "Được. Trình soạn thảo Markdown chuyển HTML từ clipboard (Google Docs, Word, trang web) sang Markdown dạng GFM, tự tải ảnh nhúng dạng data: lên thư viện media và gộp thành một bước hoàn tác. Văn bản thuần và Markdown được dán nguyên bản."
related:
  - /tinh-nang/seo-json-ld
  - /tinh-nang/quy-trinh-bien-tap
  - /tinh-nang/trinh-soan-thao-markdown
  - /tinh-nang/phan-quyen-nguoi-dung
  - /chuyen-tu-wordpress
docs: https://docs.opencms.kdigi.vn/huong-dan/seo-json-ld/
---

KDIGI CMS phù hợp làm CMS cho blog tin tức khi bạn cần nhiều tác giả, bài hẹn giờ, SEO theo mẫu và dữ liệu có cấu trúc, còn giao diện công khai tự dựng bằng Next.js hoặc Astro. CMS cung cấp trang quản trị và API; collection `posts` có sẵn ba loại bài `blog`, `news`, `guide`.

> **Tóm tắt nhanh**
> - Collection `posts` với `type` = `blog` | `news` | `guide`, danh mục/thẻ qua `taxonomies`, bài lưu 30 phiên bản và có thùng rác.
> - Bốn vai trò: super-admin > admin > editor > author; author không được xuất bản và chỉ sửa bài của mình.
> - Hẹn giờ bằng `publishedAt` ở tương lai; frontend phải tự làm mới cache khi đến giờ.
> - Mỗi lần lưu sinh JSON-LD `BlogPosting` + `Person` + `BreadcrumbList` trong `seo.jsonLd.raw`.
> - Bình luận luôn vào hàng chờ `pending`; đánh giá sao 1–5 chống trùng theo IP.
> - Không có giao diện công khai dựng sẵn: bạn cần một frontend riêng.

![Danh sách bài viết trong trang quản trị KDIGI CMS](/images/shots/posts-list.webp)

## Bài toán của một tòa soạn nhỏ

Một blog hoặc trang tin nghiêm túc thường cần năm thứ: nhiều người cùng viết với quyền khác nhau, lịch đăng bài, SEO nhất quán trên hàng trăm bài, tín hiệu tác giả đáng tin (E-E-A-T) và khả năng đổi URL mà không mất lượt truy cập. Đây là cách ánh xạ từng nhu cầu vào KDIGI CMS.

## Thiết lập đề xuất

1. **Tạo site và vai trò.** Mỗi trang là một document trong Sites; xem [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website). Gán tổng biên tập là `admin`, biên tập viên là `editor`, cộng tác viên là `author`. Chi tiết quyền ở [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung).
2. **Dựng cây chuyên mục.** Trong Taxonomies tạo `category` có cấp cha–con và `tag`. Đặt `Sites.breadcrumbs.primaryTaxonomyPost` = `category` (giá trị mặc định) để breadcrumb có chuyên mục.
3. **Tạo hồ sơ Authors.** Mỗi người có `name`, `avatar`, `bio` (đa ngôn ngữ) và danh sách `sameAs[].url` trỏ tới LinkedIn, trang cá nhân, hồ sơ báo chí.
4. **Cấu hình mẫu SEO.** Ở `Sites.seoTitles.posts` mặc định là `%title% %sep% %sitename%` cho tiêu đề và `%excerpt%` cho mô tả; bài nào để trống `seo.title` sẽ dùng mẫu này, đổi mẫu là áp dụng cho mọi bài chưa ghi đè.
5. **Chọn loại bài.** `news` cho tin theo thời điểm, `guide` cho bài hướng dẫn dài, `blog` cho phần còn lại; frontend lọc bằng `where[type][equals]`.
6. **Nối webhook revalidate.** Frontend mở `POST /api/cms/revalidate`, CMS đặt `ENABLE_JOBS_AUTORUN=true` trên đúng một instance. Xem [Headless API](/tinh-nang/headless-api).

## Quy trình biên tập

| Bước | Vai trò | Trong CMS |
| --- | --- | --- |
| Viết nháp | author | `status = draft`, `createdBy` tự gán; tác giả tự điền khi tạo nếu email trùng hồ sơ Authors |
| Duyệt, sửa SEO | editor | Sửa bài, kiểm điểm SEO audit, gợi ý liên kết nội bộ |
| Xuất bản / hẹn giờ | editor, admin | `status = published` kèm `publishedAt` |
| Hoàn tác | editor, admin | History + diff, tối đa 30 phiên bản mỗi bài, thùng rác |

Author bị chặn xuất bản bởi hook `enforceAuthorPermissions`, kể cả khi khôi phục phiên bản đã đăng. Bảng điều khiển có tiện ích SEO audit và công cụ lịch nội dung; tổng quan về luồng này ở [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap).

![Lịch nội dung trong trang quản trị KDIGI CMS hiển thị bài viết theo ngày xuất bản](/images/shots/content-calendar.webp "Lịch nội dung (content calendar)")

## Viết nhanh bằng Markdown

Thân bài lưu ở `contentMd` (Markdown, nguồn gốc) và REST trả HTML đã làm sạch ở `content`. Trình soạn thảo có menu `/`, thanh công cụ nổi, tìm và thay thế, và gõ `@` để chèn liên kết tới bài/trang/sản phẩm/landing cùng site. Dán từ Google Docs hoặc Word được chuyển thành Markdown, ảnh nhúng tự tải lên thư viện. Xem [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown) và [thư viện media](/tinh-nang/thu-vien-media).

![Trình soạn thảo Markdown trong KDIGI CMS](/images/shots/editor.webp)

## SEO và E-E-A-T

- **JSON-LD:** bài viết sinh `BlogPosting`, `Person`, `WebPage`, `ImageObject`, `BreadcrumbList`, `WebSite`, `Organization`. Frontend chèn nguyên `seo.jsonLd.raw`. Chi tiết ở [SEO và JSON-LD](/tinh-nang/seo-json-ld).
- **Tác giả:** `Person` lấy từ hồ sơ Authors, nên `sameAs` giúp công cụ tìm kiếm đối chiếu danh tính tác giả.
- **FAQ:** gắn nhóm FAQ vào bài; câu hỏi thiếu đáp án bị loại, phần còn lại nằm trong `BlogPosting`.
- **Audit và gợi ý nội bộ:** `GET /api/seo/audit` liệt kê tài liệu yếu nhất; bộ gợi ý liên kết chấm điểm theo trùng khớp từ khóa trong tiêu đề và slug.
- **AI (tùy chọn):** đặt `DEEPSEEK_API_KEY` để có nút sinh tiêu đề, mô tả, FAQ; không đặt thì tính năng tắt.

## Tương tác độc giả

Bình luận gửi qua `POST /api/comments/create`, luôn lưu `pending`, duyệt thành `approved` hoặc `spam`. Đánh giá sao gửi qua `POST /api/ratings/submit` (1–5), chỉ một lượt mỗi IP mỗi bài, lưu băm SHA-256 của IP. Hai endpoint đều cần frontend của bạn dựng form.

## Hiệu năng và đổi URL

Mỗi lần lưu bài, job `revalidateFrontend` gọi webhook của frontend (thử lại 3 lần). Đổi slug sẽ sinh redirect 301 và làm mới cả slug cũ. Đang dùng WordPress? Pipeline [chuyển từ WordPress](/chuyen-tu-wordpress) giữ `publishedAt`, tác giả, chuyên mục, bình luận, dữ liệu Yoast/RankMath và sinh redirect. So sánh với WordPress ở [KDIGI CMS vs WordPress](/so-sanh/kdigi-cms-vs-wordpress).

## Khi nào KHÔNG phù hợp

- Bạn muốn cài là có theme và widget ngay như WordPress: KDIGI CMS không có theme công khai.
- Cần **thông báo hẹn giờ chính xác đến giây**: bài hiện ở API ngay sau `publishedAt`, nhưng cache frontend không được làm mới theo đồng hồ.
- Cần quy trình duyệt nhiều bước tùy biến: trạng thái chỉ có `draft` và `published`.
- Cần xem lịch sử khi chưa đăng: không dùng Payload `drafts`; mỗi lần lưu là một phiên bản.
- Cần ràng buộc bình luận chặt bằng reCAPTCHA: điểm thấp chỉ ghi log, việc chặn dựa vào hàng chờ `pending`.

Muốn đọc thêm về vận hành nội dung và SEO, xem [blog KDIGI CMS](/blog).

Thử ngay trên [bản demo](/demo) hoặc [tự host bằng Docker Compose](/tu-host).
