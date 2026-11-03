---
title: "KDIGI CMS vs Directus: so sánh chi tiết"
description: "So sánh KDIGI CMS và Directus: mô hình dữ liệu, editor nội dung, API, SEO, phân quyền, tự host và giấy phép (MSCL). Gợi ý chọn theo nhu cầu cụ thể."
h1: "KDIGI CMS vs Directus: dữ liệu thuần hay CMS hoàn chỉnh?"
primaryKeyword: "directus"
updated: 2026-11-03
heroImage: /images/shots/roles.webp
heroAlt: "Màn hình phân quyền KDIGI CMS gán vai trò và website cho người dùng"
schema: TechArticle
faq:
  - q: "Directus có phải mã nguồn mở không?"
    a: "Directus công bố mã nguồn nhưng theo giấy phép source-available. README hiện ghi giấy phép Monospace Sustainable Core License (MSCL) 1.0, dẫn xuất từ Fair Core License, mỗi phiên bản chuyển sang GPLv3 sau 4 năm. Trước đó Directus dùng BSL. KDIGI CMS dùng MIT, một giấy phép mã nguồn mở theo định nghĩa OSI."
  - q: "Directus khác KDIGI CMS ở triết lý nào?"
    a: "Directus bao một cơ sở dữ liệu SQL có sẵn bằng API REST/GraphQL cùng Studio quản trị, phù hợp nhiều loại ứng dụng dữ liệu. KDIGI CMS là CMS cho website nội dung: mô hình bài viết, trang, sản phẩm, landing đã dựng sẵn, cộng với đa website, Markdown, JSON-LD và pipeline chuyển từ WordPress."
  - q: "Directus có đa website sẵn như KDIGI CMS không?"
    a: "README của Directus không mô tả tenant hay site như một khái niệm dựng sẵn; muốn nhiều website bạn tự thiết kế ranh giới dữ liệu bằng chính sách quyền theo bộ lọc, hoặc chạy nhiều instance. KDIGI CMS có collection Sites với trường tenant ở mọi collection nội dung và access predicate tường minh."
  - q: "Tôi có phải trả tiền khi dùng Directus không?"
    a: "Theo README Directus, tổ chức dưới 5 triệu USD doanh thu năm và dưới 50 nhân viên được dùng miễn phí qua Open Innovation Grant; có tầng Core miễn phí cho mọi người; tổ chức lớn hơn dùng tính năng nâng cao cần giấy phép thương mại. KDIGI CMS không có điều kiện như vậy vì dùng MIT."
  - q: "Chuyển từ Directus sang KDIGI CMS khó không?"
    a: "Không có công cụ tự động. Dữ liệu Directus nằm trong cơ sở dữ liệu SQL của bạn nên có thể xuất qua REST API hoặc SQL, ánh xạ sang collection của KDIGI CMS, đổi HTML hoặc rich text thành Markdown và nhập qua REST kèm trường tenant. Cần ánh xạ lại quan hệ, tệp và vai trò."
related:
  - /so-sanh/kdigi-cms-vs-strapi
  - /so-sanh/kdigi-cms-vs-payload
  - /ma-nguon-mo
  - /tinh-nang/phan-quyen-nguoi-dung
  - /so-sanh
docs: https://docs.opencms.kdigi.vn/huong-dan/vai-tro-phan-quyen/
---

Directus bao một cơ sở dữ liệu SQL có sẵn bằng API REST/GraphQL và Studio quản trị, theo giấy phép source-available MSCL. KDIGI CMS là CMS cho website nội dung, giấy phép MIT: đa website, Markdown, JSON-LD và chuyển từ WordPress. Chọn Directus cho lớp dữ liệu đa dụng; chọn KDIGI CMS cho vận hành nhiều website nội dung.

> **Tóm tắt nhanh**
> - **Cách tiếp cận:** Directus "bao" bất kỳ CSDL SQL nào thành API và Studio; KDIGI CMS là CMS nội dung hoàn chỉnh dựng trên Payload với PostgreSQL.
> - **Giấy phép:** KDIGI CMS: MIT. Directus: MSCL 1.0 (source-available); miễn phí cho tổ chức dưới 5 triệu USD doanh thu và 50 nhân viên theo Open Innovation Grant, mỗi phiên bản thành GPLv3 sau 4 năm.
> - **Cơ sở dữ liệu:** Directus hỗ trợ Postgres, MySQL, MariaDB, MS SQL, SQLite, OracleDB, CockroachDB; KDIGI CMS chỉ PostgreSQL.
> - **Đa website:** KDIGI CMS có sẵn tenant `sites`; Directus không mô tả khái niệm này dựng sẵn.
> - **SEO và nội dung:** KDIGI CMS có SEO/JSON-LD, redirect, Markdown, pipeline WordPress; Directus để bạn tự thiết kế trong mô hình dữ liệu.
> - **Trưởng thành:** Directus là dự án lớn với Cloud, MCP server, AI Assistant; KDIGI CMS mới ra bản 1.0.0 ngày 2026-11-03.

