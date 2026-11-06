---
title: "Headless API REST/GraphQL cho Next.js | KDIGI CMS"
description: "Lấy nội dung qua REST hoặc GraphQL, Markdown chuyển sang HTML ở khóa gốc, hợp đồng revalidate cho ISR và ví dụ tích hợp Next.js chạy được ngay."
h1: "Headless API: REST, GraphQL và revalidation cho Next.js"
navTitle: "Headless API"
primaryKeyword: "headless api"
icon: code
lead: "Đọc nội dung qua REST hoặc GraphQL, nhận HTML đã làm sạch và được báo làm mới cache bằng webhook."
updated: 2026-11-03
heroImage: "/images/art/tinh-nang-headless-api-hero.webp"
heroAlt: "Khối xanh nối bằng ống ánh xanh tới trình duyệt, điện thoại và máy tính bảng kính mờ, đại diện cho headless API"
schema: "TechArticle"
faq:
  - q: "Nên dùng REST hay GraphQL?"
    a: "Dùng REST để dựng trang. Chỉ REST mới chuyển Markdown sang HTML, mở rộng shortcode, chiếu menu và điền ảnh OG dự phòng. GraphQL trả dữ liệu thô."
  - q: "Vì sao truy vấn của tôi lẫn nội dung nhiều website?"
    a: "Đọc ẩn danh không tự lọc theo site. Hãy luôn thêm `where[tenant][equals]=<siteId>`; tra `siteId` một lần từ collection `sites` theo `siteKey` rồi cache lại."
  - q: "Webhook revalidate hoạt động thế nào?"
    a: "Sau khi lưu hoặc xoá nội dung, CMS gọi `POST https://<domain>/api/cms/revalidate`. Timeout 5 giây, thử lại 3 lần. Cần `ENABLE_JOBS_AUTORUN=true` trên đúng một instance."
  - q: "Đọc bản nháp qua API được không?"
    a: "Được, nhưng phải xác thực bằng API key (`Authorization: users API-Key <key>`). Khách ẩn danh chỉ thấy nội dung đã xuất bản và đã đến giờ đăng."
related:
  - /tinh-nang/noi-dung-va-cau-truc
  - /tinh-nang/seo-json-ld
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/phan-quyen-nguoi-dung
  - /thuc-hanh-tot/hieu-nang-va-cache
docs: "https://docs.cms.kdigi.vn/api/rest-graphql/"
---

KDIGI CMS chỉ có trang quản trị `/admin` và API. Website là frontend bạn tự chọn: đọc nội dung từng site qua REST, nhận HTML ở khóa `content`, và nhận webhook khi nội dung đổi.

> **Tóm tắt nhanh**
> - REST là hợp đồng chính; GraphQL trả dữ liệu thô.
> - Luôn lọc theo `tenant`, nếu không sẽ lẫn nhiều site.
> - Markdown nguồn ở `contentMd`, HTML ở `content`.
> - Webhook revalidate: timeout 5 giây, thử lại 3 lần.
> - Bản nháp chỉ đọc được bằng API key.

![Phản hồi REST thật: slug, title, contentMd, content HTML, ảnh đại diện, SEO](/images/shots/api.webp)

## :server: Chọn site rồi truy vấn

Mỗi site có `siteKey` duy nhất; nội dung tham chiếu nó qua `tenant`. Tra id một lần, rồi lọc mọi truy vấn:

```bash
curl -s 'https://cms.example.com/api/sites?where[siteKey][equals]=example-site&limit=1'
curl -s 'https://cms.example.com/api/posts?where[tenant][equals]=1&sort=-publishedAt&limit=10&depth=1'
```

> **Lưu ý** Slug chỉ duy nhất trong từng site, nên luôn kết hợp điều kiện `slug` với `tenant`. Xem [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website).

## :lock: Ai đọc được gì

| Collection | Đọc ẩn danh |
| --- | --- |
| `pages`, `posts`, `products`, `landings` | Chỉ `published`, đã đến giờ đăng, chưa vào thùng rác |
| `taxonomies`, `authors`, `menus`, `faqs`, `shortcodes` | Có (`authors` không có `email`) |
| `comments` | Chỉ `approved` |
| `rating-events`, `users` | không |

Lịch sử phiên bản cần đăng nhập. Chi tiết quyền xem [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung).

## :code: REST hay GraphQL

| Khả năng | REST | GraphQL |
| --- | --- | --- |
| Markdown → HTML ở `content` | ✓ | ✗ |
| Mở rộng shortcode | ✓ | ✗ |
| Menu chiếu thành `items` | ✓ | ✗ |
| Ảnh OG dự phòng | ✓ | ✗ |

GraphQL ở `/api/graphql`: production tắt playground, giới hạn độ phức tạp 500. `seo.jsonLd.raw` là thẻ `<script type="application/ld+json">` dựng sẵn, xem [SEO và JSON-LD](/tinh-nang/seo-json-ld).

## :refresh-cw: Webhook revalidate

Frontend của bạn phải tự cung cấp endpoint này, đặt ở tên miền của site:

```http
POST https://{Sites.domain}/api/cms/revalidate
{ "collection": "posts", "id": "42", "slug": "hello-world" }
```

:::cards 2
- :zap: **Khi nào gửi** Sau khi lưu hoặc xoá nội dung, đổi cài đặt site, duyệt bình luận.
- :refresh-cw: **Thử lại** Timeout 5 giây; lỗi thì thử lại 3 lần, backoff lũy thừa từ 1 giây.
- :key-round: **Bí mật** Đặt `REVALIDATE_SECRET` để ping mang header `x-revalidate-secret`.
- :settings: **Chạy job** Đặt `ENABLE_JOBS_AUTORUN=true` trên đúng một instance.
:::

> **Cảnh báo** Cache chỉ làm mới khi **lưu**, không theo đồng hồ. Bài hẹn giờ có thể chưa hiện cho tới khi có lượt revalidate.

Ví dụ minh họa cho Next.js (không phải mã có sẵn trong repo):

```ts
// app/api/cms/revalidate/route.ts
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET
  if (secret && req.headers.get('x-revalidate-secret') !== secret) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const { collection, slug } = await req.json()
  // menus/faqs gửi id làm slug: làm mới cả site
  if (collection === 'menus' || collection === 'faqs') revalidatePath('/', 'layout')
  else if (slug) revalidatePath(`/${slug}`)
  return NextResponse.json({ ok: true })
}
```

## :key-round: Xác thực bằng API key

Tạo key trong hồ sơ người dùng. Key chịu cùng vai trò và phạm vi site của người sở hữu:

```bash
curl -H 'Authorization: users API-Key <api-key>' \
  'https://cms.example.com/api/posts?where[tenant][equals]=1&where[status][equals]=draft'
```

## :list-checks: Thực hành tốt

:::check
- Cache `siteId` và cấu hình site ở frontend
- Dùng `select` và `depth=1` cho trang danh sách
- Chèn `seo.jsonLd.raw` nguyên văn
- Không để API key lọt vào bundle trình duyệt
:::

Các collection và trường: xem [nội dung và cấu trúc](/tinh-nang/noi-dung-va-cau-truc). Tài liệu đầy đủ: [REST và GraphQL](https://docs.cms.kdigi.vn/api/rest-graphql/).
