---
title: "Mô hình nội dung: bài viết, sản phẩm, taxonomy | KDIGI CMS"
description: "Mô hình nội dung gồm trang, bài viết, sản phẩm, landing, taxonomy, tác giả, FAQ, menu dạng cây, redirect, bình luận, đánh giá, phiên bản và thùng rác."
h1: "Nội dung và cấu trúc: trang, bài viết, sản phẩm, taxonomy"
navTitle: "Nội dung và cấu trúc"
primaryKeyword: "mô hình nội dung"
updated: 2026-11-03
heroImage: "/images/art/tinh-nang-noi-dung-va-cau-truc-hero.webp"
heroAlt: "Cây nút đất sét và kính mờ cạnh chồng thẻ nội dung, đại diện cho mô hình nội dung và phân loại"
schema: "TechArticle"
faq:
  - q: "KDIGI CMS có những loại nội dung nào?"
    a: "Bốn loại nội dung chính: pages (trang tĩnh), posts (bài viết, tin, hướng dẫn), products (trang sản phẩm/dịch vụ) và landings (trang marketing dựng bằng block). Kèm theo là taxonomies, authors, menus, faqs, shortcodes, redirects, comments và media, tất cả gắn với một website qua trường tenant."
  - q: "Slug có trùng được giữa các website không?"
    a: "Có. Slug của pages, posts, products và landings là duy nhất theo từng site, đảm bảo bằng chỉ mục duy nhất một phần (tenant, slug) chỉ áp dụng cho bản chưa vào thùng rác. Nhờ đó một slug trong thùng rác có thể được tái sử dụng, còn khi khôi phục vào slug đã bị chiếm thì CMS báo lỗi rõ ràng."
  - q: "Đổi slug có làm mất SEO không?"
    a: "Không, miễn là frontend áp dụng danh sách redirect. Khi slug của pages, posts, products hoặc landings đổi lúc cập nhật, hook autoRedirectOnSlugChange tự tạo một redirect 301 từ đường dẫn cũ sang đường dẫn mới trong cùng site; hook không bao giờ chặn việc lưu."
  - q: "Menu được lưu và trả về như thế nào?"
    a: "Mỗi site có một menu cho mỗi vị trí (PRIMARY, SECONDARY_MENU, MOBILE_MENU, FOOTER_MENU, LOGGEDIN_ACCOUNT_MENU), chỉnh bằng bộ dựng cây kéo thả. Cây lưu ở trường tree; qua REST, CMS không trả tree mà chiếu thành items theo ngôn ngữ yêu cầu, lồng tối đa 10 cấp."
  - q: "Nội dung có đa ngôn ngữ không?"
    a: "Có hai ngôn ngữ nội dung là vi (mặc định) và en, bật fallback: trường thiếu bản en tự lấy bản vi. Tiêu đề, nội dung, tóm tắt, văn bản SEO, câu hỏi FAQ, nhãn menu và nội dung shortcode đều có thể dịch. REST nhận tham số locale."
related:
  - /tinh-nang/quy-trinh-bien-tap
  - /tinh-nang/trinh-soan-thao-markdown
  - /tinh-nang/seo-json-ld
  - /tinh-nang/headless-api
  - /thuc-hanh-tot/cau-truc-noi-dung
docs: "https://docs.opencms.kdigi.vn/en/tham-khao/collections/"
---

KDIGI CMS tổ chức nội dung thành các collection: bốn loại nội dung chính (`pages`, `posts`, `products`, `landings`), nhóm phân loại và điều hướng (`taxonomies`, `menus`, `authors`, `faqs`), và nhóm hỗ trợ (`shortcodes`, `redirects`, `comments`, `media`). Mọi thứ gắn với một website qua trường `tenant`.

> **Tóm tắt nhanh**
> - 4 loại nội dung: **trang**, **bài viết**, **sản phẩm**, **landing** (block); slug duy nhất theo từng site.
> - **Taxonomy** có cây cha-con và 4 loại: `category`, `product-category`, `tag`, `custom`.
> - **Menu** chỉnh bằng cây kéo thả, 5 vị trí, nhãn vi/en.
> - **Phiên bản** (tối đa 30 mỗi tài liệu) và **thùng rác** cho pages, posts, products, landings, faqs, shortcodes.
> - Tự động: slug từ tiêu đề, tóm tắt, tác giả, đếm từ, mẫu SEO, redirect 301 khi đổi slug, JSON-LD.

![Danh sách bài viết: tab trạng thái, loại, ngày đăng, bình luận](/images/shots/posts-list.webp)

## Bản đồ các collection

