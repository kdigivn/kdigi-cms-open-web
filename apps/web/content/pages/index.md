---
title: "KDIGI CMS – CMS mã nguồn mở cho website chuẩn SEO"
description: "KDIGI CMS là CMS mã nguồn mở MIT, quản lý nhiều website, soạn Markdown, JSON-LD, REST/GraphQL API. Chuyển từ WordPress, tự host bằng Docker, dùng miễn phí."
h1: "KDIGI CMS – hệ thống quản trị nội dung mã nguồn mở, tự host"
navTitle: "Trang chủ"
primaryKeyword: "cms mã nguồn mở"
updated: 2026-11-03
heroImage: /images/art/home-hero.webp
heroAlt: "Một khối trung tâm xanh nối với ba cửa sổ website kính mờ trên đế đất sét"
schema: SoftwareApplication
faq:
  - q: "KDIGI CMS là gì?"
    a: "KDIGI CMS là hệ quản trị nội dung headless mã nguồn mở, giấy phép MIT, xây trên Payload 3, Next.js 15 và PostgreSQL. Một bản cài quản lý nhiều website; website công khai của bạn lấy nội dung qua REST hoặc GraphQL. CMS lo soạn thảo Markdown, SEO, media, phân quyền và chuyển dữ liệu từ WordPress."
  - q: "KDIGI CMS có miễn phí không?"
    a: "Có. Mã nguồn dùng giấy phép MIT, bạn được dùng, sửa và triển khai cho dự án cá nhân lẫn thương mại. Bạn chỉ trả chi phí hạ tầng của mình (VPS, tên miền). Một số tính năng tùy chọn như AI SEO cần khóa API của nhà cung cấp bên ngoài (DeepSeek) do bạn tự đăng ký."
  - q: "Tôi có cần biết lập trình để dùng KDIGI CMS không?"
    a: "Biên tập viên chỉ dùng trang quản trị bằng tiếng Việt. Còn dựng website công khai thì cần một frontend (Next.js, Astro, Nuxt, mobile app…) gọi API; KDIGI CMS là CMS headless nên không kèm giao diện website. Cài đặt CMS thì chỉ cần Docker và một lệnh docker compose."
  - q: "Chạy KDIGI CMS cần những gì?"
    a: "Để thử cục bộ chỉ cần Docker có Compose: chạy SEED_DEMO=true docker compose up --build rồi mở localhost:3000/admin. Để phát triển cần Node.js từ 20.9, pnpm 10 và PostgreSQL. Khi chạy production chỉ bắt buộc 3 biến môi trường: DATABASE_URI, PAYLOAD_SECRET và PAYLOAD_PUBLIC_SERVER_URL."
  - q: "Chuyển website WordPress sang KDIGI CMS được không?"
    a: "Được. CMS có pipeline nhập nhiều giai đoạn (thô, chuẩn hóa, nhập) với cổng duyệt và sao lưu, giữ cấu trúc SEO như JSON-LD, redirect và gallery WordPress. Hãy đọc trang chuyển từ WordPress để biết phạm vi hỗ trợ và các giới hạn trước khi bắt đầu."
  - q: "KDIGI CMS khác WordPress thế nào?"
    a: "KDIGI CMS là CMS headless: chỉ cung cấp trang quản trị và API, còn giao diện website do frontend của bạn đảm nhiệm, không kèm theme dựng sẵn. Đổi lại, một bản cài quản lý nhiều site, SEO và JSON-LD có sẵn trong lõi. Xem bài [so sánh KDIGI CMS với WordPress](/so-sanh/kdigi-cms-vs-wordpress) để biết chi tiết."
related:
  - /tinh-nang
  - /chuyen-tu-wordpress
  - /tu-host
  - /demo
  - /ma-nguon-mo
docs: https://docs.opencms.kdigi.vn/
---

KDIGI CMS là hệ quản trị nội dung headless mã nguồn mở (giấy phép MIT) cho phép quản lý nhiều website trên một bản cài duy nhất. Hệ thống xây trên Payload 3, Next.js 15 và PostgreSQL, kèm trình soạn thảo Markdown, SEO và JSON-LD tích hợp, REST/GraphQL và công cụ chuyển dữ liệu từ WordPress.

