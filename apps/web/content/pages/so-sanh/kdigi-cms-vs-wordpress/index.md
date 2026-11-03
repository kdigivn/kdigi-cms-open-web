---
title: "KDIGI CMS vs WordPress: so sánh trung thực 2026"
description: "So sánh KDIGI CMS và WordPress về kiến trúc, bảo mật, SEO, plugin, chi phí và công sức chuyển đổi. Có bảng, nguồn dẫn và khi nào nên ở lại WordPress."
h1: "KDIGI CMS vs WordPress: nên chọn cái nào?"
primaryKeyword: "thay thế wordpress"
updated: 2026-11-03
heroImage: /images/shots/dashboard.webp
heroAlt: "Bảng điều khiển KDIGI CMS với thống kê bài viết, lịch nội dung và kiểm tra SEO"
schema: TechArticle
faq:
  - q: "KDIGI CMS có thay thế hoàn toàn WordPress được không?"
    a: "Không phải trong mọi trường hợp. KDIGI CMS chỉ gồm trang quản trị và API; bạn phải có frontend riêng (Next.js, Astro…). Nó thay được WordPress khi website chủ yếu là blog, trang giới thiệu, landing và danh mục sản phẩm/dịch vụ. Nếu cần giỏ hàng, theme dựng sẵn hay plugin chuyên biệt, WordPress vẫn phù hợp hơn."
  - q: "Chuyển từ WordPress sang KDIGI CMS mất những gì?"
    a: "Pipeline nhập chuyển bài viết, trang, chuyên mục/thẻ, media, menu, tác giả, bình luận, SEO của Yoast/RankMath và sinh 301 từ permalink cũ. Không chuyển theme, plugin, cấu hình form, người dùng đăng nhập WordPress và nội dung page builder lưu ngoài post_content. WooCommerce chỉ chuyển sản phẩm cơ bản với một mức giá."
  - q: "KDIGI CMS có hỗ trợ đa website như WordPress Multisite không?"
    a: "Có, và đây là thiết kế cốt lõi: mỗi website là một document trong collection Sites, nội dung gắn với đúng một site qua trường tenant, người dùng được gán theo từng site. Thêm site chỉ là nhập dữ liệu, không cần triển khai lại. Khác biệt lớn là mọi site dùng chung một API và một cơ sở dữ liệu PostgreSQL."
  - q: "SEO của KDIGI CMS so với Yoast hoặc RankMath thế nào?"
    a: "KDIGI CMS có sẵn mẫu tiêu đề/mô tả theo biến kiểu RankMath, JSON-LD @graph, breadcrumbs, chấm điểm SEO, gợi ý liên kết nội bộ và redirect tự động khi đổi slug. Khác WordPress, CMS không render trang: frontend của bạn phải đọc các trường seo và xuất thẻ meta."
  - q: "Chi phí thực sự của KDIGI CMS là gì?"
    a: "Phần mềm dùng giấy phép MIT, không tính phí bản quyền. Chi phí nằm ở hạ tầng tự host (một server Node.js và PostgreSQL) và công phát triển frontend. WordPress cũng miễn phí bản quyền, nhưng chi phí thường nằm ở hosting, theme/plugin trả phí và bảo trì cập nhật."
related:
  - /chuyen-tu-wordpress
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/seo-json-ld
  - /tu-host
  - /so-sanh
docs: https://docs.opencms.kdigi.vn/wordpress/di-chuyen-tu-wordpress/
---

KDIGI CMS có thể thay thế WordPress cho website nội dung: CMS headless (chỉ admin và API), đa website, giấy phép MIT. WordPress là CMS đầy đủ gồm theme và plugin, giấy phép GPL. Chọn KDIGI CMS để có frontend riêng; ở lại WordPress nếu cần giỏ hàng và plugin dựng sẵn.