| Collection | Slug | Mục đích | Phiên bản / thùng rác |
| --- | --- | --- | --- |
| Pages | `pages` | Trang tĩnh | có / có |
| Posts | `posts` | Blog, tin tức, hướng dẫn | có / có |
| Products | `products` | Trang sản phẩm hoặc dịch vụ | có / có |
| Landings | `landings` | Trang marketing theo block | có / có |
| Taxonomies | `taxonomies` | Chuyên mục, danh mục sản phẩm, thẻ, loại tuỳ biến | có / không |
| Authors | `authors` | Tác giả hiển thị công khai | không |
| Menus | `menus` | Cây điều hướng | không |
| FAQs | `faqs` | Nhóm câu hỏi - trả lời | có / có |
| Shortcodes | `shortcodes` | Đoạn Markdown tái sử dụng | có / có |
| Redirects | `redirects` | Quy tắc 301/302 | không |
| Comments | `comments` | Bình luận có kiểm duyệt | không |
| Media | `media` | Tệp tải lên và thư mục ([thư viện media](/tinh-nang/thu-vien-media)) | không |

Ngoài ra còn `users`, `sites` và collection ẩn `rating-events`. Không có Payload globals: mọi cấu hình theo site nằm trong tài liệu `sites` ([quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website)).

## Posts: bài viết, tin tức, hướng dẫn

| Trường | Ghi chú |
| --- | --- |
| `type` | `blog` \| `news` \| `guide` (bắt buộc, mặc định `blog`) |
| `title`, `status`, `publishedAt`, `slug` | `status` là `draft` hoặc `published`; slug tự sinh từ tiêu đề (bỏ dấu, gộp `đ`) khi để trống |
| `author`, `featuredImage`, `categories` | Quan hệ tới `authors`, `media`, `taxonomies` (nhiều giá trị) |
| `contentMd` / `content` | Markdown nguồn / HTML render, có thể dịch |
| `excerpt` | Tự điền từ 160 ký tự đầu của `contentMd` nếu để trống |
| `faqs` | Quan hệ tới `faqs`, chỉ dùng cho JSON-LD FAQPage |
| `wordCount`, `sitemapPriority` | Đếm từ tự động (chỉ đọc); độ ưu tiên sitemap 0–1, mặc định 0,7 |
| `tier`, `cluster` | Siêu dữ liệu nhóm chủ đề nội bộ, không render bởi CMS |
| `isNotified` | Để frontend đưa bài vào danh sách thông báo |
| `seo`, `kkStarRating`, `commentCount` | Nhóm SEO; điểm đánh giá tổng hợp; số bình luận đã duyệt |

## Pages, products, landings

**Pages** có `pageType` (`default` | `blog` | `landing`, trong đó `blog` ánh xạ khoá `BLOG` của `Sites.pageGroup`), cờ `isPillarPage`, `featuredImage`, `sitemapPriority` mặc định 0,6, nội dung Markdown, `faqs` và `seo`.

**Products** là trang sản phẩm/dịch vụ tổng quát: `hero.slider[].image` và `hero.slideVideo` (liên kết nhúng YouTube/TikTok), trường Markdown thứ hai `noticeMd`/`notice` cho khối thông báo, và `prices[]` đúng một dòng gồm `originalPrice`, `currentPrice`, `currency` (`VND` mặc định; `USD`, `EUR`, `GBP`, `JPY`) và `validUntil`; `currency` đi vào Offer của JSON-LD. `sitemapPriority` mặc định 0,8.

**Landings** là trang marketing dựng bằng block, `status` có thêm `archived`:

| Phần | Giá trị |
| --- | --- |
| `layout` (block) | `hero`, `content` (thân Markdown), `imageGallery`, `testimonials`, `cta`, `faq`, `stats`, `pricingTable`, `blogFeed`, `offerCards`, `embed` (HTML/iframe thô), `divider` |
| `template` | `default` \| `wide` \| `fullscreen` |
| `campaign` | `name`, `utmSource`, `utmMedium`, `utmCampaign`, `conversionGoal`, `abTestId` |
| `schemaType` | `WebPage` (mặc định) \| `FAQPage` \| `Article` \| `Product` \| `Event` |
| `faq[]` | Q&A nội tuyến cho JSON-LD FAQPage |

Khi lấy dữ liệu qua [REST API](/tinh-nang/headless-api), thân Markdown của block `content` nằm ở `bodyMd` và HTML ở `body`.

## Taxonomy: chuyên mục, thẻ, danh mục sản phẩm

