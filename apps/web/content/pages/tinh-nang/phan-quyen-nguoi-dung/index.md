---
title: "Phân quyền người dùng: admin, editor, author | KDIGI CMS"
description: "Bốn vai trò super-admin, admin, editor, author; gán theo từng website; tác giả gửi bài chờ duyệt. Có tài khoản demo để thử ngay không cần cài đặt."
h1: "Phân quyền người dùng và quy trình duyệt bài"
navTitle: "Phân quyền người dùng"
primaryKeyword: "phân quyền người dùng"
updated: 2026-11-03
heroImage: "/images/art/tinh-nang-phan-quyen-nguoi-dung-hero.webp"
heroAlt: "Khiên kính mờ với ổ khoá xanh và bốn nhân vật đất sét trừu tượng, đại diện cho phân quyền người dùng"
schema: "TechArticle"
faq:
  - q: "KDIGI CMS có những vai trò nào?"
    a: "Bốn vai trò xếp theo thứ bậc cộng dồn: super-admin, admin, editor và author, lưu ở trường role của collection Users (bắt buộc, mặc định editor). Super-admin quản lý mọi site và người dùng; admin, editor, author chỉ làm việc trong các site được gán."
  - q: "Author có đăng bài được không?"
    a: "Không. Author chỉ tạo bản nháp và chỉ sửa hoặc đưa vào thùng rác bài do chính mình tạo. Hook enforceAuthorPermissions chặn mọi thao tác khiến trạng thái hiệu lực là published, kể cả sửa bài đang xuất bản hay khôi phục bài đã xuất bản từ thùng rác."
  - q: "Một người dùng có làm việc trên nhiều website được không?"
    a: "Được. Super-admin thêm mỗi website thành một dòng trong mảng tenants của người dùng. Người dùng chỉ thấy các site đó trong bộ chọn site và trong dữ liệu API. Người dùng không có dòng nào thì không truy cập được tài liệu nào thuộc site."
  - q: "Người dùng có thể tự nâng quyền của mình không?"
    a: "Không. Trường role và mảng tenants chỉ super-admin được sửa; thay đổi của người khác bị loại bỏ. Người dùng thường chỉ sửa được hồ sơ của mình (mật khẩu, API key). Có bài kiểm thử hồi quy users-self-escalation.integration.test.ts cho trường hợp này."
  - q: "API key có quyền gì?"
    a: "API key (header Authorization: users API-Key <key>) xác thực như chính người dùng sở hữu nó và chịu cùng quy tắc vai trò, cùng phạm vi site. Key của author vẫn không đăng được bài; key của editor chỉ đọc và ghi trong các site được gán."
related:
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/quy-trinh-bien-tap
  - /tinh-nang/headless-api
  - /thuc-hanh-tot/bao-mat-va-phan-quyen
  - /demo
docs: "https://docs.opencms.kdigi.vn/huong-dan/vai-tro-phan-quyen/"
---

KDIGI CMS có bốn vai trò xếp theo thứ bậc cộng dồn — `super-admin` > `admin` > `editor` > `author` — và mọi người dùng ngoài super-admin chỉ truy cập được những website được gán cho họ. Ranh giới bảo mật nằm ở các access predicate phía máy chủ, không phải ở bộ lọc giao diện quản trị.

> **Tóm tắt nhanh**
> - Trường `role` bắt buộc, mặc định `editor`; người dùng đầu tiên của bản cài mới tự thành `super-admin`.
> - **Author không đăng được bài** và chỉ sửa bài của chính mình; editor trở lên mới xuất bản.
> - Quyền theo **site**: người dùng chỉ thấy và ghi dữ liệu của các site trong mảng `tenants`.
> - Bộ lọc site trong giao diện chỉ mang tính tiện lợi — **access predicate** trong `src/access/*` mới là ranh giới thật.
> - Secret (khoá R2, email tác giả, email người bình luận) bị chặn đọc ở mức trường.

![Hồ sơ người dùng demo với vai trò Editor và site được gán](/images/shots/roles.webp)

