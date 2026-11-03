---
title: "Chuyển từ WordPress sang KDIGI CMS: từng bước"
description: "Hướng dẫn chuyển WordPress sang KDIGI CMS: bài viết, trang, media, menu, dữ liệu Yoast/RankMath, WooCommerce, redirect 301. Có checklist và giới hạn rõ ràng."
h1: "Chuyển website từ WordPress sang KDIGI CMS"
navTitle: "Chuyển từ WordPress"
primaryKeyword: "chuyển wordpress"
updated: 2026-11-03
heroImage: /images/art/chuyen-tu-wordpress-hero.webp
heroAlt: "Tài liệu kính mờ chuyển qua băng chuyền sang khối xanh KDIGI CMS, minh họa quy trình di chuyển từ WordPress"
schema: TechArticle
faq:
  - q: "Chuyển từ WordPress sang KDIGI CMS có mất thứ hạng SEO không?"
    a: "Pipeline giữ nguyên slug, ngày xuất bản và dữ liệu SEO (title, description, robots, Open Graph), đồng thời tự sinh redirect 301 cho mọi URL đã published mà permalink đổi. Để an toàn, bạn vẫn phải so sánh toàn bộ URL trước và sau cutover, và theo dõi Search Console 2-4 tuần."
  - q: "Những gì KDIGI CMS không di chuyển từ WordPress?"
    a: "Theme, plugin, cấu hình form, tài khoản đăng nhập WordPress, widget và dữ liệu ACF/meta box không được nhập. Nội dung do page builder lưu ngoài post_content (Elementor, Divi…) cũng không đọc được. Với WooCommerce, biến thể, tồn kho, giỏ hàng, đơn hàng và coupon không chuyển; chỉ lấy một giá đại diện."
  - q: "Tôi có cần tài khoản quản trị WordPress để di chuyển không?"
    a: "Không bắt buộc. Pipeline chạy được trên mọi site có REST API công khai (/wp-json/). Application Password là tùy chọn, dùng để lấy thêm bài nháp/private, media riêng tư, menu và danh sách người dùng. Không có nó, bạn vẫn nhập được toàn bộ nội dung đã xuất bản."
  - q: "Nếu import hỏng giữa chừng thì khôi phục thế nào?"
    a: "Mọi phase đều idempotent nên có thể sửa dữ liệu staged rồi chạy lại. Với database không phải local, CMS bắt buộc chạy pg_dump trước khi ghi và dừng nếu dump lỗi. Khi cần quay lại, bạn restore file dump đó; không có cờ nào để bỏ qua bước sao lưu."
  - q: "Có chuyển được site WordPress đa ngôn ngữ (Polylang, WPML) không?"
    a: "Có, nhưng mỗi lần chạy chỉ nhập một ngôn ngữ cho mỗi site trong KDIGI CMS, chọn bằng cờ --lang vi hoặc --lang en. Muốn nhiều ngôn ngữ, chạy pipeline nhiều lần với --site khác nhau, hoặc nhập một ngôn ngữ rồi dịch bằng tính năng localization của CMS."
related:
  - /tu-host
  - /thuc-hanh-tot/seo-onpage
  - /so-sanh/kdigi-cms-vs-wordpress
  - /tinh-nang/seo-json-ld
  - /demo
docs: https://docs.opencms.kdigi.vn/wordpress/di-chuyen-tu-wordpress/
---

KDIGI CMS chuyển nội dung từ bất kỳ site WordPress nào bằng một pipeline 8 phase có thể chạy lại: tải bản chụp qua REST hoặc WPGraphQL, chuẩn hóa thành JSON để bạn duyệt, khóa cổng review rồi mới ghi vào CMS. Bài viết, trang, media, menu, SEO Yoast/RankMath và redirect 301 được mang sang.

