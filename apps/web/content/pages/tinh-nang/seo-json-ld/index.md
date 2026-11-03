---
title: "SEO và JSON-LD tích hợp sẵn trong KDIGI CMS"
description: "Trường SEO, mẫu title kiểu RankMath, đồ thị JSON-LD, ảnh OG dự phòng, kiểm tra SEO, gợi ý internal link và AI SEO tùy chọn ngay trong trình soạn thảo."
h1: "SEO on-page và JSON-LD tự động trong KDIGI CMS"
navTitle: "SEO và JSON-LD"
primaryKeyword: "json-ld"
updated: 2026-11-03
heroImage: /images/art/tinh-nang-seo-json-ld-hero.webp
heroAlt: "Kính lúp kính mờ cạnh biểu đồ cột và đồ thị nút, đại diện cho SEO và JSON-LD"
schema: WebPage
faq:
  - q: "KDIGI CMS xử lý SEO như thế nào?"
    a: "KDIGI CMS dùng mô hình mẫu giống Rank Math: tiêu đề và mô tả là mẫu có biến, giải quyết lúc render chứ không lưu cứng. CMS lưu những gì editor nhập, tự sinh breadcrumb và đồ thị JSON-LD khi lưu, kèm công cụ chấm điểm, kiểm tra SEO và gợi ý liên kết nội bộ."
  - q: "JSON-LD được tạo tự động hay phải viết tay?"
    a: "Tự động. Mỗi lần lưu trang, bài viết, sản phẩm, landing hoặc taxonomy, CMS dựng một đồ thị schema.org với @id ổn định và lưu vào seo.jsonLd.raw dưới dạng thẻ script hoàn chỉnh. Frontend chỉ cần chèn nguyên văn thẻ này vào trang, mọi dấu < trong dữ liệu đã được escape."
  - q: "Vì sao trường seo.title trong API thường để trống?"
    a: "Đó là thiết kế, không phải thiếu dữ liệu. Trường rỗng nghĩa là dùng mẫu của site. Nhờ đó khi bạn đổi mẫu trong cấu hình site, mọi tài liệu chưa ghi đè sẽ đổi theo ngay, không cần lưu lại hay nhập lại. Đừng viết script điền sẵn seo.title cho hàng loạt bài vì sẽ làm đóng băng giá trị."
  - q: "Có bắt buộc dùng AI để viết SEO không?"
    a: "Không. AI SEO là tùy chọn, chỉ bật khi đặt DEEPSEEK_API_KEY và DEEPSEEK_MODEL. Nó gợi ý tiêu đề, mô tả, alt ảnh hoặc câu hỏi FAQ cho một trường mỗi lần. Khi thiếu khóa, endpoint trả lỗi 502 và mọi tính năng SEO khác vẫn hoạt động bình thường."
  - q: "Đổi slug có làm mất thứ hạng không?"
    a: "KDIGI CMS giảm rủi ro này: khi đổi slug của tài liệu đã có, hệ thống tự tạo redirect 301 từ đường dẫn cũ sang mới và xếp job làm mới cache cho slug cũ. Việc này không chặn thao tác lưu. Script đổi slug ngoài trang quản trị thì phải tự tạo redirect."
related:
  - /tinh-nang/trinh-soan-thao-markdown
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/headless-api
  - /thuc-hanh-tot/seo-onpage
  - /so-sanh/kdigi-cms-vs-wordpress
docs: https://docs.opencms.kdigi.vn/huong-dan/seo-json-ld/
---

KDIGI CMS tích hợp SEO ngay trong lõi: tiêu đề và mô tả là mẫu có biến theo từng loại nội dung (kiểu Rank Math), đồ thị JSON-LD schema.org được tự sinh khi lưu và lưu sẵn trong `seo.jsonLd.raw`, kèm Open Graph có fallback, kiểm tra SEO, gợi ý liên kết nội bộ và AI SEO tùy chọn.