## Bốn vai trò và phạm vi của chúng

Vai trò nằm ở trường `role` của collection Users (`src/collections/users.ts`); các hàm kiểm tra dùng chung nằm trong `src/access/role-matrix.ts`.

| Vai trò | Phạm vi | Làm được gì |
| --- | --- | --- |
| `super-admin` | Mọi site | Bỏ qua mọi bộ lọc site. Là vai trò duy nhất tạo/xoá người dùng và site, sửa cấu hình lưu trữ theo site (`sites.r2`), gán người dùng vào site và chạy jobs |
| `admin` | Site được gán | CRUD nội dung, xuất bản, kiểm duyệt bình luận, sửa cài đặt site, xoá vĩnh viễn (dọn thùng rác) |
| `editor` | Site được gán | CRUD nội dung, xuất bản, kiểm duyệt bình luận, chuyển vào thùng rác |
| `author` | Site được gán | Tạo nội dung và sửa/bỏ vào thùng rác **chỉ bài của mình**. **Không xuất bản**, không kiểm duyệt bình luận |

### Các hàm kiểm tra quyền

| Hàm | Vai trò đạt | Dùng cho |
| --- | --- | --- |
| `canManageContent` | super-admin, admin, editor, author | Tạo/sửa/bỏ thùng rác trang, bài viết, sản phẩm, landing |
| `canPublish` | super-admin, admin, editor | Quy tắc xuất bản (author bị loại, thi hành bằng hook) |
| `canManageSiteSettings` | super-admin, admin | Cài đặt site |
| `canModerateComments` | super-admin, admin, editor | Sửa/xoá bình luận |
| `canPermanentlyDelete` | super-admin, admin | Xoá vĩnh viễn / dọn thùng rác |

## Quy tắc dành cho Author

Author bị giới hạn ở hai tầng:

1. **Access predicate** (pages, posts, products, landings): với author, quyền `update` trả về điều kiện `createdBy = <id người dùng>`; quyền chuyển vào thùng rác cũng có cùng điều kiện.
2. **Hook `enforceAuthorPermissions`** (`beforeChange`): ném lỗi song ngữ nếu trạng thái hiệu lực (`data.status ?? originalDoc.status`) là `published`. Nghĩa là author không thể xuất bản, không thể sửa tại chỗ một bài đang xuất bản, và không thể khôi phục một bài đã xuất bản từ thùng rác. Chuyển bài của mình **vào** thùng rác thì được phép. Hook cũng gán `createdBy` khi tạo; trường này chặn mọi lần cập nhật sau đó nên không thể chuyển quyền sở hữu.

Lưu ý: author vẫn tạo và sửa được `taxonomies`, `authors`, `menus`, `faqs`, `shortcodes`, `redirects` và `media` trong site của mình, vì các collection đó chỉ dùng predicate theo site, không có điều kiện sở hữu. Hãy cấp vai trò này tương ứng. Quy trình duyệt bài đầy đủ ở [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap).

## Quy trình duyệt bài: author viết, editor đăng

KDIGI CMS không có trạng thái "chờ duyệt" riêng; việc duyệt được thi hành bằng vai trò:

1. Author tạo bài ở trạng thái `draft` — chỉ author đó (và editor, admin, super-admin của site) sửa được.
2. Editor hoặc admin lọc tab "nháp" trong danh sách bài viết, hoặc bấm thẻ "Bài viết nháp" trên bảng điều khiển.
3. Họ chỉnh sửa rồi đổi `status` sang `published` (hoặc đặt `publishedAt` ở tương lai để hẹn giờ).
4. Nếu author gọi API trực tiếp để đăng, hook `enforceAuthorPermissions` vẫn từ chối ở phía máy chủ.

Chi tiết lịch nội dung, phiên bản và thùng rác ở [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap).

## Phân quyền theo từng website

Collection Sites là ranh giới tenant ([quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website)); người dùng mang mảng `tenants[]` do plugin multi-tenant thêm vào. Các predicate trong `src/access/tenant-scoped.ts`:

