---
title: "Thư viện media: thư mục, sửa ảnh, WebP, R2 | KDIGI CMS"
description: "Quản lý ảnh theo thư mục, sửa ảnh trực tiếp, nhập ảnh từ URL có chống SSRF, lưu trên ổ đĩa hoặc Cloudflare R2, xuất WebP để trang tải nhanh hơn."
h1: "Thư viện media với thư mục, trình sửa ảnh và lưu trữ R2"
navTitle: "Thư viện media"
primaryKeyword: "thư viện media"
updated: 2026-11-03
heroImage: "/images/art/tinh-nang-thu-vien-media-hero.webp"
heroAlt: "Thư mục đất sét với các thẻ ảnh kính mờ và nút tải lên xanh, đại diện cho thư viện media"
schema: "TechArticle"
faq:
  - q: "KDIGI CMS lưu file media ở đâu?"
    a: "Mặc định trên đĩa local, trong thư mục MEDIA_DIR (trong Docker là /app/media), tách theo ID site. Nếu một site khai báo bucket và accountId Cloudflare R2 thì các upload mới của site đó đi vào R2. Mỗi site trên cùng một bản cài có thể dùng một backend khác nhau."
  - q: "Nhập ảnh từ URL có an toàn không?"
    a: "Endpoint POST /api/media/from-url chỉ nhận http/https, phân giải DNS trước và từ chối nếu bất kỳ địa chỉ nào thuộc dải private hoặc reserved (127/8, 10/8, 169.254/16 …). Redirect được theo dõi thủ công tối đa 3 bước, mỗi bước kiểm tra lại. Giới hạn 15 giây và 25 MB mỗi ảnh."
  - q: "Chỉnh sửa ảnh trong thư viện có làm mất ảnh gốc không?"
    a: "Có. Trình sửa ảnh (xoay, lật, cắt, đổi kích thước) ghi đè file tại chỗ để URL không đổi, nên thao tác này không hoàn tác được; giao diện luôn hỏi xác nhận trước khi lưu. Nếu cần giữ bản gốc, hãy tải bản sao lên trước khi sửa."
  - q: "Có tự chuyển ảnh sang WebP không?"
    a: "Có, nhưng chỉ cho site dùng R2 và bật r2.compressToWebp (mặc định tắt). JPEG, PNG, TIFF, AVIF được chuyển sang WebP theo r2.webpQuality (mặc định 80). SVG và GIF động không bị chuyển; nếu WebP lớn hơn bản gốc thì giữ bản gốc."
  - q: "Cần sao lưu những gì để không mất ảnh?"
    a: "Cả cơ sở dữ liệu lẫn file media, vì database chỉ giữ metadata và đường dẫn. Với đĩa local, lưu trữ volume media_data; với R2, dùng versioning của bucket hoặc đồng bộ sang bucket khác (ví dụ rclone). Nên chụp hai bản sao lưu gần nhau về thời điểm."
related:
  - /tinh-nang/trinh-soan-thao-markdown
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/phan-quyen-nguoi-dung
  - /tu-host
  - /thuc-hanh-tot/hieu-nang-va-cache
docs: "https://docs.opencms.kdigi.vn/huong-dan/thu-vien-media/"
---

Thư viện media của KDIGI CMS là nơi lưu mọi ảnh, video và tài liệu của từng website: tổ chức bằng thư mục, mỗi file bắt buộc có văn bản thay thế (`alt`), lưu mặc định trên đĩa local hoặc tuỳ chọn trên Cloudflare R2 theo từng site, có trình sửa ảnh và nhập ảnh từ URL có chặn SSRF.

> **Tóm tắt nhanh**
> - Lưu trữ **hybrid theo từng site**: đĩa local mặc định, Cloudflare R2 nếu site khai báo `bucket` + `accountId`.
> - **Thư mục** gốc của Payload, giới hạn trong phạm vi site đang chọn; có lưới/danh sách, tìm kiếm, lightbox, kéo thả nhiều file.
> - **Trình sửa ảnh**: xoay, lật, cắt, đổi kích thước (tối đa 8192 px) — ghi đè tại chỗ.
> - **Nhập từ URL** với SSRF guard: tối đa 3 redirect, 15 giây, 25 MB.
> - **WebP khi upload** cho site R2 (tuỳ chọn); `alt` là trường bắt buộc.

![Thư viện media KDIGI CMS: lưới ảnh, thư mục, upload và nhập ảnh từ URL](/images/shots/media.webp)

## Thư viện media làm được gì

