---
title: SEO và JSON-LD
description: Mẫu title/description theo từng site, ghi đè trên từng bài, JSON-LD tự sinh, kiểm tra SEO và gợi ý liên kết nội bộ.
---

KDIGI CMS có sẵn bộ công cụ SEO theo mô hình quen thuộc của RankMath, gồm ba tầng.

## Ba tầng cấu hình

| Tầng | Nơi cấu hình | Ai chỉnh |
| --- | --- | --- |
| 1. Mẫu theo site | **Sites**: mẫu title/description cho trang chủ, bài viết, trang, sản phẩm, landing, danh mục, kèm dấu phân cách | Quản trị viên, một lần cho cả site |
| 2. Ghi đè theo bài | Nhóm trường `seo` của từng bài viết/trang | Biên tập viên. **Để trống là dùng mẫu** |
| 3. Giải quyết khi hiển thị | Frontend thay biến trong mẫu bằng giá trị thật | Frontend, mỗi lần render |

Các biến mẫu gồm `%title%`, `%sitename%`, `%sep%`, `%excerpt%`, `%category%`, `%focuskw%`, `%date%`, `%modified%`, `%term%`, `%currentyear%`. CMS **cố ý không lưu giá trị đã thay**: đổi mẫu ở cấp site có hiệu lực ngay với mọi bài chưa ghi đè, không cần lưu lại từng bài. Vì vậy `seo.title` rỗng trong REST là bình thường; frontend của bạn cần thay biến khi dựng thẻ `<title>`.

## JSON-LD tự sinh

Mỗi lần lưu bài viết, trang, danh mục hay sản phẩm, CMS dựng sẵn đồ thị JSON-LD (BlogPosting, WebSite, Organization, BreadcrumbList, Person cho tác giả, FAQPage khi bài có FAQ, Product cho sản phẩm…) và lưu trong `seo.jsonLd`. Frontend chỉ việc nhúng nó vào `<script type="application/ld+json">`.

Ảnh Open Graph được chọn theo thứ tự: ảnh OG riêng của bài, ảnh đại diện, rồi ảnh mặc định của site. Bạn cũng đặt được canonical, chỉ thị robots và Twitter card cho từng bài.

## Công cụ trong trang quản trị

- **Kiểm tra SEO (SEO audit)** chấm điểm bài theo từ khoá chính.
- **Gợi ý liên kết nội bộ** đề xuất bài trong cùng site để bạn dẫn link.
- **Breadcrumbs** sinh tự động.
- **Redirects**: quản lý chuyển hướng 301/302 theo site, rất cần khi [chuyển từ WordPress](/wordpress/di-chuyen-tu-wordpress/).
- **AI SEO (tuỳ chọn)**: nút sinh title, description, alt ảnh OG và FAQ bằng AI. Chỉ hoạt động khi bạn đặt `DEEPSEEK_API_KEY`; không đặt thì CMS vẫn dùng bình thường.

Bảng trường đầy đủ ở [SEO reference](/en/tham-khao/seo/) (tiếng Anh).
