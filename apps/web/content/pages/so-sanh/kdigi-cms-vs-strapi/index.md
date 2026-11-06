---
title: "KDIGI CMS vs Strapi: khác nhau thế nào?"
description: "So sánh KDIGI CMS và Strapi: mô hình nội dung, editor, API REST/GraphQL, SEO, tự host, giấy phép. Chọn Strapi khi nào và chọn KDIGI CMS khi nào."
h1: "KDIGI CMS vs Strapi: so sánh cho developer và agency"
navTitle: "KDIGI CMS vs Strapi"
icon: boxes
lead: "Strapi cho bạn công cụ tự dựng content type; KDIGI CMS có sẵn mô hình nội dung, SEO và đa website."
primaryKeyword: "strapi"
updated: 2026-11-03
heroImage: /images/shots/api.webp
heroAlt: "Phản hồi REST API JSON của KDIGI CMS hiển thị danh sách bài viết của một website"
schema: TechArticle
faq:
  - q: "Strapi và KDIGI CMS khác nhau lớn nhất ở điểm nào?"
    a: "Strapi là nền tảng headless đa dụng, bạn tự dựng content type. KDIGI CMS đóng gói sẵn cho website nội dung: đa website, Markdown, SEO/JSON-LD, redirect, pipeline từ WordPress. Strapi linh hoạt hơn về dữ liệu."
  - q: "Strapi có hỗ trợ đa website (multi-tenant) sẵn không?"
    a: "Tài liệu Strapi không mô tả khái niệm site hay tenant dựng sẵn; thường bạn tự mô hình hóa bằng quan hệ và policy, hoặc chạy nhiều instance. KDIGI CMS có collection Sites làm ranh giới tenant."
  - q: "Giấy phép của Strapi và KDIGI CMS có khác nhau không?"
    a: "Có. Strapi Community Edition dùng MIT Expat, nhưng mã trong thư mục ee/ (Enterprise) theo giấy phép riêng. KDIGI CMS dùng MIT cho toàn bộ kho mã. Hãy đọc LICENSE của Strapi nếu cần tính năng Enterprise."
  - q: "Có thể chuyển từ Strapi sang KDIGI CMS không?"
    a: "Được, nhưng chưa có công cụ nhập tự động. Xuất dữ liệu qua REST API của Strapi, chuyển sang Markdown và nhập bằng REST hoặc Local API của Payload; cần ánh xạ lại content type, media và quan hệ."
  - q: "Strapi hay KDIGI CMS dễ dùng hơn cho người không biết code?"
    a: "Với người biên tập, cả hai đều trực quan. Với người dựng mô hình dữ liệu, Strapi có Content-Type Builder không cần code; KDIGI CMS có mô hình dựng sẵn, đổi cấu trúc cần sửa mã Payload và migration."
  - q: "Strapi và KDIGI CMS có MCP server cho AI agent không?"
    a: "Có cả hai. Strapi có [MCP server tích hợp](https://docs.strapi.io/cms/features/strapi-mcp-server) từ 5.47.0, xác thực bằng Admin token. KDIGI CMS có MCP server tích hợp (23 công cụ, API key theo người dùng, tôn trọng vai trò và khóa chỉnh sửa) kèm CLI kcms, có từ bản 1.2.0. Xem [AI agent (MCP)](/tinh-nang/ai-agent-mcp)."
related:
  - /so-sanh/kdigi-cms-vs-payload
  - /so-sanh/kdigi-cms-vs-directus
  - /tinh-nang/headless-api
  - /tinh-nang/quan-ly-nhieu-website
  - /so-sanh
docs: https://docs.cms.kdigi.vn/api/rest-graphql/
---

Cả hai là headless CMS mã nguồn mở viết bằng TypeScript/JavaScript, có REST và GraphQL. Chọn Strapi khi cần mô hình dữ liệu tự do; chọn KDIGI CMS khi quản lý nhiều website nội dung bằng Markdown.

> **Tóm tắt nhanh**
> - Giống nhau: headless, mã nguồn mở, REST + GraphQL, chạy Node.js.
> - Strapi: Content-Type Builder trực quan, mô hình dữ liệu tự do.
> - KDIGI CMS: đa website, Markdown, SEO/JSON-LD dựng sẵn.
> - CSDL: Strapi hỗ trợ 4 loại; KDIGI CMS chỉ PostgreSQL.
> - Strapi có cộng đồng lớn; KDIGI CMS mới ra bản 1.0.0 (2026-11-03).

## :scale: Bảng so sánh

Strapi theo README và tài liệu chính thức, kiểm tra 2026-11-03; số phiên bản có thể đã đổi.

| Tiêu chí | KDIGI CMS | Strapi |
| --- | --- | --- |
| Định vị | Đóng gói sẵn cho website nội dung | Headless đa dụng |
| Giấy phép | MIT | MIT Expat (Community); `ee/` giấy phép Enterprise |
| Cơ sở dữ liệu | PostgreSQL | SQLite, MySQL, MariaDB, PostgreSQL |
| Dựng content type bằng giao diện | ✗ (sửa mã + migration) | ✓ |
| GraphQL không cần plugin | ✓ | ✗ (GraphQL là plugin) |
| Đa website dựng sẵn | ✓ | ✗ (tài liệu không nêu) |
| SEO, JSON-LD, redirect trong lõi | ✓ | ✗ (plugin hoặc tự xây) |
| Pipeline chuyển từ WordPress | ✓ | ✗ (không thấy trong tài liệu) |
| Draft/Publish | ✓ | ✓ |
| Soạn thảo | Markdown (Milkdown) | Rich text |
| AI agent (MCP) | MCP server tích hợp sẵn; API key theo người dùng; có từ bản 1.2.0 | MCP server tích hợp sẵn (từ 5.47.0); Admin token; công cụ sinh theo content type |
| Docker chính thức | ✓ | ✗ (tự build, theo README Strapi) |
| Dịch vụ quản lý | ✗ | ✓ Strapi Cloud |
| Hệ sinh thái | Nhỏ, dự án mới | Lớn: plugin, template, cộng đồng |

