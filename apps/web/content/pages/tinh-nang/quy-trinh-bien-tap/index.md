---
title: "Quy trình biên tập: lịch nội dung, bản nháp, phiên bản"
description: "Bảng điều khiển biên tập, lịch nội dung, bản nháp và xuất bản, lịch sử phiên bản có khôi phục, thùng rác. Giúp nhóm nội dung làm việc nhất quán."
h1: "Quy trình biên tập: lịch nội dung, duyệt bài, khôi phục phiên bản"
navTitle: "Quy trình biên tập"
primaryKeyword: "lịch nội dung"
updated: 2026-11-03
heroImage: "/images/art/tinh-nang-quy-trinh-bien-tap-hero.webp"
heroAlt: "Lịch kính mờ có vài ô tô màu, chồng thẻ và đồng hồ đất sét, đại diện cho quy trình biên tập"
schema: "TechArticle"
faq:
  - q: "KDIGI CMS có lịch nội dung không?"
    a: "Có. Trang /admin/content-calendar hiển thị bài viết, trang, sản phẩm và landing của site đang chọn theo ngày đăng (publishedAt), dạng lưới tháng hoặc danh sách agenda. Ngày được tính theo giờ Việt Nam (Asia/Ho_Chi_Minh), có bộ lọc theo loại nội dung và theo trạng thái: đang hiển thị, hẹn giờ, nháp có ngày."
  - q: "Hẹn giờ đăng bài hoạt động như thế nào?"
    a: "Đặt trạng thái published và publishedAt ở tương lai. Điều kiện đọc công khai ẩn tài liệu cho tới giờ đó, nên bài xuất hiện ở request đầu tiên sau mốc thời gian. Lưu ý cache frontend chỉ làm mới khi có lượt lưu, không theo đồng hồ, nên hãy kiểm tra cách frontend của bạn xử lý."
  - q: "Cộng tác viên viết bài thì có tự đăng được không?"
    a: "Không. Vai trò author chỉ tạo bản nháp và chỉ sửa được bài của chính mình; mọi thao tác khiến trạng thái là published đều bị hook chặn. Editor hoặc admin mở bản nháp đó, rà soát và đổi trạng thái sang published. Không cần plugin workflow riêng."
  - q: "Lỡ xoá hoặc sửa nhầm bài thì lấy lại thế nào?"
    a: "Có hai lớp an toàn. Xoá trong giao diện chỉ chuyển bài vào thùng rác (đặt deletedAt) và khôi phục được; xoá vĩnh viễn dành cho admin. Pages, posts, products, landings, faqs, shortcodes giữ tối đa 30 phiên bản, có xem lịch sử, so sánh khác biệt và nút Restore."
  - q: "Đổi slug bài đã đăng có gây lỗi 404 không?"
    a: "CMS tự tạo redirect 301 từ đường dẫn cũ sang mới trong cùng site khi slug đổi lúc cập nhật, và gửi thêm một lượt revalidate cho slug cũ. Bạn cần áp danh sách redirect trong frontend; CMS chỉ cảnh báo chứ không chặn nếu có chuỗi chuyển hướng."
related:
  - /tinh-nang/phan-quyen-nguoi-dung
  - /tinh-nang/noi-dung-va-cau-truc
  - /tinh-nang/trinh-soan-thao-markdown
  - /tinh-nang/seo-json-ld
  - /thuc-hanh-tot
docs: "https://docs.opencms.kdigi.vn/en/tham-khao/collections/"
---

Quy trình biên tập trong KDIGI CMS gồm: bảng điều khiển cho biết việc cần làm, lịch nội dung để lên kế hoạch theo ngày, soạn thảo ở trạng thái nháp, hẹn giờ hoặc xuất bản, phiên bản để khôi phục và thùng rác để không mất bài. Author gửi nháp, editor trở lên duyệt và đăng.