| Predicate | Hành vi |
| --- | --- |
| `tenantScopedRead` | Không đăng nhập → `false`; super-admin → `true`; còn lại → `{ tenant: { in: <id site của người dùng> } }`; không có site → `false` |
| `tenantScopedWrite` | Cùng hình dạng, dùng cho tạo/sửa/xoá |
| `tenantScopedVersionsRead` | Lịch sử phiên bản; khách ẩn danh không thấy gì |
| `hasAnyTenantOrSuperAdmin` | Cổng cho thao tác **tạo** `media` và `payload-folders` |
| `publishedAndLive` | Quyền đọc công khai (xem bên dưới) |

Id site do client gửi lên (`?tenantId=`, trường body, cookie `payload-tenant`) không bao giờ được tin trực tiếp: chỉ được chấp nhận với super-admin hoặc thành viên của site đó, nếu không sẽ quay về site đầu tiên của người dùng; không xác định được thì endpoint trả 400 thay vì chạy không giới hạn.

**Bộ lọc plugin chỉ là tiện lợi.** Bộ lọc danh sách và bộ chọn site của plugin `@payloadcms/plugin-multi-tenant` thu hẹp danh sách trong giao diện quản trị — tài liệu coi đó là *advisory*. Ranh giới thật là các access predicate khai báo tường minh trên từng collection; plugin (bản ghim 3.90.2) bọc thêm quyền truy cập như một lớp phòng thủ chiều sâu.

## Đọc công khai và đọc đã xác thực

| Người gọi | Collection nội dung (`pages`, `posts`, `products`, `landings`) |
| --- | --- |
| Ẩn danh | `status = published`, chưa vào thùng rác, `publishedAt` trống hoặc đã tới giờ (tính theo từng request nên bài hẹn giờ lên đúng lúc) |
| Đã đăng nhập, không phải super-admin | Mọi trạng thái, kể cả bản nháp, trong các site của mình |
| Super-admin | Tất cả |

Điểm cần nhớ cho frontend: **đọc ẩn danh không tự lọc theo site**, nên mọi truy vấn phải thêm `where[tenant][equals]=<siteId>`. Xem [headless API](/tinh-nang/headless-api).

## Bảo vệ secret ở mức trường

| Trường | Quy tắc |
| --- | --- |
| `sites.r2.accessKeyId`, `sites.r2.secretAccessKey` | `access.read: () => false` — không bao giờ có trong REST hoặc GraphQL |
| Nhóm `sites.r2` | Chỉ super-admin được sửa |
| `authors.email`, `comments.authorEmail` | Không bao giờ trả về qua API |
| `media.tenant`, `payload-folders.tenant` | Chỉ super-admin đổi được (không chuyển quyền sở hữu) |
| `createdBy` của posts/pages/products/landings | Không ai cập nhật được sau khi tạo |
| `commentCount`, `kkStarRating` | Chỉ hook và endpoint chấm điểm ghi |
| `users.tenants[]` | Chỉ super-admin tạo/sửa |

Secret được ghi qua trình soạn thảo chỉ-ghi trong form Sites, gọi `POST /api/sites/:id/secret` (chỉ super-admin); `GET` cùng endpoint chỉ trả `{ field, hasValue }`, không bao giờ trả giá trị.

## Ma trận quyền theo collection

| Collection | Đọc (ẩn danh) | Tạo | Sửa | Xoá |
| --- | --- | --- | --- | --- |
| `users` | không | super-admin | super-admin; người khác chỉ sửa hồ sơ mình (`role`, `tenants` bị loại) | super-admin |
| `sites` | công khai (secret ẩn) | super-admin | super-admin, admin (thu hẹp theo site) | super-admin |
| `pages`, `posts`, `products`, `landings` | `publishedAndLive()` | `canManageContent` | `canManageContent`; author chỉ bài của mình | thùng rác: `canManageContent` (author: bài mình); vĩnh viễn: super-admin/admin |
| `taxonomies`, `authors`, `menus`, `redirects` | công khai | theo site | theo site | theo site |
| `faqs`, `shortcodes` | công khai, không gồm bản đã xoá | theo site | theo site | thùng rác: người ghi trong site; vĩnh viễn: super-admin/admin |
| `media` | công khai | người dùng thuộc ≥ 1 site | theo site | theo site |
| `comments` | chỉ `approved` | theo site (khách gửi qua `/api/comments/create`) | `canModerateComments` | `canModerateComments` |
| `rating-events` | không | không | không | không (chỉ endpoint chấm điểm ghi) |

