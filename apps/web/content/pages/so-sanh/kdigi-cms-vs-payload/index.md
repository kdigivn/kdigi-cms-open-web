---
title: "KDIGI CMS vs Payload CMS: so sánh chi tiết"
description: "So sánh KDIGI CMS và Payload CMS: kiến trúc, editor, phân quyền, đa website, SEO, tự host và giấy phép. Có bảng, nguồn dẫn và gợi ý theo từng tình huống."
h1: "KDIGI CMS vs Payload CMS: chọn gì cho dự án Next.js?"
primaryKeyword: "payload cms"
updated: 2026-11-03
heroImage: /images/shots/sites.webp
heroAlt: "Danh sách các website trong KDIGI CMS, mỗi website là một tenant với tên miền riêng"
schema: TechArticle
faq:
  - q: "KDIGI CMS có phải là một CMS hoàn toàn khác Payload không?"
    a: "Không. KDIGI CMS xây trực tiếp trên Payload 3.90 và Next.js 15, dùng PostgreSQL qua adapter chính thức. Nó là một dự án Payload hoàn chỉnh với collection, hook, plugin multi-tenant, trình soạn thảo Markdown và bộ SEO đã cấu hình sẵn. Bạn không bị khóa riêng: kiến thức và plugin Payload vẫn dùng được."
  - q: "Vì sao không dùng thẳng Payload mà cần KDIGI CMS?"
    a: "Dùng thẳng Payload là lựa chọn tốt nếu bạn muốn tự thiết kế mọi thứ. KDIGI CMS tiết kiệm công sức khi bạn cần đúng bài toán website nội dung nhiều site: đa tenant có access predicate, Markdown, JSON-LD, redirect, audit SEO, pipeline từ WordPress, đã kiểm thử và có tài liệu."
  - q: "Có thể tùy biến KDIGI CMS như một dự án Payload bình thường không?"
    a: "Có. Mã nguồn MIT nằm trong repo; bạn thêm collection, field, hook, endpoint hoặc plugin Payload như thường. Lưu ý các quy tắc của dự án: schema chỉ đổi bằng migration tường minh, collection thuộc site phải đăng ký vào plugin multi-tenant và dùng access predicate của repo."
  - q: "KDIGI CMS có theo kịp phiên bản Payload mới không?"
    a: "Hiện tài liệu ghim Payload và các gói @payloadcms/* cùng phiên bản 3.90.2. Nâng cấp là việc của dự án KDIGI CMS: đọc CHANGELOG, tạo migration nếu cần, sao lưu rồi chạy pnpm migrate. Nếu bạn fork, bạn tự quyết định lịch nâng cấp và tự kiểm thử hồi quy."
  - q: "Payload thuần có đa website không?"
    a: "Payload có plugin multi-tenant chính thức (@payloadcms/plugin-multi-tenant) và KDIGI CMS dùng chính plugin này với collection sites làm tenant. Phần dự án thêm vào là các access predicate tường minh, cài đặt từng site (thương hiệu, SEO, kho R2), endpoint tiện ích và quy trình tạo site không cần triển khai lại."
related:
  - /so-sanh/kdigi-cms-vs-strapi
  - /so-sanh/kdigi-cms-vs-directus
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/seo-json-ld
  - /ma-nguon-mo
docs: https://docs.opencms.kdigi.vn/tham-khao/architecture/
---

KDIGI CMS không đối đầu với Payload CMS mà được xây trên Payload 3.90. Payload thuần là framework để tự thiết kế mọi thứ; KDIGI CMS là Payload cấu hình sẵn cho website nội dung: đa website, Markdown, SEO/JSON-LD, pipeline chuyển từ WordPress, giấy phép MIT.

> **Tóm tắt nhanh**
> - **Quan hệ:** KDIGI CMS = Payload 3.90.2 + Next.js 15 + PostgreSQL + cấu hình, collection, hook và giao diện admin riêng của dự án.
> - **Payload thuần cho bạn:** framework, admin, access control, hook, versions, localization, plugin. Bạn tự quyết định mọi mô hình dữ liệu.
> - **KDIGI CMS thêm vào:** multi-site có kiểm soát truy cập tường minh, trình soạn Markdown (Milkdown), bộ SEO và JSON-LD, thư viện media, vai trò theo site, pipeline WordPress, tài liệu tiếng Việt.
> - **Giấy phép:** cả Payload và KDIGI CMS đều dùng MIT.
> - **Đánh đổi:** KDIGI CMS có mô hình nội dung định sẵn, ghim phiên bản Payload và chỉ hỗ trợ PostgreSQL.

## Quan hệ giữa KDIGI CMS và Payload

