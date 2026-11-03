---
title: "SEO on-page với KDIGI CMS: checklist từng bước"
description: "Checklist SEO on-page thực hành trong KDIGI CMS: title, meta description, heading, canonical, internal link, JSON-LD, sitemap và kiểm tra SEO có sẵn."
h1: "SEO on-page với KDIGI CMS: checklist từng bước"
primaryKeyword: "seo onpage"
updated: 2026-11-03
heroImage: /images/shots/seo.webp
heroAlt: "Tab SEO của một bài viết trong KDIGI CMS với trường tiêu đề, mô tả, từ khóa chính và bảng chấm điểm SEO"
schema: TechArticle
faq:
  - q: "Vì sao seo.title của bài viết trong API thường để trống?"
    a: "KDIGI CMS dùng mô hình mẫu kiểu Rank Math: tiêu đề và mô tả là mẫu được ghép lúc hiển thị, không lưu cứng. Trường seo.title trống nghĩa là dùng mẫu của site (Sites.seoTitles). Nhờ vậy đổi mẫu một lần là mọi tài liệu chưa ghi đè đều cập nhật ngay, không cần lưu lại từng bài."
  - q: "Điểm SEO trong editor có được lưu vào database không?"
    a: "Không. Điểm SEO (0–100) được tính bằng computeSeoScore ở trình soạn thảo và ở công cụ audit, rồi bỏ đi, không lưu. Điểm chỉ là checklist đèn giao thông: từ khóa chính trong tiêu đề, mô tả, slug, 10% đầu bài, mật độ 1–1,5%, độ dài tiêu đề, mô tả, URL và liên kết nội bộ."
  - q: "Đổi slug bài viết có làm mất thứ hạng không?"
    a: "KDIGI CMS tự tạo redirect 301 từ đường dẫn cũ sang đường dẫn mới khi bạn đổi slug ở bài viết, trang, sản phẩm hoặc landing. Frontend của bạn phải áp danh sách redirect (lấy từ /api/redirects) trong middleware. Script đổi slug ngoài admin thì phải tự tạo redirect."
  - q: "JSON-LD của KDIGI CMS có cần plugin hay code thêm không?"
    a: "Không cần plugin. CMS tự dựng một @graph schema.org mỗi khi lưu và để sẵn ở seo.jsonLd.raw dưới dạng thẻ script hoàn chỉnh. Frontend chỉ việc chèn nguyên văn vào head. Muốn đầy đủ Organization, LocalBusiness hay sameAs thì điền knowledgeGraph và socialProfiles của site."
  - q: "Có bắt buộc dùng AI để viết tiêu đề và mô tả không?"
    a: "Không. AI SEO là tùy chọn, chỉ bật khi đặt DEEPSEEK_API_KEY và DEEPSEEK_MODEL. Không có khóa thì nút AI vẫn hiện nhưng trả lỗi, các tính năng khác không bị ảnh hưởng. Bạn luôn có thể gõ tiêu đề và mô tả thủ công hoặc để mẫu của site tự điền."
related:
  - /tinh-nang/seo-json-ld
  - /tinh-nang/noi-dung-va-cau-truc
  - /thuc-hanh-tot/cau-truc-noi-dung
  - /chuyen-tu-wordpress
  - /thuc-hanh-tot/hieu-nang-va-cache
docs: https://docs.opencms.kdigi.vn/huong-dan/seo-json-ld/
---

SEO on-page với KDIGI CMS gồm bốn việc: đặt mẫu tiêu đề/mô tả một lần cho cả site, nhập từ khóa chính và ghi đè khi cần cho từng tài liệu, điền `knowledgeGraph` để JSON-LD đầy đủ, rồi chạy SEO audit định kỳ. Phần còn lại — breadcrumb, JSON-LD, redirect khi đổi slug — CMS tự làm khi bạn lưu.

> **Tóm tắt nhanh**
> - Tiêu đề và mô tả là **mẫu** (`Sites.seoTitles`), ghép lúc render; `seo.title` trống là đúng thiết kế.
> - Mỗi lần lưu `pages`, `posts`, `products`, `landings`, `taxonomies`, CMS dựng một `@graph` JSON-LD vào `seo.jsonLd.raw`.
> - Ảnh Open Graph đi theo thứ tự: ảnh OG riêng → ảnh đại diện → ảnh mặc định của site.
> - Đổi slug tự sinh redirect 301 (kèm cảnh báo chuỗi redirect).
> - `GET /api/seo/audit` liệt kê tài liệu thiếu tiêu đề/mô tả, bị `noindex` hoặc điểm dưới 50.
> - AI SEO (DeepSeek) là tùy chọn, bật bằng hai biến môi trường.