`taxonomies` có `type` bắt buộc: `category` | `product-category` | `tag` | `custom` (kèm `customType` tự do khi `custom`, ví dụ tên taxonomy giữ nguyên từ WordPress). Tách `category` (blog) khỏi `product-category` (WooCommerce `product_cat`) là chủ ý. Các trường khác: `name` (bắt buộc, có thể dịch), `slug` (tự slug hoá từ tên), `description`, `parent` (quan hệ tự thân → dạng cây), `contentMd`/`content` và `seo`. Bộ đếm `contentWordCount` tự động đánh dấu **nội dung mỏng** khi dưới ngưỡng `THIN_CONTENT_THRESHOLD = 500` từ — hữu ích để trang chuyên mục không bị coi là thin content. Taxonomy duy nhất theo `(tenant, type, slug)`, nên một `category` và một `tag` được phép trùng slug.

![Danh sách chuyên mục và thẻ (taxonomies) của một website](/images/shots/taxonomies.webp "Taxonomies: chuyên mục và thẻ của site")

## Tác giả (E-E-A-T)

`authors` gồm `name`, `slug` (tự sinh), `avatar`, `bio` (có thể dịch), `sameAs[].url` (URL http/https đã xác thực, dùng cho JSON-LD) và `email` (không bao giờ trả qua API). Khi tạo bài, hook `autoFillAuthor` gán `author` bằng tác giả cùng site có email trùng người dùng đang đăng nhập. Slug tác giả được kiểm tra duy nhất theo site trong hook `beforeValidate`.

![Danh sách tác giả của một website trong KDIGI CMS](/images/shots/authors-list.webp "Authors: tác giả hiển thị công khai")

## FAQ

Một tài liệu `faqs` là một **nhóm** câu hỏi: `group` (nhãn bắt buộc) và `items[]` gồm `question`, `answer` (bắt buộc, có thể dịch). `answer` là Markdown; qua REST, shortcode được mở rộng và nội dung render thành HTML đã lọc. Gắn nhóm FAQ vào bài hoặc trang để sinh FAQPage trong [JSON-LD](/tinh-nang/seo-json-ld).

![Collection FAQ: nhóm kdigi-cms với các cặp câu hỏi - trả lời](/images/shots/faq.webp)

## Menu dạng cây

`menus` có một tài liệu cho mỗi `location` mỗi site: `PRIMARY`, `SECONDARY_MENU`, `MOBILE_MENU`, `FOOTER_MENU`, `LOGGEDIN_ACCOUNT_MENU`. Trường `tree` (JSON) là cấu trúc chuẩn, chỉnh bằng bộ dựng kéo thả `MenuTreeField` với nhãn song ngữ vi/en; mảng `items` cũ bị ẩn, chỉ giữ để tương thích. Qua REST, `tree` bị loại và được chiếu thành `items` cho ngôn ngữ yêu cầu; GraphQL và Local API thấy `tree` thô.

![Bộ dựng cây menu PRIMARY: kéo thả, lồng cấp, nhãn VI/EN](/images/shots/menu-tree.webp)

## Redirect

`redirects` gồm `from`, `to`, `statusCode` (`301` mặc định | `302`), `isEnabled`. `from` duy nhất theo site (chỉ mục database). Hook `beforeValidate` chuẩn hoá `from` về có dấu `/` đầu, từ chối `from = to`, từ chối `to` là URL ngoài (chỉ cho đường dẫn nội bộ) và chỉ **ghi log** (không chặn) khi có nguy cơ chuỗi redirect đảo ngược. Frontend lấy danh sách đã bật và nên tự giới hạn số lần nhảy. CMS tạo redirect 301 tự động khi slug đổi, và importer WordPress cũng tạo redirect ([chuyển từ WordPress](/chuyen-tu-wordpress)).

![Collection Redirects: các 301 do CMS và quá trình migrate tạo](/images/shots/redirects.webp)

## Shortcode

`shortcodes` là đoạn Markdown tái sử dụng: `title`, `name` (khớp `^[a-z0-9-]+$`, tự suy ra từ title) và `contentMd` (có thể dịch). Shortcode **theo từng site**; cú pháp `[sc name="ten-doan" /]`, lồng tối đa 3 cấp, tên không tồn tại hoặc vòng lặp mở rộng thành chuỗi rỗng. Trong [trình soạn thảo](/tinh-nang/trinh-soan-thao-markdown), nhóm "Snippets" của menu `/` liệt kê chúng.

## Bình luận và đánh giá

