---
title: "CMS cho agency: quản lý nhiều website khách hàng"
description: "Agency quản lý nhiều website khách hàng trên một CMS: phân quyền theo site, quy trình duyệt bài, tự host và không phí bản quyền theo website."
h1: "Giải pháp KDIGI CMS cho agency"
navTitle: "Agency"
primaryKeyword: "CMS cho agency"
updated: 2026-11-03
heroImage: /images/art/giai-phap-agency-hero.webp
heroAlt: "Ba cửa sổ website kính mờ cùng nối về một khối xanh, đại diện cho agency quản lý nhiều site khách hàng"
schema: WebPage
faq:
  - q: "Một bản cài KDIGI CMS quản lý được bao nhiêu site khách?"
    a: "Tài liệu không đặt giới hạn cứng về số site: mỗi website là một bản ghi trong collection Sites, thêm site là nhập dữ liệu chứ không phải triển khai lại. Giới hạn thực tế phụ thuộc cấu hình máy chủ và PostgreSQL của bạn, nên hãy tự đo tải trên hạ tầng thật trước khi nhận nhiều khách."
  - q: "Nhân viên của khách có thấy dữ liệu của khách khác không?"
    a: "Không, nếu bạn gán đúng site. Người dùng không phải super-admin chỉ đọc và ghi trong các site được gán ở trường tenants; người chưa có site nào không thấy tài liệu nào. Ranh giới này do các access predicate trong mã thực thi, còn bộ lọc trong giao diện admin chỉ hỗ trợ thao tác."
  - q: "Freelancer viết bài cho nhiều khách thì phân quyền thế nào?"
    a: "Vai trò (role) là toàn cục theo người dùng, không đặt riêng từng site. Bạn gán freelancer vai trò author và thêm các site họ được làm; họ chỉ sửa bài do chính mình tạo và không thể xuất bản. Nếu cần một người là editor ở khách A nhưng author ở khách B, hiện phải tạo hai tài khoản."
  - q: "Frontend của từng khách có tự biết mình thuộc site nào không?"
    a: "Không. CMS không suy ra site từ tên miền yêu cầu. Mỗi frontend được cấu hình siteKey của mình, lấy id site một lần rồi thêm where[tenant][equals]=<id> vào mọi truy vấn. Nếu thiếu điều kiện này, truy vấn ẩn danh sẽ trả về nội dung đã xuất bản của tất cả các site."
  - q: "Chuyển site WordPress của khách sang KDIGI CMS có mất SEO không?"
    a: "Pipeline di chuyển có 8 phase, đọc dữ liệu Yoast hoặc RankMath, giữ ngày xuất bản và tự sinh redirect 301 từ permalink cũ. Nội dung phải qua cổng review trước khi ghi vào database. Giao diện, plugin và nội dung page builder lưu ngoài post_content thì không được chuyển."
related:
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/phan-quyen-nguoi-dung
  - /chuyen-tu-wordpress
  - /tinh-nang/seo-json-ld
  - /tu-host
docs: https://docs.opencms.kdigi.vn/huong-dan/nhieu-website/
---

KDIGI CMS cho phép một agency vận hành nhiều website khách hàng trên cùng một bản cài và một database PostgreSQL. Mỗi website là một bản ghi trong collection Sites; nội dung, media, menu và cấu hình SEO gắn với site đó. Thêm khách mới là nhập dữ liệu, không cần deploy lại.

> **Tóm tắt nhanh**
> - Một deployment, một database, nhiều frontend: mỗi khách là một document trong collection `sites`.
> - Bốn vai trò xếp bậc: `super-admin` > `admin` > `editor` > `author`; chỉ `super-admin` tạo site và gán người dùng vào site.
> - SEO template (`seoTitles`) và `knowledgeGraph` đặt riêng từng site; lưu trữ media mặc định ở ổ đĩa, có thể chuyển sang Cloudflare R2 riêng cho từng site.
> - Frontend là phần việc riêng: CMS chỉ cung cấp trang quản trị và API, không có giao diện công khai dựng sẵn.
> - Truy vấn ẩn danh không tự lọc theo site: frontend phải thêm `where[tenant][equals]=<id>`.