![Tab Trang và SEO của site trong KDIGI CMS với mẫu tiêu đề](/images/shots/site-seo.webp "Mẫu tiêu đề và mô tả cấu hình một lần ở tab Trang & SEO của site")

## 1. Đặt mẫu tiêu đề và mô tả cho cả site

Mô hình của KDIGI CMS mượn từ Rank Math: **CMS lưu những gì biên tập viên gõ, phần còn lại là mẫu**. Mẫu nằm ở `Sites.seoTitles` (tab *Trang & SEO* của site), gồm một `separator` và sáu nhóm: `homepage`, `posts`, `pages`, `products`, `landings`, `taxonomies`, mỗi nhóm có `titleTemplate` và `descriptionTemplate`.

Mặc định:

| Nhóm | Mẫu tiêu đề | Mẫu mô tả |
| --- | --- | --- |
| `homepage` | `%sitename%` | `%excerpt%` |
| `posts`, `pages`, `products`, `landings` | `%title% %sep% %sitename%` | `%excerpt%` |
| `taxonomies` | `%term% %sep% %sitename%` | `%excerpt%` |

Biến hỗ trợ: `%title%`, `%sitename%`, `%sep%`, `%excerpt%`, `%category%`, `%focuskw%`, `%date%`, `%modified%`, `%term%`, `%currentyear%`, `%price%`… Biến trống hoặc không biết sẽ bị bỏ, dấu phân cách thừa được dọn.

Thứ tự phân giải ở frontend:

```text
title       = seo.title       || template(titleTemplate)       || tiêu đề tài liệu
description = seo.description || template(descriptionTemplate) || excerpt
og:title    = seo.openGraph.title || title
```

**Việc nên làm:**

1. Giữ tiêu đề trong khoảng 40–60 ký tự: với mẫu `%title% | %sitename%`, tên site dài sẽ ăn mất ngân sách ký tự — hãy rút gọn `knowledgeGraph.name` hoặc đổi `separator`.
2. Chỉ ghi đè `seo.title` ở những trang quan trọng (trang chủ, trang dịch vụ, bài trụ cột).
3. **Đừng viết script “điền seo.title cho mọi bài”**: nó đóng băng giá trị lẽ ra phải đi theo mẫu.

Lưu ý: trường `seo.title` trống sẽ khiến SEO audit báo `missing-title`. Hãy đọc là “chưa ghi đè”, không phải “trang không có title”.

## 2. Từ khóa chính, slug và độ dài

Mỗi tài liệu có `seo.focusKeywords`; từ khóa đầu tiên quyết định điểm SEO. Bảng chấm điểm trong editor kiểm tra:

| Tiêu chí | Ngưỡng tốt |
| --- | --- |
| Từ khóa chính trong tiêu đề, mô tả, slug | Có |
| Từ khóa trong 10% đầu nội dung | Có |
| Mật độ từ khóa | 1–1,5% |
| Độ dài tiêu đề / mô tả / URL | ≤ 60 / ≤ 160 / ≤ 75 ký tự |
| Liên kết nội bộ | Ít nhất một liên kết Markdown |
| Độ dài nội dung | Có bậc, hiệu chỉnh theo âm tiết tiếng Việt |

Slug tự sinh từ tiêu đề (bỏ dấu, `đ` → `d`, ký tự lạ → `-`), **không dịch theo ngôn ngữ** và duy nhất trong từng site. Hãy chốt slug ngắn, có từ khóa, trước khi đăng.

## 3. Open Graph và Twitter Card

Trường `seo.openGraph.*` có tiêu đề, mô tả, ảnh, alt. Ảnh được điền lúc đọc qua REST theo thứ tự: `seo.openGraph.image` → `featuredImage` của tài liệu → `Sites.seoDefaults.ogImage`. Giá trị này **không ghi ngược** vào database nên luôn theo ảnh đại diện hiện tại. `twitterMeta.card` mặc định là `summary_large_image`, và `useFacebookData` mặc định bật để Twitter dùng lại dữ liệu Open Graph.

