---
title: "Sao lưu và nâng cấp KDIGI CMS an toàn"
description: "Quy trình sao lưu cơ sở dữ liệu và media, kiểm tra khôi phục, nâng cấp phiên bản bằng Docker, xem release notes và cách quay lui khi nâng cấp gặp sự cố."
h1: "Sao lưu và nâng cấp KDIGI CMS: quy trình không mất dữ liệu"
primaryKeyword: "sao lưu và nâng cấp cms"
updated: 2026-11-03
heroImage: /images/shots/dashboard.webp
heroAlt: "Dashboard quản trị KDIGI CMS sau khi nâng cấp"
schema: TechArticle
faq:
  - q: "Cần sao lưu những gì để khôi phục được toàn bộ site?"
    a: "Hai thứ cùng lúc: cơ sở dữ liệu PostgreSQL và thư mục media (volume media_data, hoặc bucket R2 nếu dùng). Database chỉ giữ metadata và đường dẫn. Nên giữ cả PAYLOAD_SECRET đang dùng; mất nó thì phiên và API key vô hiệu nhưng dữ liệu vẫn đọc được."
  - q: "Nâng cấp KDIGI CMS có tự cập nhật schema không?"
    a: "Có, nhưng qua migration chứ không đồng bộ tự động (push bị tắt). Image Docker chạy payload migrate khi khởi động trừ khi đặt SKIP_MIGRATIONS=true. Mọi thay đổi schema, biến môi trường mới và thay đổi phá vỡ API đều được ghi trong CHANGELOG của từng bản phát hành."
  - q: "Nếu nâng cấp lỗi thì quay lại thế nào?"
    a: "Triển khai lại image cũ chỉ khi nó đọc được schema đã migrate (migration chỉ thêm cột/bảng thường cho phép). Nếu không, khôi phục bản sao lưu database tạo ở bước trước nâng cấp và chấp nhận mất nội dung ghi sau thời điểm đó. Tránh pnpm migrate:down trên production."
  - q: "Có cần dừng site khi nâng cấp không?"
    a: "Migration chỉ thêm bảng, cột hoặc giá trị enum an toàn khi bản cũ vẫn phục vụ. Changelog đánh dấu bản nào không an toàn; với bản phá vỡ, hãy lên lịch bảo trì ngắn. Nên nâng CMS trước rồi mới nâng frontend dùng trường mới."
  - q: "R2 có được CMS sao lưu không?"
    a: "Không. CMS không sao lưu bucket R2. Hãy bật versioning cho bucket hoặc nhân bản bằng công cụ riêng như rclone sync sang bucket khác. Với site lưu ổ đĩa, lưu trữ thư mục MEDIA_DIR cùng thời điểm với bản dump database để mọi dòng media đều có file."
related:
  - /tu-host
  - /thuc-hanh-tot/bao-mat-va-phan-quyen
  - /tinh-nang/thu-vien-media
  - /ma-nguon-mo
  - /phat-hanh
docs: https://docs.opencms.kdigi.vn/tham-khao/upgrading/
---

Sao lưu KDIGI CMS nghĩa là lưu **cả** PostgreSQL (`pg_dump --format=custom`) **và** thư mục media cùng thời điểm; nâng cấp nghĩa là đọc CHANGELOG, sao lưu, cập nhật mã, chạy migration rồi kiểm tra đăng nhập, tài liệu, upload và một URL công khai. Rollback chủ yếu bằng cách khôi phục bản sao lưu.

> **Tóm tắt nhanh**
> - Cần 2 thứ: database + media (và nên giữ `PAYLOAD_SECRET`).
> - Schema chỉ đổi bằng migration có dấu thời gian; `push` bị tắt.
> - Container Docker tự `payload migrate` khi khởi động; `SKIP_MIGRATIONS=true` để tách bước.
> - `GET /api/health` chỉ cho biết tiến trình sống, **không** chứng minh schema đã cập nhật.
> - Hãy thử khôi phục trên máy tạm trước khi cần dùng thật.

## 1. Cái gì cần sao lưu