## Gán người dùng vào website

1. Người dùng đầu tiên của bản cài mới (màn hình "tạo người dùng đầu tiên") tự được nâng thành `super-admin` bất kể vai trò gửi lên. Mọi người dùng sau giữ vai trò lúc tạo, và chỉ super-admin tạo được người dùng.
2. Super-admin tạo người dùng trong Users và chọn `role` (mặc định `editor`).
3. Trên cùng bản ghi, super-admin thêm mỗi website thành một dòng trong mảng `tenants` (nhãn "Website" trong giao diện).
4. Người dùng chỉ thấy các site đó trong bộ chọn site và trong dữ liệu API. Không có dòng nào nghĩa là không truy cập được tài liệu nào thuộc site.
5. Người dùng thường tự sửa được mật khẩu và API key, nhưng không tự đổi `role` hay `tenants`.

Khi ghi qua REST, thân request phải mang `tenant` — giá trị mặc định lấy từ cookie `payload-tenant` mà client API không có. Phiên đăng nhập có hạn 180 ngày (`auth.tokenExpiration`).

```bash
# Ghi bằng API key của một editor: bắt buộc có tenant, phải là site được gán
curl -X POST https://cms.example.com/api/posts \
  -H 'Authorization: users API-Key <api-key>' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Bài nháp","tenant":1,"status":"draft"}'
```

## Tài khoản demo công khai

Để mở một sandbox đăng nhập công khai, liệt kê email trong biến môi trường `DEMO_ACCOUNT_EMAILS`, cấp vai trò `editor` và chỉ một site (ví dụ `demo`). Các predicate vai trò/site đã giữ tài khoản này khỏi site khác, trang quản lý người dùng và secret của site; thêm vào đó, tài khoản liệt kê sẽ nhận lỗi `403` song ngữ nếu tự đổi `email`, `password`, `apiKey` hoặc `enableAPIKey`, hoặc tự xoá mình. Lệnh `pnpm demo:reset` đặt lại site `demo` và các tài khoản này. Xem [bản demo](/demo) để thử với tài khoản editor thật.

## Các thao tác đặc quyền khác

- Chạy hàng đợi jobs qua `/api/payload-jobs/run`: chỉ super-admin.
- Xử lý hàng đợi nền chạy trong tiến trình khi `ENABLE_JOBS_AUTORUN=true`, đặt trên đúng một instance.
- Tạo/xoá site và ghi secret site: super-admin.

## Thực hành tốt

- Cấp vai trò thấp nhất đủ dùng: cộng tác viên → `author`, biên tập viên → `editor`, chủ website → `admin`.
- Giữ số super-admin tối thiểu; super-admin bỏ qua mọi bộ lọc site.
- Dùng một người dùng/API key riêng cho từng frontend hoặc tích hợp, và nhớ key kế thừa vai trò của người sở hữu.
- Khi viết collection mới có phạm vi site, hãy khai báo cả `tenantScopedRead`/`tenantScopedWrite` lẫn việc đăng ký với plugin, đừng chỉ dựa vào plugin.

Tài liệu đầy đủ: [Vai trò và phân quyền trên docs.opencms.kdigi.vn](https://docs.opencms.kdigi.vn/huong-dan/vai-tro-phan-quyen/). Xem cách áp dụng ở [bảo mật và phân quyền](/thuc-hanh-tot/bao-mat-va-phan-quyen).
