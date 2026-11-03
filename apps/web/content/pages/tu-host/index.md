---
title: "Tự host KDIGI CMS bằng Docker Compose và Coolify"
description: "Cài KDIGI CMS trên VPS của bạn bằng Docker Compose hoặc Coolify: yêu cầu hệ thống, biến môi trường, sao lưu, nâng cấp và các bước tăng cường bảo mật."
h1: "Tự host KDIGI CMS: Docker Compose, Coolify, VPS"
navTitle: "Tự host"
primaryKeyword: "self host"
updated: 2026-11-03
heroImage: /images/art/tu-host-hero.webp
heroAlt: "Khối container và cơ sở dữ liệu kính mờ, đại diện cho việc tự host KDIGI CMS bằng Docker"
schema: TechArticle
faq:
  - q: "Cần cấu hình máy chủ tối thiểu để chạy KDIGI CMS?"
    a: "Tài liệu yêu cầu một máy Linux có Docker kèm Compose plugin, RAM từ 2 GB trở lên và một domain trỏ về máy. Bước build image khá tốn bộ nhớ (script cho phép tới 8 GB heap), nên hãy build trên máy lớn hơn hoặc thêm swap nếu bị out-of-memory."
  - q: "KDIGI CMS chạy những thành phần nào khi triển khai?"
    a: "Chỉ hai thành phần: một server Next.js phục vụ cả trang quản trị lẫn API ở cổng 3000, và một database PostgreSQL (bản compose dùng postgres:16-alpine). Ảnh tải lên nằm trên volume lưu trữ bền hoặc trong Cloudflare R2 cho từng site; không cần tài khoản cloud để bắt đầu."
  - q: "Biến môi trường nào là bắt buộc?"
    a: "Tối thiểu có ba: DATABASE_URI, PAYLOAD_SECRET (từ 32 ký tự khi chạy production) và PAYLOAD_PUBLIC_SERVER_URL (URL https công khai của CMS). Với docker compose up bạn không cần đặt biến nào vì entrypoint tự sinh PAYLOAD_SECRET, nhưng production nên đặt tường minh và sao lưu nó."
  - q: "Làm sao nâng cấp KDIGI CMS lên phiên bản mới?"
    a: "Đọc CHANGELOG, sao lưu database và media, rồi lấy code mới và build lại; với Docker Compose chỉ cần git pull và docker compose up -d --build. Entrypoint tự chạy payload migrate trước khi khởi động. Schema không bao giờ tự đồng bộ, chỉ đổi qua migration có timestamp."
  - q: "Tôi cần sao lưu những gì?"
    a: "Sao lưu cả database PostgreSQL lẫn media, và giữ lại PAYLOAD_SECRET đang dùng. Database dùng pg_dump định dạng custom; media trên đĩa nén bằng tar từ thư mục /app/media. Site dùng Cloudflare R2 thì bật versioning hoặc replication ở phía Cloudflare. Hãy thử restore trên máy thử trước khi cần đến."
related:
  - /chuyen-tu-wordpress
  - /thuc-hanh-tot
  - /tinh-nang/thu-vien-media
  - /demo
  - /ma-nguon-mo
docs: https://docs.opencms.kdigi.vn/huong-dan/cai-dat-docker/
---

KDIGI CMS tự host được trên bất kỳ máy Linux nào có Docker: bạn clone repo, chạy `docker compose up -d --build` và có một server Next.js (admin cùng API, cổng 3000) kèm PostgreSQL. Có sẵn cấu hình riêng cho Coolify và cách chạy không Docker bằng Node ≥ 20.9 với pnpm 10.