`comments` thuộc đúng một `post` hoặc `product`, có `authorName` (≤ 100 ký tự), `authorEmail` (không bao giờ trả về), `content` (đã lọc) và `status` (`pending` mặc định | `approved` | `spam`). Khách gửi qua `POST /api/comments/create`, luôn vào trạng thái chờ duyệt; chỉ admin/editor trở lên kiểm duyệt ([phân quyền](/tinh-nang/phan-quyen-nguoi-dung)). Hook `syncCommentCounts` giữ `commentCount` của bài/sản phẩm cha luôn đúng, kể cả khi bình luận được chuyển sang cha khác. Điểm sao `kkStarRating` (`avg`, `count`, `ratings`) do `POST /api/ratings/submit` ghi, mỗi IP một phiếu, chỉ lưu băm SHA-256 của IP.

## Phiên bản, thùng rác, hẹn giờ

- **Không dùng `drafts` của Payload.** Xuất bản là trường `status` (`draft` | `published`; landing thêm `archived`). Chỉ `published` mới công khai.
- **Phiên bản** (`maxPerDoc: 30`): pages, posts, products, landings, faqs, shortcodes, taxonomies. Giao diện có History, so sánh khác biệt và Restore. Khôi phục đi qua quyền `update` và hook `beforeChange` bình thường, nên author không khôi phục được bản đã xuất bản. Chi tiết ở [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap).
- **Thùng rác** (`trash: true`): pages, posts, products, landings, faqs, shortcodes. Xoá trong giao diện chỉ đặt `deletedAt`; xoá vĩnh viễn thuộc admin trở lên.
- **Hẹn giờ**: `publishedAt` ở tương lai giữ nguyên ngày và điều kiện đọc công khai ẩn tài liệu đến giờ đó.

## Đa ngôn ngữ

`localization: { locales: ['vi', 'en'], defaultLocale: 'vi', fallback: true }`. Trường thiếu `en` rơi về `vi`. Tiêu đề, nội dung, tóm tắt, văn bản SEO, câu hỏi FAQ, nhãn menu, nội dung shortcode và các chuỗi công khai của Sites có thể dịch. REST nhận `?locale=vi|en`, `fallback-locale`, hoặc `locale=all`. Ngôn ngữ giao diện quản trị cấu hình riêng (fallback `vi`).

## Ràng buộc duy nhất và hook tự động

Slug của pages, posts, products, landings duy nhất theo `(tenant, slug)`, tên shortcode theo `(tenant, name)` — cả năm đều là chỉ mục duy nhất một phần (`WHERE deleted_at IS NULL`) nên bản trong thùng rác không chặn tái sử dụng; khôi phục vào slug đã bị chiếm bị từ chối bằng lỗi song ngữ rõ ràng. Các hook đáng nhớ:

| Hook | Tác dụng |
| --- | --- |
| `makeApplySeoTemplatesHook` | Điền `seo.title`/`seo.description` trống từ mẫu `seoTitles` của site; không bao giờ ghi đè giá trị có sẵn |
| `autoRedirectOnSlugChange` | Tạo 301 trong cùng site khi slug đổi; không chặn lưu |
| `autoFillExcerpt`, `autoFillAuthor`, `postsWordCount` | Điền tóm tắt, tác giả, đếm từ cho bài viết |
| `makeGenerateJsonLdHook` | Dựng đồ thị JSON-LD vào `seo.jsonLd.raw` bằng một lệnh SQL có phạm vi, không tạo thêm phiên bản |
| `triggerRevalidate` | Xếp job gọi webhook làm mới frontend, lưu không phải chờ frontend |

## Quan hệ giữa các collection

```text
sites 1──* { pages, posts, products, landings, taxonomies, menus, faqs, authors,
             comments, shortcodes, redirects, media, payload-folders }
users *──* sites                      (users.tenants[])
posts      *──* taxonomies (categories)   *──1 authors   *──1 media (featuredImage)   *──* faqs
taxonomies *──1 taxonomies (parent)
comments   *──1 posts | products       (đúng một)
```

## Thực hành tốt

- Chọn đúng loại: bài có ngày và tác giả → `posts`; trang tĩnh ít đổi → `pages`; trang giới thiệu dịch vụ/sản phẩm → `products`; chiến dịch có UTM → `landings`.
- Giữ `category` cho blog và `product-category` cho cửa hàng; dùng cây `parent` thay vì quá nhiều thẻ.
- Dùng FAQ nhóm và shortcode thay vì sao chép đoạn văn giữa các trang.
- Để trống `seo.title`/`seo.description` khi mẫu của site đã đủ tốt, chỉ ghi đè ở trang quan trọng.

Tài liệu tham chiếu đầy đủ (tiếng Anh): [Collections trên docs.opencms.kdigi.vn](https://docs.opencms.kdigi.vn/en/tham-khao/collections/). Xem [thực hành cấu trúc nội dung](/thuc-hanh-tot/cau-truc-noi-dung).