> **Tóm tắt nhanh**
> - **Bảng điều khiển** hiển thị số bài nháp, bài đã đăng, sản phẩm đã đăng, bình luận chờ duyệt, nội dung cập nhật gần đây và kiểm tra SEO.
> - **Lịch nội dung** `/admin/content-calendar`: lưới tháng hoặc agenda, giờ Việt Nam, 3 trạng thái (đang hiển thị, hẹn giờ, nháp có ngày).
> - **Xuất bản** là trường `status` (`draft`/`published`); `publishedAt` ở tương lai = hẹn giờ.
> - **Author không đăng được bài** — editor/admin duyệt và đăng.
> - **Phiên bản** tối đa 30/tài liệu, diff và Restore; **thùng rác** cho pages, posts, products, landings, faqs, shortcodes.

![Bảng điều khiển biên tập: số liệu nội dung, cập nhật gần đây, kiểm tra SEO](/images/shots/dashboard.webp)

## Bảng điều khiển biên tập

Sau khi đăng nhập, màn hình **Tổng quan** (`editorial-dashboard-view.tsx`) hiển thị website đang chọn (hoặc "Tất cả website" với super-admin) cùng hai nút nhanh: **Lịch nội dung** và **Viết bài mới** (chỉ hiện với người có quyền tạo bài). Số liệu được truy vấn **với quyền của chính người dùng** (`overrideAccess: false`), nên mỗi người chỉ thấy dữ liệu trong site của mình ([phân quyền](/tinh-nang/phan-quyen-nguoi-dung)).

| Widget | Nội dung |
| --- | --- |
| Bài viết nháp | Tổng số bài `draft`; bấm vào mở danh sách đã lọc |
| Bài viết đã xuất bản | Tổng số bài `published` |
| Sản phẩm đã xuất bản | Tổng số sản phẩm `published` |
| Bình luận chờ duyệt | Tổng số bình luận `pending` |
| Cập nhật gần đây | 5 bài viết và 3 trang sửa gần nhất (hiển thị tối đa 8 mục, mới nhất trước) |
| Kiểm tra SEO | Các tài liệu cần cải thiện SEO, hiển thị tối đa 15 mục, kèm lý do (thiếu tiêu đề SEO, thiếu meta description, đang noindex, canonical không hợp lệ, điểm SEO thấp) và điểm số |

Widget kiểm tra SEO dùng cùng bộ quét với endpoint `GET /api/seo/audit`, quét `posts`, `pages`, `products` và `landings` của một site rồi trả các tài liệu chưa đạt, tệ nhất trước. Xem thêm [SEO và JSON-LD](/tinh-nang/seo-json-ld).

## Lịch nội dung

Mở bằng nút **Lịch nội dung** hoặc mục trong thanh bên: `/admin/content-calendar`.

![Lịch nội dung dạng lưới tháng với bài viết, trang, sản phẩm theo ngày đăng](/images/shots/content-calendar.webp "Lịch nội dung: bài viết, trang, sản phẩm theo ngày đăng")

- Hiển thị `posts`, `pages`, `products` và `landings` của site đang chọn theo `publishedAt`.
- Hai chế độ: **lưới tháng** và **agenda** (mặc định agenda trên di động). Chuyển tháng bằng tham số `?month=YYYY-MM`.
- **Giờ Việt Nam**: `publishedAt` lưu theo UTC nhưng ngày trên lịch tính theo `Asia/Ho_Chi_Minh` (UTC+7, không có giờ mùa hè). Một bài đăng lúc 17:30 UTC ngày 1/10 nằm ở ngày 2/10 trên lịch.
- Mỗi mục là một liên kết thật tới màn hình sửa, có nhãn loại, trạng thái và giờ cho trình đọc màn hình.
- Bộ lọc theo loại nội dung và theo trạng thái.
- Dữ liệu tải **với quyền của người dùng**; tài liệu đã vào thùng rác không xuất hiện.

