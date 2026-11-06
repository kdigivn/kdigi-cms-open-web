---
title: "KDIGI CMS vs Ghost: nền tảng nào cho blog?"
description: "So sánh KDIGI CMS và Ghost cho blog, trang tin: soạn thảo, thành viên, SEO, đa website, tự host, giấy phép. Có bảng và gợi ý khi nào Ghost phù hợp hơn."
h1: "KDIGI CMS vs Ghost: so sánh cho blog và newsletter"
navTitle: "KDIGI CMS vs Ghost"
icon: newspaper
lead: "Ghost mạnh ở newsletter và thuê bao; KDIGI CMS mạnh ở nhiều website, frontend riêng và SEO trong CMS."
primaryKeyword: "ghost cms"
updated: 2026-11-03
heroImage: /images/shots/editor.webp
heroAlt: "Trình soạn thảo Markdown Milkdown trong KDIGI CMS khi viết một bài blog"
schema: TechArticle
faq:
  - q: "Ghost hay KDIGI CMS tốt hơn cho blog?"
    a: "Muốn newsletter, thành viên và thanh toán đăng ký có sẵn thì chọn Ghost. Muốn quản lý nhiều blog bằng một admin, dùng frontend riêng và có JSON-LD, redirect, mẫu SEO trong CMS thì chọn KDIGI CMS."
  - q: "KDIGI CMS có newsletter và membership như Ghost không?"
    a: "Không. KDIGI CMS không có newsletter, gói thành viên hay thanh toán đăng ký. Nó có bình luận (reCAPTCHA tùy chọn), đánh giá sao và quy trình biên tập. Xuất bản dựa trên thuê bao thì nên chọn Ghost."
  - q: "Ghost có quản lý nhiều website trong một bản cài không?"
    a: "Tài liệu hosting của Ghost không nêu tính năng quản lý nhiều site trong một bản cài; thực tế thường chạy mỗi site một instance. KDIGI CMS gom nhiều website vào một bản cài, mỗi website là một tenant."
  - q: "Chuyển nội dung từ Ghost sang KDIGI CMS thế nào?"
    a: "Chưa có công cụ nhập Ghost tự động. Xuất bài từ Admin API hoặc tệp xuất JSON, chuyển HTML sang Markdown, tạo site, tác giả, chuyên mục rồi nhập qua REST của KDIGI CMS kèm redirect 301 cho URL cũ."
  - q: "Ghost có MCP server cho AI agent không?"
    a: "Ghost có CLI chính thức [ghst](https://github.com/TryGhost/ghst) với chế độ MCP server chạy cục bộ (beta, chưa ổn định), dùng staff access token; chúng tôi không thấy endpoint MCP trong lõi. KDIGI CMS có MCP server tích hợp tại /api/mcp với API key theo người dùng, kèm CLI kcms; có từ bản 1.2.0. Xem [AI agent (MCP)](/tinh-nang/ai-agent-mcp)."
related:
  - /so-sanh/kdigi-cms-vs-wordpress
  - /giai-phap/blog-tin-tuc
  - /tinh-nang/trinh-soan-thao-markdown
  - /tinh-nang/quy-trinh-bien-tap
  - /so-sanh
docs: https://docs.cms.kdigi.vn/huong-dan/soan-thao-markdown/
---

Cả hai dùng giấy phép MIT, chạy Node.js và có API. Chọn Ghost để kinh doanh nội dung bằng thuê bao; chọn KDIGI CMS cho nhiều website và frontend riêng.

> **Tóm tắt nhanh**
> - Giống nhau: MIT, Node.js, có API, tự host được.
> - Ghost: newsletter, thành viên, thuê bao, theme, Ghost(Pro).
> - KDIGI CMS: nhiều website, Markdown, JSON-LD, redirect tự động.
> - CSDL: Ghost khuyến nghị MySQL 8; KDIGI CMS dùng PostgreSQL.
> - KDIGI CMS không có newsletter, membership, thanh toán đăng ký.

## :scale: Bảng so sánh

Ghost theo README và tài liệu chính thức, kiểm tra 2026-11-03.

| Tiêu chí | KDIGI CMS | Ghost |
| --- | --- | --- |
| Định vị | Headless CMS đa website | Nền tảng xuất bản, thành viên, newsletter |
| Giấy phép | MIT | MIT |
| Cơ sở dữ liệu | PostgreSQL | MySQL 8.0 hoặc 8.4 (cấu hình được hỗ trợ) |
| Newsletter, thành viên, thuê bao | ✗ | ✓ |
| Nhiều website trong một bản cài | ✓ | ✗ (tài liệu hosting không nêu) |
| Theme dựng sẵn | ✗ | ✓ |
| Bình luận | ✓ (reCAPTCHA tùy chọn, có duyệt) | ✓ (cho thành viên) |
| SEO | Mẫu RankMath, JSON-LD `@graph`, audit | Trường SEO cơ bản cho theme |
| AI agent (MCP) | MCP server tích hợp sẵn; API key theo người dùng; có từ bản 1.2.0 | CLI chính thức `ghst` có chế độ MCP server (beta, chạy cục bộ, staff token); chúng tôi không thấy MCP trong lõi |
| Dịch vụ quản lý | ✗ | ✓ Ghost(Pro) |
| Mở rộng quy mô | Một instance; jobs chạy trên đúng một bản | CDN + cache; không hỗ trợ clustering |