> **Tóm tắt nhanh**
>
> - **Ba tầng:** mẫu theo site (`Sites.seoTitles`) → ghi đè từng tài liệu (`seo.title`, `seo.description`) → frontend giải quyết khi render.
> - **JSON-LD `@graph`** sinh khi lưu cho `pages`, `posts`, `products`, `landings`, `taxonomies`; lưu ở `seo.jsonLd.raw`.
> - **Open Graph fallback:** `seo.openGraph.image` → `featuredImage` → `Sites.seoDefaults.ogImage`.
> - **Công cụ:** điểm SEO 0–100, `GET /api/seo/audit`, `GET /api/seo/internal-link-suggest`.
> - **Redirect 301 tự động** khi đổi slug. **AI SEO** (DeepSeek) là tùy chọn.

## Mô hình SEO: mẫu thay vì giá trị lưu cứng

Mô hình mượn từ Rank Math: **tiêu đề và mô tả là mẫu được giải quyết lúc render, không được lưu**. CMS lưu những gì editor gõ, sinh breadcrumb và đồ thị JSON-LD khi lưu, còn phần còn lại là việc của frontend. Hook `makeApplySeoTemplatesHook` chạy mỗi lần lưu `pages`, `posts`, `products`, `landings` và `taxonomies` nhưng chỉ ghi `seo.breadcrumbs`.

| Tầng | Ở đâu | Ai viết |
| --- | --- | --- |
| 1. Mẫu của site | `Sites.seoTitles.<nhóm>.{titleTemplate, descriptionTemplate}` và `Sites.seoTitles.separator` | Admin, một lần cho mỗi site |
| 2. Ghi đè từng tài liệu | `seo.title` / `seo.description` | Biên tập viên. **Để trống = dùng mẫu** |
| 3. Giải quyết | Frontend, lúc render | Frontend của bạn, theo cùng quy tắc |

Hệ quả thực tế: `seo.title` trống trong API là **đúng**, không phải thiếu dữ liệu; đổi mẫu của site có hiệu lực ngay với mọi tài liệu chưa ghi đè, không cần lưu lại hay nhập lại.

### Chuỗi ưu tiên khi render

```
title               = seo.title           || template(titleTemplate)       || doc title
description         = seo.description     || template(descriptionTemplate) || excerpt
og:title            = seo.openGraph.title || title
og:description      = seo.openGraph.description || description
twitter:title       = seo.openGraph.twitterMeta.title || (useFacebookData ? og:title : '')
twitter:description = seo.openGraph.twitterMeta.description || (useFacebookData ? og:description : '')
```

`useFacebookData` mặc định là `true`. Bản tham chiếu nằm ở `resolveSeoFields` (`src/hooks/apply-seo-templates.ts`) và `resolveSeoTemplate` (`src/lib/seo/resolve-variables.ts`).

### Mẫu tiêu đề và biến

`Sites.seoTitles` có `separator` (một trong `|`, `-`, `·`, `»`, `~`, `—`; mặc định `|`) và sáu nhóm, mỗi nhóm có `titleTemplate` và `descriptionTemplate`:

| Nhóm | Tiêu đề mặc định | Mô tả mặc định | Áp dụng cho |
| --- | --- | --- | --- |
| `homepage` | `%sitename%` | `%excerpt%` | Trang chủ |
| `posts` | `%title% %sep% %sitename%` | `%excerpt%` | Bài viết |
| `pages` | `%title% %sep% %sitename%` | `%excerpt%` | Trang |
| `products` | `%title% %sep% %sitename%` | `%excerpt%` | Sản phẩm |
| `landings` | `%title% %sep% %sitename%` | `%excerpt%` | Landing |
| `taxonomies` | `%term% %sep% %sitename%` | `%excerpt%` | Chuyên mục, thẻ |

Biến (không phân biệt hoa thường; biến lạ hoặc rỗng bị bỏ và dấu phân cách thừa được dọn):

