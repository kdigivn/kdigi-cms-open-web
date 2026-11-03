---
title: "Headless API REST/GraphQL cho Next.js | KDIGI CMS"
description: "Lấy nội dung qua REST hoặc GraphQL, Markdown chuyển sang HTML ở khóa gốc, hợp đồng revalidate cho ISR và ví dụ tích hợp Next.js chạy được ngay."
h1: "Headless API: REST, GraphQL và revalidation cho Next.js"
navTitle: "Headless API"
primaryKeyword: "headless api"
updated: 2026-11-03
heroImage: "/images/art/tinh-nang-headless-api-hero.webp"
heroAlt: "Khối xanh nối bằng ống ánh xanh tới trình duyệt, điện thoại và máy tính bảng kính mờ, đại diện cho headless API"
schema: "TechArticle"
faq:
  - q: "KDIGI CMS có phải headless CMS không?"
    a: "Có. KDIGI CMS chỉ gồm trang quản trị và API; không có giao diện công khai. Website là frontend bạn tự chọn (Next.js, Astro, Nuxt, PHP…) đọc nội dung ẩn danh qua REST hoặc GraphQL và được báo làm mới cache bằng webhook revalidate mỗi khi nội dung thay đổi."
  - q: "Nên dùng REST hay GraphQL?"
    a: "Nên dùng REST để dựng trang. Chỉ REST mới chuyển Markdown sang HTML sạch, mở rộng shortcode, chiếu cây menu thành items và điền ảnh OG dự phòng. GraphQL trả dữ liệu thô: contentMd là Markdown nguồn, shortcode không được mở rộng, content là JSON rich-text cũ ẩn."
  - q: "Vì sao truy vấn của tôi lẫn nội dung của nhiều website?"
    a: "Quyền đọc công khai không tự lọc theo site vì một CMS phục vụ nhiều website. Nếu thiếu điều kiện, kết quả trộn nội dung của mọi site. Frontend phải luôn thêm where[tenant][equals]=<siteId> vào mọi truy vấn; tra siteId một lần từ collection sites theo siteKey rồi cache lại."
  - q: "Webhook revalidate hoạt động thế nào?"
    a: "Sau khi lưu hoặc xoá nội dung, CMS xếp một job gọi POST https://<domain-của-site>/api/cms/revalidate với collection, id và slug. Request timeout 5 giây, thử lại 3 lần theo backoff luỹ thừa. Cần ENABLE_JOBS_AUTORUN=true trên đúng một instance để job chạy."
  - q: "Đọc bản nháp qua API được không?"
    a: "Được, nhưng phải xác thực. Khách ẩn danh chỉ thấy nội dung published và đã đến giờ đăng. Với API key của người dùng (header Authorization: users API-Key <key>), bạn nhận cả bản nháp và nội dung hẹn giờ trong các site mà người dùng đó thuộc về."
related:
  - /tinh-nang/noi-dung-va-cau-truc
  - /tinh-nang/seo-json-ld
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/phan-quyen-nguoi-dung
  - /thuc-hanh-tot/hieu-nang-va-cache
docs: "https://docs.opencms.kdigi.vn/api/rest-graphql/"
---

KDIGI CMS là headless CMS: nó chỉ có trang quản trị `/admin` và API, còn website công khai là frontend bạn tự chọn. Frontend đọc nội dung từng site qua REST hoặc GraphQL, nhận HTML đã render ở đúng key gốc (`content`), và được báo làm mới cache qua webhook `/api/cms/revalidate`.

> **Tóm tắt nhanh**
> - **REST là hợp đồng chính**: Markdown→HTML, mở rộng shortcode, chiếu menu và ảnh OG dự phòng chỉ chạy trên REST.
> - Đọc ẩn danh chỉ trả nội dung `published` đã đến giờ đăng; **luôn lọc theo `tenant`**.
> - Nguồn Markdown ở `contentMd`, HTML ở `content` (tương tự `noticeMd`/`notice`, `bodyMd`/`body`).
> - `seo.jsonLd.raw` là thẻ `<script type="application/ld+json">` dựng sẵn.
> - **Webhook revalidate** gọi `POST https://<domain>/api/cms/revalidate`, retry 3 lần.
> - GraphQL tại `/api/graphql` (tắt playground ở production, giới hạn độ phức tạp 500) trả dữ liệu thô.

