---
title: "Hiệu năng: cache, revalidate và Core Web Vitals"
description: "Tối ưu hiệu năng website headless: ISR/revalidate đúng cách, ảnh WebP, cache CDN, đo LCP/INP/CLS và cách xử lý khi nội dung cập nhật mà trang chưa đổi."
h1: "Hiệu năng: cache, revalidation và Core Web Vitals"
primaryKeyword: "core web vitals"
updated: 2026-11-03
heroImage: /images/shots/api.webp
heroAlt: "Phản hồi JSON của REST API trong KDIGI CMS"
schema: TechArticle
faq:
  - q: "Sau khi đăng bài, frontend không cập nhật thì kiểm tra gì?"
    a: "Kiểm tra ba điều: ENABLE_JOBS_AUTORUN=true trên đúng một instance CMS, trường domain của site đã được điền, và frontend có endpoint POST /api/cms/revalidate trả 2xx trong 5 giây. Job lỗi được thử lại 3 lần với backoff, và nằm trong bảng payload_jobs với cờ hasError."
  - q: "Bài hẹn giờ đăng có tự làm mới cache khi đến giờ không?"
    a: "Không. Bài hẹn giờ xuất hiện ở request đầu tiên sau mốc publishedAt, nhưng cache frontend chỉ được làm mới khi có lần lưu. Cách xử lý: đặt thời gian sống (revalidate time) hợp lý ở frontend, hoặc lưu lại bài ngay sau mốc giờ để kích hoạt webhook."
  - q: "Webhook revalidate có xác thực không?"
    a: "Mặc định không. Từ phiên bản 1.1.0 bạn có thể đặt REVALIDATE_SECRET; khi đó mỗi lời gọi mang header x-revalidate-secret để frontend từ chối request lạ. Dù vậy, hãy làm handler idempotent, rẻ và giới hạn tốc độ ở edge vì giá trị bí mật chung cho mọi site."
  - q: "REST hay GraphQL nhanh hơn cho frontend?"
    a: "Dùng REST để render trang. Chỉ REST mới chuyển Markdown thành HTML sạch, mở rộng shortcode, chiếu menu và điền ảnh OG dự phòng. GraphQL trả dạng thô. Để giảm tải, dùng depth=1 hoặc select cho danh sách, và cache kết quả theo site ở frontend."
  - q: "Ảnh tải lên có tự tối ưu không?"
    a: "Chỉ với site dùng Cloudflare R2 và bật r2.compressToWebp: JPEG, PNG, TIFF, AVIF được đổi sang WebP theo r2.webpQuality (mặc định 80). Site lưu ổ đĩa không có bước này nên hãy tối ưu ở frontend, ví dụ next/image, và phục vụ qua CDN."
related:
  - /tinh-nang/headless-api
  - /tinh-nang/thu-vien-media
  - /thuc-hanh-tot/seo-onpage
  - /tu-host
  - /thuc-hanh-tot/sao-luu-va-nang-cap
docs: https://docs.opencms.kdigi.vn/api/rest-graphql/
---

Để site dùng KDIGI CMS nhanh mà luôn cập nhật: cache trang ở frontend (ISR hoặc tương đương), để CMS gọi webhook `POST https://<domain>/api/cms/revalidate` mỗi khi nội dung đổi, bật `ENABLE_JOBS_AUTORUN=true` trên đúng một instance, lấy dữ liệu gọn bằng `depth` và `select`, và phục vụ ảnh qua CDN.

> **Tóm tắt nhanh**
> - KDIGI CMS chỉ là admin + API; hiệu năng trang công khai phụ thuộc cache ở frontend của bạn.
> - Lưu nội dung xếp một job revalidate, **không bao giờ chờ** frontend phản hồi.
> - Job chạy mỗi 10 giây, tối đa 25 job/lượt, thử lại 3 lần; timeout 5 giây.
> - Chỉ bản thân REST trả HTML đã render; GraphQL trả dữ liệu thô.
> - Ảnh: WebP-on-upload chỉ có ở site dùng R2; ảnh cục bộ cache `public, max-age=3600` kèm ETag.

## 1. Kiến trúc: CMS không render trang công khai

CMS chạy một server Next.js (cổng 3000) và PostgreSQL. Website công khai là frontend riêng (Next.js, Astro, Nuxt…) đọc API ẩn danh. Do đó, ba nơi cần tối ưu: **cách frontend truy vấn**, **cách frontend cache và làm mới**, và **cách phục vụ media**. Xem [API headless](/tinh-nang/headless-api).

## 2. Truy vấn REST gọn

