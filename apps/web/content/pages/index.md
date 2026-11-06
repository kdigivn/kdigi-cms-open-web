---
title: "KDIGI CMS – CMS headless AI-native mã nguồn mở"
description: "KDIGI CMS là CMS AI-native mã nguồn mở MIT: nhiều website, AI agent viết và đăng bài qua MCP, soạn Markdown, JSON-LD, REST/GraphQL, tự host bằng Docker."
h1: "KDIGI CMS – CMS headless AI-native, mã nguồn mở, tự host"
navTitle: "Trang chủ"
icon: sparkles
lead: "Trang quản trị, API và máy chủ MCP cho nhiều website, chạy trên hạ tầng của chính bạn."
primaryKeyword: "cms mã nguồn mở"
updated: 2026-11-03
heroImage: /images/art/home-hero.webp
heroAlt: "Một khối trung tâm xanh nối với ba cửa sổ website kính mờ trên đế đất sét"
schema: SoftwareApplication
faq:
  - q: "KDIGI CMS là gì?"
    a: "CMS headless AI-native, mã nguồn mở, giấy phép MIT, xây trên Payload 3, Next.js 15 và PostgreSQL. Một bản cài quản lý nhiều website; website công khai lấy nội dung qua REST hoặc GraphQL, AI agent làm việc qua máy chủ MCP."
  - q: "AI-native nghĩa là gì ở KDIGI CMS?"
    a: "CMS có sẵn máy chủ MCP tại `/api/mcp`: Claude Code, Codex, Cursor, VS Code, OMP tìm, viết, hẹn giờ, đăng bài và kiểm tra SEO bằng API key của một người dùng, đúng vai trò và site của người đó. Xem [AI agent và MCP](/tinh-nang/ai-agent-mcp)."
  - q: "KDIGI CMS có miễn phí không?"
    a: "Có. Giấy phép MIT cho phép dùng, sửa và triển khai cho cả dự án thương mại. Bạn chỉ trả chi phí hạ tầng của mình. AI SEO tùy chọn cần khóa API DeepSeek do bạn tự đăng ký."
  - q: "Chạy KDIGI CMS cần những gì?"
    a: "Để thử chỉ cần Docker có Compose: `SEED_DEMO=true docker compose up --build`, rồi mở localhost:3000/admin. Production bắt buộc 3 biến: DATABASE_URI, PAYLOAD_SECRET, PAYLOAD_PUBLIC_SERVER_URL."
  - q: "Chuyển website WordPress sang KDIGI CMS được không?"
    a: "Được. Pipeline nhập nhiều giai đoạn có cổng duyệt và sao lưu, giữ SEO và tự sinh redirect 301. Đọc trang chuyển từ WordPress để biết phạm vi và giới hạn trước khi bắt đầu."
  - q: "KDIGI CMS khác WordPress thế nào?"
    a: "KDIGI CMS chỉ cung cấp trang quản trị và API, không kèm theme; giao diện do frontend của bạn lo. Đổi lại, một bản cài quản lý nhiều site. Xem [so sánh với WordPress](/so-sanh/kdigi-cms-vs-wordpress)."
related:
  - /tinh-nang
  - /chuyen-tu-wordpress
  - /tu-host
  - /demo
  - /ma-nguon-mo
docs: https://docs.cms.kdigi.vn/
---

KDIGI CMS là CMS headless AI-native, mã nguồn mở (MIT): một bản cài quản lý nhiều website, website công khai lấy nội dung qua REST hoặc GraphQL, còn AI agent viết và đăng bài qua máy chủ MCP có sẵn.

> **Tóm tắt nhanh**
>
> - CMS headless, giấy phép MIT.
> - Một bản cài, nhiều website, dữ liệu tách theo site.
> - AI agent làm việc qua MCP với đúng quyền người dùng.
> - Soạn Markdown, SEO và JSON-LD có sẵn.
> - Thử bằng một lệnh Docker Compose.

:::stats
- **MIT** giấy phép
- **4** vai trò phân quyền
- **2** ngôn ngữ nội dung: vi, en
- **1.2.0** phiên bản hiện tại
:::

## :users: Dành cho ai

:::cards 2
- :building-2: **Agency** Quản lý nhiều website khách hàng trên một bản cài.
- :bot: **Đội nội dung dùng AI** Giao AI agent viết nháp, cập nhật SEO; người biên tập duyệt và đăng.
- :pen-line: **Blogger, doanh nghiệp nhỏ** Tự host, giữ dữ liệu, có SEO chuẩn từ đầu.
- :refresh-cw: **Người rời WordPress** Chuyển nội dung và SEO sang kiến trúc headless.
- :code: **Lập trình viên frontend** API REST/GraphQL có tài liệu, dùng với Next.js, Astro, Nuxt.
- :terminal: **Người thích dòng lệnh** CLI `kcms` sửa bài như tệp Markdown, đẩy lên một lệnh.
:::

## :workflow: Cách hoạt động

:::steps
- :server: **Cài CMS** Docker Compose trên máy hoặc VPS.
- :globe: **Tạo site** Nhập `siteKey`, domain, ngôn ngữ; không cần deploy lại.
- :pen-line: **Viết nội dung** Tự soạn Markdown, hoặc giao AI agent viết nháp qua MCP rồi duyệt.
- :zap: **Frontend lấy qua API** Lọc theo site; CMS báo làm mới cache khi nội dung đổi.
:::

![Bảng điều khiển KDIGI CMS với bài viết gần đây và bảng kiểm tra SEO](/images/shots/dashboard.webp "Bảng điều khiển của site đang chọn")

Chi tiết cách gọi API: [Headless API](/tinh-nang/headless-api).

## :map: Khám phá tiếp

:::cards 3
- :bot: **AI agent và MCP** Kết nối Claude Code, Codex, Cursor: [xem cách hoạt động](/tinh-nang/ai-agent-mcp).
- :list-checks: **Tính năng** Mọi tính năng theo nhóm: [xem tất cả](/tinh-nang).
- :scale: **So sánh** Với WordPress, Strapi, Ghost: [xem so sánh](/so-sanh).
- :briefcase: **Giải pháp** Cho [agency](/giai-phap/agency) và [doanh nghiệp](/giai-phap/doanh-nghiep).
- :check: **Thực hành tốt** SEO, bảo mật, sao lưu: [đọc checklist](/thuc-hanh-tot).
- :rocket: **Phát hành** Lịch sử phiên bản: [xem nhật ký](/phat-hanh).
:::