> **Tóm tắt nhanh**
>
> - Một container ứng dụng (Node 22 Alpine, `next start`, cổng 3000) và một PostgreSQL (16 trong các file compose).
> - Ba cách triển khai: Docker Compose trên VPS, Coolify (`docker-compose.coolify.yml`), hoặc không Docker (`pnpm build`, `pnpm migrate`, `pnpm start`).
> - Biến tối thiểu: `DATABASE_URI`, `PAYLOAD_SECRET` (≥ 32 ký tự), `PAYLOAD_PUBLIC_SERVER_URL`.
> - Migration tự chạy khi container khởi động; schema không bao giờ tự đồng bộ.
> - Sao lưu **cả** database và media, và giữ `PAYLOAD_SECRET`.
> - Người đầu tiên tạo tài khoản trên database trống sẽ thành `super-admin`, nên hãy làm ngay sau deploy.

Trang này hướng dẫn từ thử nhanh trên máy cá nhân đến vận hành production. Nếu bạn đang chuyển từ WordPress, hãy đọc thêm [quy trình di chuyển](/chuyen-tu-wordpress); nếu muốn xem giao diện trước khi cài, dùng [bản demo trực tiếp](/demo).

![Ảnh chụp bảng điều khiển KDIGI CMS sau khi cài đặt thành công](/images/shots/dashboard.webp)

## Bạn triển khai những gì

| Thành phần | Chi tiết |
| --- | --- |
| Image | `Dockerfile` dùng Node 22 Alpine, multi-stage build, chạy `next start` ở cổng 3000 bằng user `node` không đặc quyền. Image giữ `src/` và `node_modules` vì entrypoint chạy `payload migrate` và demo seed tùy chọn |
| Entrypoint | `docker/entrypoint.sh`: (1) sinh và lưu `PAYLOAD_SECRET` trong `DATA_DIR` nếu chưa đặt, (2) `payload migrate` trừ khi `SKIP_MIGRATIONS=true`, (3) demo seed nếu `SEED_DEMO=true`, (4) khởi động server |
| Database | PostgreSQL. Dùng service `db` đi kèm hoặc PostgreSQL managed qua `DATABASE_URI` |
| Volume | `postgres_data` (database), `media_data` mount vào `/app/media` (ảnh tải lên), `app_data` mount vào `/app/data` (secret được sinh) |
| Health | `GET /api/health` chỉ là liveness probe: trả lời khi tiến trình còn phục vụ HTTP, **không** truy vấn database |

Website công khai của bạn là frontend riêng, gọi API của CMS ([headless API](/tinh-nang/headless-api)). CMS không render trang công khai thay bạn.

## Cách 1: Thử nhanh trên máy cá nhân

Chỉ cần Docker kèm Compose plugin:

```bash
git clone https://github.com/kdigivn/kdigi-cms-open.git
cd kdigi-cms-open
SEED_DEMO=true docker compose up --build
```

Mở `http://localhost:3000/admin`. Trên database trống, admin hiện form **Create first user**; người đầu tiên tạo ra là `super-admin`. Bỏ `SEED_DEMO=true` nếu bạn muốn bản cài trống. Dữ liệu nằm trong các volume có tên, `docker compose down` giữ lại còn `docker compose down -v` xóa sạch.

Các công tắc hay dùng (đặt trong shell hoặc file `.env` cạnh file compose):

| Biến | Mặc định | Tác dụng |
| --- | --- | --- |
| `APP_PORT` | `3000` | Cổng host của CMS |
| `DB_PORT` | `5432` | Cổng host của PostgreSQL (chỉ bind `127.0.0.1`) |
| `POSTGRES_PASSWORD` | `kdigi` | Mật khẩu database, chỉ dùng local; đổi nếu bạn mở cổng ra ngoài |
| `PAYLOAD_PUBLIC_SERVER_URL` | `http://localhost:3000` | URL công khai của CMS; đặt lại nếu đổi cổng hoặc đặt sau domain |
| `SEED_DEMO` | trống | `true` nạp site demo và nội dung mẫu (idempotent) |