> **Tóm tắt nhanh**
>
> - **Loại sản phẩm:** CMS headless, giấy phép MIT, phiên bản hiện tại 1.1.0 (3/11/2026).
> - **Đa website:** một bản cài, một cơ sở dữ liệu, nhiều tên miền; dữ liệu cách ly theo site.
> - **Soạn thảo:** Markdown với Milkdown, API trả HTML đã làm sạch ở đúng khóa gốc.
> - **SEO:** mẫu tiêu đề kiểu RankMath, đồ thị JSON-LD `@graph`, kiểm tra SEO, gợi ý liên kết nội bộ.
> - **Chạy thử:** `SEED_DEMO=true docker compose up --build`, không cần tài khoản đám mây.

## KDIGI CMS là gì và dành cho ai?

KDIGI CMS là **trang quản trị cộng với API**. Bạn viết và quản lý nội dung trong CMS; website công khai (Next.js, Astro, Nuxt hay ứng dụng di động) lấy nội dung qua REST hoặc GraphQL. Cách tách này gọi là *headless*: phần "đầu" hiển thị do bạn tự chọn, CMS chỉ giữ phần dữ liệu và quy trình biên tập.

Theo README của dự án, KDIGI CMS được tách ra từ một hệ thống CMS đa website đã chạy thực tế trong môi trường production, rồi tổng quát hóa để mọi người dùng chung. Đối tượng phù hợp:

- **Agency** cần quản lý nhiều website khách hàng mà không dựng mỗi site một bản cài.
- **Blogger và doanh nghiệp nhỏ** muốn kiểm soát dữ liệu, tự host và có SEO chuẩn ngay từ đầu.
- **Người đang dùng WordPress** muốn chuyển sang kiến trúc headless nhưng giữ được nội dung và cấu trúc SEO.
- **Lập trình viên frontend** cần API ổn định, có tài liệu và có sẵn ví dụ tích hợp.

## Bản đồ tính năng

Mỗi tính năng có một trang riêng, mô tả chi tiết và kèm liên kết sang tài liệu kỹ thuật:

| Nhu cầu | Tính năng | Trang chi tiết |
| --- | --- | --- |
| Nhiều website, một hệ thống | Sites, domain, thương hiệu, cấu hình theo site | [Quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website) |
| Viết nội dung nhanh | Milkdown, slash menu, dán từ Docs/Word, shortcode | [Trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown) |
| Lên top tìm kiếm | Mẫu SEO, JSON-LD, kiểm tra SEO, gợi ý liên kết | [SEO và JSON-LD](/tinh-nang/seo-json-ld) |
| Quản lý ảnh và tệp | Thư viện media, thư mục, trình sửa ảnh, R2 | [Thư viện media](/tinh-nang/thu-vien-media) |
| Làm việc theo nhóm | Bốn vai trò, gán người dùng theo site | [Phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung) |
| Kết nối frontend | REST, GraphQL, revalidate ISR | [Headless API](/tinh-nang/headless-api) |
| Mô hình dữ liệu | Trang, bài viết, sản phẩm, landing, taxonomy, menu | [Nội dung và cấu trúc](/tinh-nang/noi-dung-va-cau-truc) |
| Vận hành biên tập | Lịch nội dung, phiên bản, thùng rác | [Quy trình biên tập](/tinh-nang/quy-trinh-bien-tap) |

Xem toàn bộ danh sách, chia nhóm theo nhu cầu, tại [trang tổng hợp tính năng](/tinh-nang).

## Hình ảnh thật từ trang quản trị

Ảnh dưới đây chụp từ bản chạy thật của KDIGI CMS, giao diện tiếng Việt: bảng điều khiển hiển thị số bài nháp, bài đã xuất bản và bảng kiểm tra SEO của site đang chọn.

![Bảng điều khiển KDIGI CMS với bài viết gần đây và bảng kiểm tra SEO](/images/shots/dashboard.webp)

Trình soạn thảo bài viết dùng Markdown, có thanh công cụ nổi và thanh bên chứa trạng thái, ngày đăng, slug, tác giả và ảnh đại diện:

![Trình soạn thảo Markdown Milkdown trong KDIGI CMS](/images/shots/editor.webp)

## Cách hoạt động trong 4 bước

1. **Cài CMS** bằng Docker Compose trên máy hoặc VPS.
2. **Tạo site**: nhập `siteKey`, `domain` và ngôn ngữ mặc định; thêm site không cần triển khai lại.
3. **Viết nội dung** trong trình soạn thảo, đặt SEO, gán tác giả và chuyên mục.
4. **Frontend lấy nội dung** qua API với bộ lọc `where[tenant][equals]=<id site>`; khi nội dung đổi, CMS gọi `POST /api/cms/revalidate` trên frontend để làm mới bộ nhớ đệm.

