---
title: "Quản lý nhiều website trên một CMS | KDIGI CMS"
description: "Một bảng quản trị cho nhiều website: tách dữ liệu theo site, cấu hình tên miền, thương hiệu, SEO riêng. Phù hợp agency và doanh nghiệp nhiều thương hiệu."
h1: "Quản lý nhiều website trong một hệ thống KDIGI CMS"
navTitle: "Quản lý nhiều website"
primaryKeyword: "quản lý nhiều website"
updated: 2026-11-03
heroImage: /images/art/tinh-nang-quan-ly-nhieu-website-hero.webp
heroAlt: "Một khối trung tâm xanh nối với bốn cửa sổ website kính mờ, quản lý nhiều website trong một cài đặt"
schema: WebPage
faq:
  - q: "KDIGI CMS quản lý nhiều website như thế nào?"
    a: "Mỗi website là một document trong collection Sites, định danh bằng siteKey và domain. Mọi nội dung (bài viết, trang, menu, media…) mang trường tenant trỏ đến đúng một site. Một bản cài, một cơ sở dữ liệu phục vụ không giới hạn số site; frontend của mỗi site lọc nội dung theo id site của mình."
  - q: "Thêm một website mới có cần triển khai lại CMS không?"
    a: "Không. Thêm site chỉ là nhập dữ liệu trong admin: đăng nhập super-admin, tạo document Sites với siteKey, domain và ngôn ngữ mặc định, gán người dùng, rồi cấu hình thương hiệu và SEO. Không cần khởi động lại hay build lại CMS. Bạn chỉ cần trỏ frontend mới tới CMS với siteKey tương ứng."
  - q: "Dữ liệu giữa các site có bị lẫn vào nhau không?"
    a: "Không với người dùng đăng nhập: quyền đọc, ghi và xem phiên bản đều có ràng buộc where theo site, người không phải super-admin chỉ thấy site được gán. Với request ẩn danh, API trả nội dung công khai của mọi site, nên frontend phải luôn thêm where[tenant][equals] với id site của mình."
  - q: "Mỗi site có thể dùng kho lưu trữ media riêng không?"
    a: "Có. Mặc định mọi upload lưu trên ổ đĩa. Nếu điền nhóm r2 trong document Sites (bucket, accountId, publicBaseUrl và hai khóa bí mật), site đó dùng Cloudflare R2 riêng. Chỉ super-admin được sửa nhóm này, hai khóa chỉ ghi chứ không bao giờ trả về qua REST hay GraphQL."
  - q: "Người dùng có thể thuộc nhiều site không?"
    a: "Có. Người dùng được gán site qua mảng tenants; một người có thể có nhiều dòng. Vai trò là toàn cục: một người chỉ có một vai trò trên mọi site của họ. Người không phải super-admin sẽ không thấy gì cho đến khi được gán ít nhất một site, và chọn site đang làm việc bằng bộ chọn site trong admin."
related:
  - /tinh-nang/phan-quyen-nguoi-dung
  - /tinh-nang/headless-api
  - /tinh-nang/thu-vien-media
  - /tu-host
  - /so-sanh/kdigi-cms-vs-wordpress
docs: https://docs.opencms.kdigi.vn/huong-dan/nhieu-website/
---

KDIGI CMS quản lý nhiều website bằng collection **Sites**: mỗi document là một website với `siteKey` và `domain` riêng, còn mọi nội dung đều thuộc đúng một site qua trường `tenant`. Một bản cài, một cơ sở dữ liệu phục vụ nhiều frontend; thêm site mới chỉ là nhập dữ liệu, không cần triển khai lại.

> **Tóm tắt nhanh**
>
> - **Một document Sites = một website**, định danh bằng `siteKey` (duy nhất) và `domain` (tên miền thuần, không có `https://`).
> - **Nội dung cách ly theo site** bằng trường `tenant` và các điều kiện truy cập tường minh trên từng thao tác.
> - **Cấu hình riêng mỗi site:** thương hiệu, trang chủ, liên hệ và footer, SEO, tích hợp GA4/GTM/Clarity, tùy chọn kho R2.
> - **Thêm site không cần deploy lại**, không cần khởi động lại CMS.
> - **Frontend chọn site bằng `siteKey`**; CMS không suy luận site từ host của request.

## Vì sao nên gộp nhiều website vào một CMS?