## Bài toán của agency khi mỗi khách một CMS

Mô hình quen thuộc là mỗi khách một bản WordPress riêng: nhiều bản cập nhật, nhiều database, nhiều tài khoản quản trị phải theo dõi. KDIGI CMS gom phần quản trị về một nơi, còn frontend vẫn tách theo từng khách (Next.js, Astro hoặc framework bạn chọn). Xem so sánh chi tiết ở [KDIGI CMS vs WordPress](/so-sanh/kdigi-cms-vs-wordpress).

Nền tảng của mô hình này là [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website): các collection `pages`, `posts`, `products`, `landings`, `taxonomies`, `menus`, `faqs`, `authors`, `comments`, `shortcodes`, `redirects` cùng `media` đều mang trường `tenant` trỏ về Sites. Một tài liệu thuộc đúng một site.

![Danh sách site trong trang quản trị KDIGI CMS](/images/shots/sites.webp)

## Setup khuyến nghị cho agency

1. **Cài một lần** bằng Docker Compose hoặc Coolify (xem [tự host](/tu-host)). Người dùng đầu tiên tạo trên màn hình "create first user" tự động là `super-admin`; đó là tài khoản của agency.
2. **Tạo site cho từng khách** (Sites → Create): điền `siteKey` (duy nhất, ví dụ `khach-a`), `domain` (tên miền trần, không có `https://`) và `defaultLanguage` (`vi` hoặc `en`).
3. **Gán người dùng**: Users → mở người dùng → thêm một dòng vào `tenants` cho mỗi site. Người chưa có dòng nào không thấy gì.
4. **Chọn vai trò theo người**: `admin` cho đầu mối phía khách (sửa cài đặt site, xuất bản, xóa vĩnh viễn trong site được gán), `editor` cho biên tập nội bộ, `author` cho freelancer.
5. **Cấu hình SEO từng site**: `seoTitles` (mẫu title/description dạng `%title%`, `%sitename%`, `%sep%`) và `knowledgeGraph` (thông tin Organization/LocalBusiness). Chi tiết ở [SEO và JSON-LD](/tinh-nang/seo-json-ld).
6. **Lưu media**: để trống nhóm `r2` nếu dùng ổ đĩa; hoặc điền `bucket`, `accountId`, `publicBaseUrl` rồi nhập hai khóa qua ô bí mật để site đó dùng R2 riêng. Xem [thư viện media](/tinh-nang/thu-vien-media).
7. **Trỏ frontend** về URL CMS với `siteKey` của khách và triển khai `POST /api/cms/revalidate` trên domain của khách để nội dung đã xuất bản được làm mới.

## Quy trình onboarding khách

Khi nhận một khách mới, agency lặp lại cùng một chuỗi việc, tất cả nằm trong admin (không cần deploy):

1. Khách cung cấp tên miền và ngôn ngữ chính; super-admin tạo site với `siteKey`, `domain`, `defaultLanguage`.
2. Nếu khách có WordPress, chạy [pipeline di chuyển](/chuyen-tu-wordpress) vào đúng `siteKey` đó; nếu không, tạo `pageGroup` và các trang nền (giới thiệu, liên hệ, chính sách).
3. Điền `seoTitles`, `knowledgeGraph`, `socialProfiles` và mã GA4/GTM của khách.
4. Gán người dùng của khách (`admin` hoặc `editor`) và freelancer (`author`) vào site.
5. Frontend của khách lấy id site theo `siteKey`, lọc mọi truy vấn bằng `where[tenant][equals]=<id>` và nhận revalidate ở `/api/cms/revalidate`.
6. Kiểm tra bằng tài khoản `editor` thử đăng một bài, rồi bàn giao.

## Phân quyền theo site, theo khách

| Vai trò | Phạm vi | Dùng cho |
| --- | --- | --- |
| `super-admin` | Mọi site | Agency: tạo/xóa site và người dùng, gán site, sửa `r2`, chạy job |
| `admin` | Site được gán | Đầu mối phía khách: cài đặt site, xuất bản, kiểm duyệt bình luận, xóa vĩnh viễn |
| `editor` | Site được gán | Biên tập: xuất bản, kiểm duyệt bình luận, chuyển vào thùng rác |
| `author` | Site được gán | Freelancer: tạo nội dung, chỉ sửa bài của mình, không xuất bản |