Theo [tài liệu kiến trúc](https://docs.opencms.kdigi.vn/tham-khao/architecture/), nền tảng của KDIGI CMS là: Payload 3.90.2 (`payload` và `@payloadcms/*` ghim cùng phiên bản), Next.js 15 App Router, React 19, PostgreSQL qua `@payloadcms/db-postgres` (Drizzle) với `push: false`, trình soạn Milkdown Crepe/Kit, và adapter lưu trữ dựng trên `@payloadcms/plugin-cloud-storage`.

Nói cách khác, khi bạn dùng KDIGI CMS, bạn đang dùng một dự án Payload. Mọi khái niệm của Payload (collection, field, access, hook, jobs, Local API, REST, GraphQL) đều áp dụng. Tài liệu REST của KDIGI CMS còn ghi rõ: *"KDIGI CMS is built on Payload, so the generic Payload REST conventions apply"* (`where`, `limit`, `page`, `sort`, `depth`, `select`, `locale`).

Vì vậy câu hỏi đúng không phải "Payload hay KDIGI CMS?" mà là **"Tôi bắt đầu từ framework trống hay từ một bản dựng sẵn?"**

## Bảng so sánh: Payload thuần và KDIGI CMS

Thông tin Payload lấy từ README và tài liệu chính thức (mục Nguồn, kiểm tra 2026-11-03).

| Tiêu chí | Payload thuần | KDIGI CMS (xây trên Payload) |
| --- | --- | --- |
| Bản chất | Next.js-native framework và headless CMS | Sản phẩm CMS hoàn chỉnh trên Payload |
| Giấy phép | MIT | MIT |
| Mô hình nội dung | Bạn tự thiết kế | Dựng sẵn: pages, posts, products, landings, taxonomies, authors, menus, faqs, shortcodes, redirects, comments, rating-events |
| Đa website | Plugin multi-tenant chính thức (cấu hình bởi bạn) | Cấu hình sẵn với `tenantsSlug: 'sites'`, thêm access predicate tường minh, cài đặt từng site, endpoint `env-page`, thêm site không cần deploy |
| Soạn thảo | Lexical rich text mặc định | Markdown với Milkdown; Lexical chỉ là fallback ẩn |
| API cho frontend | REST, GraphQL, Local API | REST/GraphQL; Markdown→HTML ở khóa gốc, shortcode, cây menu, OG fallback chỉ ở REST |
| SEO | Bạn tự xây hoặc dùng plugin SEO | Nhóm `seo` chung, mẫu kiểu RankMath, JSON-LD `@graph`, audit, gợi ý link nội bộ, redirect tự động, AI SEO tùy chọn |
| Cơ sở dữ liệu | Postgres, MongoDB, SQLite (adapter) | PostgreSQL |
| Media | Upload collection + storage adapter | Thư viện có thư mục, sửa ảnh, nhập từ URL chống SSRF, đĩa local hoặc R2 từng site |
| Phân quyền | Access control tự viết | 4 vai trò (`super-admin` › `admin` › `editor` › `author`) gán theo site, hook chặn author tự đăng |
| Di chuyển WordPress | Không có | Pipeline raw → staged → import |
| Biên tập | Admin Payload chuẩn | Admin tùy biến: dashboard biên tập, lịch nội dung, widget SEO, cây menu |
| Triển khai | Tùy bạn (Vercel, Cloudflare, Docker…) | Dockerfile, Compose, Coolify có sẵn; migration tự chạy khi khởi động |
| Phiên bản Payload | Bạn chọn và nâng cấp | Ghim 3.90.2; nâng cấp theo CHANGELOG của KDIGI CMS |
| Ngôn ngữ giao diện | Đa ngôn ngữ, nhiều bản dịch | Admin tiếng Việt và tiếng Anh; nội dung `vi` + `en` |

## KDIGI CMS thêm gì lên trên Payload?

1. **Ranh giới site có kiểm soát.** Plugin multi-tenant chỉ là bộ lọc "tư vấn" của giao diện admin. Dự án thêm các predicate tường minh (`tenantScopedRead`, `tenantScopedWrite`, `tenantScopedVersionsRead`) và coi chúng là ranh giới bảo mật thật, theo [tài liệu multi-site](https://docs.opencms.kdigi.vn/tham-khao/multi-site/).
2. **Markdown first.** Trình soạn Milkdown có slash menu, chọn media và link nội bộ, shortcode, tìm và thay thế. API trả HTML đã làm sạch ở đúng khóa gốc, còn kho lưu Markdown. Xem [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown).
3. **SEO là một hệ thống.** Hook tạo breadcrumbs và JSON-LD `@graph` khi lưu, mẫu tiêu đề cấp site, điểm SEO, audit và gợi ý liên kết nội bộ. Xem [SEO và JSON-LD](/tinh-nang/seo-json-ld).
4. **Vận hành đã giải quyết sẵn.** Job revalidate frontend có retry, `ENABLE_JOBS_AUTORUN`, guard cho kết nối Postgres bị ngắt, pool 20 kết nối, healthcheck `/api/health`, OpenTelemetry tùy chọn.
5. **Pipeline WordPress.** Nhập bài viết, trang, taxonomy, media, menu, bình luận, SEO Yoast/RankMath, redirect. Xem [chuyển từ WordPress](/chuyen-tu-wordpress).
6. **Tài liệu và demo.** Có bộ docs, site demo công khai và `pnpm demo:reset`.

## Những gì bạn đánh đổi

- **Mô hình nội dung định sẵn.** Muốn thêm collection bạn phải đăng ký vào plugin multi-tenant, viết predicate và migration; không làm được chỉ bằng click.
- **Phiên bản ghim.** Bạn không tự động hưởng tính năng Payload mới nhất; phải chờ hoặc tự nâng cấp.
- **Chỉ PostgreSQL.** Không dùng MongoDB hay SQLite như Payload thuần cho phép.
- **Phụ thuộc ghi chú vận hành riêng.** Ví dụ: `next build` bỏ qua kiểm tra type/lint (`eslint.ignoreDuringBuilds`, `typescript.ignoreBuildErrors`), nên cần chạy `pnpm typecheck` và `pnpm lint` riêng.
- **Dự án mới.** KDIGI CMS bắt đầu bản công khai 1.0.0 ngày 2026-11-03, trong khi Payload là dự án lớn, có cộng đồng đông.

## Khi nào chọn Payload thuần?

1. Bạn xây **ứng dụng hoặc sản phẩm** mà CMS chỉ là một phần, muốn front-end và backend chung một thư mục `/app` Next.js.
2. Bạn cần **mô hình dữ liệu hoàn toàn tùy ý** (thương mại điện tử, SaaS, cổng thông tin).
3. Bạn muốn **MongoDB hoặc SQLite**, hoặc deploy serverless (Vercel, Cloudflare).
4. Đội bạn đã thành thạo Payload và muốn **bám sát phiên bản mới nhất**.
5. Bạn muốn dùng các **template chính thức** (website, ecommerce) của Payload.

## Khi nào chọn KDIGI CMS?

1. Bài toán chính là **nhiều website nội dung** do một đội biên tập (agency, nhóm thương hiệu).
2. Bạn muốn **Markdown + SEO + redirect** chạy được ngay, thay vì xây lại từ đầu.
3. Bạn đang **rời WordPress** và cần pipeline nhập có cổng duyệt.
4. Bạn muốn **tài liệu tiếng Việt**, demo công khai và cấu hình Coolify sẵn.
5. Bạn chấp nhận PostgreSQL và mô hình nội dung hiện có, hoặc sẵn sàng fork để mở rộng.

## Lộ trình di chuyển

**Từ Payload thuần sang KDIGI CMS.** Dữ liệu của bạn là Payload nên khái niệm quen thuộc, nhưng schema khác nhau và không có công cụ nhập tự động. Ánh xạ collection của bạn sang `posts`, `pages`, `products`, `taxonomies`; tạo document `sites`; nhập bằng Local API hoặc REST (truyền `tenant` rõ ràng); chuyển rich text Lexical sang Markdown.

**Từ KDIGI CMS ra Payload thuần.** Vì mã nguồn là MIT và là dự án Payload chuẩn, bạn có thể fork và gỡ bớt các phần không cần. Dữ liệu nằm trong PostgreSQL thông thường; trường Markdown (`contentMd`) vẫn đọc được như text.

**Bắt đầu thử:**

```bash
git clone https://github.com/kdigivn/kdigi-cms-open.git
cd kdigi-cms-open
SEED_DEMO=true docker compose up --build
```

Mở <http://localhost:3000/admin>. Hoặc dùng ngay [demo trực tiếp](/demo).

## Nguồn

Kiểm tra ngày 2026-11-03:

- Payload, kho mã và README (giấy phép MIT, Next.js-native, versions/drafts, localization, access control, hook): <https://github.com/payloadcms/payload>
- Payload Docs, "What is Payload": <https://payloadcms.com/docs/getting-started/what-is-payload>
- Payload Docs, "Multi-Tenant Plugin": <https://payloadcms.com/docs/plugins/multi-tenant>
- Payload Docs, "Database": <https://payloadcms.com/docs/database/overview>

KDIGI CMS: [kho mã](https://github.com/kdigivn/kdigi-cms-open), [kiến trúc](https://docs.opencms.kdigi.vn/tham-khao/architecture/), [CHANGELOG](https://github.com/kdigivn/kdigi-cms-open/blob/main/CHANGELOG.md) (1.1.0, 2026-11-03). Sản phẩm thay đổi theo thời gian; hãy đối chiếu trang chính thức trước khi quyết định.