| Biến | Giá trị |
| --- | --- |
| `%title%` | Tiêu đề tài liệu |
| `%sitename%` | `knowledgeGraph.name` → `manifest.name` → `domain` |
| `%sep%` | Dấu phân cách của site |
| `%excerpt%` | Đoạn tóm tắt, đã bỏ HTML |
| `%category%`, `%focuskw%` | Chuyên mục đầu tiên; từ khóa chính đầu tiên |
| `%pt_single%`, `%pt_plural%` | Nhãn loại nội dung |
| `%date%`, `%modified%` | Ngày đăng / sửa dạng `YYYY-MM-DD` |
| `%term%`, `%currentyear%`, `%price%` | Tên thuật ngữ; năm hiện tại; giá khi bên gọi cung cấp |

![Tab SEO của một site: ảnh Open Graph mặc định và danh tính Knowledge Graph](/images/shots/site-seo.webp)

## Nhóm trường `seo` trên mỗi tài liệu

Nhóm trường `seo` được định nghĩa một lần ở `src/fields/seo-field-group.ts` và dùng lại cho `pages`, `posts`, `products`, `landings` và `taxonomies`. Đường dẫn trường là **hợp đồng với frontend**: đổi tên một trường hay đổi hình dạng `jsonLd` sẽ phá mọi nơi tiêu thụ.

| Đường dẫn | Ghi chú |
| --- | --- |
| `seo.title`, `seo.description` | Địa hóa; trống nghĩa là dùng mẫu |
| `seo.focusKeywords` | Nhiều giá trị; từ khóa đầu tiên quyết định điểm |
| `seo.openGraph.{title, description, imageAlt, image}` | Ảnh được điền lúc đọc khi trống |
| `seo.openGraph.twitterMeta.{useFacebookData, card, title, description, image}` | Nằm **trong** `openGraph`; `card` là `summary` hoặc `summary_large_image` (mặc định) |
| `seo.breadcrumbs[]` | `{ url, text, isHidden }`, tự sinh |
| `seo.canonicalOverride` | Cũng là URL của `WebPage` trong JSON-LD |
| `seo.robots` | Mặc định `index`, `follow`; hỗ trợ thêm `max-snippet:-1`, `max-image-preview:large`, `max-video-preview:-1` |
| `seo.articleMeta.{publishedTime, modifiedTime}`, `seo.updatedTime` | Ẩn; do hook JSON-LD ghi |
| `seo.jsonLd.raw` | Chỉ đọc; thẻ `<script type="application/ld+json">` hoàn chỉnh |

## Breadcrumb tự sinh

`seo.breadcrumbs` chỉ được sinh khi rỗng, nên breadcrumb do editor nhập hay đã nhập từ WordPress không bao giờ bị ghi đè. Chuỗi là `[tên site] + [thuật ngữ chính và chuỗi cha] + [tài liệu hiện tại]`; URL đầu là `https://{domain}`. Taxonomy làm mục giữa được chọn trong `Sites.breadcrumbs`: `primaryTaxonomyPost` mặc định là `category`, `primaryTaxonomyProduct` mặc định `product-category` (tùy chọn `none`, `product-category`, `category`, `tag`). Chỉ `posts` và `products` có mục giữa.

## JSON-LD: đồ thị schema.org tự sinh

Hook `makeGenerateJsonLdHook` chạy `afterChange` trên năm collection, dựng một `@graph` duy nhất và lưu vào `seo.jsonLd.raw`. Hook cập nhật bốn cột vô hướng (`seo.jsonLd.raw`, `articleMeta.publishedTime`, `articleMeta.modifiedTime`, `updatedTime`) bằng một câu `UPDATE` tham số hóa nên **không tạo thêm dòng phiên bản** và không đụng tới locale còn lại.

`seo.jsonLd.raw` là nguyên thẻ `<script type="application/ld+json">…</script>` để frontend chèn nguyên văn. Mọi ký tự `<` trong dữ liệu được escape thành `\u003c`, nên chuỗi `</script>` trong tiêu đề không thể thoát khỏi thẻ.

### Đồ thị gồm những node nào

