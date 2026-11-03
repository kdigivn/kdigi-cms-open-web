---
title: "Demo KDIGI CMS: dùng thử có tài khoản sẵn"
description: "Đăng nhập demo KDIGI CMS bằng tài khoản có sẵn, thử soạn bài, SEO, media và phân quyền. Dữ liệu demo được đặt lại hằng đêm, có giới hạn sandbox."
h1: "Dùng thử KDIGI CMS trực tiếp"
navTitle: "Demo"
primaryKeyword: "demo kdigi cms"
updated: 2026-11-03
heroImage: /images/art/demo-hero.webp
heroAlt: "Laptop kính mờ với nút phát màu xanh, minh họa bản demo trực tuyến của KDIGI CMS"
schema: WebPage
faq:
  - q: "Tài khoản demo KDIGI CMS là gì?"
    a: "Địa chỉ là https://app.opencms.kdigi.vn/admin, email demo@opencms.kdigi.vn, mật khẩu Demo@2026. Tài khoản có vai trò editor và chỉ thấy site demo. Đây là tài khoản công khai dùng chung nên đừng nhập dữ liệu thật; nội dung site demo được đặt lại mỗi đêm lúc 03:00 giờ Việt Nam."
  - q: "Tại sao tôi không đổi được mật khẩu hoặc email của tài khoản demo?"
    a: "Đó là cơ chế bảo vệ có chủ đích. Email nằm trong biến DEMO_ACCOUNT_EMAILS nên chính tài khoản đó không thể đổi email, mật khẩu, API key hay công tắc API key, cũng không tự xóa mình (trả mã 403 kèm thông báo song ngữ). Nhờ vậy khách khác không bị khóa khỏi bản demo."
  - q: "Dữ liệu tôi tạo trong bản demo có được giữ lại không?"
    a: "Không. Mỗi đêm lúc 03:00 giờ Việt Nam, lệnh pnpm demo:reset xóa toàn bộ nội dung của site demo (kể cả media, thư mục và thùng rác), nạp lại dữ liệu mẫu và đặt lại mật khẩu, vai trò, site của tài khoản demo. Muốn giữ dữ liệu, hãy tự cài KDIGI CMS."
  - q: "Bản demo có những tính năng gì để thử?"
    a: "Bạn dùng được với vai trò editor: soạn bài bằng trình soạn thảo Markdown, tải và sửa ảnh trong thư viện media, chỉnh trường SEO và xem JSON-LD, quản lý menu, FAQ, redirect và lịch nội dung. Các thao tác quản trị như tạo site, người dùng hay cấu hình lưu trữ thuộc về super-admin nên không có trong tài khoản demo."
  - q: "Tôi muốn tự chạy bản demo trên máy mình thì làm thế nào?"
    a: "Clone repo kdigivn/kdigi-cms-open rồi chạy SEED_DEMO=true docker compose up --build, mở http://localhost:3000/admin và tạo tài khoản đầu tiên (tự động là super-admin). Site demo sẽ có sẵn bài viết, trang, chuyên mục, FAQ và menu mẫu. Lệnh này idempotent nên chạy lại không tạo bản trùng."
related:
  - /tinh-nang
  - /tu-host
  - /chuyen-tu-wordpress
  - /ma-nguon-mo
  - /tinh-nang/phan-quyen-nguoi-dung
docs: https://docs.opencms.kdigi.vn/huong-dan/bat-dau-nhanh/
---

Bạn có thể dùng thử KDIGI CMS ngay trên trình duyệt: mở trang quản trị `https://app.opencms.kdigi.vn/admin` và đăng nhập bằng tài khoản demo `demo@opencms.kdigi.vn`, mật khẩu `Demo@2026`. Tài khoản có vai trò `editor` và chỉ thấy site `demo`, nội dung được đặt lại lúc 03:00 mỗi đêm.

> **Tóm tắt nhanh**
>
> - Địa chỉ: <https://app.opencms.kdigi.vn/admin>
> - Tài khoản: `demo@opencms.kdigi.vn`, mật khẩu: `Demo@2026`
> - Vai trò `editor`, chỉ thấy site `demo`; không vào được site khác, quản lý người dùng hay cấu hình lưu trữ.
> - Tài khoản demo không đổi được email, mật khẩu, API key của chính nó và không tự xóa mình.
> - Nội dung site `demo` được xóa và nạp lại lúc **03:00 giờ Việt Nam** mỗi đêm.
> - Môi trường dùng chung: đừng nhập dữ liệu thật.