Khác với một thư mục `wp-content/uploads` phẳng, thư viện của KDIGI CMS gắn chặt với mô hình đa site ([quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website)). Mỗi tài liệu Media có trường `tenant` (site sở hữu), được gán tự động khi upload và chỉ super-admin mới đổi được.

Giao diện thư viện (`media-grid-list-view.tsx`) cung cấp:

- Chế độ **lưới** và **danh sách**.
- Tìm theo tên file hoặc `alt`.
- Lọc theo loại: tất cả, ảnh, video, tài liệu.
- Breadcrumb thư mục, điều hướng thư mục con, form tạo thư mục mới, điều khiển "chuyển vào thư mục" cho từng file.
- Lightbox xem ảnh và upload nhiều file bằng kéo thả.
- Luôn bị giới hạn trong site đang chọn ở bộ chuyển site của trang quản trị.

Có bốn đường vào thư viện: dropzone của trang Media, dán hoặc kéo thả ảnh vào [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown), `POST /api/media` (multipart) và nhập từ URL.

## Lưu trữ: đĩa local hay Cloudflare R2

Collection Media dùng plugin cloud-storage của Payload với một adapter hybrid (`src/lib/r2-storage-adapter.ts`). Adapter quyết định **cho từng lượt upload, theo từng site**:

| Điều kiện | Nơi lưu |
| --- | --- |
| Site có `Sites.r2.bucket` và `Sites.r2.accountId`, và `R2_OFF` khác `true` | Cloudflare R2 (S3 API) |
| Mọi trường hợp còn lại | Đĩa local |

Nhờ vậy một bản cài mới không cần object storage. Các site trên cùng một bản cài có thể dùng backend khác nhau.

### Đĩa local (mặc định)

- Bố cục: `<MEDIA_DIR>/<siteId>/<tên-file>`; upload không thuộc site nào vào `<MEDIA_DIR>/shared/`. Trong image Docker, `MEDIA_DIR` là `/app/media`.
- Tên file được slug hoá: bỏ dấu tiếng Việt, chữ thường, ký tự ngoài `[a-z0-9-]` thành `-`, giữ phần mở rộng.
- Cùng tên trong cùng site thì **ghi đè** file cũ.
- URL lưu trong database: `<PAYLOAD_PUBLIC_SERVER_URL>/api/media/file/<tên-file>?t=<siteId>`.
- Header phục vụ file: `Cache-Control: public, max-age=3600`, ETag yếu (kích thước + mtime, hỗ trợ 304), `X-Content-Type-Options: nosniff`. SVG đi kèm CSP `default-src 'none'; … sandbox`. Loại file lạ được trả về dạng `application/octet-stream` với `Content-Disposition: attachment`.
- Chống path traversal: tên site và tên file được kiểm tra theo mẫu chặt, đường dẫn cuối cùng phải nằm trong `MEDIA_DIR`.

### Cloudflare R2 (tuỳ chọn, theo site)

Cấu hình tại **Sites > Hệ thống > Cloudflare R2 (Storage)**; chỉ super-admin sửa được nhóm này.

| Trường | Ý nghĩa |
| --- | --- |
| `r2.bucket`, `r2.accountId` | Bắt buộc cả hai thì R2 mới được dùng; endpoint là `https://<accountId>.r2.cloudflarestorage.com` |
| `r2.publicBaseUrl` | URL CDN công khai của bucket, ví dụ `https://cdn.example.com` |
| `r2.accessKeyId`, `r2.secretAccessKey` | Token API của bucket. **Chỉ ghi, không đọc lại**: không bao giờ xuất hiện trong REST hay GraphQL |
| `r2.compressToWebp`, `r2.webpQuality` | Bật nén WebP (mặc định tắt) và chất lượng 1–100 (mặc định 80) |

Khoá đối tượng trong bucket có dạng `media/<siteId>/<đường-dẫn-thư-mục>/<tên-file-slug>`. Nếu `publicBaseUrl` trống, file được phục vụ qua route media của CMS bằng redirect 302 tới URL ký sẵn có hạn một giờ — route này cần ngữ cảnh site và trả 401 cho khách ẩn danh, nên **site có media công khai phải đặt `publicBaseUrl`**.

Nút **Fetch R2** (`POST /api/media/fetch-from-r2`) liệt kê bucket của site và tạo bản ghi Media cho những object chưa có trong database mà không upload lại; mỗi lượt tối đa 200 object (bỏ qua object trên 50 MB), có thể bấm tiếp để chạy phần còn lại. Thao tác idempotent và chỉ áp dụng cho site R2.