```bash
# Danh sách nhẹ: chỉ các trường cần cho thẻ bài viết
curl -s 'https://cms.example.com/api/posts?where[tenant][equals]=1&where[status][equals]=published&sort=-publishedAt&limit=12&depth=1&select[title]=true&select[slug]=true&select[excerpt]=true&select[publishedAt]=true&select[featuredImage]=true'

# Một bài theo slug (slug duy nhất theo site, nên luôn kèm tenant)
curl -s 'https://cms.example.com/api/posts?where[tenant][equals]=1&where[slug][equals]=hello-world&limit=1&depth=2'
```

| Mẹo | Lý do |
| --- | --- |
| `depth=1` cho danh sách | Đủ để populate ảnh đại diện và chuyên mục; mặc định REST là 2 |
| `select[...]` | Bỏ `contentMd`, `seo.jsonLd` khỏi danh sách |
| Luôn lọc `where[tenant][equals]` | Đọc ẩn danh không tự lọc theo site |
| Phân giải site **một lần** và cache | `GET /api/sites?where[siteKey][equals]=...` |
| Dùng `locale=vi` hoặc `locale=en` | `en` thiếu giá trị sẽ fallback sang `vi` |
| Dùng REST để render | Markdown → HTML, shortcode, menu, ảnh OG dự phòng chỉ chạy ở REST |

Quy tắc đọc `content`: có `contentMd` thì HTML được dựng từ đó; chuỗi rỗng cho `null`; `null` mới rơi về dữ liệu Lexical cũ. Ảnh trong HTML được chèn sẵn `width`/`height` khi `src` khớp một bản ghi media (giảm CLS); bản đồ kích thước được cache 5 phút.

## 3. Webhook revalidate: hợp đồng đầy đủ

Khi nội dung đổi, CMS xếp job `revalidateFrontend` (Payload job, không chặn thao tác lưu) rồi gọi:

```http
POST https://{Sites.domain}/api/cms/revalidate
Content-Type: application/json

{ "collection": "posts", "id": "42", "slug": "hello-world" }
```

| Thuộc tính | Giá trị |
| --- | --- |
| Khi nào gửi | Lưu/xóa `pages`, `posts`, `products`, `landings`, `taxonomies`, `faqs`, `shortcodes`, `menus`, `authors`; đổi cài đặt site; bình luận bài được/không còn duyệt |
| Đổi slug | Gửi thêm một request cho slug **cũ** |
| Collection không có slug (`menus`, `faqs`) | `slug` là id tài liệu → hãy revalidate cả site |
| URL | Luôn `https://` + `Sites.domain`; site không có `domain` thì không gửi |
| Timeout / retry | 5 giây; lỗi → thử lại 3 lần, backoff theo cấp số nhân |
| Xác thực | Mặc định không; đặt `REVALIDATE_SECRET` để gửi header `x-revalidate-secret` |
| Đánh giá sao | **Không** kích hoạt revalidate |

Ví dụ handler Next.js (App Router), tối thiểu và idempotent:

```ts
// app/api/cms/revalidate/route.ts
import { revalidateTag } from 'next/cache'

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET
  if (secret && req.headers.get('x-revalidate-secret') !== secret) {
    return new Response('forbidden', { status: 403 })
  }
  const { collection, slug } = await req.json()
  revalidateTag(`cms:${collection}`)
  if (slug) revalidateTag(`cms:${collection}:${slug}`)
  return Response.json({ ok: true })
}
```

Gắn tag tương ứng vào các lệnh `fetch` đọc từ CMS. Với `menus`/`faqs`, hãy làm mới tag theo site.

### Bật job runner

```bash
ENABLE_JOBS_AUTORUN=true   # chỉ trên MỘT instance
```

Runner chạy mỗi 10 giây, tối đa 25 job/lượt và khôi phục job kẹt ở trạng thái `processing` quá 5 phút sau khi khởi động lại. Payload không có khóa job giữa các instance, nên bật ở nhiều nơi gây xử lý trùng. Không bật → job được xếp nhưng không chạy, và production cảnh báo lúc khởi động. Job lỗi nằm ở bảng `payload_jobs` (`hasError`/`error`), không xem được qua REST — kiểm tra bằng SQL.

## 4. Nội dung hẹn giờ

Bài có `publishedAt` ở tương lai bị ẩn khỏi truy vấn ẩn danh cho đến lúc đó (tính theo từng request). Nhưng **cache chỉ được làm mới bằng lần lưu**, không theo đồng hồ. Hai cách xử lý:

1. Đặt thời gian sống cho cache (ví dụ `revalidate: 300`) ở các trang danh sách.
2. Lên lịch lưu lại tài liệu (hoặc nút revalidate thủ công trong editor) ngay sau mốc giờ.