[Mở trang đăng nhập demo](https://app.opencms.kdigi.vn/admin) · [Tự cài bản của riêng bạn](/tu-host) · [Xem mã nguồn](/ma-nguon-mo)

![Màn hình đăng nhập trang quản trị KDIGI CMS](/images/shots/login.webp)

## Đăng nhập và bắt đầu

| Thông tin | Giá trị |
| --- | --- |
| Địa chỉ | `https://app.opencms.kdigi.vn/admin` |
| Email | `demo@opencms.kdigi.vn` |
| Mật khẩu | `Demo@2026` |
| Vai trò | `editor` |
| Site được thấy | `demo` |

Sau khi đăng nhập, bạn thấy bảng điều khiển biên tập của site `demo` với dữ liệu mẫu do lệnh nạp demo của CMS tạo: bài viết hướng dẫn (ví dụ "Chào mừng đến với KDIGI CMS", "Viết bài bằng Markdown", "Tối ưu SEO cho mỗi bài viết"), trang Giới thiệu và Liên hệ, chuyên mục Hướng dẫn, Tin tức, Mẹo hay, một số thẻ, FAQ và menu. Nội dung có hai ngôn ngữ `vi` (mặc định) và `en`.

![Bảng điều khiển của KDIGI CMS với số bài nháp và đã đăng, bài mới cập nhật và kiểm tra SEO](/images/shots/dashboard.webp)

## Những gì nên thử

Danh sách dưới đây nhắm vào các tính năng mà vai trò `editor` dùng được. Mỗi mục có trang giải thích riêng nếu bạn muốn đọc trước.

1. **Viết một bài bằng trình soạn thảo Markdown.** Vào Bài viết, tạo bài mới, gõ `/` để mở slash menu chèn heading, danh sách, bảng, media hoặc liên kết nội bộ. Thử dán nội dung từ Google Docs hoặc Word để xem định dạng được giữ lại thế nào. Xem [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown).
2. **Tải ảnh lên thư viện media.** Tạo thư mục, tải ảnh, mở trình sửa ảnh, hoặc nhập ảnh từ URL (có chặn SSRF). Xem [thư viện media](/tinh-nang/thu-vien-media).
3. **Chỉnh SEO của bài.** Mở tab SEO: tiêu đề và mô tả theo mẫu kiểu RankMath, điểm SEO, gợi ý liên kết nội bộ và JSON-LD dạng `@graph`. Xem [SEO và JSON-LD](/tinh-nang/seo-json-ld).
4. **Đổi slug và kiểm redirect.** Sửa slug của một bài rồi mở mục Redirects: CMS tự tạo 301 khi đổi slug trong admin.
5. **Dựng menu dạng cây và FAQ.** Menu nhiều cấp theo vị trí, FAQ nhóm lại để gắn vào bài.
6. **Xem lịch sử phiên bản, thùng rác và lịch nội dung.** Các collection nội dung có versions, thùng rác và bảng điều khiển biên tập. Xem [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap).
7. **Xem cách frontend lấy nội dung.** Bài đã xuất bản đọc được qua REST/GraphQL mà không cần đăng nhập, và frontend phải lọc theo `where[tenant][equals]=<id>` để không lẫn nội dung giữa các site. Xem [headless API](/tinh-nang/headless-api).

![Trình soạn thảo Markdown Milkdown với slash menu mở để chèn khối nội dung](/images/shots/editor-slash.webp)

## Giới hạn của môi trường demo

Đây là môi trường thử nghiệm **dùng chung** giữa nhiều người truy cập, nên có các giới hạn sau (nguồn: README và tài liệu cấu hình của KDIGI CMS):

| Giới hạn | Chi tiết |
| --- | --- |
| Không đổi thông tin tài khoản | Tài khoản trong `DEMO_ACCOUNT_EMAILS` không đổi được email, mật khẩu, API key, công tắc API key và không tự xóa mình; yêu cầu bị từ chối với mã `403` và thông báo song ngữ vi/en |
| Phạm vi site | Chỉ site `demo`; các site và người dùng khác không bị đụng đến |
| Phạm vi quyền | Vai trò `editor` soạn, xuất bản, kiểm duyệt bình luận và chuyển vào thùng rác; không tạo hay quản lý người dùng và site, không sửa thông tin lưu trữ, không xóa vĩnh viễn |
| Đặt lại hằng đêm | 03:00 giờ Việt Nam, xóa toàn bộ nội dung site `demo` rồi nạp lại dữ liệu mẫu |
| Dữ liệu | Đừng nhập thông tin thật, vì người khác dùng cùng tài khoản có thể thấy nội dung bạn tạo trước lần đặt lại kế tiếp |

Vai trò `super-admin` cùng các thao tác như tạo site mới, thêm người dùng hay cấu hình Cloudflare R2 không có trong tài khoản demo. Để thử các phần đó, hãy [tự host](/tu-host) một bản trên máy bạn, chỉ mất vài phút với Docker.

### Cơ chế đặt lại hoạt động thế nào

Lệnh `pnpm demo:reset` (mã nguồn `src/seed/demo-reset.ts`, thêm vào ở bản 1.1.0) làm đúng những việc sau:

- Xóa vĩnh viễn **mọi nội dung của site có `siteKey = demo`**: bài viết, trang, media cùng file, thư mục và cả thùng rác.
- Nạp lại site với đúng dữ liệu của `pnpm seed:demo`.
- Với mỗi email trong `DEMO_ACCOUNT_EMAILS`: tạo tài khoản nếu thiếu và đặt lại mật khẩu (lấy từ `DEMO_ACCOUNT_PASSWORD`, tối thiểu 8 ký tự), vai trò `editor` và site `demo`.
- Không đụng đến site và người dùng khác.

Trên máy chủ của KDIGI, lệnh này chạy theo lịch hằng đêm; bản docs hướng dẫn dùng **Scheduled Task** của Coolify trên service `app` với biểu thức cron và múi giờ. Bạn có thể bật cơ chế tương tự cho site công khai của riêng mình, xem [tự host](/tu-host).

## Chạy bản demo trên máy của bạn

Nếu muốn thử toàn bộ vai trò `super-admin` kèm dữ liệu mẫu:

```bash
git clone https://github.com/kdigivn/kdigi-cms-open.git
cd kdigi-cms-open
SEED_DEMO=true docker compose up --build
```

Mở `http://localhost:3000/admin`; form **Create first user** tạo tài khoản `super-admin` đầu tiên và bạn chọn site **demo** để xem nội dung mẫu. Đã cài sẵn và chỉ muốn nạp lại dữ liệu mẫu: `pnpm seed:demo` (idempotent, không ghi đè phần bạn đã sửa).

Bật bảo vệ tài khoản demo cho một site công khai của bạn là tùy chọn và không đổi hành vi nếu bạn không đặt biến:

```bash
DEMO_ACCOUNT_EMAILS=demo@example.com
DEMO_ACCOUNT_PASSWORD=change-me-min-8-chars
```

Sau đó đặt lịch `pnpm demo:reset` hằng đêm. Người dùng bị khóa tự đổi thông tin vẫn có thể được super-admin quản lý.

## Sau khi dùng thử

- Đang dùng WordPress và muốn biết nội dung cũ sẽ sang đây thế nào: [chuyển từ WordPress](/chuyen-tu-wordpress).
- Cần vận hành thật: [tự host bằng Docker Compose hoặc Coolify](/tu-host).
- Muốn xem toàn bộ khả năng của sản phẩm: [trung tâm tính năng](/tinh-nang).
- Muốn đọc hoặc đóng góp mã: [mã nguồn mở MIT](/ma-nguon-mo).

## Nguồn

- README của KDIGI CMS (mục Dùng thử trực tiếp): <https://github.com/kdigivn/kdigi-cms-open#readme>
- Cấu hình tài khoản demo công khai: <https://github.com/kdigivn/kdigi-cms-open/blob/main/docs/configuration.md>
- Vai trò và quyền (Demo accounts): <https://github.com/kdigivn/kdigi-cms-open/blob/main/docs/roles-and-permissions.md>
- CHANGELOG, bản 1.1.0: <https://github.com/kdigivn/kdigi-cms-open/blob/main/CHANGELOG.md>
