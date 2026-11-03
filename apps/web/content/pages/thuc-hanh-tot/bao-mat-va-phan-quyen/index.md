---
title: "Bảo mật và phân quyền khi tự host CMS"
description: "Hướng dẫn bảo mật: phân quyền tối thiểu theo vai trò và site, PAYLOAD_SECRET, HTTPS, giới hạn truy cập quản trị, sao lưu và bảo vệ SSRF cho nhập ảnh từ URL."
h1: "Bảo mật và phân quyền khi tự host KDIGI CMS"
primaryKeyword: "bảo mật cms"
updated: 2026-11-03
heroImage: /images/shots/roles.webp
heroAlt: "Màn hình gán vai trò editor và site cho người dùng trong KDIGI CMS"
schema: TechArticle
faq:
  - q: "Người dùng của site A có xem được nội dung site B không?"
    a: "Không, nếu họ chỉ được gán site A. Ranh giới thật là các access predicate tenantScopedRead/Write ở từng collection. Bộ lọc site trong admin chỉ là tiện ích giao diện. Điều cần chú ý: request ẩn danh không bị lọc theo site, nên frontend luôn phải thêm where[tenant][equals]=<id>."
  - q: "Vai trò author có thể tự đăng bài không?"
    a: "Không. Author chỉ tạo và sửa bài của chính mình, hook enforceAuthorPermissions chặn mọi lần lưu có trạng thái published, kể cả sửa bài đang live hay khôi phục bài đã đăng từ thùng rác. Editor trở lên mới được đăng. Đây là nền cho quy trình duyệt trước khi xuất bản."
  - q: "Ai cũng tạo được super-admin trên bản cài mới à?"
    a: "Trên database trống, người đầu tiên gửi form tạo user đầu tiên ở /admin sẽ thành super-admin. Vì vậy hãy mở admin ngay sau khi triển khai, hoặc chặn truy cập ở reverse proxy cho đến khi tạo xong. Sau đó chỉ super-admin mới tạo được người dùng và site."
  - q: "Khóa R2 và API key có lộ qua API không?"
    a: "Khóa R2 accessKeyId và secretAccessKey có access.read là false nên không bao giờ xuất hiện trong REST hay GraphQL; chúng được ghi qua endpoint riêng chỉ super-admin dùng. Tuy vậy, mọi trường thường của Sites đều đọc công khai, nên đừng đặt bí mật vào đó."
  - q: "Bình luận công khai có bị spam không và chặn thế nào?"
    a: "Bình luận luôn vào trạng thái pending, chỉ hiện sau khi được duyệt. Đặt RECAPTCHA_SECRET để xác minh token, nhưng điểm thấp chỉ được ghi log, không chặn request. Endpoint không giới hạn theo IP, nên hãy đặt rate limit ở reverse proxy và dùng MODERATION_WEBHOOK_URL để nhận thông báo."
related:
  - /tinh-nang/phan-quyen-nguoi-dung
  - /tu-host
  - /thuc-hanh-tot/sao-luu-va-nang-cap
  - /tinh-nang/quan-ly-nhieu-website
  - /ma-nguon-mo
docs: https://docs.opencms.kdigi.vn/huong-dan/vai-tro-phan-quyen/
---

Bảo mật KDIGI CMS dựa trên ba lớp: cấu hình đúng khi triển khai (`PAYLOAD_SECRET` ≥ 32 ký tự, HTTPS, tạo `super-admin` ngay), phân quyền tối thiểu theo vai trò và site, và kiểm soát các endpoint công khai như bình luận. Dưới đây là checklist có căn cứ từ `SECURITY.md` và tài liệu phân quyền.

> **Tóm tắt nhanh**
> - 4 vai trò cộng dồn: `super-admin` › `admin` › `editor` › `author`; người đầu tiên của bản cài mới là `super-admin`.
> - Ranh giới giữa các site là access predicate ở từng collection, không phải bộ chọn site trong admin.
> - `PAYLOAD_SECRET` dưới 32 ký tự ở production → server từ chối khởi động.
> - Khóa R2 chỉ ghi, không bao giờ đọc ngược qua API; chỉ `super-admin` sửa được.
> - Nhập ảnh từ URL có SSRF guard; Markdown được làm sạch bằng allow-list.