## 5. Media: ảnh nhanh và ổn định

| Chế độ | Hành vi |
| --- | --- |
| Ổ đĩa (mặc định) | URL `…/api/media/file/<tên>?t=<siteId>`, header `Cache-Control: public, max-age=3600`, ETag yếu (304 khi khớp `If-None-Match`), `nosniff` |
| Cloudflare R2 + `publicBaseUrl` | URL CDN `<publicBaseUrl>/media/<siteId>/…`; tối ưu WebP khi tải lên nếu bật `compressToWebp` |
| R2 không có `publicBaseUrl` | Qua route CMS với redirect tới URL ký 1 giờ; trả 401 cho khách ẩn danh → **luôn đặt `publicBaseUrl`** cho media công khai |

Chi tiết WebP: JPEG/PNG/TIFF/AVIF → WebP theo `webpQuality` (mặc định 80); SVG không đổi; GIF động bỏ qua; nếu WebP lớn hơn bản gốc thì giữ bản gốc. Sau khi sửa ảnh trong editor, URL được gắn `?v=<version>` để CDN lấy lại (chỉ hiệu quả với CDN tính query vào cache key).

**Thực hành:** đặt ảnh đại diện có `width`/`height`; dùng `next/image` hoặc bộ tối ưu của frontend; giữ nguyên `PAYLOAD_PUBLIC_SERVER_URL` vì URL cục bộ đã nhúng origin lúc tải lên. Xem [thư viện media](/tinh-nang/thu-vien-media).

## 6. Giới hạn vận hành của CMS

- Mỗi instance dùng pool tối đa 20 kết nối PostgreSQL (timeout kết nối 10 giây, idle-in-transaction 120 giây); tính `max_connections` theo số instance và các lệnh CLI.
- Một lượt tải ảnh giữ kết nối DB suốt thời gian chuyển đổi và ghi lưu trữ.
- GraphQL production giới hạn độ phức tạp truy vấn 500 và tắt playground.
- `GET /api/health` chỉ là kiểm tra sống (không hỏi DB), nên vẫn xanh khi đang migrate/restore.
- Quan sát: đặt `OTEL_EXPORTER_OTLP_ENDPOINT` để xuất trace OpenTelemetry; log ra stdout.

## Core Web Vitals: CMS góp phần ở đâu

Core Web Vitals (LCP, INP, CLS) được đo trên trang công khai do frontend render, nên CMS chỉ góp dữ liệu đúng và nhẹ:

| Chỉ số | Việc CMS giúp được | Việc frontend phải làm |
| --- | --- | --- |
| LCP (tải phần tử lớn nhất) | Ảnh đại diện có kích thước; R2 + `publicBaseUrl` hoặc ETag/`max-age=3600` cho ảnh cục bộ; WebP khi tải lên (site R2) | Ưu tiên tải ảnh LCP, phục vụ qua CDN, render sẵn bằng ISR/SSG |
| INP (độ phản hồi) | Trả HTML đã làm sạch, không script nội tuyến | Giảm JavaScript phía client, tách mã theo trang |
| CLS (xê dịch bố cục) | Tự chèn `width`/`height` vào `<img>` trong nội dung khi `src` khớp media của site | Đặt kích thước cho ảnh, nhúng và chữ web font |

Hãy đo bằng dữ liệu thực tế (Search Console, PageSpeed Insights) trên trang của **frontend**; CMS không đo hộ bạn.

## 7. Sơ đồ khuyến nghị

1. Frontend render trang bằng ISR/SSG, đọc API ẩn danh có lọc `tenant`.
2. CMS gọi webhook khi đổi nội dung (tag theo collection/slug).
3. CDN đứng trước frontend và trước media (R2 `publicBaseUrl` hoặc CDN trước CMS cho ảnh cục bộ).
4. Một instance CMS chạy job; instance còn lại (nếu có) đặt `ENABLE_JOBS_AUTORUN` trống.
5. Giám sát: health check, OTLP, cảnh báo job `hasError`.

## Checklist hiệu năng

- [ ] Handler `/api/cms/revalidate` trả 2xx dưới 5 giây và idempotent.
- [ ] `ENABLE_JOBS_AUTORUN=true` đúng một nơi; `domain` của site đã điền.
- [ ] Danh sách dùng `depth=1` + `select`; có lọc `tenant`.
- [ ] Media công khai có `publicBaseUrl` hoặc CDN; ảnh có kích thước.
- [ ] Có kế hoạch cho bài hẹn giờ (cache TTL hoặc lưu lại).

Tiếp theo: [SEO on-page](/thuc-hanh-tot/seo-onpage), hoặc [triển khai tự host](/tu-host) với Docker Compose/Coolify.