Mọi node dùng `@id` ổn định: `{siteUrl}/#organization`, `{siteUrl}/#website`, `{pageUrl}#webpage`, `{pageUrl}#breadcrumb`.

| Loại tài liệu | Các node |
| --- | --- |
| `posts` | `BlogPosting`, `Person` (tác giả), `WebPage`, `ImageObject`, `BreadcrumbList`, `WebSite`, `Organization`, `Place`; FAQ của bài lồng trong `BlogPosting` qua `subjectOf` |
| `pages` | `WebPage` (`ContactPage` cho slug `lien-he`, `contact`, `contact-us`; `AboutPage` cho `gioi-thieu`, `about`, `about-us`), `ImageObject`, `BreadcrumbList`, `FAQPage` riêng, node site, cùng một `LocalBusiness` cho mỗi mục trong `additionalOffices[]` |
| `products` | `Product` (kèm `Offer`, tùy chọn `AggregateRating`), `ItemPage`, `ImageObject`, `BreadcrumbList`, `FAQPage`, node site |
| `landings` | Cùng bộ lắp ráp với sản phẩm |
| `taxonomies` | `CollectionPage`, `ImageObject`, `BreadcrumbList`, node site |

### Danh tính tổ chức từ cấu hình site

Node `Organization` lấy dữ liệu từ `Sites.knowledgeGraph`, các trường trống mới dùng giá trị dự phòng từ manifest, thương hiệu hoặc liên hệ:

| JSON-LD | Nguồn |
| --- | --- |
| Tên, tên pháp lý, mô tả | `knowledgeGraph.name`, `.legalName`, `.description` (tên dự phòng `manifest.name`, rồi domain) |
| Loại bổ sung trước `Organization` | `businessType`: `Organization`, `LocalBusiness`, `ProfessionalService`, `Store`, `Restaurant` |
| Logo | `knowledgeGraph.logo`, nếu trống thì `branding.logo` |
| Điện thoại | `telephoneE164` (tự chuẩn hóa khi lưu) |
| Địa chỉ, tọa độ, giờ mở cửa | `address`, `geo`, `openingHours[]` (xuất ra `OpeningHoursSpecification`) |
| `sameAs` | `Sites.socialProfiles[].url`, cộng `wikidataId`, `wikipediaUrl`, `youtubeChannelUrl`, `tiktokUrl` |
| `SearchAction` của `WebSite` | `knowledgeGraph.searchActionUrl` |

Nếu không tải được site, hook bỏ qua việc lưu thay vì xóa đồ thị đang có.

### Quy tắc cho sản phẩm

- `offers` chỉ xuất khi `prices[0].currentPrice > 0`; giá thiếu hoặc bằng 0 thì không có offer, nghĩa là không bao giờ có offer "miễn phí" giả.
- `aggregateRating` chỉ xuất khi điểm chưa hoàn hảo (`avg < 5`) **và** có bật `aggregateRatingOverride`, hoặc có `count >= minReviewsForAggregate` (mặc định 10) cùng ít nhất một bình luận cục bộ đã duyệt. Điểm sao nhập từ nơi khác một mình không tạo ra nó.
- Mục `FAQPage` cần đủ câu hỏi và câu trả lời; mục thiếu bị loại, hết mục thì bỏ cả node.
- `priceCurrency` lấy từ dòng giá đầu tiên (mặc định `VND`).

Frontend chèn thẻ JSON-LD như sau (ví dụ Next.js):

```tsx
<div dangerouslySetInnerHTML={{ __html: post.seo.jsonLd.raw }} />
```

Giá trị này do CMS sinh và đã escape, nên không dùng dữ liệu người dùng chưa kiểm tra để nối chuỗi vào đó.

## Ảnh Open Graph: chuỗi dự phòng

Thứ tự: `seo.openGraph.image` → `featuredImage` của tài liệu → `Sites.seoDefaults.ogImage`. Hook `makeResolveOgImageFallbackHook` chỉ chạy lúc đọc qua REST và **không ghi giá trị dự phòng ngược lại**, nên kết quả luôn theo ảnh đại diện hiện tại. Taxonomy không có `featuredImage` nên rơi thẳng về ảnh mặc định của site. JSON-LD dùng cùng thứ tự, vì vậy `<meta property="og:image">` và đồ thị luôn khớp nhau.

