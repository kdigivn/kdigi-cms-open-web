---
title: "Sao lưu và nâng cấp KDIGI CMS an toàn"
description: "Quy trình sao lưu cơ sở dữ liệu và media, kiểm tra khôi phục, nâng cấp phiên bản bằng Docker, xem release notes và cách quay lui khi nâng cấp gặp sự cố."
h1: "Sao lưu và nâng cấp KDIGI CMS: quy trình không mất dữ liệu"
navTitle: "Sao lưu và nâng cấp"
icon: hard-drive
lead: "Sao lưu cả database lẫn media, đọc CHANGELOG, migrate rồi kiểm tra. Rollback chủ yếu là khôi phục bản sao lưu."
primaryKeyword: "sao lưu và nâng cấp cms"
updated: 2026-11-03
heroImage: /images/shots/dashboard.webp
heroAlt: "Dashboard quản trị KDIGI CMS sau khi nâng cấp"
schema: TechArticle
faq:
  - q: "Cần sao lưu những gì để khôi phục toàn bộ site?"
    a: "Hai thứ cùng lúc: PostgreSQL và thư mục media (volume media_data, hoặc bucket R2). Nên giữ cả PAYLOAD_SECRET; mất nó thì phiên và API key vô hiệu nhưng dữ liệu vẫn đọc được."
  - q: "Nâng cấp có tự cập nhật schema không?"
    a: "Có, qua migration chứ không đồng bộ tự động. Image Docker chạy payload migrate khi khởi động trừ khi đặt SKIP_MIGRATIONS=true."
  - q: "Nếu nâng cấp lỗi thì quay lại thế nào?"
    a: "Triển khai lại image cũ nếu nó đọc được schema đã migrate. Nếu không, khôi phục bản dump tạo trước nâng cấp. Tránh pnpm migrate:down trên production."
related:
  - /tu-host
  - /thuc-hanh-tot/bao-mat-va-phan-quyen
  - /tinh-nang/thu-vien-media
  - /ma-nguon-mo
  - /phat-hanh
docs: https://docs.cms.kdigi.vn/tham-khao/upgrading/
---

Sao lưu nghĩa là lưu **cả** PostgreSQL và thư mục media cùng thời điểm. Nâng cấp nghĩa là đọc CHANGELOG, sao lưu, cập nhật mã, chạy migration rồi kiểm tra.

> **Tóm tắt nhanh**
> - Cần hai thứ: database và media.
> - Schema chỉ đổi bằng migration; `push` bị tắt.
> - Container tự `payload migrate` khi khởi động.
> - `GET /api/health` không chứng minh schema đã cập nhật.

## :package: Cần sao lưu gì

| Thành phần | Cách sao lưu |
| --- | --- |
| PostgreSQL (nội dung, người dùng, cấu hình) | `pg_dump --format=custom` |
| Media cục bộ `<MEDIA_DIR>/<siteId>/` | Nén thư mục hoặc volume `media_data` |
| Media R2 | Versioning hoặc nhân bản bucket (CMS không làm) |
| `PAYLOAD_SECRET`, `.env` | Lưu ngoài server |

> **Cảnh báo** `docker compose down -v` xóa volume. Redeploy trên Coolify không đụng tới volume có tên.

## :database: Sao lưu và khôi phục database

```bash
docker compose exec -T db pg_dump -U kdigi --format=custom kdigi > kdigi-$(date +%F).dump
# khôi phục vào database trống
docker compose exec -T db pg_restore -U kdigi -d kdigi --clean --if-exists < kdigi-2026-01-01.dump
```

Với PostgreSQL do nhà cung cấp quản lý, dùng snapshot của họ. Trên Coolify, chạy `pg_dump` bằng Scheduled Task hoặc cron rồi **đẩy file ra ngoài server**.

## :hard-drive: Sao lưu media

```bash
docker compose exec -T app tar czf - -C /app/media . > media-$(date +%F).tgz
```

> **Mẹo** Chạy dump database và nén media sát nhau để mỗi dòng `media` đều có file. Xem [thư viện media](/tinh-nang/thu-vien-media).

![Lịch sử phiên bản của một bài viết trong KDIGI CMS](/images/shots/versions-list.webp "Mỗi tài liệu giữ tối đa 30 phiên bản để quay lại khi biên tập nhầm")

## :calendar-clock: Lịch sao lưu gợi ý

| Tần suất | Việc | Giữ |
| --- | --- | --- |
| Hằng đêm | `pg_dump` + nén media | 14 ngày |
| Trước mỗi nâng cấp | Dump thủ công, đặt tên theo phiên bản | Đến khi ổn định |
| Hằng tháng | **Khôi phục thử** trên máy tạm | — |

Lịch sử phiên bản và thùng rác không thay thế sao lưu.

## :rocket: Quy trình nâng cấp

:::steps
- :book-open: **Đọc CHANGELOG** Tìm mục “Breaking”, biến môi trường mới, thay đổi REST. Xem [phát hành](/phat-hanh).
- :hard-drive: **Sao lưu** Database và media; rollback schema chính là khôi phục bản sao lưu.
- :terminal: **Lấy mã mới** `git pull && docker compose up -d --build`; entrypoint chạy migrate trước khi start.
- :settings: **Cập nhật biến môi trường** Nếu CHANGELOG thêm biến mới.
- :check: **Kiểm tra** Đăng nhập `/admin`, mở tài liệu, tải một ảnh, gọi một URL công khai.
:::

Chạy migration thủ công: `pnpm migrate`, hoặc `docker compose exec app node_modules/.bin/payload migrate`. Muốn tách bước release, đặt `SKIP_MIGRATIONS=true` cho app.

## :history: Rollback

:::pros-cons
**Ưu điểm**
- Migration thường chỉ thêm bảng, cột, enum nên image cũ thường chạy lại được
- Có bản dump trước nâng cấp để khôi phục

**Hạn chế**
- Image cũ không đọc được schema mới thì phải restore dump, mất nội dung ghi sau đó
- Không chạy `pnpm migrate:down` trên production: nó đảo cả batch gần nhất
:::

Phiên bản theo SemVer; bản vá bảo mật chỉ phát hành cho nhánh `1.x` mới nhất.

## :settings: Thay đổi môi trường dễ gây lỗi

:::cards 2
- :key-round: **Đổi khóa bí mật** `PAYLOAD_SECRET`: đăng xuất mọi người, vô hiệu API key; nội dung không ảnh hưởng.
- :link: **Đổi URL máy chủ** `PAYLOAD_PUBLIC_SERVER_URL`: đổi origin admin và tiền tố URL media cục bộ.
- :cloud-upload: **Local → R2** Không có lệnh sẵn; sao chép file rồi sửa `url` của media và URL trong Markdown.
:::

## :list-checks: Checklist

:::check
- Có dump DB và bản nén media gần nhất, đã đẩy ra ngoài server
- Đã thử khôi phục trong 30 ngày qua
- `PAYLOAD_SECRET` được lưu riêng
- Đã đọc CHANGELOG; có cửa sổ bảo trì cho bản “Breaking”
- Sau nâng cấp: đăng nhập, mở tài liệu, tải ảnh, kiểm tra URL công khai
:::

Triển khai ban đầu: [tự host](/tu-host). Bảo mật liên quan: [bảo mật và phân quyền](/thuc-hanh-tot/bao-mat-va-phan-quyen).
