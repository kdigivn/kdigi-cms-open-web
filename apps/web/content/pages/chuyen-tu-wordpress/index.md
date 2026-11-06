---
title: "Chuyển từ WordPress sang KDIGI CMS: từng bước"
description: "Hướng dẫn chuyển WordPress sang KDIGI CMS: bài viết, trang, media, menu, dữ liệu Yoast/RankMath, WooCommerce, redirect 301. Có checklist và giới hạn rõ ràng."
h1: "Chuyển website từ WordPress sang KDIGI CMS"
navTitle: "Chuyển từ WordPress"
icon: refresh-cw
lead: "Pipeline có thể chạy lại, có cổng duyệt và sao lưu bắt buộc trước khi ghi dữ liệu."
primaryKeyword: "chuyển wordpress"
updated: 2026-11-03
heroImage: /images/art/chuyen-tu-wordpress-hero.webp
heroAlt: "Tài liệu kính mờ chuyển qua băng chuyền sang khối xanh KDIGI CMS, minh họa quy trình di chuyển từ WordPress"
schema: TechArticle
faq:
  - q: "Chuyển từ WordPress có mất thứ hạng SEO không?"
    a: "Pipeline giữ slug, ngày xuất bản, dữ liệu SEO và tự sinh redirect 301 cho URL đã published mà permalink đổi. Bạn vẫn nên so sánh toàn bộ URL trước và sau, rồi theo dõi Search Console 2-4 tuần."
  - q: "Những gì không được chuyển từ WordPress?"
    a: "Theme, plugin, cấu hình form, tài khoản đăng nhập, widget, dữ liệu ACF/meta box và nội dung page builder lưu ngoài post_content. WooCommerce chỉ lấy một giá đại diện, không có biến thể, tồn kho, đơn hàng."
  - q: "Có cần tài khoản quản trị WordPress không?"
    a: "Không bắt buộc. Pipeline chạy trên site có REST API công khai (/wp-json/). Application Password là tùy chọn, để lấy thêm bài nháp, media riêng tư, menu và người dùng."
  - q: "Nếu import hỏng giữa chừng thì khôi phục thế nào?"
    a: "Mọi phase đều idempotent nên sửa dữ liệu staged rồi chạy lại. Với database không phải local, CMS bắt buộc chạy pg_dump trước khi ghi; muốn quay lại thì restore file dump đó."
  - q: "Có chuyển được site đa ngôn ngữ (Polylang, WPML) không?"
    a: "Có, nhưng mỗi lần chạy chỉ nhập một ngôn ngữ cho mỗi site, chọn bằng --lang vi hoặc --lang en. Muốn nhiều ngôn ngữ, chạy nhiều lần với --site khác nhau."
related:
  - /tu-host
  - /thuc-hanh-tot/seo-onpage
  - /so-sanh/kdigi-cms-vs-wordpress
  - /tinh-nang/seo-json-ld
  - /demo
docs: https://docs.cms.kdigi.vn/wordpress/di-chuyen-tu-wordpress/
---

KDIGI CMS chuyển bài viết, trang, media, menu, SEO Yoast/RankMath và redirect 301 từ mọi site WordPress. Bạn duyệt dữ liệu ở dạng JSON, khóa cổng review rồi mới ghi vào CMS.

> **Tóm tắt nhanh**
>
> - Đường đi: WordPress → `raw/` → `staged/` → cổng review → CMS.
> - Chưa khóa cổng review thì không ghi gì vào database.
> - Database không phải local luôn được `pg_dump` trước khi ghi.
> - Mọi lệnh idempotent, có `--dry-run` để xem trước.
> - Theme, plugin, form, ACF và page builder không được chuyển.