## Slug và redirect

- `slug` tự sinh từ tiêu đề khi để trống (chữ thường, `đ` → `d`, bỏ dấu, ký tự khác thành `-`). Slug **không địa hóa** và là duy nhất trong từng site giữa các tài liệu chưa bị xóa.
- Khi đổi slug tài liệu đã có, `autoRedirectOnSlugChange` tạo dòng `redirects` (`301`, `isEnabled: true`) từ đường dẫn cũ sang mới: `/{slug}/` cho bài viết, trang, landing; `/product/{slug}/` cho sản phẩm. Hook bỏ qua nếu đã có redirect từ đường dẫn đó, không bao giờ chặn lưu và ghi log khi lỗi.
- Job làm mới cache cũng được xếp cho slug **cũ** để trang cache cũ được dọn.
- Quy tắc redirect: `from` bắt đầu bằng `/`, `to` phải là đường dẫn nội bộ, hai giá trị không được bằng nhau; chuỗi redirect chỉ bị cảnh báo. Frontend của bạn chịu trách nhiệm áp dụng chúng.

## Kiểm tra SEO và chấm điểm

`GET /api/seo/audit` (cần đăng nhập) quét `posts`, `pages`, `products` và `landings` của một site rồi trả về tài liệu thiếu sót, xấu nhất trước. Tham số `tenantId` (chỉ super-admin hoặc thành viên site) và `limit` (mặc định 50, tối đa 200 tài liệu mỗi collection). Phản hồi: `{ tenantId, total, deficient: [{ id, collection, title, score, reasons, adminUrl }] }`.

![Thẻ Kiểm tra SEO trên bảng điều khiển liệt kê tài liệu cần cải thiện](/images/shots/dashboard-seo-audit.webp "Thẻ Kiểm tra SEO trên bảng điều khiển")

Một tài liệu bị coi là thiếu sót khi `seo.title` hoặc `seo.description` **đã lưu** trống, `seo.robots` có `noindex`, hoặc điểm dưới 50. Lý do có thể là `missing-title`, `missing-desc`, `noindex`, `broken-canonical` hoặc `low-score:<n>`. Vì theo mô hình mẫu, tiêu đề thường để trống, hãy hiểu `missing-title` là "chưa có ghi đè", không phải "trang không có tiêu đề". Cùng bộ kiểm tra này cấp dữ liệu cho widget trên bảng điều khiển.

`computeSeoScore` (`src/lib/seo-score.ts`) trả điểm 0–100 và danh sách đèn giao thông:

- từ khóa chính được đặt, có trong tiêu đề, mô tả, slug và 10% đầu nội dung;
- mật độ từ khóa (1–1,5% là tốt);
- tiêu đề ≤ 60 ký tự, mô tả ≤ 160, URL ≤ 75;
- có ít nhất một liên kết nội bộ Markdown;
- ngưỡng độ dài nội dung được điều chỉnh theo âm tiết tiếng Việt.

Điểm chạy trong trình soạn thảo và trong audit, **không được lưu**.

## Gợi ý liên kết nội bộ

`GET /api/seo/internal-link-suggest` (cần đăng nhập) cấp nguồn cho bảng gợi ý trong trình soạn thảo. Tham số bắt buộc `docId` và `collection`; `keyword` (ưu tiên) hoặc `title` làm nguồn token; `limit` mặc định 5, tối đa 10. Hệ thống tách từ khóa, chuyển chữ thường, bỏ dấu, giữ token từ 3 ký tự, rồi chấm điểm tối đa 100 tài liệu gần đây mỗi collection của site người gọi: 2 điểm cho mỗi token khớp tiêu đề, 1 điểm cho mỗi token khớp slug. Kết quả gồm `id`, `collection`, `title`, `slug`, `score`, `adminUrl` và `frontendSlug`. Truy vấn chạy bằng quyền của chính người gọi. Bạn cũng có thể chèn liên kết bằng `@` trong [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown).