> **Tóm tắt nhanh**
> - **Kiến trúc:** WordPress là monolith (quản trị + render + theme bằng PHP). KDIGI CMS là admin + API (Payload 3.90, Next.js 15, PostgreSQL); frontend là dự án riêng.
> - **Giấy phép:** WordPress dùng GPLv2 trở lên; KDIGI CMS dùng MIT.
> - **Đa website:** KDIGI CMS gom nhiều site vào một bản cài với dữ liệu cách ly theo site; WordPress có tính năng Multisite riêng.
> - **Soạn thảo:** KDIGI CMS soạn Markdown (Milkdown) và API trả HTML đã làm sạch; WordPress dùng trình soạn khối Gutenberg.
> - **Chuyển đổi:** có pipeline nhập từ WordPress nhiều giai đoạn, có cổng duyệt và sao lưu bắt buộc khi ghi vào DB không phải local.
> - **Giới hạn thẳng thắn:** KDIGI CMS chưa có giỏ hàng, hệ sinh thái theme/plugin hay frontend dựng sẵn.

## KDIGI CMS và WordPress khác nhau ở đâu?

Khác biệt gốc nằm ở ranh giới hệ thống. WordPress làm cả ba việc trong một tiến trình PHP: lưu nội dung, quản trị và render HTML bằng theme. KDIGI CMS **chỉ** lưu nội dung và cài đặt site, rồi phục vụ qua REST và GraphQL; website công khai là một ứng dụng khác đọc API ẩn danh và được báo làm mới bằng webhook revalidate (theo [kiến trúc KDIGI CMS](https://docs.opencms.kdigi.vn/tham-khao/architecture/)).

Hệ quả thực tế:

- **Bạn sở hữu frontend.** Làm bằng Next.js, Astro, Nuxt hoặc app di động. Đổi giao diện không đụng tới kho nội dung.
- **Không có theme để cài.** Không có thư viện giao diện dựng sẵn; đội của bạn (hoặc agency) phải code frontend.
- **Không có plugin trong CMS.** Tính năng mở rộng là code trong dự án Payload, không phải gói cài một cú nhấp.

## Bảng so sánh chi tiết

Thông tin WordPress dựa trên tài liệu chính thức (xem mục Nguồn, kiểm tra 2026-11-03). Thông tin KDIGI CMS dựa trên [README](https://github.com/kdigivn/kdigi-cms-open) và tài liệu của dự án.

| Tiêu chí | KDIGI CMS | WordPress |
| --- | --- | --- |
| Loại hệ thống | CMS headless: admin + REST/GraphQL | CMS đầy đủ: admin + theme + render |
| Ngôn ngữ / nền tảng | TypeScript, Payload 3.90, Next.js 15, React 19 | PHP |
| Cơ sở dữ liệu | PostgreSQL | MySQL hoặc MariaDB |
| Giấy phép | MIT | GPLv2 trở lên |
| Đa website | Mặc định: collection `sites`, trường `tenant`, gán người dùng theo site | Tính năng Multisite (mạng lưới site) |
| Soạn thảo | Markdown (Milkdown), slash menu, shortcode, dán từ Docs/Word | Gutenberg (khối); Classic qua plugin |
| API | REST + GraphQL có sẵn; Markdown trả về HTML tại khóa gốc | REST API có sẵn; GraphQL qua plugin (WPGraphQL) |
| SEO | Mẫu kiểu RankMath, JSON-LD `@graph`, audit, gợi ý link nội bộ, AI SEO tùy chọn | Cần plugin (Yoast, RankMath…) |
| Phân quyền | `super-admin` › `admin` › `editor` › `author`, gán theo site | Administrator, Editor, Author, Contributor, Subscriber |
| Quy trình tác giả | Author không tự đăng, bị chặn ở hook phía server | Contributor gửi duyệt |
| Media | Thư viện có thư mục, sửa ảnh, nhập từ URL (chống SSRF), đĩa local hoặc R2 từng site | Media Library; mở rộng bằng plugin |
| Thương mại điện tử | Không có giỏ hàng/thanh toán; Products là trang sản phẩm/dịch vụ tổng quát | WooCommerce và nhiều plugin khác |
| Theme / plugin | Không có; frontend tự xây | Hệ sinh thái rất lớn |
| Triển khai | Docker Compose, Coolify, VPS; cần Node.js + PostgreSQL | Shared hosting, VPS, managed hosting, WordPress.com |
| Song ngữ | `vi` và `en` có fallback, admin tiếng Việt/Anh | Qua plugin (Polylang, WPML…) |

## SEO: cùng mục tiêu, khác cách làm

Ở WordPress, plugin SEO sinh thẻ `<title>`, meta và schema ngay trong HTML vì WordPress tự render trang. Ở KDIGI CMS, CMS **không** render trang, nên nó cung cấp dữ liệu và frontend xuất ra HTML.

- **Mẫu tiêu đề/mô tả** cấp site với biến `%title%`, `%sitename%`, `%sep%`, `%excerpt%`… Trường SEO của từng bài để trống thì dùng mẫu; đổi mẫu là áp dụng ngay cho mọi bài chưa ghi đè.
- **JSON-LD** được sinh khi lưu thành một `@graph` (BlogPosting, WebPage, BreadcrumbList, Organization, WebSite…) và lưu ở `seo.jsonLd.raw` để frontend chèn nguyên văn.
- **Redirect 301 tự động** khi đổi slug.
- **Kiểm tra SEO** của site (`GET /api/seo/audit`) và gợi ý liên kết nội bộ trong trình soạn thảo.

Chi tiết xem [SEO và JSON-LD](/tinh-nang/seo-json-ld). Điểm cần nhớ: nếu frontend của bạn không đọc trường `seo`, bạn sẽ không có thẻ meta nào, trong khi WordPress cho kết quả ngay sau khi cài plugin.

## Đa website: Multisite hay một CMS nhiều tenant?

WordPress Multisite cho phép chạy mạng lưới nhiều site trên một bản cài, nhưng mỗi site vẫn là một site WordPress đầy đủ với theme và plugin riêng. KDIGI CMS nhìn bài toán khác: một kho nội dung, một API, nhiều frontend. Mỗi site có `siteKey`, `domain`, thương hiệu, mẫu SEO, menu, nội dung và (tùy chọn) kho Cloudflare R2 riêng. Thêm site không cần khởi động lại hay triển khai lại CMS.

Lưu ý quan trọng: request ẩn danh **không** tự giới hạn theo site. Frontend phải luôn thêm `where[tenant][equals]=<id>` khi truy vấn:

```bash
curl 'https://cms.example.com/api/posts?where[tenant][equals]=1&sort=-publishedAt&limit=10&depth=1'
```

Xem thêm [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website).

## Bảo trì và bảo mật

| Khía cạnh | KDIGI CMS | WordPress |
| --- | --- | --- |
| Cập nhật | Schema chỉ đổi bằng migration tường minh (`pnpm migrate`); đọc CHANGELOG và sao lưu trước | Cập nhật core, theme, plugin thường xuyên |
| Bề mặt tấn công | Frontend công khai tách khỏi admin; admin chỉ cần mở cho người biên tập | Admin, theme và plugin chạy chung một ứng dụng công khai |
| Sao lưu | Database PostgreSQL + thư mục media | Database + thư mục `wp-content` |
| Phụ thuộc bên thứ ba | Chỉ Payload và thư viện trong repo | Phụ thuộc chất lượng từng plugin |

Cả hai đều cần quy trình sao lưu và cập nhật. Khác biệt là với WordPress, rủi ro tập trung ở plugin bên thứ ba; với KDIGI CMS, rủi ro nằm ở cấu hình triển khai và code frontend của bạn. Xem [tự host](/tu-host).

## Khi nào chọn WordPress?

Hãy chọn WordPress nếu:

1. Bạn cần **bán hàng đầy đủ** (giỏ hàng, thanh toán, tồn kho, mã giảm giá): WooCommerce làm được, KDIGI CMS thì không.
2. Bạn muốn **cài theme và dựng site không cần lập trình** với page builder.
3. Đội của bạn đã quen WordPress và phụ thuộc vào plugin chuyên biệt (đặt chỗ, LMS, diễn đàn…).
4. Ngân sách không có lập trình viên frontend.

## Khi nào chọn KDIGI CMS?

Hãy chọn KDIGI CMS nếu:

1. Bạn quản lý **nhiều website** (agency, tập đoàn nhiều thương hiệu) và muốn một chỗ biên tập duy nhất.
2. Bạn muốn **frontend hiện đại** (Next.js/Astro) với API sạch, nội dung Markdown.
3. SEO tiếng Việt là ưu tiên và bạn muốn JSON-LD, redirect, mẫu tiêu đề nằm trong CMS.
4. Bạn muốn **tự host**, dữ liệu trong PostgreSQL của mình, giấy phép MIT.
5. Bạn đang rời WordPress và chủ yếu có bài viết, trang, danh mục.

Nếu chưa chắc, thử [demo trực tiếp](/demo) trước khi quyết định.

## Lộ trình chuyển từ WordPress sang KDIGI CMS

Pipeline nằm trong repo (`src/importers/run-wp-migration.ts`) và chạy lặp lại được (idempotent). Dữ liệu đi theo luồng `WordPress → raw/ → staged/ → cổng duyệt → Payload`.

1. **Chuẩn bị:** Node ≥ 20, pnpm, PostgreSQL đã `pnpm migrate`, `pg_dump`, truy cập được REST API (`/wp-json/`) của site cũ.
2. **Archive:** tải bản chụp nguồn bằng WPGraphQL nếu có, nếu không dựng từ REST chuẩn.
3. **Normalize:** HTML chuyển thành Markdown, SEO của Yoast/RankMath chuẩn hóa về một schema.
4. **Duyệt:** sửa tay `staged/`, chạy `--gate lint` rồi `--gate lock`. Chưa lock thì chưa ghi gì vào database.
5. **Nhập:** 8 phase `seed → taxonomy → content → media → seo → nav → comments → redirects`, có `--dry-run`.
6. **Cutover:** đổi DNS sang frontend mới, giữ WordPress cũ chạy 2–4 tuần để có đường lui.

```bash
node --env-file=.env --import tsx src/importers/run-wp-migration.ts \
  --site my-blog --wp-url https://old.example.com --domain www.example.com --dry-run
```

![Kết quả lệnh run-wp-migration --help liệt kê các cờ của pipeline chuyển từ WordPress](/images/shots/terminal-wp-migration.webp "Các cờ của pipeline chuyển từ WordPress sang KDIGI CMS")

JSON-LD không được nhập; CMS sinh lại từ dữ liệu của tài liệu và knowledge graph của site. Nếu database đích không phải local, pipeline luôn chạy `pg_dump` trước và dừng nếu dump lỗi. Hướng dẫn đầy đủ: [chuyển từ WordPress](/chuyen-tu-wordpress) và [tài liệu migration](https://docs.opencms.kdigi.vn/wordpress/di-chuyen-tu-wordpress/).

> **Giới hạn khi chuyển:** theme, plugin, cấu hình form, người dùng đăng nhập WordPress và nội dung page builder (Elementor, Divi…) lưu ngoài `post_content` không được chuyển. Dữ liệu ACF/meta box cũng không được nhập tự động.

## Nguồn

Thông tin về WordPress, kiểm tra ngày 2026-11-03:

- WordPress.org, "License": <https://wordpress.org/about/license/>
- WordPress Developer Resources, "REST API Handbook": <https://developer.wordpress.org/rest-api/>
- WordPress.org, "Requirements" (PHP, MySQL/MariaDB): <https://wordpress.org/about/requirements/>
- WordPress Advanced Administration, "Create a Network" (Multisite): <https://developer.wordpress.org/advanced-administration/multisite/create-network/>

Thông tin về KDIGI CMS: [kho mã nguồn](https://github.com/kdigivn/kdigi-cms-open), [CHANGELOG](https://github.com/kdigivn/kdigi-cms-open/blob/main/CHANGELOG.md) (phiên bản 1.1.0 ngày 2026-11-03) và [tài liệu](https://docs.opencms.kdigi.vn). Các sản phẩm thay đổi theo thời gian; hãy đối chiếu trang chính thức trước khi quyết định.