![Phản hồi REST thật: slug, title, contentMd, content HTML, ảnh đại diện, SEO](/images/shots/api.webp)

## Nguyên tắc cốt lõi

- **Đọc ẩn danh.** Frontend gọi API **không cookie, không header `Authorization`**. Request đã xác thực (phiên admin hoặc API key) chuyển sang quyền theo site và sẽ trả cả bản nháp lẫn nội dung hẹn giờ.
- **REST là hợp đồng.** GraphQL và Local API trả dạng lưu trữ thô.
- **Tự lọc theo site.** Một CMS phục vụ nhiều website ([quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website)) nên phải thêm điều kiện `tenant`.
- Danh sách trả về dạng phân trang chuẩn của Payload: `docs`, `totalDocs`, `limit`, `page`, `totalPages`, `hasNextPage`, `hasPrevPage`, `nextPage`, `prevPage`, `pagingCounter`.

## Chọn site

Mỗi site là một tài liệu `sites` có `siteKey` duy nhất và `domain`. Collection nội dung tham chiếu nó qua trường `tenant` (giá trị là `id` số). Tra một lần rồi cache:

```bash
curl -s 'https://cms.example.com/api/sites?where[siteKey][equals]=example-site&depth=1&limit=1'
```

Sau đó lọc mọi truy vấn:

```bash
curl -s 'https://cms.example.com/api/posts?where[tenant][equals]=1&sort=-publishedAt&limit=10&depth=1'
```

Collection `sites` đọc công khai nhưng `r2.accessKeyId` và `r2.secretAccessKey` không bao giờ xuất hiện. Các thiết lập công khai như branding, contact, footer, `seoDefaults`, `knowledgeGraph`, `seoTitles`, `breadcrumbs`, `pageGroup` và `defaultLanguage` đọc được.

## Ai đọc được gì

| Collection | Đọc ẩn danh |
| --- | --- |
| `pages`, `posts`, `products`, `landings` | `status = published`, `publishedAt` trống hoặc `<= now`, chưa vào thùng rác. Bài hẹn giờ tự lên khi tới giờ. `?trash=true` không mở rộng kết quả |
| `taxonomies` | Tất cả; lọc theo `type` (`category`, `product-category`, `tag`, `custom`) |
| `authors` | Tất cả, không bao giờ có `email` |
| `menus` | Tất cả, dạng đã chiếu thành `items` |
| `faqs`, `shortcodes` | Tất cả bản chưa vào thùng rác |
| `redirects` | Tất cả (kể cả đã tắt) — lọc `where[isEnabled][equals]=true` |
| `comments` | Chỉ `status = approved` |
| `media`, `sites` | Tất cả (secret ẩn) |
| `rating-events`, `users` | Không |

Lịch sử phiên bản (`/api/<collection>/versions`) cần đăng nhập; khách ẩn danh nhận 403 vì snapshot chứa trường SEO nội bộ.

## Truy vấn thường dùng

```bash
# Danh sách, mới nhất trước, một site
curl -s 'https://cms.example.com/api/posts?where[tenant][equals]=1&sort=-publishedAt&limit=12&page=1&depth=1'

# Một tài liệu theo slug (slug duy nhất theo site, không duy nhất toàn cục)
curl -s 'https://cms.example.com/api/pages?where[tenant][equals]=1&where[slug][equals]=about&limit=1&depth=2'

# Chỉ lấy vài trường
curl -s 'https://cms.example.com/api/posts?where[tenant][equals]=1&select[title]=true&select[slug]=true&select[publishedAt]=true'
```

`depth` quyết định mức populate quan hệ (`featuredImage`, `categories`, `author`, `seo.openGraph.image`…): `depth=0` trả id trần, `depth=1` đủ cho media và taxonomy; với danh sách nên dùng `depth=1` hoặc `select`. Slug là duy nhất trong số tài liệu chưa vào thùng rác, nên luôn kết hợp điều kiện `slug` với `tenant`.

**Ngôn ngữ**: nội dung có `vi` (mặc định) và `en`, có fallback.

