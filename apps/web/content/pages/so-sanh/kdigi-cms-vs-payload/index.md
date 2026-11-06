---
title: "KDIGI CMS vs Payload CMS: so sánh chi tiết"
description: "So sánh KDIGI CMS và Payload CMS: kiến trúc, editor, phân quyền, đa website, SEO, tự host và giấy phép. Có bảng, nguồn dẫn và gợi ý theo từng tình huống."
h1: "KDIGI CMS vs Payload CMS: chọn gì cho dự án Next.js?"
navTitle: "KDIGI CMS vs Payload"
icon: layers
lead: "KDIGI CMS xây trên Payload: chọn framework trống để tự thiết kế, hoặc bản cấu hình sẵn cho website nội dung."
primaryKeyword: "payload cms"
updated: 2026-11-03
heroImage: /images/shots/sites.webp
heroAlt: "Danh sách các website trong KDIGI CMS, mỗi website là một tenant với tên miền riêng"
schema: TechArticle
faq:
  - q: "KDIGI CMS có phải là CMS hoàn toàn khác Payload không?"
    a: "Không. KDIGI CMS xây trực tiếp trên Payload 3.90 và Next.js 15, dùng PostgreSQL qua adapter chính thức. Đó là một dự án Payload hoàn chỉnh, nên kiến thức và plugin Payload vẫn dùng được."
  - q: "Vì sao không dùng thẳng Payload mà cần KDIGI CMS?"
    a: "Dùng thẳng Payload nếu muốn tự thiết kế mọi thứ. KDIGI CMS tiết kiệm công khi bạn cần website nội dung nhiều site: đa tenant có access predicate, Markdown, JSON-LD, redirect, audit SEO, pipeline từ WordPress."
  - q: "KDIGI CMS có theo kịp phiên bản Payload mới không?"
    a: "Hiện tài liệu ghim payload và các gói @payloadcms/* cùng phiên bản 3.90.2. Nâng cấp theo CHANGELOG của KDIGI CMS: tạo migration nếu cần, sao lưu rồi chạy pnpm migrate. Nếu fork, bạn tự quyết lịch nâng cấp."
  - q: "Payload thuần có đa website không?"
    a: "Có plugin multi-tenant chính thức (@payloadcms/plugin-multi-tenant); KDIGI CMS dùng chính plugin này với collection sites. Phần thêm vào là access predicate tường minh, cài đặt từng site và quy trình tạo site không cần deploy lại."
  - q: "Payload và KDIGI CMS khác nhau thế nào về MCP cho AI agent?"
    a: "Payload có [plugin MCP chính thức](https://payloadcms.com/docs/plugins/mcp): bạn thêm vào config và bật từng collection, từng thao tác theo API key. KDIGI CMS dựng sẵn MCP server với 23 công cụ biên tập (bài, trang, lịch đăng, SEO, media), API key theo người dùng, tôn trọng khóa chỉnh sửa; có từ bản 1.2.0. Xem [AI agent (MCP)](/tinh-nang/ai-agent-mcp)."
related:
  - /so-sanh/kdigi-cms-vs-strapi
  - /so-sanh/kdigi-cms-vs-directus
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/seo-json-ld
  - /ma-nguon-mo
docs: https://docs.cms.kdigi.vn/tham-khao/architecture/
---

KDIGI CMS không đối đầu với Payload mà được xây trên Payload 3.90. Payload thuần là framework để tự thiết kế; KDIGI CMS là Payload cấu hình sẵn cho website nội dung nhiều site. Cả hai đều dùng MIT.

> **Tóm tắt nhanh**
> - KDIGI CMS = Payload 3.90.2 + Next.js 15 + PostgreSQL.
> - Payload thuần: bạn quyết định mọi mô hình dữ liệu.
> - KDIGI CMS thêm: đa website, Markdown, SEO/JSON-LD, pipeline WordPress.
> - Đánh đổi: mô hình định sẵn, phiên bản ghim, chỉ PostgreSQL.

## :scale: Bảng so sánh

Payload theo README và tài liệu chính thức, kiểm tra 2026-11-03.

| Tiêu chí | Payload thuần | KDIGI CMS |
| --- | --- | --- |
| Giấy phép | MIT | MIT |
| Mô hình nội dung | Bạn tự thiết kế | Dựng sẵn: pages, posts, products, landings… |
| Đa website | Plugin multi-tenant (bạn cấu hình) | Cấu hình sẵn, thêm site không cần deploy |
| Soạn thảo | Lexical rich text | Markdown (Milkdown) |
| SEO, JSON-LD, redirect dựng sẵn | ✗ (tự xây hoặc plugin) | ✓ |
| Pipeline chuyển từ WordPress | ✗ | ✓ |
| AI agent (MCP) | Plugin chính thức `@payloadcms/plugin-mcp` (bạn thêm và cấu hình); API key | MCP server dựng sẵn, 23 công cụ biên tập; API key theo người dùng; có từ bản 1.2.0 |
| Cơ sở dữ liệu | Postgres, MongoDB, SQLite | PostgreSQL |
| Triển khai | Tùy bạn (Vercel, Cloudflare, Docker…) | Dockerfile, Compose, Coolify có sẵn |

## :sparkles: KDIGI CMS thêm gì lên Payload

