---
title: Bắt đầu nhanh
description: Chạy KDIGI CMS trên máy bạn trong vài phút bằng Docker Compose, kèm một site demo có sẵn nội dung mẫu.
---

Chỉ cần Docker và Docker Compose. Không cần cài Node.js hay Postgres riêng: Compose khởi động cả cơ sở dữ liệu lẫn ứng dụng.

## 1. Tải mã nguồn

```bash
git clone https://github.com/kdigivn/kdigi-cms-open.git
cd kdigi-cms-open
```

## 2. Chạy bằng Docker Compose

```bash
SEED_DEMO=true docker compose up --build
```

`SEED_DEMO=true` nạp thêm một site demo có nội dung mẫu để bạn có cái xem ngay. Bỏ biến này nếu muốn bắt đầu với CMS trống. Lần đầu build mất vài phút. Ứng dụng tự chạy migration khi khởi động và tự sinh `PAYLOAD_SECRET`, nên bạn không cần tạo file `.env`.

## 3. Mở trang quản trị

Truy cập [http://localhost:3000/admin](http://localhost:3000/admin). Không có tài khoản demo: tài khoản đầu tiên bạn tạo trên form đăng ký sẽ trở thành super admin. Sau khi đăng nhập, bạn sẽ thấy site demo (`siteKey` là `demo`) cùng bài viết, trang, danh mục và menu mẫu.

## 4. Lấy nội dung ra frontend

Mỗi website là một bản ghi trong **Sites**. Frontend của bạn đọc nội dung theo site qua REST hoặc GraphQL. Trước hết tra `id` của site demo theo `siteKey`, rồi lọc bài viết theo `id` đó:

```bash
curl "http://localhost:3000/api/sites?where[siteKey][equals]=demo"
curl "http://localhost:3000/api/posts?where[tenant][equals]=<site-id>&sort=-publishedAt&limit=5"
```

Khách ẩn danh chỉ thấy nội dung đã xuất bản. Chi tiết cách lọc theo site và các endpoint khác ở trang [REST và GraphQL](/api/rest-graphql/).

## Dừng và xoá dữ liệu

```bash
docker compose down        # dừng, giữ nguyên dữ liệu
docker compose down -v     # dừng và xoá sạch dữ liệu (database, media)
```

## Tiếp theo

- [Tự host bằng Docker](/huong-dan/cai-dat-docker/): các biến cấu hình và chạy trên máy chủ.
- [Triển khai trên Coolify](/huong-dan/trien-khai-coolify/)
- [Di chuyển từ WordPress](/wordpress/di-chuyen-tu-wordpress/)
