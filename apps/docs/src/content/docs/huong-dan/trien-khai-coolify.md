---
title: Triển khai trên Coolify
description: Đưa KDIGI CMS lên Coolify bằng resource Docker Compose có sẵn trong repo, Coolify cấp tên miền, TLS và mật khẩu database.
---

Repo có sẵn `docker-compose.coolify.yml` cho loại resource **Docker Compose** của Coolify. File gồm ứng dụng và PostgreSQL 16, dữ liệu nằm trong named volume nên redeploy không bao giờ chạm tới chúng.

## Các bước

1. Trong Coolify: **New Resource → Docker Compose**, chọn repo `https://github.com/kdigivn/kdigi-cms-open` (hoặc bản fork của bạn), đặt **Docker Compose Location** là `/docker-compose.coolify.yml`.
2. Thêm biến môi trường `PAYLOAD_SECRET` bằng một chuỗi ngẫu nhiên từ 32 ký tự trở lên (`openssl rand -hex 32`). Đây là biến bắt buộc duy nhất. Coolify tự sinh tên miền, chứng chỉ TLS và mật khẩu database.
3. Gán tên miền cho dịch vụ `app` (cổng 3000). Nếu dùng tên miền riêng, đặt thêm `PAYLOAD_PUBLIC_SERVER_URL=https://cms.example.com`, nếu không trang đăng nhập và URL ảnh sẽ dùng tên miền do Coolify sinh.
4. Deploy. Lần khởi động đầu tiên áp dụng toàn bộ migration. Mở `https://cms.example.com/admin` và tạo tài khoản đầu tiên, tài khoản này trở thành super admin.

> **Tạo tài khoản đầu tiên ngay sau khi deploy.** Khi database còn trống, ai truy cập được `/admin` đều có thể gửi form tạo người dùng đầu tiên và trở thành super admin.

Dùng PostgreSQL ngoài thay cho bản đi kèm: đặt `DATABASE_URI`, rồi bỏ dịch vụ `db` cùng mục `depends_on` của `app`.

## Biến tuỳ chọn

File compose chuyển tiếp các biến `R2_OFF`, `ENABLE_JOBS_AUTORUN`, `FRONTEND_BASE_URL`, `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, `RECAPTCHA_SECRET`, `MODERATION_WEBHOOK_URL`, `OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `SEED_DEMO` và `SKIP_MIGRATIONS`. Biến không có trong khối `environment:` của compose sẽ không vào container, nên cần thêm vào đó nếu bạn dùng biến khác. Không đặt `SEED_DEMO=true` trên bản chạy thật: nó tạo site và nội dung demo.

## Media và tác vụ nền

- Ảnh mặc định lưu ở volume `media_data` (`/app/media`). Muốn đưa ảnh ra ngoài máy chủ, cấu hình Cloudflare R2 cho từng site. Xem [Thư viện media](/huong-dan/thu-vien-media/).
- Mỗi lần lưu nội dung, CMS xếp một job "revalidate frontend" để website của bạn làm mới cache. Job chỉ chạy khi `ENABLE_JOBS_AUTORUN=true`, và biến này phải bật trên **đúng một** instance.

## Sao lưu

Sao lưu cả database và media, và giữ lại `PAYLOAD_SECRET` đang dùng. Bật lịch sao lưu database của Coolify cho volume `postgres_data`, đưa `media_data` vào bản sao lưu máy chủ.

Hướng dẫn đầy đủ về triển khai, sao lưu và xử lý sự cố ở [Deploy](/en/tham-khao/deploy/) (tiếng Anh).