![Danh sách người dùng và vai trò trong KDIGI CMS](/images/shots/users-list.webp "Danh sách người dùng: mỗi người có một vai trò và các site được gán")

## 1. Khi triển khai: những điều không được bỏ qua

| Hạng mục | Việc cần làm | Vì sao |
| --- | --- | --- |
| `PAYLOAD_SECRET` | Chuỗi ngẫu nhiên ≥ 32 ký tự (`openssl rand -hex 32`) | Ký phiên và API key; production không boot nếu ngắn hơn; đổi giá trị = đăng xuất mọi người |
| `PAYLOAD_PUBLIC_SERVER_URL` | Đúng origin `https://` của CMS | Sai → 403, mất cookie đăng nhập, nó cũng là tiền tố URL media |
| HTTPS | Reverse proxy (Caddy/nginx/Coolify) | CMS không tự làm TLS |
| Cổng 3000 | Tường lửa, chỉ proxy được truy cập | Image chạy `next start` ở 3000 |
| PostgreSQL | Chỉ mở trong mạng nội bộ; đổi `POSTGRES_PASSWORD` mặc định nếu cổng có thể tới | Compose cục bộ dùng mật khẩu mặc định `kdigi` |
| Tài khoản đầu tiên | Tạo ngay sau khi triển khai | Trên DB trống, ai gửi form trước thành `super-admin` |
| `SEED_DEMO` | **Không** bật ở production | Tạo site và nội dung mẫu |

Ví dụ Caddy và các lệnh Compose xem ở [tự host](/tu-host).

## 2. Mô hình vai trò

| Vai trò | Phạm vi | Làm được |
| --- | --- | --- |
| `super-admin` | Mọi site | Bỏ qua bộ lọc site; **duy nhất** tạo/xóa người dùng và site, sửa cấu hình R2, gán site, chạy job |
| `admin` | Site được gán | Quản lý nội dung, đăng, duyệt bình luận, cài đặt site, xóa vĩnh viễn |
| `editor` | Site được gán | Quản lý nội dung, đăng, duyệt bình luận, chuyển vào thùng rác |
| `author` | Site được gán | Tạo nội dung; sửa/bỏ vào thùng rác **chỉ bài của mình**; **không đăng** |

Mỗi người dùng chỉ có **một** vai trò áp cho mọi site họ được gán (vai trò là toàn cục). Nếu cần một người là editor ở site A nhưng chỉ author ở site B, hãy tạo hai tài khoản.

**Nguyên tắc tối thiểu quyền:**

1. Cộng tác viên viết bài → `author`; biên tập viên duyệt và bấm Đăng.
2. Quản lý một khách hàng/chi nhánh → `admin` chỉ gán site đó.
3. Giữ `super-admin` cho 1–2 người vận hành hạ tầng.
4. Lưu ý: `author` vẫn sửa được `taxonomies`, `authors`, `menus`, `faqs`, `shortcodes`, `redirects`, `media` trong site của mình. Hãy cân nhắc trước khi cấp.

Chi tiết từng vai trò: [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung).

## 3. Cách ly giữa các site

Có hai lớp, và chỉ một lớp là ranh giới thật:

| Lớp | Vai trò |
| --- | --- |
| Bộ lọc danh sách và site selector trong admin (cookie `payload-tenant`) | Tiện ích giao diện, **không** phải kiểm soát bảo mật |
| Access predicate `tenantScopedRead/Write/VersionsRead` ở từng collection | **Ranh giới thật**, ràng buộc `where` cho mọi thao tác |

ID site do client gửi (query `tenantId`, body, cookie) không bao giờ được tin trực tiếp: chỉ được chấp nhận với `super-admin` hoặc thành viên site đó. Khi không xác định được site, endpoint trả 400 thay vì chạy không giới hạn.

**Cảnh báo cho frontend:** request ẩn danh đọc nội dung đã xuất bản của **mọi** site nếu bạn không lọc. Luôn thêm `where[tenant][equals]=<id>`. Xem [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website).

## 4. API key và quyền truy cập máy–máy

- `users` bật `useAPIKey`; khóa xác thực **như chính người dùng đó** và chịu cùng quy tắc vai trò/site. Header: `Authorization: users API-Key <key>`.
- Frontend công khai nên gọi API **không cookie, không Authorization** để chỉ thấy nội dung công khai.
- Tạo user riêng cho mỗi tích hợp (importer, CI), gán đúng site, đặt vai trò thấp nhất đủ dùng.
- Phiên đăng nhập admin kéo dài 180 ngày (`auth.tokenExpiration`); thu hồi bằng cách đổi `PAYLOAD_SECRET` (cũng làm mất hiệu lực mọi API key).

