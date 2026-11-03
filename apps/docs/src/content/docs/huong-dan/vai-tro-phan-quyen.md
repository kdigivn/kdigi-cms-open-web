---
title: Vai trò và phân quyền
description: Bốn vai trò của KDIGI CMS (super admin, admin, editor, author), quyền theo từng website và cách tài khoản được gán vào site.
---

Mỗi tài khoản có một **vai trò** và được gán vào một hoặc nhiều site. Quyền thực tế là giao của hai thứ này: vai trò quyết định làm được gì, site được gán quyết định làm trên nội dung nào.

## Bốn vai trò

| Vai trò | Phạm vi | Làm được |
| --- | --- | --- |
| `super-admin` | Mọi site | Toàn quyền. Là vai trò duy nhất tạo hoặc xoá người dùng và site, gán người dùng vào site, sửa cấu hình lưu trữ (R2) |
| `admin` | Các site được gán | Quản lý nội dung, xuất bản, duyệt bình luận, sửa cài đặt site, xoá vĩnh viễn |
| `editor` | Các site được gán | Quản lý nội dung, xuất bản, duyệt bình luận, chuyển vào thùng rác |
| `author` | Các site được gán | Tạo nội dung, chỉ sửa và bỏ vào thùng rác bài của chính mình. **Không xuất bản được** |

## Điểm cần nhớ

- **Author gửi bài, editor duyệt.** Author lưu được bản nháp nhưng không thể chuyển bài sang trạng thái đã xuất bản, cũng không sửa tại chỗ bài đang hiển thị.
- **Phân quyền theo site là hàng rào thật.** Một biên tập viên của site A không đọc hay sửa được nội dung của site B qua API.
- **Người dùng không thuộc site nào** thì không truy cập được nội dung nào.
- **Thùng rác**: xoá một bài là chuyển vào thùng rác; chỉ super admin và admin được xoá vĩnh viễn.
- **Khách ẩn danh** chỉ đọc được nội dung đã xuất bản và đã đến giờ hiển thị.

## Gán người dùng vào site

Super admin tạo người dùng, chọn vai trò rồi thêm các site mà người đó được làm việc. Tài khoản có nhiều site sẽ có bộ chọn site trong trang quản trị.

Bảng phân quyền chi tiết theo từng collection ở [Roles and permissions reference](/en/tham-khao/roles-and-permissions/) (tiếng Anh).