Thực hành tốt: đặt `seoDefaults.ogImage` cho mọi site ngay từ đầu để không bài nào chia sẻ ra mạng xã hội mà thiếu ảnh.

## 4. JSON-LD và dữ liệu có cấu trúc

Hook `makeGenerateJsonLdHook` chạy sau mỗi lần lưu và ghi `seo.jsonLd.raw` — một thẻ `<script type="application/ld+json">` hoàn chỉnh chứa một `@graph`. Mọi ký tự `<` bên trong được escape thành `\u003c` nên tiêu đề chứa `</script>` không phá được thẻ.

| Loại tài liệu | Các node chính |
| --- | --- |
| Bài viết | `BlogPosting`, `Person`, `WebPage`, `ImageObject`, `BreadcrumbList`, `WebSite`, `Organization`; FAQ lồng trong `BlogPosting` |
| Trang | `WebPage` (`ContactPage`/`AboutPage` cho slug quen thuộc), `FAQPage`, `BreadcrumbList` |
| Sản phẩm / landing | `Product` + `Offer`, `ItemPage`, `FAQPage` |
| Chuyên mục/thẻ | `CollectionPage`, `BreadcrumbList` |

Để node `Organization` có giá trị, hãy điền ở site: `knowledgeGraph` (tên, logo, `businessType`, địa chỉ, giờ mở cửa, `telephone` được chuẩn hóa E.164) và `socialProfiles[]` cho `sameAs`. Frontend chỉ cần chèn nguyên văn:

```tsx
const jsonLd = post.seo?.jsonLd?.raw // đã gồm cả thẻ <script>
// <div dangerouslySetInnerHTML={{ __html: jsonLd ?? '' }} />
```

Giá trị này rỗng cho đến khi tài liệu được lưu ít nhất một lần với site hợp lệ. Quy tắc đáng nhớ với sản phẩm: `offers` chỉ xuất khi `prices[0].currentPrice > 0`, và `aggregateRating` chỉ xuất khi đủ điều kiện (số đánh giá ≥ `minReviewsForAggregate` và có bình luận được duyệt, hoặc bật `aggregateRatingOverride`). Xem thêm tại [tính năng SEO & JSON-LD](/tinh-nang/seo-json-ld).

## 5. Breadcrumb

`seo.breadcrumbs` tự sinh khi lưu **nếu đang trống** (không bao giờ ghi đè breadcrumb do biên tập viên nhập hay nhập từ WordPress). Chuỗi gồm: tên site → chuyên mục chính và chuỗi cha → tài liệu hiện tại. Chọn loại taxonomy làm “mắt xích giữa” ở `Sites.breadcrumbs` (`primaryTaxonomyPost`, mặc định `category`). Chỉ bài viết và sản phẩm có mắt xích giữa; trang và landing phẳng. Frontend bỏ qua các mục có `isHidden: true`.

## 6. Redirect khi đổi slug

Đổi slug của một tài liệu hiện có khiến `autoRedirectOnSlugChange` tạo một dòng `redirects` (301, bật sẵn) từ đường dẫn cũ sang mới, đồng thời đưa một job revalidate cho slug cũ. Quy tắc cần nhớ:

- `from` phải bắt đầu bằng `/`, `to` chỉ nhận đường dẫn nội bộ, `from` khác `to`.
- Chuỗi redirect chỉ bị cảnh báo, không bị chặn: hãy tự giới hạn số bước nhảy ở middleware.
- Script đổi slug **ngoài admin** phải tự tạo redirect.

```bash
curl -s 'https://cms.example.com/api/redirects?where[tenant][equals]=1&where[isEnabled][equals]=true&limit=1000&depth=0'
```

Khi chuyển từ WordPress, permalink cũ được sinh redirect 301 tự động — xem [chuyển từ WordPress](/chuyen-tu-wordpress).

## 7. Liên kết nội bộ

