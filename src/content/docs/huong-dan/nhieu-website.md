---
title: Nhiều website
description: Quản lý nhiều website trong một bản cài KDIGI CMS. Mỗi site có nội dung, tên miền, thương hiệu, SEO và thành viên riêng.
---

KDIGI CMS xây theo mô hình đa website (multi-site). Một bản cài phục vụ nhiều website độc lập: blog cá nhân, site khách hàng của agency, trang sản phẩm. Mỗi website là một bản ghi trong collection **Sites**.

## Mỗi site có gì

- Tên miền, thương hiệu và cấu hình hiển thị.
- Mẫu SEO riêng (title, description, dấu phân cách, biến như `%title%`, `%sitename%`).
- Tuỳ chọn lưu media trên Cloudflare R2 (không cấu hình thì dùng đĩa máy chủ).
- Nội dung riêng: bài viết, trang, danh mục, menu, FAQ, shortcode, redirect, bình luận.
- Danh sách thành viên được phép làm việc trên site đó.

Thêm một site mới chỉ cần tạo bản ghi **Sites** trong trang quản trị, không phải triển khai lại CMS. Frontend, tên miền và CDN của site vẫn do bạn cấu hình.

## Làm việc với nhiều site

Người dùng thuộc nhiều site chọn site đang làm việc ngay trong trang quản trị; danh sách nội dung được lọc theo site đó. Super admin thấy mọi site.

## Lấy nội dung theo site từ frontend

Quyền đọc công khai chỉ lọc theo trạng thái xuất bản, **không** lọc theo site. Frontend phải luôn thêm điều kiện site vào truy vấn, nếu không sẽ lẫn nội dung của các website khác nhau:

```bash
curl "https://cms.example.com/api/posts?where[tenant][equals]=<site-id>"
```

Trong code, "site" được gọi là `tenant`. Xem thêm [Vai trò và phân quyền](/huong-dan/vai-tro-phan-quyen/) và [mô hình multi-site](/en/tham-khao/multi-site/) (tiếng Anh).