## Quy trình upload

1. **Xác định site sở hữu** theo thứ tự: `tenant` trong body → cookie site đang chọn `payload-tenant` → trang sửa Sites trong referer → site duy nhất của người dùng. Người không phải super-admin không thể upload vào site không thuộc về mình.
2. **Nén WebP** (nếu site R2 bật tuỳ chọn).
3. **Ghi file** vào đĩa local hoặc R2 rồi trả về URL.
4. **Khi đọc**: nếu có `externalUrl` thì nó thay `url`; nếu `version > 1` (ảnh đã sửa) thì thêm `?v=<version>` để phá cache CDN.

Client tự viết gọi `POST /api/media` phải gửi các trường trong một phần `_payload` dạng JSON, ví dụ `{"alt":"Logo","folder":null}` — Payload 3 bỏ qua trường form rời và trả 400. Quyền: đọc công khai (URL được nhúng trong nội dung đã xuất bản); tạo cần thuộc ít nhất một site; sửa/xoá giới hạn trong site của người dùng. Xem thêm [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung).

## WebP khi upload

Chỉ chạy với site R2 có `r2.compressToWebp` bật, dùng thư viện `sharp`:

| Kết quả | Khi nào |
| --- | --- |
| Chuyển sang WebP theo `r2.webpQuality`, đổi đuôi thành `.webp` | Đầu vào JPEG, PNG, TIFF hoặc AVIF |
| Bỏ qua | Loại khác — SVG cố ý không bao giờ bị chuyển |
| Bỏ qua | GIF nhiều khung hình (động) |
| Bỏ qua, giữ bản gốc | Bản WebP lớn hơn bản gốc |

Site dùng đĩa local không có bước này; hãy cân nhắc bật R2 nếu bạn muốn nén tự động.

## Trình sửa ảnh

Mở từ một ảnh trong thư viện, gọi `POST /api/media/:id/edit-image` và áp dụng theo thứ tự: xoay → lật → cắt → đổi kích thước.

![Trình sửa ảnh trong thư viện media: cắt, xoay, đổi kích thước](/images/shots/media-image-editor.webp "Trình sửa ảnh: cắt, xoay, lật, đổi kích thước")

| Tham số | Ràng buộc |
| --- | --- |
| `rotate` | `0`, `90`, `180` hoặc `270` |
| `flipH`, `flipV` | boolean |
| `crop` | `{ left, top, width, height }` theo pixel nguồn, phải nằm trong ảnh |
| `resizeWidth` | 1–8192; chiều cao theo tỉ lệ |

Việc sửa là **phá huỷ (destructive)**: file bị ghi đè tại cùng đường dẫn hoặc key nên mọi URL đang nhúng vẫn chạy; `width`, `height`, `filesize` và `version` được cập nhật. Người gọi phải thuộc site của file. Bản ghi dùng `externalUrl` không nằm trong kho do CMS quản lý nên bị từ chối với lỗi 400. Trình sửa chạy được trên cả hai backend.

## Nhập ảnh từ URL và SSRF guard

Nút **Dán URL** trong thư viện (và tab URL của hộp thoại ảnh trong trình soạn thảo) gọi `POST /api/media/from-url`: máy chủ tải ảnh về, lưu như một bản ghi Media bình thường và ghi `externalUrl` là URL nguồn.

![Hộp thoại nhập ảnh từ URL kèm văn bản alt trong thư viện media](/images/shots/media-from-url-dialog.webp "Nút Dán URL: nhập ảnh từ URL kèm alt")

```bash
curl -X POST https://cms.example.com/api/media/from-url \
  -H 'Content-Type: application/json' \
  -H 'Authorization: users API-Key <api-key>' \
  -d '{"url":"https://example.com/photo.jpg","alt":"Ảnh minh hoạ","folder":null}'
# 201 {"ok":true,"id":…,"url":"…","alt":"…","filename":"…"}
```

Tính năng gọi URL do người dùng cung cấp là điểm rủi ro SSRF kinh điển, nên endpoint có lớp bảo vệ (`src/lib/ssrf-guard.ts`):

| Bảo vệ | Hành vi |
| --- | --- |
| Scheme, độ dài | Chỉ `http`/`https`, URL tối đa 500 ký tự |
| Dải địa chỉ bị chặn | Phân giải hostname trước (timeout 5 giây); từ chối 422 nếu **bất kỳ** địa chỉ nào thuộc dải private/reserved: `10/8`, `172.16/12`, `192.168/16`, `127/8`, `169.254/16` (metadata đám mây), `0/8`, `100.64/10`, multicast, reserved và các dải loopback, unique-local, link-local, unspecified của IPv6. Host dạng IP được kiểm tra tương tự |
| Redirect | Theo dõi thủ công, tối đa 3 bước; mỗi `Location` được kiểm tra lại |
| Timeout / dung lượng | 15 giây mỗi request; thân phản hồi tối đa 25 MB |

