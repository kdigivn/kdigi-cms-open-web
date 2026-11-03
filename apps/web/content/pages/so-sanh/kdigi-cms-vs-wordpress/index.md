---
title: "KDIGI CMS vs WordPress: so sánh trung thực 2026"
description: "So sánh KDIGI CMS và WordPress về kiến trúc, bảo mật, SEO, plugin, chi phí và công sức chuyển đổi. Có bảng, nguồn dẫn và khi nào nên ở lại WordPress."
h1: "KDIGI CMS vs WordPress: nên chọn cái nào?"
navTitle: "KDIGI CMS vs WordPress"
icon: globe
lead: "KDIGI CMS thay WordPress cho website nội dung; WordPress vẫn hợp hơn khi cần giỏ hàng, theme và plugin dựng sẵn."
primaryKeyword: "thay thế wordpress"
updated: 2026-11-03
heroImage: /images/shots/dashboard.webp
heroAlt: "Bảng điều khiển KDIGI CMS với thống kê bài viết, lịch nội dung và kiểm tra SEO"
schema: TechArticle
faq:
  - q: "KDIGI CMS có thay hoàn toàn WordPress được không?"
    a: "Không phải mọi trường hợp. KDIGI CMS chỉ có admin và API nên cần frontend riêng. Nó thay được WordPress cho blog, trang giới thiệu, landing; cần giỏ hàng, theme hay plugin chuyên biệt thì ở lại WordPress."
  - q: "Chuyển từ WordPress sang KDIGI CMS mất những gì?"
    a: "Pipeline chuyển bài viết, trang, chuyên mục/thẻ, media, menu, tác giả, bình luận, SEO Yoast/RankMath và sinh 301 từ permalink cũ. Theme, plugin, form, người dùng WordPress và nội dung page builder ngoài post_content không được chuyển."
  - q: "KDIGI CMS có đa website như WordPress Multisite không?"
    a: "Có, đây là thiết kế cốt lõi: mỗi website là một document trong collection Sites, nội dung gắn trường tenant. Thêm site chỉ là nhập dữ liệu; mọi site dùng chung một API và một PostgreSQL."
  - q: "SEO của KDIGI CMS so với Yoast hoặc RankMath thế nào?"
    a: "Có sẵn mẫu tiêu đề kiểu RankMath, JSON-LD @graph, breadcrumbs, audit và redirect 301 khi đổi slug. Khác WordPress, CMS không render trang: frontend của bạn phải đọc trường seo và xuất thẻ meta."
  - q: "Chi phí thực sự của KDIGI CMS là gì?"
    a: "Giấy phép MIT, không phí bản quyền. Chi phí nằm ở hạ tầng tự host (Node.js và PostgreSQL) và công phát triển frontend. WordPress cũng miễn phí bản quyền; chi phí thường ở hosting, theme/plugin trả phí và bảo trì."
related:
  - /chuyen-tu-wordpress
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/seo-json-ld
  - /tu-host
  - /so-sanh
docs: https://docs.opencms.kdigi.vn/wordpress/di-chuyen-tu-wordpress/
---

KDIGI CMS chỉ gồm trang quản trị và API (headless, MIT); bạn tự làm frontend. WordPress là CMS đầy đủ gồm theme và plugin (GPL). Chọn theo việc bạn cần bán hàng hay cần quản lý nhiều website.

> **Tóm tắt nhanh**
> - WordPress render trang bằng PHP; KDIGI CMS chỉ cung cấp API.
> - Giấy phép: WordPress GPLv2+, KDIGI CMS MIT.
> - KDIGI CMS gom nhiều website vào một bản cài.
> - Có pipeline nhập từ WordPress, duyệt trước, sao lưu bắt buộc.
> - Chưa có giỏ hàng, theme hay plugin.

## :scale: Bảng so sánh