![Tab SEO của bài viết với gợi ý liên kết nội bộ và bảng điểm SEO](/images/shots/internal-links.webp "Gợi ý liên kết nội bộ và điểm SEO trong tab SEO của bài viết")

## AI SEO (tùy chọn)

`POST /api/seo/ai-generate` (cần đăng nhập) trả gợi ý cho một trường SEO từ API chat tương thích OpenAI.

| Biến môi trường | Ý nghĩa |
| --- | --- |
| `DEEPSEEK_API_KEY` | Khóa API; **bắt buộc để bật** |
| `DEEPSEEK_MODEL` | Mã mô hình; bắt buộc, không có mặc định. `pnpm verify:deepseek` kiểm tra mô hình có trả lời ở chế độ JSON |
| `SEO_AI_RATE_LIMIT` | Số lần gọi mỗi người dùng trong 60 giây, mặc định `20` |

Trường `field` nhận `title`, `description`, `faq` hoặc `alt`; câu lệnh gợi ý viết bằng tiếng Việt và nhắm 40–65 ký tự cho tiêu đề, 100–165 cho mô tả, tối đa 125 cho alt. Khóa API không rời máy chủ. Nút "Tạo FAQ" chỉ xem trước, vì FAQ nằm trong collection riêng. Giới hạn tốc độ là cửa sổ trượt trong bộ nhớ của từng tiến trình, nên không chia sẻ giữa các instance và mất khi khởi động lại. Base URL `https://api.deepseek.com` được viết cứng trong `src/lib/ai/deepseek-client.ts`; dùng nhà cung cấp khác thì sửa tệp đó.

## Ổn định hợp đồng cho website chuyển từ WordPress

Website chuyển từ WordPress thường giữ thứ hạng nhờ markup cũ, nên bề mặt SEO được giữ ổn định: đường dẫn trường `seoFieldGroup`, định dạng `seo.jsonLd.raw`, và các quy tắc cấu trúc (`twitterMeta` trong `openGraph`, `articleMeta` bên cạnh, `breadcrumbs` có `isHidden`). Tùy chọn robots gồm các chỉ thị `max-*` của Rank Math để giá trị nhập vào mang sang nguyên vẹn, và đồ thị có node `Place` cùng `LocalBusiness` theo từng văn phòng. Hãy coi mọi thay đổi ở đây là thay đổi API gây phá vỡ. Xem [chuyển từ WordPress](/chuyen-tu-wordpress).

## Quy trình SEO đề xuất cho một site mới

1. Điền `knowledgeGraph`, `socialProfiles` và `seoDefaults.ogImage` ở tab **Trang & SEO** của site, xem [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website).
2. Đặt mẫu trong `seoTitles` cho từng nhóm, giữ tiêu đề ≤ 60 ký tự.
3. Với mỗi bài, nhập từ khóa chính ở `seo.focusKeywords` và theo dõi điểm trong trình soạn thảo.
4. Chèn liên kết nội bộ bằng `@` hoặc bảng gợi ý.
5. Chèn thẻ `seo.jsonLd.raw` ở frontend và kiểm tra bằng công cụ kiểm thử dữ liệu có cấu trúc của bạn.
6. Chạy `GET /api/seo/audit` định kỳ để tìm tài liệu `noindex` hay canonical hỏng.

Thêm hướng dẫn thực hành tại [SEO on-page với KDIGI CMS](/thuc-hanh-tot/seo-onpage) và [thực hành tốt](/thuc-hanh-tot); nếu đang cân nhắc rời WordPress, xem [so sánh KDIGI CMS và WordPress](/so-sanh/kdigi-cms-vs-wordpress). Tài liệu kỹ thuật: [SEO và JSON-LD](https://docs.opencms.kdigi.vn/huong-dan/seo-json-ld/). Xem toàn bộ [tính năng KDIGI CMS](/tinh-nang).