| Thành phần | Chứa gì | Cách sao lưu |
| --- | --- | --- |
| PostgreSQL | Toàn bộ nội dung, người dùng, cấu hình site, metadata media | `pg_dump --format=custom` |
| Media cục bộ | File tải lên: `<MEDIA_DIR>/<siteId>/<file>` | Nén thư mục / volume `media_data` |
| Media R2 | File trong bucket | Versioning hoặc nhân bản bucket (CMS không làm) |
| `PAYLOAD_SECRET` | Ký phiên, API key | Lưu trong kho bí mật; mất → phiên và khóa API mất hiệu lực |
| `.env` / biến môi trường | Cấu hình triển khai | Lưu ngoài server |

Volume Compose: `postgres_data` (DB), `media_data` → `/app/media` (upload), `app_data` → `/app/data` (secret sinh tự động). **`docker compose down -v` xóa volume.** Redeploy trên Coolify không đụng tới volume có tên.

## 2. Sao lưu database

Với PostgreSQL đi kèm Compose:

```bash
docker compose exec -T db pg_dump -U kdigi --format=custom kdigi > kdigi-$(date +%F).dump
```

Khôi phục vào database **trống**:

```bash
docker compose exec -T db pg_restore -U kdigi -d kdigi --clean --if-exists < kdigi-2026-01-01.dump
```

Với PostgreSQL do nhà cung cấp quản lý, dùng snapshot của họ. Trên Coolify, sao lưu định kỳ tích hợp áp dụng cho database là tài nguyên riêng; với service `db` nằm trong Compose, hãy chạy `pg_dump` bằng Scheduled Task hoặc cron trên host, rồi **đẩy file ra ngoài server**:

```bash
docker exec <db-container> pg_dump -U kdigi --format=custom kdigi > /backups/kdigi-$(date +%F).dump
find /backups -name 'kdigi-*.dump' -mtime +14 -delete
```

## 3. Sao lưu media

Ổ đĩa cục bộ:

```bash
docker compose exec -T app tar czf - -C /app/media . > media-$(date +%F).tgz
# khôi phục
docker compose exec -T app tar xzf - -C /app/media < media-2026-01-01.tgz
```

Hoặc từ ngoài container (tên volume xem bằng `docker volume ls`):

```bash
docker run --rm -v <project>_media_data:/media -v "$PWD":/backup alpine \
  tar czf /backup/media-backup.tgz -C /media .
```

**Mẹo nhất quán:** chạy dump database và nén media sát nhau để mỗi dòng `media` đều có file tương ứng. Với R2: bật versioning ở Cloudflare hoặc `rclone sync` sang bucket khác. Xem [thư viện media](/tinh-nang/thu-vien-media).

![Lịch sử phiên bản của một bài viết trong KDIGI CMS](/images/shots/versions-list.webp "Mỗi tài liệu giữ tối đa 30 phiên bản để quay lại khi biên tập nhầm")

## 4. Lịch sao lưu gợi ý

| Tần suất | Việc | Giữ |
| --- | --- | --- |
| Hằng đêm | `pg_dump` + nén media | 14 ngày |
| Trước mỗi nâng cấp | Dump thủ công, đặt tên theo phiên bản | Đến khi nâng cấp ổn định |
| Hằng tháng | **Khôi phục thử** trên máy tạm, mở admin, kiểm tra ảnh | — |

Ngoài sao lưu hạ tầng, nội dung có thêm hai lớp bảo vệ: lịch sử 30 phiên bản mỗi tài liệu (History/Diff/Restore) và thùng rác cho `pages`, `posts`, `products`, `landings`, `faqs`, `shortcodes`. Hai lớp này giúp sửa lỗi biên tập, không thay thế sao lưu.

## 5. Quy trình nâng cấp