Khi agency hay doanh nghiệp có nhiều website, mỗi site một bản cài CMS kéo theo nhiều bản vá, nhiều bản sao lưu và nhiều tài khoản. KDIGI CMS gộp tất cả vào một hệ thống: một cơ sở dữ liệu PostgreSQL, một trang quản trị, một lần nâng cấp. Mỗi website vẫn có tên miền, thương hiệu, nội dung và nhóm biên tập riêng. Trên một install, người dùng chọn site đang làm việc bằng bộ chọn site và chỉ thấy dữ liệu của site đó.

![Danh sách website trong KDIGI CMS khi đăng nhập super-admin](/images/shots/sites.webp)

## Mô hình site trong KDIGI CMS

Collection `sites` (mã nguồn `src/collections/sites.ts`) là ranh giới tenant, cấu hình qua plugin `@payloadcms/plugin-multi-tenant` với `tenantsSlug: 'sites'`. Khi viết, tài liệu dùng từ "site"; trong mã nguồn bạn sẽ thấy `tenant`.

Các collection thuộc về một site gồm: `pages`, `posts`, `products`, `landings`, `taxonomies`, `menus`, `faqs`, `authors`, `comments`, `shortcodes`, `redirects`, cộng với `media` và thư mục media. Người dùng là dữ liệu dùng chung, được liên kết với site qua mảng `users.tenants[]`.

### Định danh site

| Trường | Kiểu | Ý nghĩa |
| --- | --- | --- |
| `siteKey` | text, bắt buộc, duy nhất | Mã ổn định (ví dụ `my-blog`). Frontend dùng để tìm site của mình |
| `domain` | text, bắt buộc | Tên miền chính, không có scheme và dấu `/` cuối (ví dụ `www.example.com`) |
| `defaultLanguage` | select, mặc định `vi` | `vi` hoặc `en`; là ngôn ngữ của JSON-LD được sinh |

`domain` được ba nơi sử dụng: job `revalidateFrontend` (gọi `POST https://<domain>/api/cms/revalidate` sau khi nội dung đổi), bộ sinh JSON-LD (tạo URL canonical và các `@id`) và nút xem trên site (`GET /api/frontend-doc-url`).

### Sáu tab cấu hình

Form Sites chia thành sáu tab, các trường nằm ở cấp cao nhất:

| Tab | Nội dung |
| --- | --- |
| Hệ thống | `siteKey`, `domain`, `defaultLanguage`, nhóm `r2` |
| Thương hiệu | `theme`, `branding` (`primaryColor`, `fontFamily`, `logo`, `favicon`, `notFoundImage`) |
| Trang chủ | `landing` (hero, slider), `featuredPosts`, `featuredProducts`, `homePageHighlight[]` |
| Liên hệ & Footer | `contact` (nút liên hệ nổi, icon header), `footer`, `sidebar` |
| Trang & SEO | `pageGroup[]`, `seoDefaults`, `knowledgeGraph`, `socialProfiles[]`, `seoTitles`, `breadcrumbs` |
| Tích hợp | `integration` (`ga4Id`, `gtmId`, `clarityId`), `manifest` (PWA) |

![Tab Thương hiệu trong cấu hình một site](/images/shots/site-settings.webp)

![Tab Hệ thống của một site: mã website, tên miền, ngôn ngữ mặc định và lưu trữ R2](/images/shots/site-settings-system.webp "Tab Hệ thống: siteKey, domain, defaultLanguage và nhóm R2")

![Tab Tích hợp của một site: mã GA4, GTM, Clarity và cấu hình PWA](/images/shots/site-settings-integrations.webp "Tab Tích hợp: GA4, GTM, Clarity và manifest PWA")

## Thương hiệu và giao diện theo từng site

- **`theme`:** chọn một trong `light` (mặc định), `dark`, `brand-red`, `brand-blue`, `brand-green`. Chỉ những theme mà frontend của bạn đã đăng ký mới hiển thị đúng. Thêm theme mới cần sửa `THEME_OPTIONS` và tạo migration `ALTER TYPE "enum_sites_theme" ADD VALUE`, vì danh sách là enum PostgreSQL.
- **`branding.primaryColor`:** màu CSS được kiểm tra hợp lệ (không chứa `{ } < > " ' \` ;`, tối đa 60 ký tự) vì frontend có thể chèn vào thẻ `<style>`.
- **`branding.logo`, `favicon`, `notFoundImage`:** tải lên từ thư viện media của chính site.
- **Trang chủ:** `landing.heroTitle`, hai badge `heroNotice1/2`, `slider[]` và các thẻ điểm nổi bật `homePageHighlight[]` (có bản địa hóa).