:::cards 3
- :shield-check: **Ranh giới site tường minh** Predicate `tenantScopedRead/Write` là ranh giới bảo mật thật. [Multi-site](https://docs.cms.kdigi.vn/tham-khao/multi-site/)
- :pen-line: **Markdown first** Milkdown, slash menu, shortcode; API trả HTML đã làm sạch. [Trình soạn thảo](/tinh-nang/trinh-soan-thao-markdown)
- :search: **SEO là một hệ thống** JSON-LD `@graph`, mẫu tiêu đề, audit, gợi ý link nội bộ. [SEO và JSON-LD](/tinh-nang/seo-json-ld)
- :server: **Vận hành sẵn** Job revalidate có retry, healthcheck `/api/health`.
- :refresh-cw: **Pipeline WordPress** Nhập bài, trang, media, SEO, redirect. [Chuyển từ WordPress](/chuyen-tu-wordpress)
- :book-open: **Docs và demo** Có bộ tài liệu, site demo công khai và `pnpm demo:reset`.
:::

## :settings: Những gì bạn đánh đổi

:::cards 2
- :boxes: **Mô hình nội dung định sẵn** Thêm collection cần đăng ký plugin, viết predicate và migration.
- :lock: **Phiên bản ghim** Không tự hưởng tính năng Payload mới nhất; chờ hoặc tự nâng cấp.
- :database: **Chỉ PostgreSQL** Không dùng MongoDB hay SQLite như Payload thuần.
- :calendar-clock: **Dự án mới** Bản công khai 1.0.0 ngày 2026-11-03; Payload có cộng đồng lớn hơn.
:::

## :bot: AI agent và MCP

Payload có plugin chính thức [`@payloadcms/plugin-mcp`](https://payloadcms.com/docs/plugins/mcp), mã nguồn mở nằm trong kho Payload. Bạn thêm plugin vào config, chọn collection/global được mở và tạo API key trong admin để bật từng thao tác (find, create, update, delete) cho từng key. Quy tắc truy cập, hook và multi-tenant của Payload vẫn áp dụng theo người dùng gắn với key; có thể tự thêm tool, prompt, resource riêng.

KDIGI CMS có sẵn một lớp MCP riêng (không cần cấu hình plugin) tại `POST /api/mcp`: 23 công cụ cho bài, trang, lịch đăng, phiên bản, thùng rác, media, SEO audit, cùng hướng dẫn nội dung `kcms://guide/content`. Xác thực bằng API key theo người dùng; agent chạy đúng vai trò và website của người đó, tôn trọng khóa chỉnh sửa trong admin, ghi cần `expectedUpdatedAt`. Kèm CLI `kcms`. Có từ bản 1.2.0. Xem [AI agent (MCP) của KDIGI CMS](/tinh-nang/ai-agent-mcp).

Đánh đổi: Payload thuần cho bạn khung tổng quát để tự thiết kế bộ công cụ cho mọi mô hình dữ liệu; KDIGI CMS cho bộ công cụ biên tập dựng sẵn nhưng chỉ cho mô hình nội dung của nó.

## :check: Khi nào chọn mỗi bên

### Chọn Payload thuần khi

:::cards 2
- :rocket: **Xây ứng dụng hoặc sản phẩm** CMS chỉ là một phần, chung thư mục `/app` Next.js.
- :boxes: **Cần mô hình dữ liệu tùy ý** Thương mại điện tử, SaaS, cổng thông tin.
- :cloud-upload: **Muốn MongoDB, SQLite hoặc serverless** Vercel, Cloudflare.
- :package: **Muốn template chính thức** Website, ecommerce của Payload; bám sát phiên bản mới.
:::

### Chọn KDIGI CMS khi

:::cards 2
- :layers: **Nhiều website nội dung** Một đội biên tập: agency, nhóm thương hiệu.
- :zap: **Cần Markdown, SEO, redirect chạy ngay** Không phải xây lại từ đầu.
- :refresh-cw: **Đang rời WordPress** Cần pipeline nhập có cổng duyệt.
- :heart-handshake: **Muốn tài liệu tiếng Việt** Demo công khai, cấu hình Coolify sẵn.
:::

## :refresh-cw: Chuyển đổi

Chưa có công cụ nhập tự động từ Payload thuần; schema khác nhau.

:::steps
- :list-checks: **Ánh xạ collection** Sang `posts`, `pages`, `products`, `taxonomies`.
- :building-2: **Tạo document `sites`** Gán `siteKey`, `domain` và người dùng.
- :code: **Nhập dữ liệu** Qua Local API hoặc REST, truyền `tenant` rõ ràng.
- :pen-line: **Đổi rich text** Chuyển Lexical sang Markdown.
:::

Chiều ngược lại cũng khả thi: đây là dự án Payload chuẩn (MIT), dữ liệu nằm trong PostgreSQL thông thường. Thử tại [demo trực tiếp](/demo).

## :link: Nguồn

Payload, kiểm tra 2026-11-03: [kho mã](https://github.com/payloadcms/payload), [What is Payload](https://payloadcms.com/docs/getting-started/what-is-payload), [Multi-Tenant Plugin](https://payloadcms.com/docs/plugins/multi-tenant), [Database](https://payloadcms.com/docs/database/overview), [MCP Plugin](https://payloadcms.com/docs/plugins/mcp). KDIGI CMS: [kho mã](https://github.com/kdigivn/kdigi-cms-open), [kiến trúc](https://docs.cms.kdigi.vn/tham-khao/architecture/), [tích hợp AI agent](https://docs.cms.kdigi.vn/huong-dan/ai-agent-mcp/), [CHANGELOG](https://github.com/kdigivn/kdigi-cms-open/blob/main/CHANGELOG.md) (1.2.0, 2026-11-03).