| Trạng thái trên lịch | Ý nghĩa |
| --- | --- |
| Đang hiển thị (live) | `published` và `publishedAt` đã qua — công khai ngay |
| Hẹn giờ (scheduled) | `published` nhưng `publishedAt` ở tương lai |
| Nháp có ngày (planned) | Bản nháp đã đặt ngày dự kiến |

Quy tắc phân loại dùng cùng điều kiện với `publishedAndLive()` khi đọc công khai, nên lịch phản ánh đúng thứ khách truy cập thấy. Mẹo lập kế hoạch: tạo bản nháp, đặt `publishedAt` dự kiến, và để lịch cho cả nhóm thấy "nháp có ngày" trước khi duyệt.

## Từ ý tưởng đến xuất bản

1. **Tạo bản nháp.** Bấm **Viết bài mới** — `status` mặc định là `draft`. Slug tự sinh từ tiêu đề, `author` tự gán theo email người đăng nhập, `excerpt` tự điền từ 160 ký tự đầu nếu để trống, `wordCount` tự tính.
2. **Soạn thảo.** Viết trong [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown); thanh bên phải có trạng thái, ngày đăng, slug, tác giả và ảnh đại diện. Mẫu SEO của site điền `seo.title`/`seo.description` còn trống.
3. **Rà soát SEO.** Mở tab SEO để kiểm tra tiêu đề, từ khoá, mô tả và điểm số.
4. **Duyệt.** Editor hoặc admin mở bản nháp, chỉnh nếu cần.
5. **Xuất bản hoặc hẹn giờ.** Đổi `status` thành `published`; để trống `publishedAt` thì hệ thống đóng dấu thời điểm hiện tại, đặt ngày tương lai thì bài hẹn giờ.
6. **Kiểm tra trên site.** Liên kết "xem trên site" dựng URL công khai của tài liệu.
7. **Làm mới cache.** Mỗi lần lưu xếp job gọi webhook revalidate tới frontend ([headless API](/tinh-nang/headless-api)); biên tập viên cũng có thể bấm làm mới thủ công.

### Cách `publishedAt` hoạt động

- Lưu ở trạng thái `published` với `publishedAt` trống thì được đóng dấu thời gian hiện tại.
- Với pages, posts, products, khi sửa tài liệu đã xuất bản thì **giữ nguyên ngày gốc**; landing dùng hook đơn giản hơn, đóng dấu lại mọi `publishedAt` trống hoặc đã qua mỗi lần lưu khi đang `published`.
- Điều kiện đọc công khai được đánh giá mỗi request, nên tài liệu hiện ở request đầu tiên sau giờ hẹn.
- **Cache frontend chỉ làm mới khi lưu, không theo đồng hồ**: nếu frontend cache trang tĩnh, bài hẹn giờ có thể chưa hiện cho tới khi có lượt revalidate. Hãy thiết kế bước này (ví dụ job định kỳ ở frontend) nếu bạn cần lên bài chính xác theo giờ.

## Luồng duyệt: author gửi nháp, editor đăng

KDIGI CMS không có workflow trạng thái riêng như "chờ duyệt" — quy tắc duyệt được thi hành bằng vai trò:

| Vai trò | Trong quy trình |
| --- | --- |
| `author` | Tạo và sửa **bản nháp của chính mình**; không thể xuất bản, sửa bài đã xuất bản hay khôi phục bài đã xuất bản. Có thể chuyển bài của mình vào thùng rác |
| `editor` | Sửa mọi nội dung trong site được gán, xuất bản, kiểm duyệt bình luận, chuyển vào thùng rác |
| `admin` | Như editor, thêm cài đặt site và xoá vĩnh viễn |

Quy trình thực tế: author viết nháp → editor lọc tab "nháp" trong danh sách bài viết (hoặc bấm thẻ "Bài viết nháp" trên bảng điều khiển) → chỉnh sửa và đổi sang `published`. Hook `enforceAuthorPermissions` chặn ở phía máy chủ nên dù author gọi API trực tiếp cũng không đăng được.

