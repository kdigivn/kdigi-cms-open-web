---
title: "Quy trình biên tập: lịch nội dung, bản nháp, phiên bản"
description: "Bảng điều khiển biên tập, lịch nội dung, bản nháp và xuất bản, lịch sử phiên bản có khôi phục, thùng rác. Giúp nhóm nội dung làm việc nhất quán."
h1: "Quy trình biên tập: lịch nội dung, duyệt bài, khôi phục phiên bản"
navTitle: "Quy trình biên tập"
primaryKeyword: "lịch nội dung"
icon: calendar-clock
lead: "Bảng điều khiển, lịch nội dung, hẹn giờ, phiên bản và thùng rác cho nhóm biên tập."
updated: 2026-11-03
heroImage: "/images/art/tinh-nang-quy-trinh-bien-tap-hero.webp"
heroAlt: "Lịch kính mờ có vài ô tô màu, chồng thẻ và đồng hồ đất sét, đại diện cho quy trình biên tập"
schema: "TechArticle"
faq:
  - q: "KDIGI CMS có lịch nội dung không?"
    a: "Có. Trang `/admin/content-calendar` hiển thị bài viết, trang, sản phẩm và landing theo `publishedAt`, dạng lưới tháng hoặc agenda, tính theo giờ Việt Nam, có bộ lọc loại và trạng thái."
  - q: "Hẹn giờ đăng bài hoạt động thế nào?"
    a: "Đặt `status` là `published` và `publishedAt` ở tương lai. Bài ẩn tới giờ đó. Cache frontend chỉ làm mới khi có lượt lưu, nên hãy kiểm tra cách frontend của bạn xử lý."
  - q: "Lỡ xóa hoặc sửa nhầm bài thì lấy lại thế nào?"
    a: "Xóa trong giao diện chỉ chuyển bài vào thùng rác và khôi phục được. Pages, posts, products, landings, faqs, shortcodes giữ tối đa 30 phiên bản, có diff và nút Restore."
  - q: "Đổi slug bài đã đăng có gây lỗi 404 không?"
    a: "CMS tự tạo redirect 301 từ đường dẫn cũ sang mới trong cùng site. Bạn cần áp danh sách redirect ở frontend."
related:
  - /tinh-nang/phan-quyen-nguoi-dung
  - /tinh-nang/noi-dung-va-cau-truc
  - /tinh-nang/trinh-soan-thao-markdown
  - /tinh-nang/seo-json-ld
  - /thuc-hanh-tot
docs: "https://docs.cms.kdigi.vn/en/tham-khao/collections/"
---

Author gửi bản nháp, editor trở lên duyệt và đăng. Bảng điều khiển cho biết việc cần làm, lịch nội dung giúp lên kế hoạch theo ngày, còn phiên bản và thùng rác giúp không mất bài.

> **Tóm tắt nhanh**
>
> - Bảng điều khiển: nháp, đã đăng, bình luận chờ, SEO.
> - Lịch nội dung `/admin/content-calendar`, giờ Việt Nam.
> - Hẹn giờ: `published` với `publishedAt` tương lai.
> - Tối đa 30 phiên bản mỗi tài liệu, có Restore.
> - Thùng rác trước khi xóa vĩnh viễn.

![Bảng điều khiển biên tập: số liệu nội dung, cập nhật gần đây, kiểm tra SEO](/images/shots/dashboard.webp)

## :gauge: Bảng điều khiển

:::cards
- :pen-line: **Bài viết nháp** Bấm vào để mở danh sách đã lọc.
- :newspaper: **Bài đã xuất bản** Tổng số bài `published`.
- :package: **Sản phẩm đã xuất bản** Tổng số sản phẩm `published`.
- :list-checks: **Bình luận chờ duyệt** Tổng số bình luận `pending`.
- :history: **Cập nhật gần đây** 5 bài viết và 3 trang sửa gần nhất.
- :search: **Kiểm tra SEO** Tối đa 15 tài liệu cần cải thiện, kèm lý do. Xem [SEO và JSON-LD](/tinh-nang/seo-json-ld).
:::

Số liệu truy vấn bằng quyền của chính người dùng, nên mỗi người chỉ thấy site của mình ([phân quyền](/tinh-nang/phan-quyen-nguoi-dung)).

## :calendar-clock: Lịch nội dung

Hai chế độ: lưới tháng và agenda. Ngày tính theo `Asia/Ho_Chi_Minh`; có bộ lọc theo loại nội dung và trạng thái.

| Trạng thái | Ý nghĩa |
| --- | --- |
| Đang hiển thị | `published` và `publishedAt` đã qua |
| Hẹn giờ | `published` nhưng `publishedAt` ở tương lai |
| Nháp có ngày | Bản nháp đã đặt ngày dự kiến |

![Lịch nội dung dạng lưới tháng với bài viết, trang, sản phẩm theo ngày đăng](/images/shots/content-calendar.webp "Lịch nội dung: bài viết, trang, sản phẩm theo ngày đăng")

## :rocket: Từ ý tưởng đến xuất bản

:::steps
- **Tạo nháp** Bấm *Viết bài mới*: slug, tác giả, tóm tắt, đếm từ tự điền.
- **Soạn thảo** Trong [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown).
- **Rà soát SEO** Tab SEO: tiêu đề, từ khóa, mô tả, điểm số.
- **Duyệt** Editor hoặc admin chỉnh nếu cần.
- **Xuất bản hoặc hẹn giờ** Đổi `status`; `publishedAt` trống thì lấy giờ hiện tại.
- **Làm mới cache** Mỗi lần lưu xếp job revalidate tới frontend ([Headless API](/tinh-nang/headless-api)).
:::

> **Cảnh báo** Cache frontend chỉ làm mới khi **lưu**, không theo đồng hồ. Bài hẹn giờ có thể chưa hiện cho tới khi có lượt revalidate.

## :history: Phiên bản, thùng rác, redirect

:::cards
- :history: **Phiên bản** Tối đa 30 mỗi tài liệu; xem History, diff, Restore.
- :x: **Thùng rác** Xóa trong giao diện chỉ đặt `deletedAt`; xóa vĩnh viễn thuộc admin.
- :link: **Redirect 301** Đổi slug tự tạo redirect và làm mới slug cũ.
:::

![Lịch sử phiên bản bài viết: so sánh hai phiên bản và nút khôi phục](/images/shots/versions-restore.webp "So sánh khác biệt hai phiên bản và nút Restore")

> **Lưu ý** Khôi phục đi qua quyền `update` bình thường, nên author không khôi phục được bài đã xuất bản.

## :heart-handshake: Kiểm duyệt bình luận

Bình luận do khách gửi luôn ở `pending`; editor trở lên duyệt (`approved`) hoặc đánh dấu `spam`. Đặt `MODERATION_WEBHOOK_URL` để nhận thông báo mỗi bình luận mới chờ duyệt.

## :list-checks: Thực hành tốt

:::check
- Mỗi cộng tác viên một tài khoản `author`
- Đặt `publishedAt` dự kiến để cả nhóm thấy nhịp đăng
- Rà tab SEO trước khi đăng
- Dọn thùng rác định kỳ; xóa vĩnh viễn không hoàn tác
:::

Muốn thử với tài khoản editor, vào [bản demo](/demo). Chi tiết mô hình dữ liệu ở [nội dung và cấu trúc](/tinh-nang/noi-dung-va-cau-truc) và [thực hành tốt](/thuc-hanh-tot).