## Cấu hình SEO riêng cho mỗi site

Mỗi site có mẫu tiêu đề `seoTitles`, ảnh Open Graph mặc định `seoDefaults.ogImage`, danh tính tổ chức `knowledgeGraph` và danh sách `socialProfiles[]` (xuất ra `sameAs` trong JSON-LD). Nhờ vậy mỗi website tự có đồ thị JSON-LD với `Organization` và `WebSite` của mình. Chi tiết xem [SEO và JSON-LD](/tinh-nang/seo-json-ld).

Nhóm `pageGroup[]` ánh xạ các khóa chuẩn (`FRONT_PAGE`, `BLOG`, `CONTACT`, `ABOUT`, `TERM_CONDITION`, `PRIVACY_POLICY`…) sang slug thật của site, đọc qua `GET /api/sites/:siteKey/env-page?key=<KEY>`.

## Kho lưu trữ media riêng cho từng site

Mặc định mọi upload lưu trên ổ đĩa, không cần tài khoản đám mây. Nếu muốn, site có thể dùng Cloudflare R2 riêng bằng cách điền nhóm `r2`: `bucket`, `accountId`, `publicBaseUrl`, hai khóa `accessKeyId`, `secretAccessKey`, cùng `compressToWebp` và `webpQuality`. Một site chỉ dùng R2 khi có cả `bucket` và `accountId`.

Nhóm `r2` chỉ **super-admin** được ghi; hai khóa bí mật chỉ ghi (set qua `POST /api/sites/:id/secret`) và không bao giờ trả về qua REST hay GraphQL. Biến môi trường `R2_OFF=true` buộc mọi site dùng ổ đĩa cục bộ. Xem thêm [thư viện media](/tinh-nang/thu-vien-media).

## Cách ly dữ liệu: điều gì được bảo đảm

| Cơ chế | Vai trò |
| --- | --- |
| Bộ lọc danh sách và bộ chọn site của plugin | Chỉ để giao diện admin gọn gàng |
| Các predicate `tenantScopedRead`, `tenantScopedWrite`, `tenantScopedVersionsRead` và quy tắc riêng cho `media`, `payload-folders` | **Ranh giới thật**: ràng buộc `where` tường minh trên mọi thao tác |
| Quyền bọc của plugin (khóa phiên bản 3.90.2) | Lớp bổ sung cho người không phải super-admin |
| Đọc ẩn danh | **Không** tự lọc theo site: frontend phải thêm `where[tenant][equals]=<id>` |

Điểm cuối cùng rất quan trọng: nếu bạn quên bộ lọc `tenant`, request ẩn danh sẽ nhận nội dung đã xuất bản của **tất cả** site. Vì Sites cho phép đọc công khai, **không bao giờ đặt bí mật vào trường Sites thông thường**.

## Frontend chọn site như thế nào

CMS không suy luận site từ host của request. Mỗi frontend được cấu hình `siteKey` của mình và tự giới hạn mọi truy vấn:

1. Tìm id site một lần rồi cache lại:

   ```bash
   curl 'https://cms.example.com/api/sites?where[siteKey][equals]=my-blog&limit=1&depth=1'
   ```

2. Lọc mọi truy vấn nội dung theo id đó:

   ```bash
   curl 'https://cms.example.com/api/posts?where[tenant][equals]=1&where[status][equals]=published&locale=vi'
   ```

3. Endpoint ghi công khai (`POST /api/comments/create`, `POST /api/ratings/submit`) nhận `tenantSiteKey` thay vì id và từ chối document cha thuộc site khác.

4. Truy cập server-to-server: tạo bản ghi Users, gán site trong `tenants[]` và dùng khóa API (`Authorization: users API-Key <key>`); tài khoản này chỉ thấy bản nháp của site được gán.

Xem thêm [Headless API](/tinh-nang/headless-api) để biết hợp đồng REST đầy đủ.

## Thêm một website mới: 7 bước