Cơ chế chi tiết nằm ở trang [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung). Hai điểm cần lưu ý khi giao việc cho cộng tác viên:

- `author` bị chặn xuất bản bằng cả access predicate lẫn hook `beforeChange`, kể cả khi sửa trực tiếp bài đang live hoặc khôi phục bài đã xuất bản từ thùng rác.
- Tuy vậy `author` vẫn có thể tạo và sửa `taxonomies`, `menus`, `faqs`, `shortcodes`, `redirects` và `media` trong site được gán, vì các collection này chỉ dùng điều kiện theo site, không có điều kiện "bài của chính mình".

## Cài đặt riêng từng site

| Hạng mục | Riêng từng site? |
| --- | --- |
| Nội dung, taxonomy, menu, FAQ, shortcode, redirect, bình luận, tác giả | Có |
| Media (file và thư mục) | Có; backend lưu trữ chọn theo site |
| `seoTitles`, `knowledgeGraph`, `socialProfiles`, GA4/GTM/Clarity | Có |
| Shortcode trùng tên giữa hai khách | Được; mỗi tài liệu chỉ mở rộng shortcode của đúng site mình |
| Người dùng | Dùng chung; truy cập qua `tenants[]` |
| Vai trò, ngôn ngữ (`vi`/`en`) | Toàn cục |
| Biến môi trường (database, khóa AI, reCAPTCHA, jobs) | Toàn cục theo bản cài |

## Chi phí và vận hành

Một bản cài nghĩa là một image Docker (Next.js, cổng 3000), một PostgreSQL và một nơi để sao lưu. Nâng cấp là `git pull && docker compose up -d --build`; migration chạy khi khởi động. Sao lưu database bằng `pg_dump`:

```bash
docker compose exec -T db pg_dump -U kdigi --format=custom kdigi > kdigi-$(date +%F).dump
```

Hãy sao lưu thêm volume `media_data` cho các site dùng ổ đĩa. Lưu ý vận hành: hàng đợi revalidate chỉ chạy khi `ENABLE_JOBS_AUTORUN=true` trên đúng một instance. Chúng tôi không công bố con số chi phí hay benchmark; chi phí phụ thuộc máy chủ bạn chọn.

## Chuyển site WordPress của khách

Pipeline di chuyển nhập một site WordPress vào một site KDIGI qua `--site <siteKey>`: bài viết, trang, taxonomy, media, menu, tác giả, bình luận, SEO Yoast/RankMath, redirect và tùy chọn sản phẩm WooCommerce. Dữ liệu qua bước `raw/` → `staged/` → cổng review; database không phải local luôn được `pg_dump` trước khi ghi. Đọc [chuyển từ WordPress](/chuyen-tu-wordpress) trước khi báo giá cho khách.

## Khi nào KDIGI CMS không phù hợp với agency

- **Bạn cần giao diện dựng sẵn.** KDIGI CMS là headless: không có theme, giỏ hàng hay thanh toán. Mỗi khách cần một frontend, và đó là công việc dựng riêng ([Headless API](/tinh-nang/headless-api)).
- **Một người cần vai trò khác nhau ở các khách khác nhau.** Vai trò là toàn cục theo người dùng; hiện phải tạo tài khoản riêng.
- **Khách không chấp nhận chung hạ tầng.** Các site dùng chung một database và biến môi trường; khách cần cô lập hạ tầng nên có bản cài riêng.
- **Frontend quên lọc theo site.** Truy vấn ẩn danh trả về nội dung đã xuất bản của mọi site nếu thiếu `where[tenant][equals]=<id>`. Đây là điều phải kiểm tra trong code review.
- **Khách phụ thuộc plugin WordPress hoặc page builder.** Giao diện, plugin và nội dung page builder lưu ngoài `post_content` không được chuyển.

Xem thử trang quản trị tại [demo](/demo), hoặc dựng bản cài riêng theo hướng dẫn [tự host](/tu-host).