| Query | Kết quả |
| --- | --- |
| *(không có)* | `vi` |
| `locale=en` | `en`; trường thiếu bản `en` rơi về `vi` |
| `locale=en&fallback-locale=none` | Chỉ `en`, giá trị thiếu để trống |
| `locale=all` | Mọi ngôn ngữ dạng `{ vi, en }` |

## Markdown → HTML ở key gốc

Biên tập viên viết Markdown trong [trình soạn thảo Milkdown](/tinh-nang/trinh-soan-thao-markdown); API trả HTML sẵn ở đúng key:

| Collection | Nguồn Markdown | Trường bạn đọc (HTML) |
| --- | --- | --- |
| `posts`, `pages`, `products`, `taxonomies`, `shortcodes` | `contentMd` | `content` |
| `products` | `noticeMd` | `notice` |
| `landings` (block `content` trong `layout[]`) | `bodyMd` | `body` |
| `faqs` (`items[].answer`) | câu trả lời lưu dạng Markdown | cùng key, render HTML trên REST |

Quy tắc: nếu `*Md` có chữ thì nó thắng — shortcode được mở rộng, Markdown được render thành HTML đã lọc (sanitize), và thẻ `<img>` được thêm `width`/`height` khi biết kích thước từ thư viện media; nếu `*Md` là chuỗi rỗng thì trường HTML là `null` (giá trị rich-text cũ **không** sống lại); nếu `*Md` là `null` (tài liệu chưa lưu lại từ sau đợt chuyển sang Markdown) thì giá trị Lexical cũ được chuyển sang HTML. Đừng render trực tiếp trường `*Md` trong response.

### Shortcode

Shortcode là đoạn Markdown tái sử dụng trong collection `shortcodes`, gọi bằng `[sc name="ten-doan"/]` (hoặc `[sc name="ten-doan"][/sc]`). Mở rộng diễn ra khi đọc REST, trước bước render Markdown: tra theo `name` trong site của chính tài liệu, đúng ngôn ngữ request, lồng tối đa 3 cấp; tên không tồn tại, vòng lặp hoặc quá sâu được thay bằng chuỗi rỗng.

## SEO và JSON-LD

Mỗi `pages`, `posts`, `products`, `landings`, `taxonomies` có nhóm `seo` với hình dạng ổn định ([SEO và JSON-LD](/tinh-nang/seo-json-ld)):

| Đường dẫn | Ghi chú |
| --- | --- |
| `seo.title`, `seo.description` | Thường **để trống có chủ đích**: CMS lưu đúng thứ biên tập viên nhập, frontend điền phần còn lại từ mẫu `Sites.seoTitles` khi render |
| `seo.focusKeywords[]`, `seo.robots[]`, `seo.canonicalOverride`, `seo.breadcrumbTitle` | — |
| `seo.breadcrumbs[]` | `{ url, text, isHidden }`, tự sinh khi lưu nếu trống; bỏ qua mục `isHidden: true` |
| `seo.openGraph.*` | `image` được điền lúc đọc: ảnh OG riêng → `featuredImage` → `Sites.seoDefaults.ogImage` |
| `seo.jsonLd.raw` | Phần tử `<script type="application/ld+json">` đầy đủ chứa một `@graph` schema.org, chèn nguyên văn |

Bên trong phần tử này mọi ký tự `<` của JSON được escape thành `\u003c`, nên chuỗi `</script>` trong tiêu đề không thể thoát khỏi thẻ. Giá trị rỗng cho tới khi tài liệu được lưu ít nhất một lần với site xác định được.

## Menu

`menus` có một tài liệu cho mỗi `location` mỗi site: `PRIMARY`, `SECONDARY_MENU`, `MOBILE_MENU`, `FOOTER_MENU`, `LOGGEDIN_ACCOUNT_MENU`. Lưu trữ là trường `tree`, nhưng REST **không bao giờ trả `tree`** mà trả `items` đã chiếu theo ngôn ngữ; mỗi mục có `label`, `url` (= `path` = `uri`), `order`, `parentId`, `children` (= `childItems.nodes`). Lồng tối đa 10 cấp; `label` rơi về ngôn ngữ kia rồi về id nút nên không bao giờ rỗng.

```bash
curl -s 'https://cms.example.com/api/menus?where[tenant][equals]=1&where[location][equals]=PRIMARY&locale=vi&limit=1'
```

## Bình luận, đánh giá, chuyển hướng