1. **Đăng nhập super-admin.** Ở bản cài mới, người dùng đầu tiên tạo trên màn hình "create first user" tự động là `super-admin`.
2. **Tạo site** (Sites → Create): nhập `siteKey`, `domain`, `defaultLanguage`.
3. **Lưu trữ (tùy chọn):** để trống `r2` để dùng ổ đĩa, hoặc điền thông tin R2 của site.
4. **Gán người dùng:** mở Users, thêm dòng vào `tenants` cho site. Người không phải super-admin không thấy gì cho đến khi có ít nhất một dòng.
5. **Cấu hình site:** thương hiệu, trang chủ, liên hệ và footer, `pageGroup`, `seoTitles`, `knowledgeGraph`, tích hợp.
6. **Tạo nội dung:** menu, taxonomy, tác giả, trang và bài viết; mỗi mục được gắn site đang chọn.
7. **Trỏ frontend** về URL của CMS với `siteKey` mới và triển khai `POST /api/cms/revalidate` trên domain của site để nội dung xuất bản làm mới bộ nhớ đệm.

Job revalidate chỉ chạy khi đặt `ENABLE_JOBS_AUTORUN=true` trên đúng một instance CMS.

## Shortcode theo từng site

Shortcode là đoạn Markdown dùng lại (bảng giá, chính sách, boilerplate) và thuộc về một site. Hệ thống chỉ mở rộng shortcode của **chính site** chứa tài liệu: hai site có thể cùng định nghĩa `pricing-note` với nội dung khác nhau mà không xung đột. Cú pháp trong Markdown: `[sc name="pricing-note" /]`. Xem thêm tại [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown).

## Cái gì dùng chung, cái gì riêng theo site

| Hạng mục | Theo site? |
| --- | --- |
| Nội dung, taxonomy, menu, FAQ, shortcode, redirect, bình luận, tác giả | Có (`tenant`) |
| Tệp media và thư mục; kho lưu trữ | Có |
| Người dùng | Dùng chung; quyền truy cập qua `tenants[]` |
| Vai trò | Toàn cục (một người một vai trò trên mọi site của họ) |
| Ngôn ngữ nội dung (`vi`, `en`) | Toàn cục; `defaultLanguage` theo từng site |
| Biến môi trường (database, secret, jobs, khóa AI, reCAPTCHA) | Toàn cục trên cả cài đặt |

## Khi nào dùng multi-site?

Mô hình này hợp với [agency](/giai-phap/agency) quản lý nhiều website khách hàng, với doanh nghiệp có nhiều thương hiệu hay nhiều tên miền, và với người đang gộp nhiều blog WordPress vào một hệ thống bằng [pipeline chuyển từ WordPress](/chuyen-tu-wordpress). Nếu bạn chỉ có một website duy nhất, multi-site vẫn không tốn thêm: bạn chỉ dùng một site.

Bạn có thể thử ngay bằng [demo trực tuyến](/demo), hoặc đọc [hướng dẫn kỹ thuật về nhiều website](https://docs.opencms.kdigi.vn/huong-dan/nhieu-website/) trên trang tài liệu. Xem toàn bộ [tính năng KDIGI CMS](/tinh-nang).

## So với WordPress Multisite

WordPress Multisite là tính năng có sẵn của WordPress, cho phép tạo một "network" gồm nhiều website trên cùng một bản cài WordPress. Về nguyên tắc, hai bên cùng giải bài toán "một hệ thống, nhiều website", nhưng khác nhau ở kiến trúc:

| Điểm | WordPress Multisite | KDIGI CMS |
| --- | --- | --- |
| Kiến trúc | Một bản cài WordPress phục vụ cả mạng site, có giao diện theme | CMS headless: chỉ quản trị và API, website là frontend riêng |
| Cách chọn site | Theo tên miền hoặc thư mục con của mạng site | Frontend tự gửi `siteKey` và lọc `tenant`; CMS không suy luận từ host |
| Cấu hình SEO theo site | Thường qua plugin SEO của bạn chọn | Có sẵn trong lõi: `seoTitles`, `knowledgeGraph`, JSON-LD theo từng site |
| Kho media | Do cấu hình của mạng site | Ổ đĩa mặc định, tùy chọn Cloudflare R2 riêng từng site |

Nếu bạn đang chạy WordPress Multisite và muốn chuyển sang, xem [chuyển từ WordPress](/chuyen-tu-wordpress) và [so sánh KDIGI CMS với WordPress](/so-sanh/kdigi-cms-vs-wordpress). Việc thiết lập hạ tầng cho nhiều site nằm ở trang [tự host](/tu-host).

## Nguồn

- WordPress, "Multisite" (tài liệu chính thức cho nhà phát triển WordPress): <https://developer.wordpress.org/advanced-administration/multisite/> — truy cập ngày 2026-11-03.
- Mã nguồn và tài liệu KDIGI CMS: [docs/multi-site.md](https://github.com/kdigivn/kdigi-cms-open/blob/main/docs/multi-site.md).
