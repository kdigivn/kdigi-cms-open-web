---
title: "Tự host KDIGI CMS bằng Docker Compose và Coolify"
description: "Cài KDIGI CMS trên VPS của bạn bằng Docker Compose hoặc Coolify: yêu cầu hệ thống, biến môi trường, sao lưu, nâng cấp và các bước tăng cường bảo mật."
h1: "Tự host KDIGI CMS: Docker Compose, Coolify, VPS"
navTitle: "Tự host"
icon: server
lead: "Một máy Linux có Docker là đủ: một container ứng dụng và một PostgreSQL."
primaryKeyword: "self host"
updated: 2026-11-03
heroImage: /images/art/tu-host-hero.webp
heroAlt: "Khối container và cơ sở dữ liệu kính mờ, đại diện cho việc tự host KDIGI CMS bằng Docker"
schema: TechArticle
faq:
  - q: "Cần cấu hình máy chủ tối thiểu để chạy KDIGI CMS?"
    a: "Máy Linux có Docker kèm Compose plugin, RAM từ 2 GB và một domain trỏ về máy. Bước build tốn bộ nhớ: nếu bị out-of-memory, hãy build trên máy lớn hơn hoặc thêm swap."
  - q: "KDIGI CMS chạy những thành phần nào?"
    a: "Hai thành phần: server Next.js phục vụ cả trang quản trị lẫn API ở cổng 3000, và PostgreSQL. Ảnh tải lên nằm trên volume bền hoặc Cloudflare R2 theo từng site."
  - q: "Biến môi trường nào là bắt buộc?"
    a: "Ba biến: DATABASE_URI, PAYLOAD_SECRET (từ 32 ký tự khi chạy production) và PAYLOAD_PUBLIC_SERVER_URL (URL https công khai). Với docker compose up, entrypoint tự sinh PAYLOAD_SECRET."
  - q: "Làm sao nâng cấp lên phiên bản mới?"
    a: "Đọc CHANGELOG, sao lưu database và media, rồi git pull và docker compose up -d --build. Entrypoint tự chạy payload migrate trước khi khởi động; schema chỉ đổi qua migration."
  - q: "Tôi cần sao lưu những gì?"
    a: "Cả database PostgreSQL lẫn media, và giữ PAYLOAD_SECRET đang dùng. Site dùng Cloudflare R2 thì bật versioning ở phía Cloudflare. Hãy thử restore trên máy phụ trước khi cần đến."
related:
  - /chuyen-tu-wordpress
  - /thuc-hanh-tot
  - /tinh-nang/thu-vien-media
  - /demo
  - /ma-nguon-mo
docs: https://docs.opencms.kdigi.vn/huong-dan/cai-dat-docker/
---

Clone repo, chạy `docker compose up -d --build` là có server Next.js (admin và API, cổng 3000) cùng PostgreSQL. Có sẵn cấu hình cho Coolify và cách chạy không Docker.

> **Tóm tắt nhanh**
>
> - Bốn cách: máy cá nhân, VPS Compose, Coolify, không Docker.
> - Biến tối thiểu: `DATABASE_URI`, `PAYLOAD_SECRET`, `PAYLOAD_PUBLIC_SERVER_URL`.
> - Migration tự chạy khi container khởi động.
> - Sao lưu cả database lẫn media.
> - Người đầu tiên tạo tài khoản thành `super-admin`.

![Ảnh chụp bảng điều khiển KDIGI CMS sau khi cài đặt thành công](/images/shots/dashboard.webp)

## :boxes: Bạn triển khai những gì

:::cards 2
- :server: **Ứng dụng** Node 22 Alpine, `next start`, cổng 3000, chạy bằng user `node`.
- :database: **PostgreSQL** Service `db` đi kèm hoặc PostgreSQL managed qua `DATABASE_URI`.
- :hard-drive: **Volume** `postgres_data`, `media_data` (`/app/media`), `app_data` (`/app/data`).
- :gauge: **Health** `GET /api/health` chỉ là liveness, không truy vấn database.
:::

Website công khai là frontend riêng gọi [headless API](/tinh-nang/headless-api); CMS không render trang thay bạn.

## :terminal: Cách 1: thử trên máy cá nhân

Chỉ cần Docker kèm Compose plugin:

```bash
git clone https://github.com/kdigivn/kdigi-cms-open.git
cd kdigi-cms-open
SEED_DEMO=true docker compose up --build
```