- **Đọc bình luận**: `GET /api/comments?where[tenant][equals]=1&where[post][equals]=42` chỉ trả bình luận đã duyệt; `authorEmail` không bao giờ trả về.
- **Gửi bình luận**: dùng `POST /api/comments/create` (không `POST /api/comments`) với `postId` hoặc `productId`, `authorName`, `content`, `tenantSiteKey` (phải trùng site của tài liệu, nếu không 403). Luôn tạo ở trạng thái `pending`; nếu đặt `RECAPTCHA_SECRET` và gửi token thì CMS xác minh với Google nhưng chỉ **ghi log**, không chặn; endpoint không có giới hạn theo IP nên kiểm duyệt là kiểm soát spam chính. `MODERATION_WEBHOOK_URL` gửi `{ "text": "…" }` cho mỗi bình luận chờ duyệt.
- **Đánh giá sao**: `POST /api/ratings/submit` với `collection` (`posts`/`products`), `id`, `rating` 1–5, `tenantSiteKey`; mỗi IP một phiếu (chỉ lưu băm SHA-256 của IP).
- **Chuyển hướng**: `GET /api/redirects?where[tenant][equals]=1&where[isEnabled][equals]=true&limit=1000&depth=0`; các trường `from`, `to`, `statusCode` (`'301'`/`'302'`, chuỗi), `isEnabled`. CMS tự tạo 301 khi slug đổi. Hãy áp danh sách trong middleware frontend và giới hạn số lần nhảy.

## Webhook revalidate

Khi nội dung đổi, CMS báo frontend làm mới cache. Đây là webhook **frontend của bạn phải tự cung cấp**:

```http
POST https://{Sites.domain}/api/cms/revalidate
Content-Type: application/json

{ "collection": "posts", "id": "42", "slug": "hello-world" }
```

- Job `revalidateFrontend` gửi sau khi lưu/xoá `pages`, `posts`, `products`, `landings`, `taxonomies`, `faqs`, `shortcodes`, `menus`, `authors`, sau khi đổi cài đặt site, và khi một bình luận trên bài được duyệt (hoặc bị bỏ duyệt). Đổi slug gửi thêm request thứ hai cho slug cũ. Collection không có slug (`menus`, `faqs`) gửi `id` làm `slug` — coi đó là "làm mới cả site".
- URL luôn là `https://` + trường `domain` của site; site không có `domain` thì không làm gì.
- Timeout 5 giây; mọi phản hồi không phải 2xx hoặc lỗi mạng làm job thất bại và được thử lại 3 lần theo backoff luỹ thừa bắt đầu từ 1 giây.
- Nếu đặt biến `REVALIDATE_SECRET`, mọi ping mang header `x-revalidate-secret: <giá trị>` để frontend từ chối ping lạ; không đặt thì ping không xác thực — hãy viết handler idempotent và nhẹ.
- Cần `ENABLE_JOBS_AUTORUN=true` trên **đúng một instance** (runner chạy mỗi 10 giây, tối đa 25 job mỗi lượt); không có nó job được xếp nhưng không bao giờ chạy.
- Biên tập viên cũng bấm tay được từ trình soạn thảo (`POST /api/revalidate-frontend`, cần đăng nhập).
- Cache chỉ làm mới khi **lưu**, không theo đồng hồ: bài hẹn giờ hiển thị ở request đầu tiên sau giờ đăng nhưng cache frontend không tự làm mới.

### Ví dụ tích hợp Next.js (App Router)

Ví dụ minh hoạ — không phải mã có sẵn trong repo KDIGI CMS:

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
  // menus/faqs gửi id làm slug → làm mới toàn site
  if (collection === 'menus' || collection === 'faqs') {
    revalidatePath('/', 'layout')
  } else if (slug) {
    revalidatePath(`/${slug}`)
    revalidatePath('/blog')
  }
  return NextResponse.json({ ok: true })
}
```

```tsx
// app/[slug]/page.tsx (rút gọn)
const CMS = 'https://cms.example.com'
const TENANT = '1'

