---
title: Tự host bằng Docker
description: Cách bộ Docker Compose của KDIGI CMS hoạt động, các biến cấu hình thường dùng, dữ liệu lưu ở đâu và cách chạy trên máy chủ.
---

`docker-compose.yml` trong repo dựng hai dịch vụ: PostgreSQL 16 (`db`) và ứng dụng (`app`, cổng 3000). Migration chạy tự động mỗi lần ứng dụng khởi động.

## Dữ liệu nằm ở đâu

Ba named volume giữ dữ liệu qua các lần `docker compose down`:

| Volume | Nội dung |
| --- | --- |
| `postgres_data` | Cơ sở dữ liệu |
| `media_data` | Ảnh và file tải lên (`/app/media`), khi site chưa cấu hình Cloudflare R2 |
| `app_data` | Dữ liệu của ứng dụng, gồm `PAYLOAD_SECRET` tự sinh |

`docker compose down -v` xoá cả ba.

## Biến cấu hình thường dùng

Đặt trong môi trường hoặc file `.env` cạnh `docker-compose.yml`. Chạy thử trên máy bạn thì không cần đặt gì.

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `PAYLOAD_PUBLIC_SERVER_URL` | `http://localhost:3000` | Địa chỉ công khai của CMS như trình duyệt thấy; cũng là tiền tố URL của ảnh |
| `PAYLOAD_SECRET` | trống (tự sinh một lần) | Khoá ký phiên đăng nhập. Trên máy chủ nên tự đặt, tối thiểu 32 ký tự |
| `POSTGRES_PASSWORD` | `kdigi` | Mật khẩu database |
| `APP_PORT` / `DB_PORT` | `3000` / `5432` | Cổng ra máy chủ. Database chỉ mở trên `127.0.0.1` |
| `SEED_DEMO` | trống | `true` để nạp site demo (chạy lại không tạo trùng) |
| `SKIP_MIGRATIONS` | trống | `true` để bỏ bước migration tự động khi container khởi động |

Danh sách đầy đủ, gồm AI SEO, reCAPTCHA cho bình luận, OpenTelemetry và importer WordPress, nằm trong file `.env.example` của repo và ở [tài liệu cấu hình](/en/tham-khao/configuration/).

## Chạy trên máy chủ

1. Đặt `PAYLOAD_PUBLIC_SERVER_URL` thành địa chỉ `https://` thật của CMS và `PAYLOAD_SECRET` thành chuỗi ngẫu nhiên dài (`openssl rand -hex 32`).
2. Đổi `POSTGRES_PASSWORD` khỏi giá trị mặc định.
3. Đặt một reverse proxy có TLS (Traefik, Caddy, nginx) phía trước cổng 3000.
4. Giữ nguyên các volume để không mất dữ liệu khi cập nhật image.

Nếu dùng Coolify, đọc [Triển khai trên Coolify](/huong-dan/trien-khai-coolify/).

## Chạy ứng dụng ngoài Docker (phát triển)

Chỉ dựng database bằng Compose rồi chạy Next.js trên máy:

```bash
docker compose up db
cp .env.example .env
pnpm install
pnpm migrate
pnpm dev
```

## Kiểm tra sức khoẻ

`GET /api/health` trả 200 khi tiến trình còn phục vụ HTTP. Endpoint này không truy vấn database, nên đừng coi nó là bằng chứng schema đã sẵn sàng.
