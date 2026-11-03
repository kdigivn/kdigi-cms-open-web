---
title: Thư viện media
description: Quản lý ảnh và file trong KDIGI CMS. Lưu trên đĩa máy chủ mặc định, hoặc Cloudflare R2 cho từng site; có thư mục, chỉnh sửa ảnh và tải ảnh từ URL.
---

Thư viện media gom ảnh và file của từng site, có thư mục để sắp xếp và trình chỉnh sửa ảnh ngay trong trang quản trị.

## Hai nơi lưu trữ

CMS quyết định **theo từng lần tải lên, theo từng site**:

| Điều kiện | Nơi lưu |
| --- | --- |
| Site có cấu hình Cloudflare R2 (bucket và account ID) | Cloudflare R2 |
| Các trường hợp còn lại | Đĩa máy chủ |

Bản cài mới không cần dịch vụ lưu trữ nào: ảnh nằm trên đĩa, trong thư mục `MEDIA_DIR` (trong Docker là volume `/app/media`). Các site khác nhau trên cùng một bản cài có thể dùng hai nơi lưu khác nhau.

## Bật Cloudflare R2 cho một site

Vào **Sites > Hệ thống > Cloudflare R2**, điền bucket, account ID, URL công khai (CDN) và khoá truy cập. Chỉ super admin sửa được nhóm này; hai khoá bí mật không bao giờ được trả qua REST hay GraphQL. Có thêm tuỳ chọn tự chuyển ảnh sang WebP khi tải lên.

Không có biến môi trường R2 toàn cục. Đặt `R2_OFF=true` nếu muốn ép mọi site dùng đĩa (ví dụ khi dev trên bản sao dữ liệu thật).

## Tính năng

- **Thư mục** để sắp xếp ảnh, tách theo site.
- **Chỉnh sửa ảnh** (cắt, xoay…) hoạt động ở cả hai nơi lưu.
- **Tải ảnh từ URL**: nhập địa chỉ, CMS tải về và lưu vào thư viện, có chặn các địa chỉ nội bộ để tránh lỗi SSRF.
- **Tên file** được chuẩn hoá (bỏ dấu, chữ thường). Cùng tên trong cùng site sẽ ghi đè file cũ.
- Media đọc công khai, vì đường dẫn ảnh được nhúng trong bài đã xuất bản. Chỉ thành viên của site mới tải lên, sửa hoặc xoá được.

Chi tiết (cấu trúc thư mục, header cache, giới hạn loại file) ở [Media storage reference](/en/tham-khao/media-storage/) (tiếng Anh).
