---
title: "KDIGI CMS vs Directus: so sánh chi tiết"
description: "So sánh KDIGI CMS và Directus: mô hình dữ liệu, editor nội dung, API, SEO, phân quyền, tự host và giấy phép (MSCL). Gợi ý chọn theo nhu cầu cụ thể."
h1: "KDIGI CMS vs Directus: dữ liệu thuần hay CMS hoàn chỉnh?"
navTitle: "KDIGI CMS vs Directus"
icon: database
lead: "Directus bao một CSDL SQL thành API và Studio; KDIGI CMS là CMS nội dung đa website, giấy phép MIT."
primaryKeyword: "directus"
updated: 2026-11-03
heroImage: /images/shots/roles.webp
heroAlt: "Màn hình phân quyền KDIGI CMS gán vai trò và website cho người dùng"
schema: TechArticle
faq:
  - q: "Directus có phải mã nguồn mở không?"
    a: "Directus công bố mã nguồn nhưng theo giấy phép source-available. README hiện ghi MSCL 1.0, dẫn xuất từ Fair Core License; mỗi phiên bản chuyển sang GPLv3 sau 4 năm. KDIGI CMS dùng MIT, giấy phép mở theo OSI."
  - q: "Directus khác KDIGI CMS ở triết lý nào?"
    a: "Directus bao một CSDL SQL có sẵn bằng REST/GraphQL và Studio, phù hợp nhiều ứng dụng dữ liệu. KDIGI CMS là CMS website nội dung: mô hình dựng sẵn, đa website, Markdown, JSON-LD, pipeline từ WordPress."
  - q: "Directus có đa website sẵn như KDIGI CMS không?"
    a: "README Directus không mô tả tenant hay site dựng sẵn; bạn tự thiết kế ranh giới bằng chính sách quyền theo bộ lọc, hoặc chạy nhiều instance. KDIGI CMS có collection Sites và access predicate tường minh."
  - q: "Tôi có phải trả tiền khi dùng Directus không?"
    a: "Theo README Directus, tổ chức dưới 5 triệu USD doanh thu năm và dưới 50 nhân viên dùng miễn phí qua Open Innovation Grant; có tầng Core miễn phí. Tổ chức lớn cần giấy phép thương mại."
related:
  - /so-sanh/kdigi-cms-vs-strapi
  - /so-sanh/kdigi-cms-vs-payload
  - /ma-nguon-mo
  - /tinh-nang/phan-quyen-nguoi-dung
  - /so-sanh
docs: https://docs.opencms.kdigi.vn/huong-dan/vai-tro-phan-quyen/
---

Directus bao một CSDL SQL bằng API và Studio, theo giấy phép source-available. KDIGI CMS là CMS cho website nội dung, giấy phép MIT. Chọn Directus cho lớp dữ liệu đa dụng, KDIGI CMS để vận hành nhiều website.

> **Tóm tắt nhanh**
> - Directus bao CSDL SQL bất kỳ; KDIGI CMS dựng trên Payload.
> - Giấy phép: KDIGI CMS MIT; Directus MSCL 1.0 (source-available).
> - Directus hỗ trợ nhiều CSDL; KDIGI CMS chỉ PostgreSQL.
> - KDIGI CMS có đa website, SEO/JSON-LD, Markdown, pipeline WordPress.
> - Directus có Cloud, MCP server, AI Assistant; KDIGI CMS mới ra 1.0.0.

## :scale: Bảng so sánh

Directus theo README và trang chính thức, kiểm tra 2026-11-03.

| Tiêu chí | KDIGI CMS | Directus |
| --- | --- | --- |
| Định vị | CMS đa website cho nội dung | Lớp API + Studio trên CSDL SQL |
| Giấy phép | MIT | MSCL 1.0; GPLv3 sau 4 năm |
| Cơ sở dữ liệu | PostgreSQL | Postgres, MySQL, MariaDB, MS SQL, SQLite, OracleDB, CockroachDB |
| Bao CSDL SQL có sẵn | ✗ (schema do migration quản lý) | ✓ |
| Đa website dựng sẵn | ✓ | ✗ (README không mô tả) |
| SEO, JSON-LD, redirect trong lõi | ✓ | ✗ (tự thiết kế) |
| Pipeline chuyển từ WordPress | ✓ | ✗ (README không nêu) |
| Phân quyền | 4 vai trò theo site | Chính sách tới cấp trường |
| AI | AI SEO tùy chọn (DeepSeek) | AI Assistant, MCP server |
| Dịch vụ quản lý | ✗ | ✓ Directus Cloud |