1. **Đọc [CHANGELOG](/phat-hanh)** cho mọi phiên bản giữa bản hiện tại và bản đích: tìm mục “Breaking”, biến môi trường mới, thay đổi phản hồi REST mà frontend dùng.
2. **Sao lưu** database và media (mục 2–3). Đừng bỏ qua: rollback schema = khôi phục bản sao lưu.
3. **Lấy mã mới** và build lại:

   ```bash
   git fetch --tags && git checkout vX.Y.Z      # hoặc: git pull
   docker compose up -d --build                 # entrypoint chạy payload migrate trước khi start
   ```

   Coolify: redeploy. Không dùng Docker: `pnpm install --frozen-lockfile && pnpm build && pnpm migrate && pnpm start`.
4. **Cập nhật biến môi trường** nếu changelog thêm biến mới.
5. **Kiểm tra**: đăng nhập `/admin`, mở vài tài liệu mỗi collection, tải một ảnh, gọi một URL công khai từ frontend. Đừng chỉ dựa vào `/api/health`.

Chạy migration thủ công khi cần:

| Ở đâu | Lệnh |
| --- | --- |
| Checkout cục bộ | `pnpm migrate` |
| Xem trạng thái | `pnpm payload migrate:status` |
| Container đang chạy | `docker compose exec app node_modules/.bin/payload migrate` |
| Bước release riêng | Đặt `SKIP_MIGRATIONS=true` cho app, chạy lệnh trên trước khi chuyển lưu lượng |

## 6. Rollback

- Migration chỉ **thêm** bảng, cột, giá trị enum thường cho phép chạy lại image cũ.
- Nếu image cũ không đọc được schema mới: **khôi phục bản dump** tạo ở bước 2 (mất nội dung ghi sau đó).
- Không chạy `pnpm migrate:down` trên production: nó đảo cả **batch** gần nhất, có thể nhiều hơn một migration. Dùng ở database thử nghiệm.
- Phiên bản theo [SemVer](https://semver.org/); bản vá bảo mật chỉ phát hành cho nhánh `1.x` mới nhất, vì vậy hãy lên bản mới trước khi báo lỗi.

## 7. Những thay đổi môi trường dễ gây lỗi

| Thay đổi | Hệ quả |
| --- | --- |
| Đổi `PAYLOAD_SECRET` | Đăng xuất mọi người, vô hiệu API key; nội dung không ảnh hưởng |
| Đổi `PAYLOAD_PUBLIC_SERVER_URL` | Đổi origin admin và tiền tố URL media cục bộ (URL cũ đã nhúng trong cột `url`) |
| Local → R2 | Không có lệnh sẵn; sao chép file theo khóa `media/<siteId>/<file>`, rồi sửa `url` của media và các URL trong Markdown |
| Nâng Node/pnpm | Image dùng Node 22; yêu cầu tối thiểu Node ≥ 20.9; dùng `corepack enable` |

## 8. Nâng cấp khi bạn có fork

Khi thêm trường/collection: dùng `pnpm payload migrate:create <tên>`, **đọc SQL được sinh ra**, bảo vệ `CREATE TYPE` bằng khối `DO $$ … EXCEPTION`, dùng `IF NOT EXISTS`, viết `down()` và thử `migrate` → `migrate:down` → `migrate` trên database thử. Collection mới phải thêm khóa ngoại vào `payload_locked_documents_rels`, nếu không mọi trang admin báo 500. Chi tiết trong tài liệu nâng cấp và trang [mã nguồn mở](/ma-nguon-mo).

## Checklist

- [ ] Có dump DB và bản nén media gần nhất, **đã đẩy ra ngoài server**.
- [ ] Đã thử khôi phục trong 30 ngày qua.
- [ ] `PAYLOAD_SECRET` được lưu riêng.
- [ ] Đã đọc CHANGELOG trước khi nâng cấp; có cửa sổ bảo trì cho bản “Breaking”.
- [ ] Sau nâng cấp: đăng nhập, mở tài liệu, tải ảnh, kiểm tra URL công khai.

Triển khai ban đầu và Caddy/nginx: xem [tự host](/tu-host). Biện pháp bảo mật liên quan: [bảo mật và phân quyền](/thuc-hanh-tot/bao-mat-va-phan-quyen).
