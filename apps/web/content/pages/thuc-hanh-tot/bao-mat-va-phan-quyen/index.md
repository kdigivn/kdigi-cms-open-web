---
title: "Bảo mật và phân quyền khi tự host CMS"
description: "Hướng dẫn bảo mật: phân quyền tối thiểu theo vai trò và site, PAYLOAD_SECRET, HTTPS, giới hạn truy cập quản trị, sao lưu và bảo vệ SSRF cho nhập ảnh từ URL."
h1: "Bảo mật và phân quyền khi tự host KDIGI CMS"
navTitle: "Bảo mật và phân quyền"
icon: shield-check
lead: "Ba lớp: cấu hình khi triển khai, phân quyền tối thiểu theo vai trò và site, kiểm soát endpoint công khai."
primaryKeyword: "bảo mật cms"
updated: 2026-11-03
heroImage: /images/shots/roles.webp
heroAlt: "Màn hình gán vai trò editor và site cho người dùng trong KDIGI CMS"
schema: TechArticle
faq:
  - q: "Người dùng site A có xem được nội dung site B không?"
    a: "Không, nếu họ chỉ được gán site A: ranh giới thật là access predicate tenantScopedRead/Write. Request ẩn danh không bị lọc theo site, nên frontend phải thêm where[tenant][equals]=<id>."
  - q: "Vai trò author có thể tự đăng bài không?"
    a: "Không. Hook enforceAuthorPermissions chặn mọi lần lưu có trạng thái published, kể cả sửa bài đang live hay khôi phục từ thùng rác. Editor trở lên mới được đăng."
  - q: "Ai cũng tạo được super-admin trên bản cài mới à?"
    a: "Trên database trống, người đầu tiên gửi form tạo user đầu tiên ở /admin thành super-admin. Hãy tạo ngay sau khi triển khai hoặc chặn admin ở reverse proxy."
  - q: "Khóa R2 và API key có lộ qua API không?"
    a: "Khóa R2 có access.read là false, không bao giờ xuất hiện trong REST hay GraphQL. Nhưng mọi trường thường của Sites đều đọc công khai, nên đừng đặt bí mật vào đó."
  - q: "Bình luận công khai có bị spam không?"
    a: "Bình luận luôn vào pending, chỉ hiện sau khi duyệt. Endpoint không giới hạn theo IP, nên hãy đặt rate limit ở reverse proxy."
related:
  - /tinh-nang/phan-quyen-nguoi-dung
  - /tu-host
  - /thuc-hanh-tot/sao-luu-va-nang-cap
  - /tinh-nang/quan-ly-nhieu-website
  - /ma-nguon-mo
docs: https://docs.cms.kdigi.vn/huong-dan/vai-tro-phan-quyen/
---

Cấu hình đúng khi triển khai, cấp quyền tối thiểu theo vai trò và site, rồi kiểm soát endpoint công khai. Checklist dưới đây có căn cứ từ `SECURITY.md` và tài liệu phân quyền.

> **Tóm tắt nhanh**
> - Bốn vai trò: `super-admin` › `admin` › `editor` › `author`.
> - Ranh giới giữa site là access predicate, không phải bộ chọn site.
> - `PAYLOAD_SECRET` dưới 32 ký tự: production không khởi động.
> - Khóa R2 chỉ ghi, không đọc ngược qua API.

![Danh sách người dùng và vai trò trong KDIGI CMS](/images/shots/users-list.webp "Danh sách người dùng: mỗi người có một vai trò và các site được gán")

## :rocket: Khi triển khai

:::check
- `PAYLOAD_SECRET` ngẫu nhiên ≥ 32 ký tự (`openssl rand -hex 32`)
- `PAYLOAD_PUBLIC_SERVER_URL` đúng origin `https://` của CMS
- HTTPS qua reverse proxy (Caddy, nginx, Coolify)
- Cổng 3000 chỉ proxy truy cập được
- PostgreSQL chỉ mở trong mạng nội bộ, đổi mật khẩu mặc định
- Tạo `super-admin` ngay sau khi triển khai
- Không bật `SEED_DEMO` ở production
:::

