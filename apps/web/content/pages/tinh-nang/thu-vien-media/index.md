---
title: "Thư viện media: thư mục, sửa ảnh, WebP, R2 | KDIGI CMS"
description: "Quản lý ảnh theo thư mục, sửa ảnh trực tiếp, nhập ảnh từ URL có chống SSRF, lưu trên ổ đĩa hoặc Cloudflare R2, xuất WebP để trang tải nhanh hơn."
h1: "Thư viện media với thư mục, trình sửa ảnh và lưu trữ R2"
navTitle: "Thư viện media"
primaryKeyword: "thư viện media"
icon: image
lead: "Ảnh theo thư mục, sửa trực tiếp, nhập từ URL an toàn, lưu trên ổ đĩa hoặc Cloudflare R2."
updated: 2026-11-03
heroImage: "/images/art/tinh-nang-thu-vien-media-hero.webp"
heroAlt: "Thư mục đất sét với các thẻ ảnh kính mờ và nút tải lên xanh, đại diện cho thư viện media"
schema: "TechArticle"
faq:
  - q: "KDIGI CMS lưu file media ở đâu?"
    a: "Mặc định trên đĩa local, trong `MEDIA_DIR` (Docker: `/app/media`), tách theo id site. Site khai báo `bucket` và `accountId` Cloudflare R2 thì upload mới đi vào R2."
  - q: "Chỉnh sửa ảnh có làm mất ảnh gốc không?"
    a: "Có. Trình sửa ghi đè file tại chỗ để URL không đổi và không hoàn tác được; giao diện luôn hỏi xác nhận. Cần giữ bản gốc thì tải bản sao lên trước."
  - q: "Có tự chuyển ảnh sang WebP không?"
    a: "Có, nhưng chỉ với site R2 bật `r2.compressToWebp` (mặc định tắt). JPEG, PNG, TIFF, AVIF được chuyển; SVG và GIF động thì không."
  - q: "Cần sao lưu những gì để không mất ảnh?"
    a: "Cả database lẫn file media, vì database chỉ giữ metadata. Đĩa local: lưu volume `media_data`. R2: dùng versioning của bucket hoặc `rclone sync`."
related:
  - /tinh-nang/trinh-soan-thao-markdown
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/phan-quyen-nguoi-dung
  - /tu-host
  - /thuc-hanh-tot/hieu-nang-va-cache
docs: "https://docs.opencms.kdigi.vn/huong-dan/thu-vien-media/"
---

Thư viện media lưu ảnh, video và tài liệu theo từng website; mỗi file bắt buộc có `alt`. Mặc định lưu trên đĩa local, mỗi site có thể chuyển sang Cloudflare R2 riêng.

> **Tóm tắt nhanh**
>
> - Lưu theo từng site: đĩa local hoặc R2.
> - Thư mục, lưới/danh sách, tìm kiếm, lightbox.
> - Sửa ảnh: xoay, lật, cắt, đổi kích thước.
> - Nhập từ URL có chống SSRF.
> - WebP khi upload cho site R2, tùy chọn.

![Thư viện media KDIGI CMS: lưới ảnh, thư mục, upload và nhập ảnh từ URL](/images/shots/media.webp)

## :wand-sparkles: Tính năng chính

:::cards
- :boxes: **Thư mục** Giới hạn trong site đang chọn; kéo thả nhiều file.
- :pen-line: **Trình sửa ảnh** Xoay, lật, cắt, đổi kích thước tối đa 8192 px.
- :link: **Nhập từ URL** Máy chủ tải ảnh về, chặn dải địa chỉ nội bộ.
- :zap: **WebP khi upload** Chỉ site R2 bật `r2.compressToWebp`.
- :cloud-upload: **Cloudflare R2** Khai báo `bucket` và `accountId` cho từng site.
- :eye: **Alt bắt buộc** Mọi file phải có văn bản thay thế.
:::

Ảnh cũng vào thư viện khi dán hoặc kéo thả trong [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown). Mỗi file thuộc một site ([quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website)).

## :hard-drive: Lưu ở đâu

| Điều kiện | Nơi lưu |
| --- | --- |
| Site có `r2.bucket` và `r2.accountId`, `R2_OFF` khác `true` | Cloudflare R2 |
| Mọi trường hợp còn lại | Đĩa local (`MEDIA_DIR`) |

> **Lưu ý** Site có media công khai trên R2 phải đặt `r2.publicBaseUrl`. Hai khóa R2 chỉ ghi, không bao giờ trả qua REST hay GraphQL.

## :pen-line: Sửa ảnh tại chỗ

![Trình sửa ảnh trong thư viện media: cắt, xoay, đổi kích thước](/images/shots/media-image-editor.webp "Trình sửa ảnh: cắt, xoay, lật, đổi kích thước")

> **Cảnh báo** Sửa ảnh ghi đè file tại cùng đường dẫn nên URL không đổi, nhưng không hoàn tác được. Cần bản gốc thì tải bản sao lên trước.

## :shield-check: Nhập ảnh từ URL an toàn

Endpoint `POST /api/media/from-url` có lớp chống SSRF:

:::check
- Chỉ nhận `http` và `https`
- Từ chối nếu địa chỉ thuộc dải private hoặc reserved
- Tối đa 3 redirect, mỗi bước kiểm tra lại
- Tối đa 15 giây và 25 MB mỗi ảnh
:::

![Hộp thoại nhập ảnh từ URL kèm văn bản alt trong thư viện media](/images/shots/media-from-url-dialog.webp "Nút Dán URL: nhập ảnh từ URL kèm alt")

## :history: Sao lưu

Sao lưu **cả** database và file media. Docker: lưu volume `media_data`; R2: bật versioning hoặc `rclone sync`. Hướng dẫn ở [tự host](/tu-host).

> **Cảnh báo** `docker compose down -v` xóa volume media. Chưa có lệnh di chuyển sẵn từ local sang R2; xem [tài liệu](https://docs.opencms.kdigi.vn/huong-dan/thu-vien-media/).

## :list-checks: Thực hành tốt

:::check
- Điền `alt` mô tả đúng nội dung ảnh
- Đặt tên file có nghĩa; cùng tên sẽ ghi đè
- Dùng ảnh đúng kích thước, định dạng nhẹ ([hiệu năng và cache](/thuc-hanh-tot/hieu-nang-va-cache))
- Sao lưu database và media cùng lúc
:::

Quyền thao tác media xem [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung). Muốn thử, mở [bản demo](/demo).