Muốn phát triển có hot reload: `pnpm install --frozen-lockfile`, `cp .env.example .env`, `docker compose up -d db`, `pnpm migrate`, `pnpm dev`. Chi tiết nằm trong [hướng dẫn bắt đầu nhanh](https://docs.opencms.kdigi.vn/huong-dan/bat-dau-nhanh/).

![Đầu ra docker compose config của KDIGI CMS gồm service app, db và các volume](/images/shots/terminal-docker.webp "Đầu ra thật của docker compose config")

## Cách 2: VPS với Docker Compose

Yêu cầu: máy Linux có Docker và Compose plugin, RAM từ 2 GB, domain đã trỏ về máy. Bước build image tốn bộ nhớ (script build cho phép tới 8 GB heap), nên hãy build trên máy lớn hơn hoặc thêm swap nếu bị hết bộ nhớ.

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

Ứng dụng lắng nghe ở cổng host `APP_PORT` (mặc định 3000) trên mọi interface. Hãy đặt một reverse proxy kết thúc TLS phía trước và chặn cổng này bằng tường lửa. Ví dụ với Caddy:

```caddyfile
cms.example.com {
    reverse_proxy 127.0.0.1:3000
}
```

Với nginx: proxy về `127.0.0.1:3000`, chuyển tiếp `Host` và `X-Forwarded-Proto`, đồng thời cho phép body lớn (`client_max_body_size 50m;`) để upload media.

> Không chạy `SEED_DEMO=true` trên bản production thật: nó tạo site demo và nội dung mẫu.

## Cách 3: Coolify

`docker-compose.coolify.yml` được viết cho loại resource "Docker Compose" của Coolify.

1. Trong Coolify: **New Resource → Docker Compose**, chọn repository (hoặc fork của bạn), đặt **Docker Compose Location** là `/docker-compose.coolify.yml`.
2. Thêm biến `PAYLOAD_SECRET` (tạo bằng `openssl rand -hex 32`). Đây là biến bắt buộc duy nhất; Coolify sinh domain, chứng chỉ TLS và mật khẩu database.
3. Gắn domain vào service `app` (cổng 3000). Nếu dùng domain riêng, đặt thêm `PAYLOAD_PUBLIC_SERVER_URL=https://cms.example.com`, nếu không đăng nhập admin và URL media sẽ dùng domain Coolify sinh ra.
4. Các biến tùy chọn mà file compose chuyển tiếp: `R2_OFF`, `ENABLE_JOBS_AUTORUN`, `FRONTEND_BASE_URL`, `DEEPSEEK_API_KEY`, `DEEPSEEK_MODEL`, `RECAPTCHA_SECRET`, `MODERATION_WEBHOOK_URL`, `OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_ENDPOINT`, `SEED_DEMO`, `SKIP_MIGRATIONS` (bản 1.1.0 thêm `REVALIDATE_SECRET`, `DEMO_ACCOUNT_EMAILS`, `DEMO_ACCOUNT_PASSWORD`). Biến không có trong khối `environment:` của compose sẽ không đến được container.
5. Deploy. Lần chạy đầu áp dụng toàn bộ migration; mở `https://cms.example.com/admin` và tạo người dùng đầu tiên.

Lưu ý khi dùng Coolify: các lần redeploy không đụng đến named volume, nhưng bạn vẫn phải đưa `media_data` vào kế hoạch sao lưu. Backup tự động của Coolify dành cho database tạo thành resource riêng, không áp dụng cho service `db` bên trong một Docker Compose resource; với `db` đi kèm, hãy dùng **Scheduled Task** chạy `pg_dump`, hoặc cron trên host Docker.

## Cách 4: Không dùng Docker

Yêu cầu Node.js ≥ 20.9, pnpm 10 và PostgreSQL.

```bash
pnpm install --frozen-lockfile
export DATABASE_URI=postgres://kdigi:change-me@127.0.0.1:5432/kdigi
export PAYLOAD_SECRET=... PAYLOAD_PUBLIC_SERVER_URL=https://cms.example.com NODE_ENV=production
pnpm build
pnpm migrate
pnpm start
```

Chạy dưới một process manager (systemd, pm2) và đặt `MEDIA_DIR` về thư mục bền. `pnpm build` chủ ý bỏ qua lint và kiểm tra kiểu, nên hãy tự chạy `pnpm typecheck` và `pnpm lint` khi bạn sửa code.

## Sau khi deploy

1. **Tạo người dùng đầu tiên ngay.** Trên database trống, bất kỳ ai truy cập được `/admin` đều có thể gửi form tạo user đầu tiên và trở thành `super-admin`. Mở admin ngay sau deploy, hoặc giới hạn truy cập ở proxy cho đến lúc đó.
2. **Tạo site** (Sites → Create new) với `siteKey` duy nhất, `domain` trần như `example.com` và ngôn ngữ mặc định. Thêm site mới không cần deploy lại, xem [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website).
3. **Mời người dùng** và gán vai trò cùng site; chỉ `super-admin` tạo được người dùng ([phân quyền](/tinh-nang/phan-quyen-nguoi-dung)).
4. **Bật job revalidate.** Lưu nội dung sẽ đưa vào hàng đợi một job "revalidate frontend" (CMS gọi `https://<domain của site>/api/cms/revalidate`). Job chỉ chạy khi `ENABLE_JOBS_AUTORUN=true`, và biến này phải đặt trên **đúng một** instance.
5. **Chọn nơi lưu media.** Mặc định là ổ đĩa local, không cần tài khoản cloud; có thể dùng Cloudflare R2 riêng cho từng site ([thư viện media](/tinh-nang/thu-vien-media)).

![Ảnh chụp danh sách site trong KDIGI CMS, mỗi site có siteKey và domain riêng](/images/shots/sites.webp)

## Sao lưu và khôi phục

Hãy sao lưu **cả** database lẫn media, và giữ lại `PAYLOAD_SECRET` đang dùng. Mất secret thì phiên đăng nhập và API key hiện có ngừng hoạt động, nhưng dữ liệu vẫn đọc được.

```bash
# Database (PostgreSQL đi kèm), chạy ở thư mục có file compose
docker compose exec -T db pg_dump -U kdigi --format=custom kdigi > kdigi-$(date +%F).dump
# Khôi phục vào database trống
docker compose exec -T db pg_restore -U kdigi -d kdigi --clean --if-exists < kdigi-2026-01-01.dump

# Media trên ổ đĩa
docker compose exec -T app tar czf - -C /app/media . > media-$(date +%F).tgz
docker compose exec -T app tar xzf - -C /app/media < media-2026-01-01.tgz
```

- Site dùng Cloudflare R2 giữ file trong bucket; bật versioning hoặc replication ở phía Cloudflare.
- Với PostgreSQL managed, dùng snapshot của nhà cung cấp.
- Đặt lịch xóa dump quá 14 ngày và **sao chép dump ra khỏi máy chủ**.
- Thử restore trên máy phụ trước khi bạn cần đến nó.

## Nâng cấp

1. Đọc [CHANGELOG](/phat-hanh) cho mọi phiên bản giữa bản của bạn và bản đích: tìm mục "Breaking", biến môi trường mới và thay đổi ảnh hưởng phản hồi REST mà frontend đang dùng.
2. Sao lưu database và media.
3. Lấy code mới (`git pull`, hoặc `git fetch --tags && git checkout vX.Y.Z`) rồi build lại:
   - Docker Compose: `docker compose up -d --build` (entrypoint chạy `payload migrate` trước khi khởi động).
   - Coolify: redeploy.
   - Không Docker: `pnpm install --frozen-lockfile && pnpm build && pnpm migrate && pnpm start`.
4. Kiểm tra: đăng nhập `/admin`, mở vài tài liệu mỗi collection, tải một ảnh, gọi một URL công khai từ frontend. `GET /api/health` chỉ chứng minh tiến trình còn sống, không chứng minh schema đã mới.

Muốn chạy migration như một bước release riêng, đặt `SKIP_MIGRATIONS=true` cho container và chạy `docker compose exec app node_modules/.bin/payload migrate` trước khi chuyển lưu lượng sang. Xem trạng thái bằng `pnpm payload migrate:status`. Nên nâng cấp CMS trước, rồi mới nâng cấp các frontend dùng trường mới. Khi cần quay lại: chỉ redeploy image cũ nếu nó đọc được schema đã migrate; nếu không, khôi phục bản sao lưu (bạn mất nội dung ghi sau thời điểm đó). Tránh `pnpm migrate:down` trên production vì nó đảo ngược cả **batch** gần nhất.

## Bảo mật khi vận hành

Danh sách từ chính sách bảo mật của dự án ([ma-nguon-mo](/ma-nguon-mo)):

- Đặt `PAYLOAD_SECRET` ngẫu nhiên từ 32 ký tự; production không khởi động nếu ngắn hơn.
- Đặt CMS sau HTTPS, giới hạn truy cập database trong mạng của ứng dụng, đổi `POSTGRES_PASSWORD` mặc định của compose local nếu cổng đó truy cập được từ ngoài.
- Tạo admin đầu tiên ngay sau deploy, trước khi mở admin ra internet; không chạy `SEED_DEMO` trên bản thật.
- Giới hạn tốc độ request ở reverse proxy: comment và rating là endpoint công khai có kiểm soát lạm dụng riêng (reCAPTCHA qua `RECAPTCHA_SECRET`) nhưng không tự giới hạn tốc độ.
- Cập nhật phụ thuộc đều đặn và theo dõi [bản phát hành](/phat-hanh).

## Khắc phục sự cố thường gặp

| Triệu chứng | Kiểm tra |
| --- | --- |
| Container khởi động lại với `PAYLOAD_SECRET must be at least 32 characters` | Đặt `PAYLOAD_SECRET` ≥ 32 ký tự, hoặc bỏ đặt khi dùng Docker để entrypoint tự sinh |
| Đăng nhập admin lặp, API trả 403 | `PAYLOAD_PUBLIC_SERVER_URL` phải đúng từng ký tự với origin trên thanh địa chỉ (scheme, host, port) |
| App không kết nối được database | Kiểm tra `DATABASE_URI`; trong Compose dùng host `db`, không dùng `localhost` |
| Container healthy nhưng admin báo thiếu bảng/cột | Migration chưa chạy hoặc lỗi: xem log, chạy `docker compose exec app node_modules/.bin/payload migrate` |
| Ảnh tải lên biến mất sau redeploy | `/app/media` chưa nằm trên volume bền (hoặc đặt `MEDIA_DIR` vào volume) |
| Ảnh 404 hoặc trỏ sai host | `PAYLOAD_PUBLIC_SERVER_URL` là tiền tố URL media |
| Frontend không làm mới sau khi đăng bài | `ENABLE_JOBS_AUTORUN=true` trên một instance, `domain` của site đã đặt, frontend có `/api/cms/revalidate` |
| Build bị kill / hết bộ nhớ | Build trên máy lớn hơn hoặc thêm swap |
| Build xanh nhưng code lỗi | `next build` bỏ qua lint và typecheck; chạy `pnpm typecheck` và `pnpm lint` |

## Nguồn

- `docs/deploy.md`, `docs/getting-started.md`, `docs/upgrading.md`, `SECURITY.md` trong repo: <https://github.com/kdigivn/kdigi-cms-open>
- Tài liệu cài đặt Docker: <https://docs.opencms.kdigi.vn/huong-dan/cai-dat-docker/>
- Tài liệu triển khai Coolify: <https://docs.opencms.kdigi.vn/huong-dan/trien-khai-coolify/>