Ví dụ Caddy và lệnh Compose xem ở [tự host](/tu-host).

## :users: Mô hình vai trò

| Vai trò | Phạm vi | Làm được |
| --- | --- | --- |
| `super-admin` | Mọi site | Duy nhất tạo/xóa người dùng và site, sửa R2, chạy job |
| `admin` | Site được gán | Quản lý nội dung, đăng, cài đặt site, xóa vĩnh viễn |
| `editor` | Site được gán | Quản lý nội dung, đăng, duyệt bình luận |
| `author` | Site được gán | Chỉ sửa bài của mình, **không đăng** |

:::cards
- :users: **Cộng tác viên là author** Biên tập viên duyệt và bấm Đăng.
- :building-2: **Khách hàng là admin** Chỉ gán đúng site của họ.
- :key-round: **Super-admin ít người** Giữ cho 1–2 người vận hành hạ tầng.
:::

> **Lưu ý** Vai trò là toàn cục: cần editor ở site A nhưng author ở site B thì tạo hai tài khoản. Author vẫn sửa được `taxonomies`, `menus`, `faqs`, `redirects`, `media` trong site của mình. Chi tiết: [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung).

## :layers: Cách ly giữa các site

| Lớp | Vai trò |
| --- | --- |
| Bộ chọn site trong admin | Tiện ích giao diện, **không** phải kiểm soát bảo mật |
| Access predicate `tenantScopedRead/Write` | **Ranh giới thật** cho mọi thao tác |

> **Cảnh báo** Request ẩn danh đọc nội dung đã xuất bản của mọi site nếu bạn không lọc. Luôn thêm `where[tenant][equals]=<id>`. Xem [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website).

## :key-round: API key và bí mật

:::check
- Mỗi tích hợp một user riêng, vai trò thấp nhất đủ dùng
- Frontend công khai gọi API không cookie, không Authorization
- Khóa R2 chỉ ghi qua `POST /api/sites/:id/secret` (super-admin)
- Không đặt bí mật vào trường thường của Sites
- Đổi `PAYLOAD_SECRET` để thu hồi mọi phiên và API key
:::

Phiên admin kéo dài 180 ngày (`auth.tokenExpiration`).

## :lock: Endpoint công khai và tải lên

:::cards
- :heart-handshake: **Bình luận** Luôn `pending`; `RECAPTCHA_SECRET` chỉ ghi log điểm thấp. Đặt rate limit ở proxy.
- :cloud-upload: **Nhập ảnh từ URL** `POST /api/media/from-url` chặn SSRF: từ chối dải IP riêng, tối đa 3 lần chuyển hướng, 25 MB.
- :file-text: **Markdown** Làm sạch bằng allow-list; `script`, `iframe`, `on*` bị loại.
:::

## :life-buoy: Báo lỗi bảo mật

Dự án chỉ hỗ trợ bản `1.x` mới nhất. Báo qua GitHub Security Advisories, không mở issue công khai; phản hồi trong 3 ngày làm việc, cập nhật trạng thái trong 10 ngày. Xem [mã nguồn mở](/ma-nguon-mo).

## :list-checks: Checklist nhanh

:::check
- `PAYLOAD_SECRET` ≥ 32 ký tự, đã sao lưu cùng database
- HTTPS; cổng 3000 và Postgres không lộ ra internet
- Mỗi người chỉ được gán đúng site; cộng tác viên là `author`
- Frontend lọc `tenant` trên mọi truy vấn ẩn danh
- Rate limit ở proxy nếu mở bình luận
- Có [kế hoạch sao lưu và nâng cấp](/thuc-hanh-tot/sao-luu-va-nang-cap)
:::
