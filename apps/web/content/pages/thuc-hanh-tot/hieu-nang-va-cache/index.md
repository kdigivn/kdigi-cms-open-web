---
title: "Hiệu năng: cache, revalidate và Core Web Vitals"
description: "Tối ưu hiệu năng website headless: ISR/revalidate đúng cách, ảnh WebP, cache CDN, đo LCP/INP/CLS và cách xử lý khi nội dung cập nhật mà trang chưa đổi."
h1: "Hiệu năng: cache, revalidation và Core Web Vitals"
navTitle: "Hiệu năng và cache"
icon: gauge
lead: "Cache ở frontend, để CMS báo qua webhook khi nội dung đổi, lấy dữ liệu gọn và phục vụ ảnh qua CDN."
primaryKeyword: "core web vitals"
updated: 2026-11-03
heroImage: /images/shots/api.webp
heroAlt: "Phản hồi JSON của REST API trong KDIGI CMS"
schema: TechArticle
faq:
  - q: "Đăng bài xong frontend không cập nhật thì kiểm tra gì?"
    a: "Ba điều: ENABLE_JOBS_AUTORUN=true trên đúng một instance, trường domain của site đã điền, frontend có POST /api/cms/revalidate trả 2xx trong 5 giây."
  - q: "Bài hẹn giờ có tự làm mới cache khi đến giờ không?"
    a: "Không. Bài hiện ở request đầu tiên sau publishedAt, nhưng cache chỉ làm mới khi có lưu. Đặt thời gian sống cho cache hoặc lưu lại bài ngay sau mốc giờ."
  - q: "Webhook revalidate có xác thực không?"
    a: "Mặc định không. Từ 1.1.0 bạn đặt REVALIDATE_SECRET để CMS gửi header x-revalidate-secret. Vẫn nên làm handler idempotent và rẻ."
  - q: "REST hay GraphQL nhanh hơn cho frontend?"
    a: "Dùng REST để render: chỉ REST chuyển Markdown thành HTML sạch, mở rộng shortcode và chiếu menu. Danh sách thì dùng depth=1 hoặc select."
  - q: "Ảnh tải lên có tự tối ưu không?"
    a: "Chỉ với site dùng Cloudflare R2 và bật r2.compressToWebp. Site lưu ổ đĩa không có bước này, hãy tối ưu ở frontend, ví dụ next/image."
related:
  - /tinh-nang/headless-api
  - /tinh-nang/thu-vien-media
  - /thuc-hanh-tot/seo-onpage
  - /tu-host
  - /thuc-hanh-tot/sao-luu-va-nang-cap
docs: https://docs.cms.kdigi.vn/api/rest-graphql/
---

KDIGI CMS chỉ phục vụ admin và API; tốc độ trang công khai phụ thuộc cache ở frontend của bạn. Lưu nội dung xếp một job revalidate và không bao giờ chờ frontend phản hồi.

> **Tóm tắt nhanh**
> - Job chạy mỗi 10 giây, tối đa 25 job mỗi lượt.
> - Webhook timeout 5 giây, thử lại 3 lần.
> - Chỉ REST trả HTML đã render; GraphQL trả dữ liệu thô.
> - WebP khi tải lên chỉ có ở site dùng R2.

## :layers: Ba chỗ cần tối ưu

:::cards
- :search: **Truy vấn** Frontend lấy dữ liệu gọn bằng `depth` và `select`. Xem [API headless](/tinh-nang/headless-api).
- :refresh-cw: **Cache và làm mới** ISR hoặc tương đương, kèm webhook revalidate.
- :image: **Media** Phục vụ qua CDN, đặt `publicBaseUrl`. Xem [thư viện media](/tinh-nang/thu-vien-media).
:::

## :code: Truy vấn REST gọn

```bash
curl -s 'https://cms.example.com/api/posts?where[tenant][equals]=1&where[status][equals]=published&sort=-publishedAt&limit=12&depth=1&select[title]=true&select[slug]=true'
```

