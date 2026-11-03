---
title: "Demo KDIGI CMS: dùng thử có tài khoản sẵn"
description: "Đăng nhập demo KDIGI CMS bằng tài khoản có sẵn, thử soạn bài, SEO, media và phân quyền. Dữ liệu demo được đặt lại hằng đêm, có giới hạn sandbox."
h1: "Dùng thử KDIGI CMS trực tiếp"
navTitle: "Demo"
icon: eye
lead: "Đăng nhập bằng tài khoản editor công khai, thử soạn bài, SEO và media ngay trên trình duyệt."
primaryKeyword: "demo kdigi cms"
updated: 2026-11-03
heroImage: /images/art/demo-hero.webp
heroAlt: "Laptop kính mờ với nút phát màu xanh, minh họa bản demo trực tuyến của KDIGI CMS"
schema: WebPage
faq:
  - q: "Tài khoản demo KDIGI CMS là gì?"
    a: "Mở https://app.opencms.kdigi.vn/admin, email demo@opencms.kdigi.vn, mật khẩu Demo@2026. Vai trò editor, chỉ thấy site demo. Tài khoản dùng chung nên đừng nhập dữ liệu thật."
  - q: "Tại sao tôi không đổi được mật khẩu của tài khoản demo?"
    a: "Đó là cơ chế bảo vệ có chủ đích. Tài khoản trong DEMO_ACCOUNT_EMAILS không đổi được email, mật khẩu, API key và không tự xóa mình (mã 403), để khách khác không bị khóa."
  - q: "Dữ liệu tôi tạo trong bản demo có được giữ lại không?"
    a: "Không. Mỗi đêm lúc 03:00 giờ Việt Nam, pnpm demo:reset xóa nội dung site demo và nạp lại dữ liệu mẫu. Muốn giữ dữ liệu, hãy tự cài KDIGI CMS."
  - q: "Bản demo có những tính năng gì để thử?"
    a: "Với vai trò editor: soạn Markdown, tải và sửa ảnh, chỉnh SEO và xem JSON-LD, quản lý menu, FAQ, redirect, lịch nội dung. Tạo site, người dùng và cấu hình lưu trữ thuộc về super-admin."
  - q: "Tôi muốn tự chạy bản demo trên máy mình thì làm thế nào?"
    a: "Clone kdigivn/kdigi-cms-open rồi chạy SEED_DEMO=true docker compose up --build, mở http://localhost:3000/admin và tạo tài khoản đầu tiên (tự động là super-admin)."
related:
  - /tinh-nang
  - /tu-host
  - /chuyen-tu-wordpress
  - /ma-nguon-mo
  - /tinh-nang/phan-quyen-nguoi-dung
docs: https://docs.opencms.kdigi.vn/huong-dan/bat-dau-nhanh/
---

Mở trang quản trị và đăng nhập bằng tài khoản demo công khai. Bạn có vai trò `editor` trên site `demo`; nội dung được đặt lại lúc 03:00 mỗi đêm.

> **Tóm tắt nhanh**
>
> - Địa chỉ: <https://app.opencms.kdigi.vn/admin>
> - Vai trò `editor`, chỉ thấy site `demo`.
> - Không đổi được email, mật khẩu, API key của tài khoản demo.
> - Nội dung đặt lại lúc **03:00 giờ Việt Nam** mỗi đêm.
> - Môi trường dùng chung: đừng nhập dữ liệu thật.