## Lưu ý về giấy phép (đã thay đổi)

Nhiều bài so sánh cũ còn ghi Directus dùng BSL 1.1; thông tin đó đã lỗi thời. Theo bài công bố của Directus ngày 2026-04-22, Directus chuyển từ Business Source License sang **Monospace Sustainable Core License (MSCL)**, một giấy phép source-available dẫn xuất từ Fair Core License, đi kèm v12. README hiện tại của Directus nêu:

- Tổ chức dưới 5 triệu USD doanh thu năm và dưới 50 nhân viên dùng miễn phí qua **Open Innovation Grant**.
- Có **tầng Core miễn phí** cho mọi người để khám phá và xây dựng.
- Tổ chức vượt ngưỡng dùng tính năng nâng cao hoặc doanh nghiệp cần giấy phép thương mại.
- Mỗi phiên bản chuyển sang GPLv3 sau 4 năm; SDK vẫn dùng MIT.
- Có khóa đăng ký phần mềm cho người dùng trả phí và người dùng theo Grant.

Điều này không làm Directus "xấu đi"; nó chỉ có nghĩa là Directus không còn là mã nguồn mở theo nghĩa OSI. Nếu giấy phép MIT là yêu cầu cứng của bạn (ví dụ cung cấp lại sản phẩm cho khách hàng), hãy đọc kỹ [giấy phép Directus](https://directus.com/license) trước khi quyết định. Xem thêm [mã nguồn mở của KDIGI CMS](/ma-nguon-mo).

## Hai triết lý khác nhau

**Directus** là "backend cộng tác cho người xây dựng": bạn kết nối một CSDL SQL, nó sinh API REST và GraphQL, cung cấp Studio trực quan, kiểm soát truy cập theo chính sách (tới cấp trường), và mở rộng bằng endpoint, hook, giao diện tùy biến. README cũng giới thiệu AI Assistant và MCP server gốc.

**KDIGI CMS** không bắt đầu từ dữ liệu mà từ **quy trình nội dung của website**: bài viết, trang, sản phẩm/dịch vụ, landing, chuyên mục, tác giả, menu cây, FAQ, redirect, bình luận; SEO và JSON-LD sinh khi lưu; nhiều website trong một bản cài. Nó dựng trên [Payload](/so-sanh/kdigi-cms-vs-payload).

## Bảng so sánh

Thông tin Directus lấy từ README và các trang chính thức (mục Nguồn, kiểm tra 2026-11-03).

| Tiêu chí | KDIGI CMS | Directus |
| --- | --- | --- |
| Định vị | CMS đa website cho nội dung | Lớp API + Studio trên cơ sở dữ liệu SQL |
| Giấy phép | MIT | MSCL 1.0 (source-available); Open Innovation Grant cho tổ chức nhỏ; GPLv3 sau 4 năm |
| Nền tảng | TypeScript, Payload 3.90, Next.js 15 | TypeScript (Node.js) |
| Cơ sở dữ liệu | PostgreSQL | Postgres, MySQL, MariaDB, MS SQL, SQLite, OracleDB, CockroachDB |
| Dùng CSDL có sẵn | Không; schema do migration của dự án quản lý | Có, bao CSDL SQL hiện có |
| API | REST + GraphQL | REST + GraphQL sinh tự động từ schema |
| Quản trị | Admin Payload tùy biến: dashboard biên tập, lịch nội dung, widget SEO | Directus Studio |
| Soạn thảo | Markdown (Milkdown), API trả HTML đã làm sạch | Rich text, các interface theo trường |
| Đa website | Có sẵn: `sites` + `tenant` + gán người dùng theo site | Không mô tả khái niệm dựng sẵn |
| Phân quyền | 4 vai trò theo site; author không tự đăng | Kiểm soát truy cập theo chính sách tới cấp trường |
| SEO | Mẫu RankMath, JSON-LD `@graph`, audit, redirect, AI SEO tùy chọn | Tự thiết kế trong mô hình dữ liệu |
| Di chuyển WordPress | Pipeline có sẵn | Không thấy trong README chính thức |
| AI | AI SEO tùy chọn (DeepSeek) | AI Assistant và MCP server gốc |
| Dịch vụ quản lý | Không | Directus Cloud |
| Triển khai | Docker Compose, Coolify, VPS | Self-host, Directus Cloud, triển khai một cú nhấp (ví dụ Railway) |

## Đa website và phân quyền

Directus có hệ thống quyền mạnh theo chính sách và có thể thể hiện cách ly dữ liệu bằng bộ lọc, nhưng đó là việc của bạn thiết kế và kiểm thử. KDIGI CMS làm sẵn: mỗi nội dung có trường `tenant`, người dùng gắn với site qua `tenants[]`, các predicate `tenantScopedRead`/`tenantScopedWrite` là ranh giới thật; còn bộ lọc của plugin chỉ để giao diện admin gọn hơn.

Cũng cần nói thẳng: người gọi ẩn danh vào API của KDIGI CMS thấy nội dung đã xuất bản của **mọi site** trừ khi frontend thêm `where[tenant][equals]=<id>`.

| Vai trò KDIGI CMS | Phạm vi |
| --- | --- |
| `super-admin` | Mọi site; tạo site, người dùng, cấu hình lưu trữ |
| `admin` | Nội dung và cài đặt trong các site được gán |
| `editor` | Biên tập và đăng nội dung trong các site được gán |
| `author` | Viết và sửa bài của mình, không tự đăng |

Xem [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung) và [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website).

## Khi nào chọn Directus?

1. Bạn **đã có cơ sở dữ liệu SQL** (kể cả MySQL, MS SQL, Oracle) và muốn thêm API cùng giao diện quản trị mà không đổi schema.
2. Bài toán là **ứng dụng nội bộ, bảng điều khiển, dữ liệu có cấu trúc**, không chỉ website nội dung.
3. Bạn muốn **Directus Cloud**, AI Assistant hoặc MCP server gốc.
4. Tổ chức của bạn nằm trong ngưỡng Open Innovation Grant hoặc đã sẵn sàng giấy phép thương mại.

## Khi nào chọn KDIGI CMS?

1. Giấy phép **MIT thuần** là yêu cầu (ví dụ triển khai và bàn giao cho nhiều khách hàng mà không lo ngưỡng doanh thu).
2. Bạn vận hành **nhiều website nội dung** và cần ranh giới site có sẵn.
3. Bạn cần **SEO, JSON-LD, redirect** nằm trong CMS và nội dung **Markdown**.
4. Bạn đang **rời WordPress**.
5. Bạn chấp nhận PostgreSQL và schema do dự án quản lý.

## Lộ trình chuyển từ Directus sang KDIGI CMS

Không có công cụ nhập tự động, nhưng dữ liệu Directus nằm trong SQL thông thường nên quy trình rõ ràng:

1. **Kiểm kê collection** của Directus và ánh xạ: bài viết → `posts`, trang → `pages`, danh mục → `taxonomies`, sản phẩm/dịch vụ → `products`.
2. **Tạo site đích** (`siteKey`, `domain`) và gán người dùng theo vai trò tương ứng.
3. **Xuất dữ liệu** qua REST API của Directus (hoặc SQL), đổi rich text/HTML thành Markdown.
4. **Nhập** qua REST của KDIGI CMS bằng API key của người dùng gắn đúng site, truyền `tenant` rõ ràng.
5. **Chuyển tệp** vào thư viện media, tạo `redirects` 301.
6. **Kiểm tra** bằng `GET /api/seo/audit`, rồi chuyển frontend sang API mới.

```bash
curl -H 'Authorization: users API-Key <key>' \
     -H 'Content-Type: application/json' \
     -X POST https://cms.example.com/api/posts \
     -d '{"title":"Bài viết đã chuyển","tenant":1,"contentMd":"Nội dung…","status":"draft"}'
```

Trường bắt buộc chính xác phụ thuộc cấu hình collection; xem [REST API](https://docs.opencms.kdigi.vn/api/rest-graphql/).

## Nguồn

Kiểm tra ngày 2026-11-03:

- Directus, kho mã và README (hỗ trợ CSDL, Studio, MCP, mô tả giấy phép MSCL và Open Innovation Grant): <https://github.com/directus/directus>
- Directus, giấy phép MSCL 1.0: <https://directus.com/license>
- Directus, "Evolving Our License for Long-Term Sustainability" (2026-04-22): <https://directus.com/resources/directus-v12-license-change>
- Directus Docs: <https://directus.com/docs>

KDIGI CMS: [kho mã](https://github.com/kdigivn/kdigi-cms-open), [tài liệu](https://docs.opencms.kdigi.vn), CHANGELOG 1.1.0 (2026-11-03). Sản phẩm thay đổi theo thời gian; hãy đối chiếu trang chính thức trước khi quyết định.