Lệnh chi tiết từng bước: [runbook trên GitHub](https://github.com/kdigivn/kdigi-cms-open/blob/main/docs/wordpress-migration/runbook.md).

![Ảnh chụp trang quản lý redirect của KDIGI CMS, nơi chứa các redirect 301 sinh ra từ permalink WordPress cũ](/images/shots/redirects.webp)

## :list-checks: Trước khi bắt đầu

:::check
- Dùng KDIGI CMS từ 1.0.1 trở lên ([nhật ký phát hành](/phat-hanh))
- Node.js ≥ 20, pnpm, PostgreSQL đích đã migrate
- `DATABASE_URI` trong `.env`
- WordPress có REST API `/wp-json/` truy cập được
- `pg_dump` khớp phiên bản server (gói `postgresql-client`)
- Application Password (tùy chọn) cho bài nháp, menu, người dùng
:::

## :package: Những gì được chuyển

:::cards 3
- :file-text: **Bài viết và trang** Chuyển sang Markdown, giữ ngày xuất bản.
- :tags: **Taxonomy và menu** Giữ cây cha/con và vị trí menu.
- :image: **Media** Tải ảnh gốc về ổ đĩa hoặc Cloudflare R2.
- :search: **SEO** Yoast và RankMath quy về một schema thống nhất.
- :link: **Redirect 301** Tự sinh khi permalink đổi.
- :shopping-cart: **WooCommerce** Tùy chọn, thành Products với một giá chung.
:::

> **Cảnh báo** Không chuyển: theme, plugin, form, tài khoản WordPress, widget, ACF/meta box và nội dung page builder lưu ngoài `post_content`. Dựng lại phần cần giữ ở frontend hoặc bằng `landings`.

## :workflow: Các bước chuyển

:::steps
- :history: **Baseline nguồn** Lưu sitemap, canonical, status code mọi URL; đóng băng nội dung.
- :cloud-upload: **Archive** Tải bản chụp qua REST hoặc WPGraphQL vào `raw/`.
- :wand-sparkles: **Normalize** Sinh `staged/`: JSON từng tài liệu, SEO đã thống nhất.
- :eye: **Review và khóa** Sửa `staged/`, `--gate lint` sạch rồi `--gate lock`.
- :database: **Import** `--dry-run` trước, rồi chạy thật; có `pg_dump` bắt buộc.
- :rocket: **Nghiệm thu và cutover** Duyệt checklist, chuyển DNS, theo dõi Search Console.
:::

Lệnh cốt lõi, chạy ở thư mục gốc repo `kdigi-cms-open`:

```bash
SITE=my-site; WP_URL=https://wp.example.com; DOMAIN=example.com
mig() { node --env-file=.env --import tsx src/importers/run-wp-migration.ts \
  --site "$SITE" --wp-url "$WP_URL" --domain "$DOMAIN" "$@"; }

mig                                          # archive, normalize, dừng ở cổng review
mig --gate lint && mig --gate lock           # rà staged/ rồi khóa
mig --from schema --to redirects --dry-run   # xem trước
mig --from schema --to redirects             # import thật
```

![Kết quả lệnh run-wp-migration --help liệt kê các cờ --site, --wp-url, --domain, --gate và --dry-run](/images/shots/terminal-wp-migration.webp "Đầu ra thật của run-wp-migration --help")

> **Mẹo** Đặt `WP_UTC_OFFSET=+07:00` trước khi normalize để `publishedAt` không lệch giờ. Đặt `PAYLOAD_PUBLIC_SERVER_URL` và nơi lưu media ([thư viện media](/tinh-nang/thu-vien-media)) trước phase `media`.

## :pen-line: Theo loại site WordPress

| Cách soạn | Kết quả |
| --- | --- |
| Classic Editor | Tốt nhất: đoạn, heading, list, bảng, ảnh |
| Gutenberg | Tốt; block động (query loop, form) bị mất |
| Elementor, Divi, WPBakery | Cấu trúc bị làm phẳng, layout mất |

Yoast và RankMath đều được đọc; JSON-LD không nhập mà CMS sinh lại ([SEO và JSON-LD](/tinh-nang/seo-json-ld)).

> **Lưu ý** Canonical tùy biến trong database WordPress có thể không hiện ở frontend. Trước khi lock, so `seo.canonicalOverride` trong `staged/` với trang thật.

## :link: Redirect và cutover

:::cards 2
- :check: **Tự sinh 301** Cho mọi tài liệu `published` có permalink đổi.
- :x: **Không tự sinh** Trang taxonomy, tác giả, phân trang, feed, `?p=123`: thêm vào `staged/redirects/`.
- :history: **Nội dung đã xóa** Để `draft` (404), đừng redirect về trang chủ.
- :clock: **Giữ WordPress chạy** Ít nhất 2-4 tuần sau cutover.
:::

## :check: Nghiệm thu

:::check
- Số lượng tài liệu trong CMS khớp `staged/`
- Chạy lại toàn bộ không đổi số tài liệu (`created: 0`)
- 10 URL ngẫu nhiên và sitemap cũ mở được hoặc 301 đúng đích
- Canonical, OG, robots đúng domain mới, không `noindex` ngoài ý muốn
- Ngày xuất bản đúng nguồn, không phải ngày import
- Đã lưu file `pg_dump` và thư mục `wp-archive/<site>/`
:::

## :life-buoy: Rollback

| Tình huống | Cách quay lại |
| --- | --- |
| Sai `staged/`, chưa import | Sửa, lint, lock lại |
| Import local hỏng | `pnpm migrate:down`, `pnpm migrate`, import lại |
| Import database không local hỏng | Dừng app, `pg_restore` file dump trong `backups-local/` (xem runbook) |
| Vài tài liệu sai | **Versions** → Restore |
| Đã chuyển DNS, lỗi nặng | Trỏ DNS về WordPress cũ |

## :arrow-right: Sau khi chuyển

:::cards 3
- :zap: **Hiển thị nội dung** Frontend lấy qua [REST và GraphQL](/tinh-nang/headless-api).
- :server: **Tự vận hành** [Tự host](/tu-host), [sao lưu và nâng cấp](/thuc-hanh-tot/sao-luu-va-nang-cap).
- :scale: **Còn phân vân?** [So sánh KDIGI CMS và WordPress](/so-sanh/kdigi-cms-vs-wordpress).
:::