WordPress theo tài liệu chính thức, kiểm tra 2026-11-03. KDIGI CMS theo [README](https://github.com/kdigivn/kdigi-cms-open) và tài liệu dự án.

| Tiêu chí | KDIGI CMS | WordPress |
| --- | --- | --- |
| Kiến trúc | Headless: admin + REST/GraphQL | Đầy đủ: admin + theme + render |
| Giấy phép | MIT | GPLv2 trở lên |
| Cơ sở dữ liệu | PostgreSQL | MySQL hoặc MariaDB |
| Đa website | `sites` + `tenant`, một API chung | Multisite, mỗi site có theme/plugin riêng |
| Soạn thảo | Markdown (Milkdown) | Gutenberg |
| GraphQL có sẵn | ✓ | ✗ (qua plugin WPGraphQL) |
| SEO, JSON-LD không cần plugin | ✓ | ✗ (Yoast, RankMath…) |
| Nội dung song ngữ `vi` + `en` có sẵn | ✓ | ✗ (qua plugin Polylang, WPML…) |
| Giỏ hàng, thanh toán | ✗ | WooCommerce |
| Theme và plugin | ✗ | ✓ |
| Triển khai | Docker Compose, Coolify, VPS | Shared hosting đến WordPress.com |

> **Lưu ý** Nếu frontend không đọc trường `seo`, bạn sẽ không có thẻ meta nào. Request ẩn danh cũng không tự giới hạn theo site: hãy thêm `where[tenant][equals]=<id>`.

## :layers: Khác biệt chính

:::cards 3
- :search: **SEO là dữ liệu** CMS xuất trường `seo` và JSON-LD; frontend in ra HTML. [SEO và JSON-LD](/tinh-nang/seo-json-ld)
- :layers: **Một kho, nhiều frontend** Mỗi site có domain, menu, mẫu SEO riêng. [Quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website)
- :shield-check: **Admin tách khỏi site** Frontend công khai không chạy chung ứng dụng với admin. [Tự host](/tu-host)
:::

## :check: Khi nào chọn mỗi bên

### Chọn WordPress khi

:::cards 2
- :shopping-cart: **Cần bán hàng đầy đủ** Giỏ hàng, thanh toán, tồn kho qua WooCommerce.
- :layout-template: **Muốn theme và page builder** Dựng site mà không cần lập trình.
- :package: **Phụ thuộc plugin chuyên biệt** Đặt chỗ, LMS, diễn đàn…
- :users: **Chưa có lập trình viên frontend** KDIGI CMS cần frontend riêng.
:::

### Chọn KDIGI CMS khi

:::cards 2
- :layers: **Quản lý nhiều website** Agency hoặc nhóm thương hiệu cần một nơi biên tập.
- :code: **Muốn frontend hiện đại** Next.js hoặc Astro đọc API sạch, nội dung Markdown.
- :search: **SEO tiếng Việt là ưu tiên** JSON-LD, redirect, mẫu tiêu đề nằm trong CMS.
- :server: **Tự host, dữ liệu của mình** PostgreSQL, giấy phép MIT. Thử [demo trực tiếp](/demo).
:::

## :refresh-cw: Chuyển từ WordPress

Pipeline chạy lặp lại được: `WordPress → raw → staged → cổng duyệt → Payload`. Xem [hướng dẫn chuyển từ WordPress](/chuyen-tu-wordpress) và [tài liệu migration](https://docs.opencms.kdigi.vn/wordpress/di-chuyen-tu-wordpress/).

:::steps
- :list-checks: **Chuẩn bị** Node ≥ 20, pnpm, PostgreSQL đã `pnpm migrate`, `pg_dump`, truy cập được `/wp-json/` của site cũ.
- :cloud-upload: **Archive** Tải bản chụp nguồn bằng WPGraphQL, hoặc từ REST chuẩn.
- :refresh-cw: **Normalize** HTML thành Markdown; SEO Yoast/RankMath về một schema.
- :eye: **Duyệt** Sửa `staged/`, chạy `--gate lint` rồi `--gate lock`. Chưa lock thì chưa ghi vào database.
- :database: **Nhập** 8 phase từ `seed` đến `redirects`, có `--dry-run`. Database không phải local luôn `pg_dump` trước.
- :rocket: **Cutover** Đổi DNS sang frontend mới, giữ WordPress cũ 2–4 tuần để có đường lui.
:::

![Kết quả lệnh run-wp-migration --help liệt kê các cờ của pipeline chuyển từ WordPress](/images/shots/terminal-wp-migration.webp "Các cờ của pipeline chuyển từ WordPress sang KDIGI CMS")

> **Lưu ý** Không được chuyển: theme, plugin, cấu hình form, người dùng WordPress, nội dung page builder lưu ngoài `post_content`, dữ liệu ACF/meta box. JSON-LD được sinh lại, không nhập.

## :link: Nguồn

WordPress, kiểm tra 2026-11-03: [giấy phép](https://wordpress.org/about/license/), [REST API](https://developer.wordpress.org/rest-api/), [yêu cầu hệ thống](https://wordpress.org/about/requirements/), [Multisite](https://developer.wordpress.org/advanced-administration/multisite/create-network/). KDIGI CMS: [kho mã](https://github.com/kdigivn/kdigi-cms-open), [CHANGELOG](https://github.com/kdigivn/kdigi-cms-open/blob/main/CHANGELOG.md) (1.1.0, 2026-11-03), [tài liệu](https://docs.opencms.kdigi.vn).
