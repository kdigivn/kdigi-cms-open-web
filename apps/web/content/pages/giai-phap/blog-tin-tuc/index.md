---
title: "CMS cho blog tin tức: hẹn giờ, SEO, E-E-A-T | KDIGI CMS"
description: "CMS cho blog tin tức mã nguồn mở: bài blog/news/guide, hẹn giờ đăng, tác giả có sameAs, JSON-LD BlogPosting, bình luận kiểm duyệt, ISR. Giấy phép MIT."
h1: "CMS cho blog và trang tin tức: từ biên tập đến xuất bản"
navTitle: "Blog và tin tức"
icon: newspaper
lead: "Nhiều tác giả, bài hẹn giờ, SEO theo mẫu và JSON-LD tự sinh. Giao diện công khai bạn tự dựng."
primaryKeyword: "CMS cho blog tin tức"
updated: 2026-11-03
heroImage: /images/art/giai-phap-blog-tin-tuc-hero.webp
heroAlt: "Minh họa quy trình biên tập blog và trang tin nhiều tác giả trên KDIGI CMS"
order: 1
schema: WebPage
faq:
  - q: "KDIGI CMS có hẹn giờ đăng bài không?"
    a: "Có. Đặt trạng thái published và publishedAt ở tương lai; API công khai ẩn bài đến lúc đó. Cache frontend chỉ làm mới khi có lượt lưu, nên cần revalidate theo thời gian."
  - q: "Bình luận được kiểm duyệt thế nào?"
    a: "Mọi bình luận gửi qua POST /api/comments/create đều ở trạng thái pending, chỉ hiện khi biên tập viên duyệt. Điểm reCAPTCHA thấp chỉ được ghi log, không chặn."
  - q: "Có tự tạo JSON-LD BlogPosting cho bài viết không?"
    a: "Có. Mỗi lần lưu, CMS dựng một @graph gồm BlogPosting, Person, BreadcrumbList… vào seo.jsonLd.raw. Frontend chỉ việc chèn chuỗi này vào trang."
related:
  - /tinh-nang/seo-json-ld
  - /tinh-nang/quy-trinh-bien-tap
  - /tinh-nang/trinh-soan-thao-markdown
  - /tinh-nang/phan-quyen-nguoi-dung
  - /chuyen-tu-wordpress
docs: https://docs.opencms.kdigi.vn/huong-dan/seo-json-ld/
---

Collection `posts` có sẵn ba loại bài `blog`, `news`, `guide`, kèm danh mục, thẻ, tác giả và thùng rác. CMS cung cấp trang quản trị và API; website công khai dựng bằng Next.js hoặc Astro.

> **Tóm tắt nhanh**
> - Mỗi bài lưu tối đa 30 phiên bản, có thùng rác.
> - Author không xuất bản được, chỉ sửa bài của mình.
> - Hẹn giờ bằng `publishedAt` ở tương lai.
> - Mỗi lần lưu sinh JSON-LD `BlogPosting` + `Person`.
> - Cần frontend riêng: không có giao diện dựng sẵn.

![Danh sách bài viết trong trang quản trị KDIGI CMS](/images/shots/posts-list.webp)

## :sparkles: Điểm mạnh cho tòa soạn nhỏ

:::cards
- :users: **Nhiều tác giả** Bốn vai trò; xem [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung).
- :calendar-clock: **Hẹn giờ đăng** Bài hiện ở API ngay sau `publishedAt`.
- :search: **SEO theo mẫu** Mẫu `Sites.seoTitles.posts` áp cho mọi bài chưa ghi đè.
- :pen-line: **Soạn Markdown** Menu `/`, gõ `@` chèn liên kết nội bộ. Xem [trình soạn thảo](/tinh-nang/trinh-soan-thao-markdown).
- :history: **Hoàn tác** Lịch sử, so sánh và khôi phục phiên bản.
- :link: **Đổi slug an toàn** Tự tạo redirect 301 và làm mới slug cũ.
:::

## :list-checks: Thiết lập đề xuất

:::steps
- :users: **Tạo site và vai trò** Tổng biên tập `admin`, biên tập viên `editor`, cộng tác viên `author`.
- :tags: **Dựng chuyên mục** Tạo `category` có cấp cha–con và `tag` trong Taxonomies.
- :heart-handshake: **Tạo hồ sơ Authors** Điền `bio`, `avatar` và `sameAs[]` trỏ tới LinkedIn hoặc trang cá nhân.
- :search: **Đặt mẫu SEO** Mặc định `%title% %sep% %sitename%`; bài để trống `seo.title` dùng mẫu này.
- :refresh-cw: **Nối revalidate** Frontend mở `POST /api/cms/revalidate`; đặt `ENABLE_JOBS_AUTORUN=true` trên một instance.
:::

## :workflow: Quy trình biên tập

| Bước | Vai trò | Trong CMS |
| --- | --- | --- |
| Viết nháp | author | `status = draft` |
| Duyệt, sửa SEO | editor | SEO audit, gợi ý liên kết nội bộ |
| Xuất bản / hẹn giờ | editor, admin | `status = published` + `publishedAt` |
| Hoàn tác | editor, admin | History + diff, tối đa 30 phiên bản |

![Lịch nội dung trong trang quản trị KDIGI CMS hiển thị bài viết theo ngày xuất bản](/images/shots/content-calendar.webp "Lịch nội dung (content calendar)")

Chi tiết ở [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap).

## :shield-check: SEO và E-E-A-T

:::check
- JSON-LD: `BlogPosting`, `Person`, `BreadcrumbList`
- `sameAs` của tác giả giúp đối chiếu danh tính
- FAQ gắn vào bài, lồng trong `BlogPosting`
- `GET /api/seo/audit` liệt kê tài liệu yếu nhất
:::

Xem [SEO và JSON-LD](/tinh-nang/seo-json-ld). AI gợi ý tiêu đề, mô tả chỉ bật khi đặt `DEEPSEEK_API_KEY`.

## :heart-handshake: Bình luận và đánh giá

Bình luận gửi qua `POST /api/comments/create`, luôn `pending` rồi duyệt thành `approved` hoặc `spam`. Đánh giá sao 1–5 qua `POST /api/ratings/submit`, một lượt mỗi IP mỗi bài. Frontend của bạn tự dựng form.

## :scale: Khi nào không phù hợp

:::pros-cons
**Ưu điểm**
- Nhiều tác giả, hẹn giờ, SEO và JSON-LD sẵn có
- Chuyển từ WordPress giữ tác giả, bình luận, dữ liệu Yoast/RankMath

**Hạn chế**
- Không có theme và widget dựng sẵn
- Cache frontend không làm mới theo đồng hồ khi bài đến giờ
- Chỉ có hai trạng thái `draft` và `published`
- Điểm reCAPTCHA thấp chỉ ghi log, không chặn
:::

Đang dùng WordPress? Xem [chuyển từ WordPress](/chuyen-tu-wordpress). Thử trên [bản demo](/demo) hoặc [tự host](/tu-host).
