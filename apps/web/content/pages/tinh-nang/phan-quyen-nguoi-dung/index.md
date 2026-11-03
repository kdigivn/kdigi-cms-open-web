---
title: "Phân quyền người dùng: admin, editor, author | KDIGI CMS"
description: "Bốn vai trò super-admin, admin, editor, author; gán theo từng website; tác giả gửi bài chờ duyệt. Có tài khoản demo để thử ngay không cần cài đặt."
h1: "Phân quyền người dùng và quy trình duyệt bài"
navTitle: "Phân quyền người dùng"
primaryKeyword: "phân quyền người dùng"
icon: shield-check
lead: "Bốn vai trò xếp theo thứ bậc, gán theo từng website. Author viết nháp; editor trở lên mới đăng bài."
updated: 2026-11-03
heroImage: "/images/art/tinh-nang-phan-quyen-nguoi-dung-hero.webp"
heroAlt: "Khiên kính mờ với ổ khoá xanh và bốn nhân vật đất sét trừu tượng, đại diện cho phân quyền người dùng"
schema: "TechArticle"
faq:
  - q: "Author có đăng bài được không?"
    a: "Không. Author chỉ tạo bản nháp và chỉ sửa bài của chính mình. Hook `enforceAuthorPermissions` chặn mọi thao tác khiến trạng thái là `published`, kể cả khi gọi API trực tiếp."
  - q: "Một người dùng có làm việc trên nhiều website được không?"
    a: "Được. Super-admin thêm mỗi website thành một dòng trong mảng `tenants` của người dùng. Người dùng không có dòng nào thì không truy cập được tài liệu nào thuộc site."
  - q: "Người dùng có thể tự nâng quyền không?"
    a: "Không. Trường `role` và mảng `tenants` chỉ super-admin được sửa. Người dùng thường chỉ sửa được hồ sơ của mình, như mật khẩu và API key."
  - q: "API key có quyền gì?"
    a: "API key xác thực như chính người sở hữu và chịu cùng quy tắc vai trò, cùng phạm vi site. Từ 1.2.0, phiên API key còn bị giới hạn thêm: không tạo người dùng, không đổi email, mật khẩu, API key, vai trò hay site, không xoá vĩnh viễn (chỉ chuyển vào thùng rác). Key của author vẫn không đăng được bài."
related:
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/quy-trinh-bien-tap
  - /tinh-nang/headless-api
  - /thuc-hanh-tot/bao-mat-va-phan-quyen
  - /demo
docs: "https://docs.opencms.kdigi.vn/huong-dan/vai-tro-phan-quyen/"
---

Vai trò xếp cộng dồn: `super-admin` > `admin` > `editor` > `author`. Ngoài super-admin, mọi người chỉ truy cập được các website được gán. Ranh giới nằm ở access predicate phía máy chủ.

> **Tóm tắt nhanh**
>
> - Trường `role` bắt buộc, mặc định `editor`.
> - Author không đăng được bài.
> - Quyền theo site qua mảng `tenants`.
> - Người dùng đầu tiên tự thành `super-admin`.
> - Khóa R2 và email bị chặn đọc qua API.

![Hồ sơ người dùng demo với vai trò Editor và site được gán](/images/shots/roles.webp)

## :users: Bốn vai trò

| Quyền | super-admin | admin | editor | author |
| --- | --- | --- | --- | --- |
| Phạm vi | Mọi site | Site được gán | Site được gán | Site được gán |
| Tạo nội dung | ✓ | ✓ | ✓ | ✓ |
| Xuất bản | ✓ | ✓ | ✓ | ✗ |
| Kiểm duyệt bình luận | ✓ | ✓ | ✓ | ✗ |
| Sửa cài đặt site | ✓ | ✓ | ✗ | ✗ |
| Xóa vĩnh viễn (phiên đăng nhập, không qua API key) | ✓ | ✓ | ✗ | ✗ |
| Tạo người dùng, site, cấu hình R2 | ✓ | ✗ | ✗ | ✗ |

Author chỉ sửa và chuyển vào thùng rác **bài của chính mình**.

> **Lưu ý** Author vẫn tạo và sửa được taxonomy, menu, FAQ, shortcode, redirect và media trong site của mình. Hãy cấp vai trò tương ứng.

## :pen-line: Quy trình duyệt bài

KDIGI CMS không có trạng thái "chờ duyệt" riêng; vai trò thi hành việc duyệt. Xem thêm [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap).

:::steps
- **Author tạo nháp** Chỉ author đó và editor trở lên sửa được.
- **Editor lọc tab "nháp"** Hoặc bấm thẻ "Bài viết nháp" trên bảng điều khiển.
- **Chỉnh và đăng** Đổi `status` sang `published`, hoặc đặt `publishedAt` tương lai để hẹn giờ.
- **Máy chủ chặn author** Hook từ chối cả khi author gọi API trực tiếp.
:::

## :layers: Phân quyền theo website

Người dùng chỉ thấy các site trong `tenants[]`. Bộ chọn site của plugin multi-tenant chỉ để tiện dùng; ranh giới thật là các predicate `tenantScopedRead` và `tenantScopedWrite`. Xem [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website).

> **Cảnh báo** Đọc ẩn danh không tự lọc theo site. Mọi truy vấn của frontend phải thêm `where[tenant][equals]=<siteId>`. Xem [Headless API](/tinh-nang/headless-api).

## :lock: Bảo vệ ở mức trường

:::check
- Khóa R2 của site không bao giờ trả qua REST hay GraphQL
- `authors.email` và `comments.authorEmail` không lộ qua API
- `role` và `tenants[]` chỉ super-admin sửa được
- `createdBy` không đổi được sau khi tạo
:::

## :key-round: Gán người dùng vào website

:::steps
- **Tạo người dùng** Super-admin chọn `role`, mặc định `editor`.
- **Gán website** Thêm mỗi site thành một dòng trong `tenants`.
- **Người dùng đăng nhập** Chỉ thấy các site được gán; phiên kéo dài 180 ngày.
- **Dùng API key (tùy chọn)** Kế thừa vai trò, site của chủ sở hữu; không đổi tài khoản, không xoá vĩnh viễn. Dùng cho [AI agent qua MCP](/tinh-nang/ai-agent-mcp).
:::

> **Mẹo** Khi ghi qua REST, thân request phải mang `tenant` của site được gán.

## :eye: Tài khoản demo công khai

Liệt kê email trong `DEMO_ACCOUNT_EMAILS`, cấp vai trò `editor` và một site duy nhất. Tài khoản này không tự đổi được `email`, `password` hay API key. `pnpm demo:reset` đặt lại site demo. Thử ngay ở [bản demo](/demo).

## :list-checks: Thực hành tốt

:::check
- Cấp vai trò thấp nhất đủ dùng
- Giữ số super-admin tối thiểu
- Mỗi frontend hoặc tích hợp một người dùng và API key riêng
:::

Xem cách áp dụng ở [bảo mật và phân quyền](/thuc-hanh-tot/bao-mat-va-phan-quyen) hoặc [tài liệu vai trò](https://docs.opencms.kdigi.vn/huong-dan/vai-tro-phan-quyen/).
