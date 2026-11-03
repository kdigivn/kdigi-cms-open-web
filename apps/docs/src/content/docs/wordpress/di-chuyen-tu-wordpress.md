---
title: Di chuyển từ WordPress
description: Chuyển bài viết, trang, taxonomy, media, SEO (Yoast, RankMath), menu, bình luận và redirect từ bất kỳ site WordPress nào sang KDIGI CMS bằng pipeline có bước duyệt trước khi ghi dữ liệu.
---

KDIGI CMS có sẵn pipeline di chuyển nội dung từ **bất kỳ site WordPress nào**. Nguyên tắc: **không ghi gì vào database cho đến khi bạn đã rà soát và khoá dữ liệu trung gian.** Pipeline chạy bằng lệnh trong repo, không cần cài plugin lên WordPress, và chạy lại được nhiều lần mà không tạo bản ghi trùng.

## Những gì được chuyển

| Từ WordPress | Sang KDIGI CMS |
| --- | --- |
| Bài viết, trang | `posts`, `pages`: nội dung đổi sang Markdown, giữ ngày xuất bản |
| Danh mục, thẻ, taxonomy tuỳ biến | `taxonomies`, giữ cây cha/con |
| Thư viện media | `media`, tải file về và lưu vào [thư viện media](/huong-dan/thu-vien-media/) |
| Menu | `menus` nhiều cấp |
| Tác giả | `authors` |
| Bình luận | `comments`, bình luận spam giữ trạng thái `spam` |
| Yoast SEO hoặc RankMath | Nhóm `seo` của từng bài: title, description, canonical, robots, Open Graph, Twitter, từ khoá chính |
| Permalink cũ | `redirects` 301 tự sinh khi đường dẫn đổi |
| Sản phẩm WooCommerce (tuỳ chọn) | `products` |

**Không** chuyển: giao diện (theme), plugin, cấu hình form, tài khoản đăng nhập WordPress, nội dung do page builder lưu ngoài nội dung bài.

## Quy trình

```text
WordPress  →  raw/ (bản chụp nguồn)  →  staged/ (JSON sửa được)  →  duyệt + khoá  →  Payload
```

1. **Archive**: tải bản chụp nguồn. Dùng WPGraphQL nếu site có, nếu không thì dùng REST API chuẩn của WordPress (chạy được trên mọi site). Thêm *Application Password* nếu cần lấy media riêng tư hoặc menu.
2. **Normalize**: chuyển bản chụp thành các file JSON `staged/`, mỗi mục một file. HTML đổi sang Markdown, dữ liệu SEO của Yoast hoặc RankMath gom về một schema chung.
3. **Duyệt (gate)**: bạn đọc và sửa các file `staged/` (slug, taxonomy, ảnh, liên kết, canonical), chạy `--gate lint` cho sạch rồi `--gate lock` để khoá bằng một mã băm nội dung. Sửa `staged/` sau khi khoá thì khoá mất hiệu lực.
4. **Import**: chạy các phase `schema → seed → taxonomy → content → media → seo → nav → comments → redirects`. Mỗi phase kiểm lại khoá. Có `--dry-run` để xem trước.

Ví dụ lệnh khởi đầu, chạy từ thư mục repo CMS:

```bash
node --env-file=.env --import tsx src/importers/run-wp-migration.ts \
  --site my-blog --wp-url https://wp.example.com --domain www.example.com --archive
```

`--site` là `siteKey` của website nhận nội dung trong KDIGI CMS. Các lệnh cho từng bước nằm trong [runbook](/en/tham-khao/wordpress-migration/runbook/).

## An toàn dữ liệu

- Database không phải máy local luôn bị buộc `pg_dump` trước khi ghi, và không có cờ bỏ qua bước này.
- Site mới tạo dừng sau phase `seed` để bạn cấu hình lưu trữ media (R2, nếu dùng) rồi mới nhập tiếp.
- Nhập thành công không có nghĩa website đã giống bản cũ. Hãy đối chiếu URL, canonical, JSON-LD và ảnh trước khi chuyển tên miền.

## Sau khi nhập

1. So sánh danh sách URL và sitemap của site cũ với site mới; mọi URL đổi hoặc mất phải có redirect.
2. Kiểm tra canonical, meta, Open Graph và [JSON-LD](/huong-dan/seo-json-ld/).
3. Kiểm tra ảnh hiển thị đúng và liên kết nội bộ không trỏ về tên miền WordPress cũ.
4. Trỏ tên miền sang frontend mới.

Phần quyết định cho từng cách dùng WordPress (Yoast hay RankMath, Gutenberg hay Elementor, WooCommerce, đa ngôn ngữ, thư viện media lớn) và các lỗi đã biết nằm trong [playbook](/en/tham-khao/wordpress-migration/playbook/). Tổng quan đầy đủ: [WordPress migration](/en/tham-khao/wordpress-migration/) (tiếng Việt kèm tóm tắt tiếng Anh).