> **Tóm tắt nhanh**
>
> - Dữ liệu đi theo đường `WordPress → raw/ (bản sao bất biến) → staged/ (JSON sửa được) → cổng review → Payload`.
> - Không có gì được ghi vào database trước khi bạn khóa dữ liệu bằng `--gate lock`.
> - Database không phải local luôn được `pg_dump` trước khi ghi, không có cờ bỏ qua.
> - Yoast và RankMath đều được đọc và quy về một schema SEO thống nhất; JSON-LD do CMS sinh lại.
> - Mọi lệnh idempotent: chạy lại không tạo bản trùng, có `--dry-run` để xem trước.
> - Không di chuyển theme, plugin, form, tài khoản đăng nhập WordPress và dữ liệu page builder lưu ngoài `post_content`.

Trang này tóm tắt cách pipeline hoạt động, những gì được mang sang, những gì phải làm tay và checklist nghiệm thu. Lệnh chi tiết từng bước nằm trong [runbook trên GitHub](https://github.com/kdigivn/kdigi-cms-open/blob/main/docs/wordpress-migration/runbook.md); trang [Thực hành tốt](/thuc-hanh-tot) gom các quy tắc SEO nên áp dụng khi cutover.

![Ảnh chụp trang quản lý redirect của KDIGI CMS, nơi chứa các redirect 301 sinh ra từ permalink WordPress cũ](/images/shots/redirects.webp)

## Những gì được di chuyển

Bảng dưới đây lấy từ tài liệu pipeline của KDIGI CMS (phạm vi di chuyển, bản 1.1.0).

| Nguồn WordPress | Đích KDIGI CMS | Ghi chú |
| --- | --- | --- |
| `post` | `posts` | Nội dung chuyển sang Markdown (`contentMd`), giữ ngày xuất bản |
| `page` | `pages` | Trang lồng nhau được làm phẳng theo slug cuối, kèm redirect từ URL cũ |
| `category`, `post_tag` | `taxonomies` (`category`, `tag`) | Giữ cây cha/con |
| Taxonomy tùy biến | `taxonomies` (`custom` + `customType`) | `customType` là tên taxonomy gốc |
| WooCommerce `product`, `product_cat`, `product_tag` | `products`, `taxonomies` | Tùy chọn; một giá chung, gallery thành slider |
| Custom post type khác | `posts`, `pages` hoặc `products` | Khai báo bằng `--cpt <type>=<collection>` |
| Media Library | `media` | Tải binary qua REST, lưu local-disk hoặc R2 theo cấu hình |
| Menu | `menus` | Cây nhiều cấp, map vị trí về `PRIMARY`, `FOOTER_MENU`… |
| Tác giả | `authors` | Lấy từ bài viết, thêm `/users` nếu REST cho phép |
| Bình luận | `comments` | Bình luận spam giữ trạng thái `spam` |
| Yoast SEO / RankMath | `seo.*` của từng tài liệu | Title, description, canonical, robots, Open Graph, twitter, focus keyword |
| Logo, favicon, JSON-LD Organization, mạng xã hội | Cấu hình site | Chỉ điền phần WordPress thực sự sở hữu |
| Permalink cũ | `redirects` (301) | Tự sinh khi đường dẫn đổi; thêm tay qua `staged/redirects/` |

**Không di chuyển:** theme và giao diện, plugin, cấu hình form, người dùng đăng nhập WordPress, widget/sidebar, custom fields ACF/meta box, redirect nằm trong plugin (RankMath Redirections, Yoast Premium), sitemap và `robots.txt` (frontend của bạn sinh lại).

## Pipeline hoạt động thế nào

Pipeline gồm bốn bước lớn, điều phối bởi `src/importers/run-wp-migration.ts`:

1. **Archive.** Tải bản chụp site nguồn. Ưu tiên WPGraphQL nếu site có; nếu không, dựng từ REST API chuẩn của WordPress nên chạy được trên mọi site. Thư mục `raw/` là bản sao nguồn, không sửa tay.
2. **Normalize.** Chuyển `raw/` thành `staged/`: HTML thành Markdown, SEO Yoast/RankMath thành một schema thống nhất, cùng taxonomy, menu, tác giả, media và bình luận. Bước này không ghi database và không gọi mạng.
3. **Review gate.** Con người rà soát và sửa các file JSON trong `staged/`. `--gate lint` phải sạch lỗi, `--gate lock` ghi hash nội dung vào `.gate-lock`. Sửa `staged/` sau khi khóa sẽ làm khóa mất hiệu lực.
4. **Import.** Ghi vào Payload, mỗi phase kiểm lại khóa trước khi chạy.

### 8 phase ghi dữ liệu

Phase `schema` chuẩn bị database (chạy `pnpm payload migrate` và kiểm các giá trị enum cần thiết). Tám phase ghi dữ liệu là `seed` đến `redirects`:

| # | Phase | Việc làm |
| --- | --- | --- |
| 1 | `seed` | Tạo site nếu chưa có (không bao giờ ghi đè site sẵn có), tạo tác giả |
| 2 | `taxonomy` | Upsert category, tag, product-category, custom; nối cây cha/con |
| 3 | `content` | Upsert pages, posts, products kèm FAQ, rating, giá; giữ `publishedAt` của WordPress |
| 4 | `media` | Tải/tạo media, gắn ảnh đại diện, gallery, ảnh OG và ghi lại URL ảnh trong thân bài |
| 5 | `seo` | Áp lại nhóm `seo`: canonical, robots, OG, twitter, ngày bài viết |
| 6 | `nav` | Menu, cấu hình site (logo, favicon, knowledge graph, social), FAQ |
| 7 | `comments` | Bình luận của post/product |
| 8 | `redirects` | 301 từ permalink cũ sang đường dẫn mới, cộng các dòng thủ công |

## 6 giai đoạn từ đầu đến cutover

1. **Baseline nguồn.** Lưu sitemap, canonical và status code của toàn bộ URL WordPress hiện tại; đóng băng nội dung từ lúc archive cuối đến cutover.
2. **Archive.** Tải bản chụp REST hoặc WPGraphQL vào `wp-archive/<site>/raw/` (kèm binary media).
3. **Normalize.** Sinh `staged/` gồm JSON mỗi tài liệu, SEO đã thống nhất, taxonomy, menu, tác giả, media, bình luận.
4. **Review và khóa.** Sửa tay `staged/`, `--gate lint` sạch rồi `--gate lock`.
5. **Import.** `--dry-run` trước, sau đó `--from schema --to redirects` với sao lưu `pg_dump` bắt buộc khi database không phải local.
6. **Nghiệm thu và cutover.** Duyệt checklist, so sánh lại URL, chuyển DNS, theo dõi Search Console 2-4 tuần rồi mới tắt WordPress.

> **Cảnh báo** KDIGI CMS không phải bản sao WordPress: theme, plugin, form, ACF/meta box và layout của page builder không được chuyển. Phần nào cần giữ hãy dựng lại ở frontend hoặc bằng collection `landings`.

## Chạy di chuyển từng bước

Dưới đây là luồng rút gọn từ runbook, chạy ở thư mục gốc của repo `kdigi-cms-open` (Node ≥ 20, pnpm, PostgreSQL đích đã migrate, `DATABASE_URI` trong `.env`).

![Kết quả lệnh run-wp-migration --help liệt kê các cờ --site, --wp-url, --domain, --gate và --dry-run](/images/shots/terminal-wp-migration.webp "Đầu ra thật của run-wp-migration --help")

### 1. Đặt biến và kiểm tra nguồn

```bash
SITE=my-site                       # siteKey: a-z, 0-9, dấu -
WP_URL=https://wp.example.com      # backend WordPress (REST/GraphQL)
DOMAIN=example.com                 # domain công khai MỚI trên KDIGI CMS

mig() { node --env-file=.env --import tsx src/importers/run-wp-migration.ts \
  --site "$SITE" --wp-url "$WP_URL" --domain "$DOMAIN" "$@"; }

curl -s -o /dev/null -w '%{http_code}\n' "$WP_URL/wp-json/wp/v2/posts?per_page=1"   # mong đợi 200
```

Nếu REST trả 401/403 cho mọi thứ, thường là plugin bảo mật hoặc WAF đang chặn; tạo Application Password và đặt `WP_AUTH_USER`, `WP_AUTH_PASSWORD`.

### 2. Archive và normalize

```bash
mig        # lần đầu: archive → normalize → dừng ở review gate (exit khác 0 là bình thường)
```

Đặt `WP_UTC_OFFSET=+07:00` (hoặc múi giờ đúng của WordPress) **trước khi normalize** để `publishedAt` không lệch giờ; không đặt thì giá trị được coi là UTC. Kết quả nằm trong `wp-archive/<site>/raw/` và `wp-archive/<site>/staged/`. Thư mục `wp-archive/` đã nằm trong `.gitignore`, đừng commit dữ liệu WordPress.

### 3. Review, lint, lock

```bash
mig --gate lint     # lỗi (chặn lock) và cảnh báo (không chặn)
mig --gate lock     # lint sạch thì ghi staged/.gate-lock {approver, timestamp, contentHash}
mig --gate status   # khóa còn hiệu lực không
```

Tối thiểu hãy rà các mục sau trong `staged/`:

- `contentMd` của vài bài mẫu mỗi loại: heading, bảng, ảnh, shortcode còn sót dạng `[xyz]`.
- `seo.canonical` phải trỏ về domain mới, không phải host WordPress. Lint báo lỗi nếu còn trỏ host cũ.
- Cây taxonomy và menu; term thừa xóa bằng file `.delete-<tên>.json`.
- Alt của media (xem `media-alt-fallback-report.md`); ảnh nhạy cảm đưa vào `denylist.json`.

![Ảnh chụp tab SEO của một bài viết trong KDIGI CMS với title, description, canonical và Open Graph](/images/shots/seo.webp)

### 4. Dry-run rồi import thật

```bash
mig --from schema --to redirects --dry-run   # xem trước, không ghi Payload
mig --from schema --to redirects             # import thật
```

Dry-run vẫn kết nối database để kiểm enum. Với lần ghi thật vào database không phải local, CMS hỏi xác nhận rồi chạy `pg_dump -Fc` vào `backups-local/`. Hãy ghi lại tên file dump, đó là điểm rollback. Bạn cần `pg_dump` (gói `postgresql-client`) khớp phiên bản server.

> Dùng KDIGI CMS từ phiên bản **1.0.1** trở lên. Bản 1.0.1 sửa lỗi phase `media` thiếu khóa idempotency `sourceMediaId` khiến ảnh đại diện, slider và ảnh trong thân bài không được nhập. Bản hiện hành là 1.1.0, xem [lịch sử phát hành](/phat-hanh).

### 5. Kiểm tra sau import

| Phase | Dấu hiệu đúng |
| --- | --- |
| `schema` | Không có lỗi `schema gate: … enum missing` |
| `seed` | Site `$SITE` xuất hiện trong admin với đúng `domain` |
| `taxonomy` | Log `gate OK — counts match staged` |
| `content` | `errors: 0`; chạy lại lần hai phải ra `skipped: N` |
| `media` | `failed: 0`; ảnh trong thân bài trỏ về `…/api/media/file/…` |
| `seo`, `nav`, `comments`, `redirects` | `errors: 0` |

Sau khi site mới đã có dữ liệu, bạn cấu hình theme, footer, thông tin liên hệ và SEO mặc định trong admin ở mục **Sites**. Xem thêm [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website).

## Quyết định theo từng loại site WordPress

### Yoast SEO hay RankMath

Cả hai được quy về cùng một cấu trúc: `title`, `description`, `canonicalOverride`, `robots`, `focusKeywords`, Open Graph, twitter meta và ngày xuất bản/sửa. JSON-LD **không** được nhập mà được CMS sinh lại từ dữ liệu tài liệu và knowledge graph của site ([SEO và JSON-LD](/tinh-nang/seo-json-ld)).

| | Yoast SEO | RankMath |
| --- | --- | --- |
| Qua REST | Có sẵn `yoast_head_json` trên mọi post, page, term | Dựng từ trường `rank_math_*`; nếu thiếu, gọi `/wp-json/rankmath/v1/getHead` cho từng URL (có throttle) |
| Qua WPGraphQL | Cần plugin *WPGraphQL Yoast SEO* | Cần plugin *WPGraphQL for Rank Math* |
| Focus keyword | Yoast không công khai qua REST nên để trống | Có |

Một lưu ý hay bị bỏ sót: nhiều site WordPress đặt canonical tùy biến trong database mà không phát ra ở frontend. Nếu mang nguyên sang, CMS sẽ áp dụng và có thể de-index nhầm trang đích. Trước khi lock, hãy `curl` trang thật và so với `seo.canonicalOverride` trong `staged/`.

### Gutenberg, Classic hay page builder

Importer chỉ đọc HTML đã render của `post_content` rồi chuyển thành GitHub-flavoured Markdown.

| Cách soạn | Kết quả | Việc cần làm |
| --- | --- | --- |
| Classic Editor | Tốt nhất: đoạn, heading, list, bảng, ảnh, link | Kiểm shortcode còn sót |
| Gutenberg | Tốt: bỏ chú thích `<!-- wp:… -->`, chuyển được image, bảng, list, quote, gallery, embed | Block động (query loop, form) không có trong `post_content` nên mất |
| Elementor, Divi, WPBakery | Cấu trúc bị làm phẳng; layout cột, section, animation mất | Xem lại từng trang quan trọng; dựng lại landing bằng collection `landings` của CMS |
| Shortcode | `[gallery]` thành bảng ảnh; shortcode lạ bị loại, nội dung bao quanh được giữ | Form, slider, popup dựng lại thủ công |

Trang Elementor hay Divi bị rỗng thường do nội dung nằm trong meta (`_elementor_data`) còn `post_content` gần như trống; `--gate lint` sẽ cảnh báo `contentMd empty`.

### WooCommerce

Tùy chọn. Sản phẩm trở thành *Products* của KDIGI CMS (trang sản phẩm/dịch vụ) với một mức giá, tiền tệ trong `VND, USD, EUR, GBP, JPY`. Biến thể, thuộc tính, tồn kho, giỏ hàng, thanh toán, đơn hàng, coupon và khách hàng **không** chuyển. Nếu bạn cần bán hàng online, KDIGI CMS không thay thế WooCommerce: hãy giữ WooCommerce làm backend bán hàng và chỉ dùng pipeline để chuyển nội dung và SEO. Với website chỉ giới thiệu catalog, Products là đủ; xem thêm [giải pháp website bán hàng](/giai-phap/website-ban-hang).

### Thư viện media lớn

- Script archive tải song song (`--concurrency=N`, mặc định 8), bỏ qua file đã có và ghi file lỗi vào `raw/media/failed.json`; bị ngắt thì chạy lại để tải tiếp.
- Phase `media` tạo một media cho mỗi ảnh gốc trong inventory, không phải từng kích thước thumbnail, và nhận lại ảnh đã upload qua `sourceMediaId`.
- Cấu hình storage (local-disk hoặc Cloudflare R2) **trước** khi import để file đi thẳng vào nơi cuối cùng, xem [thư viện media](/tinh-nang/thu-vien-media).
- Đặt `PAYLOAD_PUBLIC_SERVER_URL` về URL thật trước phase `media`, nếu không URL localhost sẽ bị ghi vào thân bài (sửa bằng cách chạy lại `--from content --to media`).

## Redirect và cutover

Phase `redirects` sinh 301 từ permalink WordPress (ví dụ `/2024/05/ten-bai/`) sang đường dẫn mới cho mọi tài liệu đã `published`. Quy tắc cần nhớ:

- **Không tự sinh** redirect cho trang lưu trữ taxonomy (`/category/<slug>/`, `/tag/<slug>/`), trang tác giả, phân trang, feed, `?p=123` và attachment. Lấy danh sách URL có traffic/backlink từ Search Console hoặc log, rồi thêm vào `staged/redirects/*.json` với `statusCode` 301 hoặc 302.
- Không tạo chuỗi A → B → C; `to` luôn là đích cuối.
- Nội dung đã xóa nên để `draft` (trả 404) thay vì redirect về trang chủ, vì soft-404 gây hại SEO.
- Thử vài URL cũ: `curl -sI https://example.com/2024/05/old-post/ | grep -iE '^(HTTP|location)'`.

Ba kịch bản cutover được tài liệu mô tả:

1. **Đổi domain:** `--wp-url https://old.example.com --domain example.com`. Canonical và `og:url` được viết lại sang domain mới, link nội bộ trong bài trở thành đường dẫn tương đối.
2. **Backend WordPress tách khỏi site công khai:** thêm `--public-url https://example.com` để link nội bộ trỏ về đường dẫn tương đối.
3. **Thay thế tại chỗ (cùng host):** bắt buộc có redirect cho mọi URL thay đổi và kiểm robots/canonical trên bản staging trước khi chuyển DNS.

Quy trình khuyến nghị: baseline site nguồn (sitemap, canonical, status code toàn bộ URL) → import vào database local/staging → duyệt checklist → import production (có backup) → so sánh lại URL → chuyển DNS → theo dõi Search Console 2-4 tuần → tắt WordPress. **Giữ WordPress chạy ít nhất 2-4 tuần sau cutover.**

## Checklist nghiệm thu

1. Số lượng posts, pages, products, taxonomies, media, menus, comments trong CMS khớp `staged/` (trừ phần cố ý bỏ).
2. Chạy lại toàn bộ `--from schema --to redirects` không làm đổi số tài liệu, log `created: 0`.
3. 10 URL ngẫu nhiên cùng toàn bộ URL trong sitemap WordPress cũ mở được hoặc redirect 301 đúng đích.
4. Thân bài không còn Markdown thô, `[shortcode]` hay chữ dính nhau; bảng và ảnh hiển thị đủ.
5. Canonical, OG, robots đúng domain mới; không có `noindex` ngoài ý muốn.
6. Ngày xuất bản và sửa đúng nguồn, không phải ngày import.
7. Menu header, footer, mobile đúng; link nội bộ không 404.
8. Logo, favicon, knowledge graph, social đã đúng; theme, footer, contact đã cấu hình trong admin.
9. Đã lưu file `pg_dump` và thư mục `wp-archive/<site>/` (raw, staged, `.gate-lock`).

## Rollback

| Tình huống | Cách quay lại |
| --- | --- |
| Sai `staged/`, chưa import | Sửa, lint, lock lại; không có gì để rollback |
| Import local/dev hỏng | `pnpm migrate:down` rồi `pnpm migrate` và import lại, hoặc xóa site trong admin và chạy lại |
| Import vào database không local hỏng | `pg_restore --clean --if-exists --no-owner -d "$DATABASE_URI" backups-local/db-…-pre-wp-migration-$SITE.dump` (dừng app trước) |
| Chỉ vài tài liệu sai | Dùng **Versions** của tài liệu để *Restore*, hoặc sửa `staged/` và chạy lại đúng phase |
| Đã chuyển DNS nhưng lỗi nặng | Trỏ DNS về WordPress cũ, vì bạn đã giữ nó chạy |

Đừng xóa `wp-archive/<site>/raw/` hay file dump trước khi cutover ổn định.

## Sau khi chuyển xong

Bạn có một site KDIGI CMS để hiển thị nội dung qua [REST và GraphQL API](/tinh-nang/headless-api) trên frontend tự chọn. Nếu muốn tự vận hành máy chủ, xem [hướng dẫn tự host](/tu-host) và [sao lưu, nâng cấp](/thuc-hanh-tot/sao-luu-va-nang-cap). Muốn thử giao diện biên tập trước khi di chuyển thật, vào [bản demo trực tiếp](/demo). Nếu còn cân nhắc giữa hai hệ thống, [so sánh KDIGI CMS và WordPress](/so-sanh/kdigi-cms-vs-wordpress) nêu rõ khi nào nên giữ WordPress; sau cutover, áp dụng [SEO on-page](/thuc-hanh-tot/seo-onpage) cho nội dung mới.

## Nguồn

- Tài liệu di chuyển WordPress của KDIGI CMS (README, runbook, playbook): <https://github.com/kdigivn/kdigi-cms-open/tree/main/docs/wordpress-migration>
- Bản hosted trên docs: <https://docs.opencms.kdigi.vn/wordpress/di-chuyen-tu-wordpress/>
- CHANGELOG (1.0.1 sửa phase media): <https://github.com/kdigivn/kdigi-cms-open/blob/main/CHANGELOG.md>