> **Lưu ý** Request ẩn danh tới KDIGI CMS không tự giới hạn theo site; frontend phải thêm `where[tenant][equals]=<id>`. Xem [Headless API](/tinh-nang/headless-api).

## :layers: Khác biệt chính

:::cards 3
- :boxes: **Mô hình nội dung** Strapi: tự dựng bằng Builder. KDIGI CMS: collection sẵn, thêm mới cần mã và migration.
- :layers: **Đa website** KDIGI CMS có `sites` làm ranh giới tenant; Strapi cần tự thiết kế. [Quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website)
- :search: **SEO** Mẫu tiêu đề, JSON-LD `@graph`, audit, redirect có sẵn. [SEO và JSON-LD](/tinh-nang/seo-json-ld)
:::

## :bot: AI agent và MCP

Cả hai đều có MCP server tích hợp sẵn, không cần plugin bên thứ ba. [Strapi](https://docs.strapi.io/cms/features/strapi-mcp-server) (từ 5.47.0, tính năng miễn phí) bật bằng `mcp.enabled` trong `config/server`, endpoint `/mcp`, xác thực bằng Admin token và chỉ lộ các công cụ mà token được cấp quyền. Công cụ CRUD, publish/unpublish được sinh theo content type của bạn, kèm công cụ thư viện media.

KDIGI CMS có MCP server tại `POST /api/mcp` (23 công cụ cho bài, trang, lịch đăng, phiên bản, thùng rác, media, SEO audit) chạy theo API key của từng người dùng: đúng vai trò và website của người đó, tôn trọng khóa chỉnh sửa trong admin, ghi cần `expectedUpdatedAt`. Kèm CLI `kcms` cho file Markdown và lệnh `kcms setup` cho Claude Code, Codex, Cursor, VS Code. Có từ bản 1.2.0. Xem [AI agent (MCP) của KDIGI CMS](/tinh-nang/ai-agent-mcp).

Khác biệt thực tế: Strapi phản ánh mô hình dữ liệu tự do của bạn; KDIGI CMS có bộ công cụ biên tập dựng sẵn (SEO audit, phiên bản, thùng rác) cho website nội dung.

## :check: Khi nào chọn mỗi bên

### Chọn Strapi khi

:::cards 2
- :boxes: **Không phải website nội dung thuần** Cần mô hình dữ liệu tùy ý: danh bạ, đặt chỗ, catalog.
- :wand-sparkles: **Muốn dựng content type trực quan** Đội đã quen hệ sinh thái Strapi.
- :database: **Cần MySQL, MariaDB hoặc SQLite** Thay vì chỉ PostgreSQL.
- :cloud-upload: **Muốn dịch vụ quản lý sẵn** Strapi Cloud thay vì tự vận hành.
:::

### Chọn KDIGI CMS khi

:::cards 2
- :layers: **Nhiều website nội dung** Một admin, dữ liệu cách ly theo site.
- :pen-line: **Viết bằng Markdown** Bài viết, trang, landing, dịch vụ.
- :search: **Cần SEO sẵn** JSON-LD, redirect, mẫu tiêu đề, ưu tiên thị trường Việt Nam.
- :server: **Chấp nhận PostgreSQL và tự host** Có cấu hình [Coolify và Docker Compose](/tu-host).
:::

## :refresh-cw: Chuyển từ Strapi

Chưa có công cụ nhập Strapi tự động, nên đây là quy trình thủ công. Bộ chuyển HTML → Markdown trong `src/importers` có thể tái sử dụng cho bước 3.

:::steps
- :list-checks: **Kiểm kê content type** Ánh xạ: bài viết → `posts`, trang → `pages`, danh mục/thẻ → `taxonomies`, sản phẩm → `products`.
- :building-2: **Dựng site đích** Tạo document `sites` (`siteKey`, `domain`), gán người dùng.
- :cloud-upload: **Xuất dữ liệu** Lấy từ REST API của Strapi (kèm `populate`), đổi rich text sang Markdown.
- :code: **Nhập** Qua REST (API key gắn đúng site, truyền `tenant`) hoặc Local API của Payload.
- :link: **Media và redirect** Chuyển media, tạo `redirects` 301 cho URL cũ, cập nhật frontend.
- :gauge: **Kiểm tra SEO** Chạy `GET /api/seo/audit` trước khi đổi DNS.
:::

## :link: Nguồn

Strapi, kiểm tra 2026-11-03: [kho mã](https://github.com/strapi/strapi), [giấy phép](https://github.com/strapi/strapi/blob/main/LICENSE), [cấu hình CSDL](https://docs.strapi.io/cms/configurations/database), [tài liệu](https://docs.strapi.io), [Strapi Cloud](https://strapi.io/cloud), [MCP server](https://docs.strapi.io/cms/features/strapi-mcp-server). KDIGI CMS: [kho mã](https://github.com/kdigivn/kdigi-cms-open), [tài liệu](https://docs.cms.kdigi.vn), [tích hợp AI agent](https://docs.cms.kdigi.vn/huong-dan/ai-agent-mcp/), CHANGELOG 1.2.0 (2026-11-03).