async function getPage(slug: string) {
  const qs = new URLSearchParams({
    'where[tenant][equals]': TENANT,
    'where[slug][equals]': slug,
    limit: '1',
    depth: '2',
  })
  const res = await fetch(`${CMS}/api/pages?${qs}`, { next: { tags: ['cms'] } })
  const { docs } = await res.json()
  return docs[0] ?? null
}
// render: <article dangerouslySetInnerHTML={{ __html: page.content }} />
// JSON-LD: <div dangerouslySetInnerHTML={{ __html: page.seo?.jsonLd?.raw ?? '' }} />
```

Handler đứng ở tên miền của site (trường `domain`), không phải tên miền CMS.

## Trang theo khoá hệ thống và liên kết "xem trên site"

`GET /api/sites/:siteKey/env-page?key=FRONT_PAGE` trả tài liệu `pages` mà `pageGroup` của site ánh xạ tới khoá đó (`FRONT_PAGE`, `BLOG`, `PROFILE`, `CONTACT`, `ABOUT`, `SEARCH`, `SIGN_IN`, `SIGN_UP`, `FORGOT_PASSWORD`, `CONFIRM_EMAIL`, `PASSWORD_CHANGE`, `TERM_CONDITION`, `PRIVACY_POLICY`). Phản hồi là `null` với site, khoá hoặc trang không tồn tại; `400` nếu thiếu `key`.

Nút "xem trên site" trong trình soạn thảo dùng `GET /api/frontend-doc-url` (cần đăng nhập): đường dẫn được dựng bởi hàm `publicPathFor` — `/product/{slug}` cho `products`, `/{slug}` cho `posts`, `pages`, `landings`. Nếu frontend bạn dùng route khác, chỉ cần sửa hàm đó.

## GraphQL

`POST /api/graphql` phơi cùng collection và cùng quy tắc truy cập. Production tắt playground và giới hạn độ phức tạp truy vấn ở 500.

```bash
curl -s https://cms.example.com/api/graphql \
  -H 'Content-Type: application/json' \
  -d '{"query":"{ Posts(where: { tenant: { equals: 1 } }, limit: 5) { docs { title slug contentMd } } }"}'
```

Vì hook Markdown, menu và OG chỉ chạy trên REST, GraphQL trả dạng thô:

| Trường | GraphQL | REST |
| --- | --- | --- |
| `content`, `notice`, `body` | JSON rich-text cũ (ẩn) | HTML |
| `contentMd`, `noticeMd`, `bodyMd` | Markdown nguồn — tự render | Markdown nguồn |
| `menus.tree` | JSON cây chuẩn | không trả |
| `menus.items` | mảng cũ đã lưu | chiếu từ cây |
| `seo.openGraph.image` | giá trị đã lưu | có dự phòng ảnh đại diện / mặc định site |

Shortcode **không** được mở rộng qua GraphQL; hãy dùng REST khi cần render trang.

## Xác thực và API key

Đọc nội dung đã xuất bản không cần đăng nhập. Để đọc bản nháp hoặc ghi, tạo API key trong hồ sơ người dùng ở trang quản trị:

```bash
curl -H 'Authorization: users API-Key <api-key>' \
  'https://cms.example.com/api/posts?where[tenant][equals]=1&where[status][equals]=draft'
```

Key xác thực như người sở hữu nó và chịu cùng quy tắc vai trò, cùng phạm vi site ([phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung)).

## Kiểm tra sức khoẻ

`GET /api/health` trả `200 {"status":"ok"}` mà không truy vấn database, nên vẫn xanh khi đang restore hay migrate — phù hợp làm healthcheck cho [môi trường tự host](/tu-host).

## Thực hành tốt

- Cache `siteId` và cấu hình site ở phía frontend; không tra lại mỗi request.
- Dùng `select` và `depth=1` cho trang danh sách để giữ payload nhỏ.
- Dùng `seo.jsonLd.raw` nguyên văn thay vì tự dựng lại.
- Chỉ gọi API công khai bằng request không xác thực; đừng để API key lọt vào bundle trình duyệt.
- Xem mô hình dữ liệu ở [nội dung và cấu trúc](/tinh-nang/noi-dung-va-cau-truc).

Tài liệu đầy đủ: [REST và GraphQL trên docs.opencms.kdigi.vn](https://docs.opencms.kdigi.vn/api/rest-graphql/) và [REST API reference](https://docs.opencms.kdigi.vn/en/tham-khao/rest-api/) (tiếng Anh).