Trong editor, gõ `@` để chèn liên kết đến bài/trang/sản phẩm/landing cùng site (mặc định chỉ liệt kê nội dung đã live). Panel gợi ý (`GET /api/seo/internal-link-suggest`) chấm điểm 2 cho mỗi token khớp tiêu đề, 1 cho mỗi token khớp slug, tối đa 10 gợi ý. Mục tiêu thực tế: mỗi bài có ít nhất 3 liên kết nội bộ có ngữ cảnh, và không có trang “mồ côi”. Cách tổ chức nhóm bài ở [cấu trúc nội dung](/thuc-hanh-tot/cau-truc-noi-dung).

## 8. Chạy SEO audit định kỳ

`GET /api/seo/audit` (cần đăng nhập) quét `posts`, `pages`, `products`, `landings` của một site (tối đa 200 tài liệu/collection mỗi lần) và trả về danh sách tài liệu yếu, tệ nhất trước, cùng `reasons`: `missing-title`, `missing-desc`, `noindex`, `broken-canonical`, `low-score:<n>`. Kết quả hiện luôn trên widget ở dashboard.

![Widget SEO audit trên dashboard KDIGI CMS liệt kê tài liệu cần sửa](/images/shots/dashboard-seo-audit.webp "Widget SEO audit ở dashboard: tài liệu yếu nhất hiện trước")

Quy trình gợi ý mỗi tuần:

1. Mở dashboard, xem widget SEO audit.
2. Với mục `noindex` hoặc `broken-canonical`: sửa ngay (canonical override phải bắt đầu bằng `http`).
3. Với `low-score`: mở tài liệu, làm xanh checklist, ưu tiên bài đang có traffic.
4. Với `missing-title`/`missing-desc` ở trang quan trọng: ghi đè thủ công hoặc dùng AI gợi ý.

## 9. AI SEO (tùy chọn)

Nút AI trong tab SEO gọi `POST /api/seo/ai-generate` (đăng nhập, giới hạn mặc định 20 lần/phút/người) để gợi ý tiêu đề, mô tả, FAQ hoặc alt ảnh bằng DeepSeek. Chỉ bật khi đặt `DEEPSEEK_API_KEY` và `DEEPSEEK_MODEL`; khóa không rời khỏi server. Coi đầu ra là bản nháp: tiêu đề nhắm 40–65 ký tự, mô tả 100–165 ký tự. Nút “Tạo FAQ” chỉ xem trước, vì FAQ nằm ở collection riêng.

## Checklist 12 bước trước khi bấm Đăng

1. Chọn từ khóa chính và nhập vào `seo.focusKeywords` (từ khóa đầu tiên quyết định điểm).
2. Đặt từ khóa chính trong tiêu đề, slug và 10% đầu nội dung.
3. Kiểm tra tiêu đề ≤ 60 ký tự; để mẫu site lo hoặc ghi đè `seo.title` ở trang quan trọng.
4. Viết mô tả ≤ 160 ký tự, nêu lợi ích cụ thể (hoặc để mẫu `%excerpt%` và kiểm tra bản resolve).
5. Dùng một H1 duy nhất (tiêu đề), các mục con bằng H2/H3 theo thứ tự logic.
6. Đặt ảnh đại diện (để OG đúng) và `alt` mô tả cho mọi ảnh.
7. Thêm ít nhất 3 liên kết nội bộ có ngữ cảnh bằng bộ chọn `@` và ít nhất một nguồn ngoài đáng tin nếu có số liệu.
8. Kiểm tra `seo.robots` không dính `noindex` và `canonicalOverride` (nếu dùng) bắt đầu bằng `http`.
9. Điền FAQ (nếu có) và hiển thị chính nội dung đó ra trang, không chỉ trong JSON-LD.
10. Xác nhận `knowledgeGraph` và `socialProfiles` của site đã đầy đủ để graph JSON-LD có `Organization` và `sameAs`.
11. Đăng, rồi mở URL công khai để kiểm tra title, mô tả, canonical, ảnh OG và JSON-LD trong HTML.
12. Một tuần sau: xem widget SEO audit ở dashboard và sửa mọi mục `noindex`, `broken-canonical`, `low-score`.

Sitemap, `robots.txt` và thẻ canonical trong HTML do frontend của bạn xuất ra; CMS cung cấp dữ liệu (`sitemapPriority`, `seo.canonicalOverride`, `seo.robots`) để frontend dựng chúng.

Thử toàn bộ quy trình trên [bản demo](/demo) hoặc [tự host](/tu-host) để làm trên dữ liệu của bạn.