:::check
- `depth=1` cho danh sách (mặc định REST là 2)
- `select[...]` bỏ `contentMd`, `seo.jsonLd` khỏi danh sách
- Luôn lọc `where[tenant][equals]`
- Phân giải site một lần rồi cache
- Dùng REST để render trang
:::

## :refresh-cw: Webhook revalidate

Khi nội dung đổi, CMS xếp job `revalidateFrontend` rồi gọi `POST https://{Sites.domain}/api/cms/revalidate` với `{ "collection", "id", "slug" }`.

| Thuộc tính | Giá trị |
| --- | --- |
| Đổi slug | Gửi thêm request cho slug **cũ** |
| URL | `https://` + `Sites.domain`; không có `domain` thì không gửi |
| Timeout / retry | 5 giây; lỗi thì thử lại 3 lần |
| Xác thực | Đặt `REVALIDATE_SECRET` để có header `x-revalidate-secret` |
| Đánh giá sao | Không kích hoạt revalidate |

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

## :zap: Bật job runner

```bash
ENABLE_JOBS_AUTORUN=true   # chỉ trên MỘT instance
```

> **Cảnh báo** Payload không có khóa job giữa các instance; bật ở nhiều nơi gây xử lý trùng. Không bật thì job được xếp nhưng không chạy. Job lỗi nằm ở bảng `payload_jobs`, kiểm tra bằng SQL.

## :calendar-clock: Nội dung hẹn giờ

Bài có `publishedAt` ở tương lai bị ẩn khỏi truy vấn ẩn danh, nhưng cache chỉ làm mới khi có lưu.

:::steps
- :clock: **Đặt TTL cho cache** Ví dụ `revalidate: 300` ở các trang danh sách.
- :refresh-cw: **Hoặc lưu lại bài** Lưu lại hoặc revalidate thủ công ngay sau mốc giờ.
:::

## :image: Media nhanh và ổn định

| Chế độ | Hành vi |
| --- | --- |
| Ổ đĩa (mặc định) | `Cache-Control: public, max-age=3600`, ETag yếu, `nosniff` |
| R2 + `publicBaseUrl` | URL CDN; WebP khi tải lên nếu bật `compressToWebp` |
| R2 không có `publicBaseUrl` | Redirect tới URL ký 1 giờ, khách ẩn danh nhận 401 |

> **Mẹo** Luôn đặt `publicBaseUrl` cho media công khai, đặt `width`/`height` cho ảnh đại diện và giữ nguyên `PAYLOAD_PUBLIC_SERVER_URL`.

## :gauge: Core Web Vitals

| Chỉ số | CMS giúp | Frontend làm |
| --- | --- | --- |
| LCP | Ảnh có kích thước, `publicBaseUrl`, ETag | Ưu tiên ảnh LCP, CDN, ISR/SSG |
| INP | HTML đã làm sạch, không script nội tuyến | Giảm JavaScript client |
| CLS | Tự chèn `width`/`height` vào `<img>` khi `src` khớp media | Đặt kích thước ảnh, nhúng, font |

Hãy đo trên trang của **frontend** bằng Search Console hoặc PageSpeed Insights.

## :server: Giới hạn vận hành

:::cards
- :database: **Kết nối DB** Pool tối đa 20 kết nối PostgreSQL mỗi instance.
- :lock: **GraphQL** Production giới hạn độ phức tạp 500 và tắt playground.
- :life-buoy: **Health check** `GET /api/health` chỉ kiểm tra tiến trình sống, không hỏi DB.
:::

Muốn xuất trace, đặt `OTEL_EXPORTER_OTLP_ENDPOINT` để dùng OpenTelemetry.

## :list-checks: Checklist hiệu năng

:::check
- Handler `/api/cms/revalidate` trả 2xx dưới 5 giây, idempotent
- `ENABLE_JOBS_AUTORUN=true` đúng một nơi; `domain` đã điền
- Danh sách dùng `depth=1` + `select`, có lọc `tenant`
- Media công khai có `publicBaseUrl` hoặc CDN
- Có kế hoạch cho bài hẹn giờ
:::

Tiếp theo: [SEO on-page](/thuc-hanh-tot/seo-onpage) hoặc [tự host](/tu-host) bằng Docker Compose/Coolify.