[Mở trang đăng nhập demo](https://app.opencms.kdigi.vn/admin) · [Tự cài bản của riêng bạn](/tu-host) · [Xem mã nguồn](/ma-nguon-mo)

## :key-round: Đăng nhập

| Thông tin | Giá trị |
| --- | --- |
| Địa chỉ | `https://app.opencms.kdigi.vn/admin` |
| Email | `demo@opencms.kdigi.vn` |
| Mật khẩu | `Demo@2026` |

![Màn hình đăng nhập trang quản trị KDIGI CMS](/images/shots/login.webp)

Sau khi đăng nhập, bạn thấy bảng điều khiển của site `demo` với bài viết, trang, chuyên mục, FAQ và menu mẫu bằng hai ngôn ngữ `vi` và `en`.

![Bảng điều khiển của KDIGI CMS với số bài nháp và đã đăng, bài mới cập nhật và kiểm tra SEO](/images/shots/dashboard.webp)

## :list-checks: Nên thử gì

:::cards 3
- :pen-line: **Viết bài Markdown** Gõ `/` mở slash menu; thử dán từ Google Docs. [Trình soạn thảo](/tinh-nang/trinh-soan-thao-markdown).
- :image: **Thư viện media** Tạo thư mục, tải ảnh, mở trình sửa ảnh. [Thư viện media](/tinh-nang/thu-vien-media).
- :search: **SEO của bài** Mẫu tiêu đề, điểm SEO, JSON-LD. [SEO và JSON-LD](/tinh-nang/seo-json-ld).
- :link: **Redirect** Đổi slug một bài rồi xem mục Redirects: CMS tự tạo 301.
- :tags: **Menu và FAQ** Menu dạng cây theo vị trí, FAQ gắn vào bài.
- :history: **Phiên bản, thùng rác** Khôi phục và lịch nội dung. [Quy trình biên tập](/tinh-nang/quy-trinh-bien-tap).
:::

![Trình soạn thảo Markdown Milkdown với slash menu mở để chèn khối nội dung](/images/shots/editor-slash.webp)

## :lock: Giới hạn của môi trường demo

:::cards 2
- :users: **Không đổi thông tin tài khoản** Yêu cầu bị từ chối với mã `403`, thông báo song ngữ vi/en.
- :building-2: **Chỉ site demo** Site và người dùng khác không bị đụng đến.
- :shield-check: **Quyền editor** Soạn, xuất bản, kiểm duyệt, đưa vào thùng rác; không tạo người dùng, site hay xóa vĩnh viễn.
- :clock: **Đặt lại hằng đêm** Lúc 03:00 giờ Việt Nam, xóa nội dung site `demo` rồi nạp lại dữ liệu mẫu.
:::

> **Cảnh báo** Người khác dùng chung tài khoản có thể thấy nội dung bạn tạo trước lần đặt lại kế tiếp. Đừng nhập dữ liệu thật.

Muốn thử vai trò `super-admin` (tạo site, thêm người dùng, cấu hình R2), hãy [tự host](/tu-host) một bản trên máy bạn.

## :refresh-cw: Cơ chế đặt lại

Lệnh `pnpm demo:reset` (bản 1.1.0) làm đúng bốn việc:

:::check
- Xóa vĩnh viễn mọi nội dung của site `demo`, gồm media và thùng rác
- Nạp lại dữ liệu của `pnpm seed:demo`
- Đặt lại mật khẩu, vai trò `editor` và site `demo` cho tài khoản trong `DEMO_ACCOUNT_EMAILS`
- Không đụng đến site và người dùng khác
:::

Muốn bật cho site công khai của riêng bạn: [cấu hình tài khoản demo](https://github.com/kdigivn/kdigi-cms-open/blob/main/docs/configuration.md).

## :terminal: Chạy demo trên máy bạn

```bash
git clone https://github.com/kdigivn/kdigi-cms-open.git
cd kdigi-cms-open
SEED_DEMO=true docker compose up --build
```

Mở `http://localhost:3000/admin`, tạo tài khoản `super-admin` đầu tiên rồi chọn site **demo**. Đã cài sẵn? Chạy `pnpm seed:demo` để nạp lại mẫu mà không ghi đè phần bạn đã sửa.

## :arrow-right: Sau khi dùng thử

:::cards 2
- :refresh-cw: **Đang dùng WordPress** Xem nội dung cũ sang đây thế nào: [chuyển từ WordPress](/chuyen-tu-wordpress).
- :server: **Cần vận hành thật** [Tự host bằng Docker Compose hoặc Coolify](/tu-host).
- :layers: **Xem toàn bộ khả năng** [Trung tâm tính năng](/tinh-nang).
- :github: **Đọc hoặc đóng góp mã** [Mã nguồn mở MIT](/ma-nguon-mo).
:::