Rủi ro còn lại được ghi rõ trong tài liệu: `fetch` của Node phân giải DNS lại lúc kết nối, nên vẫn tồn tại một khoảng DNS-rebinding giữa lúc kiểm tra và lúc kết nối; kẻ tấn công cần quyền admin cộng với DNS do mình kiểm soát.

## URL mà frontend nhận được

| Nguồn | `url` trong REST |
| --- | --- |
| Đĩa local | `<PAYLOAD_PUBLIC_SERVER_URL>/api/media/file/<tên-file>?t=<siteId>` |
| R2 + `publicBaseUrl` | `<publicBaseUrl>/media/<siteId>/[<thư-mục>/]<tên-file>` |
| R2 không có `publicBaseUrl` | Route media của CMS (redirect URL ký sẵn, cần ngữ cảnh site) |
| Có `externalUrl` | Giá trị `externalUrl` |
| Sau khi sửa ảnh (`version > 1`) | Một trong các dạng trên cộng `?v=<version>` |

Khi render, CMS tự thêm `width`/`height` cho thẻ `<img>` nếu `src` khớp một bản ghi Media cùng site, giúp tránh dịch chuyển bố cục (CLS). Chi tiết ở [headless REST/GraphQL API](/tinh-nang/headless-api).

Lưu ý: URL local được dựng từ `PAYLOAD_PUBLIC_SERVER_URL` **tại thời điểm upload**, nên đổi tên miền công khai sau này sẽ để lại origin cũ trong các `url` đã lưu; hãy giữ origin ổn định hoặc cập nhật cột `url` của bảng `media`.

## Sao lưu và chuyển từ local sang R2

Hãy sao lưu **cả** database và thư mục media. Với Docker Compose của dự án, volume `media_data` được mount tại `/app/media`; lưu trữ nó bằng:

```bash
docker run --rm -v <project>_media_data:/media -v "$PWD":/backup alpine \
  tar czf /backup/media-backup.tgz -C /media .
```

Tìm đúng tên volume bằng `docker volume ls`. Lệnh `docker compose down -v` xoá volume này. Với R2, CMS không tự sao lưu: dùng versioning của bucket hoặc `rclone sync` sang bucket khác. Xem thêm hướng dẫn [tự host KDIGI CMS](/tu-host).

Không có lệnh di chuyển sẵn từ local sang R2. Sau khi bật R2, file cũ vẫn chạy (URL cũ trỏ về route local) và chỉ upload mới đi vào R2. Để chuyển hẳn: tạo bucket và token, sao chép `<MEDIA_DIR>/<siteId>/<file>` thành `media/<siteId>/<file>` (ví dụ `rclone copy`), điền `Sites.r2` bằng tài khoản super-admin, viết lại `url` của từng Media (script Local API hoặc SQL), kiểm tra qua CDN rồi mới xoá file local. Nội dung Markdown nhúng ảnh bằng URL cũng cần được viết lại.

## Dùng thư viện media khi chuyển từ WordPress

Importer WordPress ghi mã attachment gốc vào trường `sourceMediaId` (chỉ đọc trong giao diện) để chạy lại import không tạo bản sao ảnh; mọi tra cứu đều giới hạn theo `tenant`. Xem [chuyển từ WordPress sang KDIGI CMS](/chuyen-tu-wordpress).

## Thực hành tốt

- Luôn điền `alt` mô tả đúng nội dung ảnh — CMS bắt buộc trường này.
- Đặt tên file có nghĩa vì tên file trở thành một phần URL, và cùng tên sẽ ghi đè.
- Ảnh đúng kích thước và định dạng nhẹ giúp trang tải nhanh hơn; xem thêm [hiệu năng và cache](/thuc-hanh-tot/hieu-nang-va-cache).
- Bật `publicBaseUrl` cho mọi site R2 có media công khai.
- Backup database và media cùng lúc để mọi dòng `media` luôn có file tương ứng.

Tài liệu đầy đủ: [Thư viện media trên docs.opencms.kdigi.vn](https://docs.opencms.kdigi.vn/huong-dan/thu-vien-media/). Muốn thử, hãy mở [bản demo](/demo).