Ví dụ lấy 10 bài mới nhất của một site:

```bash
curl 'https://cms.example.com/api/posts?where[tenant][equals]=1&sort=-publishedAt&limit=10&depth=1'
```

Request ẩn danh chỉ thấy nội dung đã xuất bản; trường nội dung Markdown được trả về dạng HTML ở đúng khóa gốc. Chi tiết nằm ở [Headless API](/tinh-nang/headless-api) và [tài liệu kỹ thuật](https://docs.opencms.kdigi.vn/).

## Chạy thử trong vài phút

Yêu cầu duy nhất là Docker có Compose:

```bash
git clone https://github.com/kdigivn/kdigi-cms-open.git
cd kdigi-cms-open
SEED_DEMO=true docker compose up --build
```

Mở `http://localhost:3000/admin`, tạo tài khoản đầu tiên (tự động là `super-admin`) rồi chọn site **demo** để xem nội dung mẫu. Bỏ `SEED_DEMO=true` nếu muốn bản cài trống. Dữ liệu nằm trong các volume Docker (`postgres_data`, `media_data`, `app_data`) và được giữ lại sau `docker compose down`.

Không muốn cài? Dùng [demo trực tuyến](/demo) với tài khoản biên tập công khai; nội dung site `demo` được đặt lại mỗi đêm lúc 03:00 giờ Việt Nam, vì vậy đừng nhập dữ liệu thật.

## Chuyển từ WordPress

Nếu bạn đang có website WordPress, KDIGI CMS cung cấp pipeline nhập nhiều giai đoạn (thô → chuẩn hóa → nhập) có cổng duyệt và sao lưu. Bản sửa lỗi 1.0.1 và 1.1.0 trong [CHANGELOG](/phat-hanh) cho thấy pipeline này được duy trì tích cực: ví dụ ảnh đại diện, slider và ảnh trong bài đã nhập được đầy đủ, nguồn có cổng như `127.0.0.1:8080` cũng được nhận diện khi viết lại liên kết nội bộ. Tìm hiểu các giai đoạn, phạm vi và giới hạn tại [hướng dẫn chuyển từ WordPress](/chuyen-tu-wordpress).

## Tự host và kiểm soát dữ liệu

KDIGI CMS chạy trên Docker Compose ở bất kỳ VPS nào, hoặc trên [Coolify](https://coolify.io) với tệp `docker-compose.coolify.yml` có sẵn. Container tự chạy migration khi khởi động. Media **mặc định lưu trên ổ đĩa**, không cần tài khoản đám mây; mỗi site có thể bật Cloudflare R2 riêng. Nhớ sao lưu cả cơ sở dữ liệu lẫn thư mục media. Hướng dẫn đầy đủ: [tự host KDIGI CMS](/tu-host).

## Mã nguồn mở

Giấy phép [MIT](/ma-nguon-mo), mã nguồn tại GitHub `kdigivn/kdigi-cms-open`. Dự án có sẵn Code of Conduct, hướng dẫn đóng góp và chính sách bảo mật (báo lỗi bảo mật riêng tư, không mở issue công khai). Thông tin chi tiết ở trang [mã nguồn mở](/ma-nguon-mo).

## Công nghệ

Payload 3.90, Next.js 15 (App Router), React 19, PostgreSQL, Milkdown, Tailwind CSS 4 cùng shadcn/ui trong trang quản trị, TypeScript và pnpm. Nội dung hỗ trợ hai ngôn ngữ `vi` (mặc định) và `en` với cơ chế fallback; giao diện admin có tiếng Việt và tiếng Anh. Phiên bản và thay đổi nằm ở trang [phát hành](/phat-hanh).

## Bước tiếp theo

- Đọc [tổng hợp tính năng](/tinh-nang) để xem KDIGI CMS làm được gì.
- So sánh với giải pháp khác tại [trang so sánh](/so-sanh).
- Theo dõi hướng dẫn và bài phân tích mới trên [blog](/blog).
- Cần triển khai cho agency hoặc doanh nghiệp? Xem [giải pháp cho agency](/giai-phap/agency) và [giải pháp cho doanh nghiệp](/giai-phap/doanh-nghiep).