![Danh sách bài viết với tab trạng thái nháp / đã xuất bản](/images/shots/posts-list.webp)

## Phiên bản và khôi phục

![Lịch sử phiên bản bài viết: so sánh hai phiên bản và nút khôi phục](/images/shots/versions-restore.webp "So sánh khác biệt hai phiên bản và nút Restore")

- `versions: { maxPerDoc: 30 }`, không dùng `drafts` của Payload: pages, posts, products, landings, faqs, shortcodes, taxonomies.
- Giao diện có **History**, so sánh khác biệt (diff) và **Restore**.
- Quyền đọc lịch sử theo site (`tenantScopedVersionsRead`); không có lịch sử cho khách ẩn danh vì snapshot chứa trường SEO nội bộ.
- Khôi phục đi qua quyền `update` và hook `beforeChange` bình thường, nên author không thể khôi phục bản đã xuất bản.
- Hook `postsWordCount` và JSON-LD ghi trong cùng lượt lưu hoặc bằng một lệnh SQL có phạm vi, nên mỗi lần lưu chỉ tạo **một** phiên bản.

## Thùng rác

- Bật cho pages, posts, products, landings, faqs, shortcodes.
- Xoá trong giao diện chỉ đặt `deletedAt`; `canManageContent` (author: chỉ bài của mình) được chuyển vào thùng rác, còn **xoá vĩnh viễn** thuộc admin/super-admin.
- Khách ẩn danh không bao giờ thấy bài trong thùng rác, kể cả khi gửi `?trash=true`.
- Slug (hoặc `name` của shortcode) chỉ duy nhất trong số bản chưa vào thùng rác, nên có thể tạo bản thay thế dùng lại slug đó. Khôi phục vào slug đã bị chiếm sẽ bị từ chối bằng thông báo song ngữ ở hook `guard-restore-slug-conflict`.

## Khi đổi slug hoặc tái cấu trúc

- Đổi slug của pages/posts/products/landings tự tạo **redirect 301** từ đường dẫn cũ (có dấu `/` cuối) sang đường dẫn mới; hook không bao giờ chặn việc lưu và gửi thêm một request revalidate cho slug cũ.
- Redirect có thể xem và chỉnh trong collection **Redirects** ([nội dung và cấu trúc](/tinh-nang/noi-dung-va-cau-truc)).

## Kiểm duyệt bình luận

Bình luận do khách gửi luôn ở trạng thái `pending`; editor, admin hoặc super-admin duyệt (`approved`) hoặc đánh dấu `spam`. Thẻ "Bình luận chờ duyệt" trên bảng điều khiển dẫn tới danh sách đã lọc. Nếu bạn đặt `MODERATION_WEBHOOK_URL`, CMS POST `{ "text": "…" }` tới URL đó cho mỗi bình luận mới chờ duyệt (ví dụ vào kênh chat của nhóm). Khi một bình luận trên bài được duyệt hoặc bị bỏ duyệt, frontend cũng được báo làm mới.

## Thực hành tốt

- Mỗi cộng tác viên một tài khoản `author`; chỉ editor/admin có quyền xuất bản.
- Dùng lịch hằng tuần: đặt `publishedAt` dự kiến cho bản nháp để cả nhóm thấy nhịp đăng.
- Trước khi đăng, rà tab SEO và thẻ "Kiểm tra SEO" trên bảng điều khiển.
- Khi đổi slug bài đã được chỉ mục, kiểm tra redirect đã được frontend áp dụng.
- Dọn thùng rác định kỳ bằng tài khoản admin; xoá vĩnh viễn không hoàn tác được.

Chi tiết tham chiếu (tiếng Anh): [Collections trên docs.opencms.kdigi.vn](https://docs.opencms.kdigi.vn/en/tham-khao/collections/). Muốn thử quy trình này với tài khoản editor, vào [bản demo](/demo). Các thực hành quản trị liên quan ở [thực hành tốt](/thuc-hanh-tot).