Mở `http://localhost:3000/admin` và tạo người dùng đầu tiên (tự động là `super-admin`). Bỏ `SEED_DEMO=true` để có bản cài trống. Chạy dev có hot reload: [bắt đầu nhanh](https://docs.opencms.kdigi.vn/huong-dan/bat-dau-nhanh/).

## :cloud-upload: Cách 2: VPS với Docker Compose

:::check
- Máy Linux có Docker và Compose plugin
- RAM từ 2 GB
- Domain đã trỏ về máy
:::

```bash
git clone https://github.com/kdigivn/kdigi-cms-open.git
cd kdigi-cms-open
cat > .env <<'EOF'
POSTGRES_PASSWORD=change-me-to-a-long-random-password
PAYLOAD_SECRET=change-me-to-a-random-string-of-32-chars-or-more
PAYLOAD_PUBLIC_SERVER_URL=https://cms.example.com
ENABLE_JOBS_AUTORUN=true
EOF
docker compose up -d --build
```

Đặt reverse proxy kết thúc TLS phía trước và chặn cổng 3000 bằng tường lửa. Ví dụ Caddy:

```caddyfile
cms.example.com {
    reverse_proxy 127.0.0.1:3000
}
```

> **Cảnh báo** Không chạy `SEED_DEMO=true` trên bản production thật.

## :boxes: Cách 3: Coolify

:::steps
- **Tạo resource** Chọn New Resource → Docker Compose, đặt Compose Location là `/docker-compose.coolify.yml`.
- **Đặt biến bí mật** Thêm `PAYLOAD_SECRET` (tạo bằng `openssl rand -hex 32`); đây là biến bắt buộc duy nhất.
- **Gắn domain** Vào service `app` (cổng 3000); domain riêng cần thêm `PAYLOAD_PUBLIC_SERVER_URL`.
- **Deploy** Lần đầu áp dụng mọi migration; mở `/admin` và tạo người dùng đầu tiên.
:::

Các biến tùy chọn và cách sao lưu `db` trong Coolify: [tài liệu Coolify](https://docs.opencms.kdigi.vn/huong-dan/trien-khai-coolify/).

## :settings: Cách 4: không dùng Docker

Cần Node.js ≥ 20.9, pnpm 10 và PostgreSQL. Đặt `DATABASE_URI`, `PAYLOAD_SECRET`, `PAYLOAD_PUBLIC_SERVER_URL`, rồi chạy `pnpm build`, `pnpm migrate`, `pnpm start` dưới systemd hoặc pm2. Chi tiết: [tài liệu triển khai](https://docs.opencms.kdigi.vn/tham-khao/deploy/).

## :list-checks: Sau khi deploy

:::steps
- :key-round: **Tạo người dùng đầu tiên ngay** Trên database trống, ai mở `/admin` trước sẽ thành `super-admin`.
- :globe: **Tạo site** Nhập `siteKey`, `domain`, ngôn ngữ; xem [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website).
- :users: **Mời người dùng** Gán vai trò và site ([phân quyền](/tinh-nang/phan-quyen-nguoi-dung)).
- :refresh-cw: **Bật job revalidate** Đặt `ENABLE_JOBS_AUTORUN=true` trên đúng một instance.
- :image: **Chọn nơi lưu media** Mặc định ổ đĩa; Cloudflare R2 theo từng site ([thư viện media](/tinh-nang/thu-vien-media)).
:::

## :hard-drive: Sao lưu và khôi phục

Sao lưu **cả** database lẫn media, và giữ `PAYLOAD_SECRET`. Mất secret thì phiên đăng nhập và API key ngừng hoạt động, dữ liệu vẫn đọc được.

```bash
docker compose exec -T db pg_dump -U kdigi --format=custom kdigi > kdigi-$(date +%F).dump
docker compose exec -T app tar czf - -C /app/media . > media-$(date +%F).tgz
```

:::check
- Chép dump ra khỏi máy chủ
- Thử restore trên máy phụ
- Site dùng R2: bật versioning phía Cloudflare
- PostgreSQL managed: dùng snapshot của nhà cung cấp
:::

Lệnh restore và quy trình đầy đủ: [sao lưu và nâng cấp](/thuc-hanh-tot/sao-luu-va-nang-cap).

## :history: Nâng cấp

:::steps
- **Đọc CHANGELOG** Tìm mục Breaking và biến môi trường mới ([phát hành](/phat-hanh)).
- **Sao lưu** Database và media.
- **Lấy code mới, build lại** `docker compose up -d --build`; Coolify thì redeploy.
- **Kiểm tra** Đăng nhập `/admin`, tải một ảnh, gọi một URL công khai.
:::

> **Lưu ý** Tránh `pnpm migrate:down` trên production: nó đảo ngược cả batch gần nhất. Khi cần quay lại, khôi phục bản sao lưu.

## :shield-check: Bảo mật khi vận hành

:::check
- `PAYLOAD_SECRET` ngẫu nhiên, từ 32 ký tự
- Đặt CMS sau HTTPS
- Giới hạn truy cập database trong mạng ứng dụng
- Đổi `POSTGRES_PASSWORD` mặc định nếu cổng truy cập được từ ngoài
- Giới hạn tốc độ request ở reverse proxy
:::

Chi tiết: [chính sách bảo mật](/ma-nguon-mo) và [bảo mật, phân quyền](/thuc-hanh-tot/bao-mat-va-phan-quyen).

## :life-buoy: Sự cố thường gặp

| Triệu chứng | Kiểm tra |
| --- | --- |
| Container khởi động lại, báo `PAYLOAD_SECRET must be at least 32 characters` | Đặt secret ≥ 32 ký tự, hoặc bỏ đặt để entrypoint tự sinh |
| Đăng nhập admin lặp, API trả 403 | `PAYLOAD_PUBLIC_SERVER_URL` phải khớp origin trên thanh địa chỉ |
| Không kết nối được database | Trong Compose dùng host `db`, không dùng `localhost` |
| Ảnh tải lên mất sau redeploy | `/app/media` chưa nằm trên volume bền |
| Frontend không làm mới sau khi đăng bài | `ENABLE_JOBS_AUTORUN=true` trên một instance, đã đặt `domain` của site |
| Build bị kill, hết bộ nhớ | Build trên máy lớn hơn hoặc thêm swap |