> **Lưu ý** Request ẩn danh vào API của KDIGI CMS thấy mọi site, trừ khi frontend thêm `where[tenant][equals]=<id>`. Xem [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website).

## :key-round: Giấy phép đã thay đổi

Nhiều bài so sánh cũ ghi Directus dùng BSL 1.1; đã lỗi thời. Theo công bố của Directus ngày 2026-04-22, Directus chuyển sang **MSCL**, giấy phép source-available dẫn xuất từ Fair Core License. SDK vẫn dùng MIT.

:::stats
- **5 triệu USD** ngưỡng doanh thu năm; dưới mức này dùng miễn phí qua Open Innovation Grant
- **50** ngưỡng số nhân viên theo cùng điều kiện
- **4 năm** sau đó mỗi phiên bản chuyển sang GPLv3
:::

> **Lưu ý** Directus không còn là mã nguồn mở theo nghĩa OSI. Nếu MIT là yêu cầu cứng, đọc [giấy phép Directus](https://directus.com/license) và xem [mã nguồn mở của KDIGI CMS](/ma-nguon-mo).

## :check: Khi nào chọn mỗi bên

### Chọn Directus khi

:::cards 2
- :database: **Đã có CSDL SQL** Kể cả MySQL, MS SQL, Oracle; thêm API mà không đổi schema.
- :briefcase: **Ứng dụng nội bộ, dữ liệu có cấu trúc** Không chỉ website nội dung.
- :bot: **Muốn Cloud, AI Assistant, MCP** Có sẵn ở Directus.
- :scale: **Nằm trong ngưỡng Grant** Hoặc đã sẵn sàng giấy phép thương mại.
:::

### Chọn KDIGI CMS khi

:::cards 2
- :scale: **Cần MIT thuần** Bàn giao cho nhiều khách hàng mà không lo ngưỡng doanh thu.
- :layers: **Nhiều website nội dung** Ranh giới site có sẵn.
- :search: **SEO và Markdown trong CMS** JSON-LD, redirect, mẫu tiêu đề.
- :refresh-cw: **Đang rời WordPress** Chấp nhận PostgreSQL, schema do dự án quản lý.
:::

## :refresh-cw: Chuyển từ Directus

Không có công cụ nhập tự động, nhưng dữ liệu Directus nằm trong SQL thông thường. Chi tiết endpoint xem [REST API](https://docs.opencms.kdigi.vn/api/rest-graphql/).

:::steps
- :list-checks: **Kiểm kê collection** Ánh xạ: bài viết → `posts`, trang → `pages`, danh mục → `taxonomies`, sản phẩm → `products`.
- :building-2: **Tạo site đích** `siteKey`, `domain`, gán người dùng theo vai trò.
- :cloud-upload: **Xuất dữ liệu** Qua REST API của Directus hoặc SQL, đổi rich text sang Markdown.
- :code: **Nhập qua REST** API key gắn đúng site, truyền `tenant` rõ ràng.
- :link: **Tệp và redirect** Chuyển tệp vào thư viện media, tạo `redirects` 301.
- :gauge: **Kiểm tra** Chạy `GET /api/seo/audit`, rồi chuyển frontend sang API mới.
:::

## :link: Nguồn

Directus, kiểm tra 2026-11-03: [kho mã](https://github.com/directus/directus), [giấy phép MSCL](https://directus.com/license), [thông báo đổi giấy phép](https://directus.com/resources/directus-v12-license-change) (2026-04-22), [tài liệu](https://directus.com/docs). KDIGI CMS: [kho mã](https://github.com/kdigivn/kdigi-cms-open), [tài liệu](https://docs.opencms.kdigi.vn), CHANGELOG 1.1.0 (2026-11-03).