## 5. Bí mật và trường nhạy cảm

| Trường | Quy tắc |
| --- | --- |
| `sites.r2.accessKeyId`, `secretAccessKey` | `access.read: () => false`, chỉ ghi qua `POST /api/sites/:id/secret` (super-admin); GET chỉ trả `{ field, hasValue }` |
| `authors.email`, `comments.authorEmail` | Không bao giờ trả về |
| `createdBy`, `commentCount`, `kkStarRating` | Không sửa được từ API |
| `users.tenants[]`, `role` | Chỉ `super-admin` sửa; người dùng không tự nâng quyền |

**Lưu ý quan trọng:** `sites` được đọc công khai, nên **đừng bao giờ đặt bí mật vào trường thường** của Sites. Nếu bạn viết endpoint tùy biến dùng Local API với `overrideAccess: true`, nó có thể đọc cả trường bí mật — hãy giới hạn dữ liệu trả về.

## 6. Endpoint công khai: bình luận và đánh giá

- `POST /api/comments/create`: luôn tạo `pending`; nội dung được làm sạch HTML; `tenantSiteKey` phải khớp site của bài (sai → 403).
- `RECAPTCHA_SECRET`: nếu đặt, token được xác minh nhưng kết quả xấu chỉ **ghi log**, không chặn. Không đặt → production in cảnh báo `[SECURITY]` lúc khởi động.
- Không có rate limit theo IP: **đặt rate limit ở reverse proxy**, và dùng `MODERATION_WEBHOOK_URL` để nhận thông báo bình luận mới.
- `POST /api/ratings/submit`: chỉ lưu băm SHA-256 của IP để chống bỏ phiếu lặp; đặt header `X-Client-IP` từ frontend server để lấy IP thật.

## 7. Nội dung và tải lên

- Markdown → HTML qua `markdown-it` rồi `sanitize-html` theo allow-list; `script`, `style`, `iframe`, `style=` và `on*` không lọt ra HTML.
- `POST /api/media/from-url` chặn SSRF: chỉ `http/https`, phân giải DNS rồi từ chối nếu **bất kỳ** địa chỉ nào thuộc dải riêng/dự phòng (10/8, 172.16/12, 192.168/16, 127/8, 169.254/16…), tối đa 3 lần chuyển hướng (kiểm lại từng bước), timeout 15 giây, giới hạn 25 MB. Rủi ro còn lại (DNS rebinding) cần quyền admin.
- File cục bộ trả `X-Content-Type-Options: nosniff`, SVG kèm CSP `default-src 'none'; sandbox`.

## 8. Tài khoản demo công khai

Nếu bạn chạy sandbox công khai, liệt kê email trong `DEMO_ACCOUNT_EMAILS`: tài khoản đó không đổi được email, mật khẩu, API key hay tự xóa (403). Cho nó vai trò `editor` và **một** site demo. Đặt `pnpm demo:reset` chạy hằng đêm. Xem [demo](/demo).

## 9. Báo lỗi bảo mật

Dự án chỉ hỗ trợ bản `1.x` mới nhất. Báo lỗi qua GitHub Security Advisories (không mở issue công khai); cam kết phản hồi trong 3 ngày làm việc và cập nhật trạng thái trong 10 ngày làm việc. Đọc thêm ở trang [mã nguồn mở](/ma-nguon-mo).

## Checklist nhanh

- [ ] `PAYLOAD_SECRET` ≥ 32 ký tự, đã sao lưu cùng database.
- [ ] HTTPS, cổng 3000 và Postgres không lộ ra internet.
- [ ] Tài khoản `super-admin` đã tạo; không bật `SEED_DEMO`.
- [ ] Mỗi người dùng chỉ được gán đúng site; cộng tác viên là `author`.
- [ ] Frontend lọc `tenant` trên mọi truy vấn ẩn danh.
- [ ] `RECAPTCHA_SECRET` + rate limit ở proxy nếu mở bình luận.
- [ ] Đã có [kế hoạch sao lưu và nâng cấp](/thuc-hanh-tot/sao-luu-va-nang-cap).