## :pen-line: Biên tập và SEO

:::cards 3
- :search: **SEO cho frontend riêng** Dữ liệu có cấu trúc: mẫu tiêu đề, OG, breadcrumbs, JSON-LD. [SEO và JSON-LD](/tinh-nang/seo-json-ld)
- :users: **Nhiều người biên tập** 4 vai trò theo site; author không tự đăng bài. [Phân quyền](/tinh-nang/phan-quyen-nguoi-dung)
- :history: **Quy trình biên tập** Lịch nội dung, tối đa 30 phiên bản mỗi bài, thùng rác. [Quy trình](/tinh-nang/quy-trinh-bien-tap)
:::

> **Mẹo** Nếu SEO dựa vào theme Ghost và không cần tùy biến sâu, Ghost cho kết quả nhanh.

## :bot: AI agent và MCP

Ghost không có MCP endpoint tích hợp trong lõi mà chúng tôi tìm thấy. Hướng chính thức là [`ghst`](https://github.com/TryGhost/ghst), CLI của TryGhost (MIT, bản beta, README ghi rõ chưa ổn định) có chế độ MCP server chạy cục bộ qua stdio hoặc HTTP, xác thực bằng staff access token và gọi Admin API. Đã có thêm các MCP server cộng đồng, không do Ghost phát hành.

KDIGI CMS có MCP server nằm ngay trong CMS tại `POST /api/mcp`, 23 công cụ cho bài, trang, lịch đăng, phiên bản, thùng rác, media, SEO audit. Xác thực bằng API key theo người dùng; agent chạy đúng vai trò và website của người đó, tôn trọng khóa chỉnh sửa trong admin, ghi cần `expectedUpdatedAt`. Kèm CLI `kcms`. Có từ bản 1.2.0. Xem [AI agent (MCP) của KDIGI CMS](/tinh-nang/ai-agent-mcp).

> **Lưu ý** Nếu bạn dùng Ghost chủ yếu cho newsletter và thành viên, `ghst` còn có nhóm công cụ cho thành viên, bình luận và thống kê; KDIGI CMS không có các phần đó.

## :check: Khi nào chọn mỗi bên

### Chọn Ghost khi

:::cards 2
- :heart-handshake: **Kinh doanh bằng thuê bao** Newsletter, cộng đồng thành viên, thuê bao trả phí.
- :pen-line: **Nhà xuất bản độc lập** Một publication, cần giao diện viết gọn.
- :layout-template: **Muốn theme và dịch vụ quản lý** Theme sẵn, Ghost(Pro) lo hạ tầng.
- :server: **Chỉ một site** Không cần nhiều site trong cùng admin.
:::

### Chọn KDIGI CMS khi

:::cards 2
- :layers: **Nhiều blog và website** Một nơi biên tập chung. Xem [giải pháp blog, tin tức](/giai-phap/blog-tin-tuc).
- :boxes: **Nội dung rộng hơn blog** Trang, landing, sản phẩm/dịch vụ, FAQ, menu cây.
- :code: **Frontend riêng** Nhận JSON-LD, trường SEO, redirect từ CMS.
- :database: **PostgreSQL và Markdown** Làm nguồn nội dung chính. Xem [trình soạn thảo](/tinh-nang/trinh-soan-thao-markdown).
:::

## :refresh-cw: Chuyển từ Ghost

Chưa có công cụ nhập Ghost tự động. Nội dung nhập sẽ không mang theo theme, danh sách thành viên hay lịch sử newsletter.

:::steps
- :cloud-upload: **Xuất dữ liệu** Từ Admin API hoặc tính năng xuất của Ghost: bài, trang, thẻ, tác giả, ảnh.
- :building-2: **Chuẩn bị site đích** Tạo `sites` (`siteKey`, `domain`), tác giả và chuyên mục.
- :pen-line: **Chuyển HTML sang Markdown** Lưu vào trường `contentMd`.
- :code: **Nhập qua REST** Dùng API key gắn đúng site, truyền `tenant` rõ ràng.
- :link: **Redirect 301** Tạo cho từng URL cũ, giữ `publishedAt` gốc.
- :heart-handshake: **Newsletter và thành viên** Giữ Ghost hoặc dùng dịch vụ email khác cho phần này. Xem thêm [tự host](/tu-host).
:::

## :link: Nguồn

Ghost, kiểm tra 2026-11-03: [kho mã](https://github.com/TryGhost/Ghost), [Hosting](https://docs.ghost.org/hosting), [Content API](https://docs.ghost.org/content-api), [bảng giá](https://ghost.org/pricing/), [ghst CLI (MCP server mode)](https://github.com/TryGhost/ghst), [thảo luận MCP trên diễn đàn Ghost](https://forum.ghost.org/t/integrating-the-model-context-protocol-mcp-as-a-native-ghost-server/63239). KDIGI CMS: [kho mã](https://github.com/kdigivn/kdigi-cms-open), [tài liệu](https://docs.cms.kdigi.vn), [tích hợp AI agent](https://docs.cms.kdigi.vn/huong-dan/ai-agent-mcp/), CHANGELOG 1.2.0 (2026-11-03).
