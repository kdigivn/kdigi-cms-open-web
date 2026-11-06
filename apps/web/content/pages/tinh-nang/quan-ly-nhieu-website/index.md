---
title: "Quản lý nhiều website trên một CMS | KDIGI CMS"
description: "Một bảng quản trị cho nhiều website: tách dữ liệu theo site, cấu hình tên miền, thương hiệu, SEO riêng. Phù hợp agency và doanh nghiệp nhiều thương hiệu."
h1: "Quản lý nhiều website trong một hệ thống KDIGI CMS"
navTitle: "Quản lý nhiều website"
primaryKeyword: "quản lý nhiều website"
icon: layers
lead: "Một bảng quản trị cho nhiều website: mỗi site có tên miền, thương hiệu, SEO và nhóm biên tập riêng."
updated: 2026-11-03
heroImage: /images/art/tinh-nang-quan-ly-nhieu-website-hero.webp
heroAlt: "Một khối trung tâm xanh nối với bốn cửa sổ website kính mờ, quản lý nhiều website trong một cài đặt"
schema: WebPage
faq:
  - q: "Thêm một website mới có cần triển khai lại CMS không?"
    a: "Không. Thêm site chỉ là nhập dữ liệu trong admin: tạo document Sites với `siteKey`, `domain`, ngôn ngữ mặc định, rồi gán người dùng. Bạn chỉ cần trỏ frontend mới tới CMS."
  - q: "Dữ liệu giữa các site có bị lẫn vào nhau không?"
    a: "Không với người dùng đăng nhập: quyền đọc và ghi bị ràng buộc theo site. Với request ẩn danh, frontend phải luôn thêm `where[tenant][equals]` với id site của mình."
  - q: "Mỗi site có thể dùng kho media riêng không?"
    a: "Có. Mặc định upload lưu trên ổ đĩa. Nếu site khai báo nhóm `r2` (bucket, accountId), site đó dùng Cloudflare R2 riêng. Chỉ super-admin được sửa nhóm này."
  - q: "Người dùng có thể thuộc nhiều site không?"
    a: "Có, qua mảng `tenants` (mỗi site một dòng). Vai trò là toàn cục: một người có một vai trò trên mọi site của họ."
related:
  - /tinh-nang/phan-quyen-nguoi-dung
  - /tinh-nang/headless-api
  - /tinh-nang/thu-vien-media
  - /tu-host
  - /so-sanh/kdigi-cms-vs-wordpress
docs: https://docs.cms.kdigi.vn/huong-dan/nhieu-website/
---

Mỗi website là một document trong collection **Sites** (`siteKey` + `domain`), và mọi nội dung thuộc đúng một site qua trường `tenant`. Một bản cài, một cơ sở dữ liệu phục vụ nhiều frontend.

> **Tóm tắt nhanh**
>
> - Một document Sites là một website.
> - Nội dung tách theo `tenant`, quyền kiểm tra phía máy chủ.
> - Cấu hình riêng: thương hiệu, SEO, tích hợp, kho R2.
> - Thêm site không cần triển khai lại CMS.
> - Frontend chọn site bằng `siteKey`.

![Danh sách website trong KDIGI CMS khi đăng nhập super-admin](/images/shots/sites.webp)

## :settings: Sáu tab cấu hình mỗi site

:::cards
- :settings: **Hệ thống** `siteKey`, `domain`, ngôn ngữ mặc định, nhóm R2.
- :wand-sparkles: **Thương hiệu** Theme, màu chính, logo, favicon.
- :layout-template: **Trang chủ** Hero, slider, bài viết và sản phẩm nổi bật.
- :link: **Liên hệ & Footer** Nút liên hệ nổi, footer, sidebar.
- :search: **Trang & SEO** Mẫu tiêu đề, ảnh OG, Knowledge Graph. Xem [SEO và JSON-LD](/tinh-nang/seo-json-ld).
- :gauge: **Tích hợp** GA4, GTM, Clarity, manifest PWA.
:::

![Tab Hệ thống của một site: mã website, tên miền, ngôn ngữ mặc định và lưu trữ R2](/images/shots/site-settings-system.webp "Tab Hệ thống: siteKey, domain, defaultLanguage và nhóm R2")

## :shield-check: Dữ liệu được tách thế nào

Người dùng đăng nhập chỉ thấy các site được gán; ranh giới thật là điều kiện truy cập phía máy chủ, không phải bộ chọn site. Xem [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung).

> **Cảnh báo** Đọc ẩn danh **không** tự lọc theo site. Quên `where[tenant][equals]=<id>` thì request nhận nội dung đã xuất bản của mọi site. Đừng đặt bí mật vào trường Sites thông thường. Xem [Headless API](/tinh-nang/headless-api).

## :rocket: Thêm website mới

:::steps
- :users: **Đăng nhập super-admin** Người dùng đầu tiên của bản cài mới tự thành `super-admin`.
- :pen-line: **Tạo site** Sites → Create: nhập `siteKey`, `domain`, `defaultLanguage`.
- :key-round: **Gán người dùng** Thêm dòng vào `tenants` của người dùng.
- :settings: **Cấu hình site** Thương hiệu, SEO, tích hợp; R2 là tùy chọn.
- :newspaper: **Tạo nội dung** Menu, taxonomy, trang, bài viết.
- :code: **Trỏ frontend** Dùng `siteKey` mới và triển khai `/api/cms/revalidate` trên domain của site.
:::

## :hard-drive: Kho media riêng cho từng site

Mặc định upload lưu trên ổ đĩa. Site có `bucket` và `accountId` dùng Cloudflare R2 riêng; hai khóa bí mật chỉ ghi, không bao giờ trả qua API. Xem [thư viện media](/tinh-nang/thu-vien-media).

## :boxes: Dùng chung và riêng theo site

| Hạng mục | Riêng theo site | Ghi chú |
| --- | --- | --- |
| Nội dung, menu, FAQ, shortcode, redirect, bình luận, tác giả | ✓ | Qua `tenant` |
| Media, thư mục, kho lưu trữ | ✓ | R2 tùy chọn |
| Người dùng | ✗ | Gán site qua `tenants[]` |
| Vai trò | ✗ | Một vai trò cho mọi site của người dùng |
| Ngôn ngữ nội dung (`vi`, `en`) | ✗ | `defaultLanguage` riêng từng site |
| Biến môi trường | ✗ | Dùng chung toàn cài đặt |

## :building-2: Hợp với ai

Hợp với [agency](/giai-phap/agency) quản lý nhiều website khách hàng, doanh nghiệp nhiều thương hiệu, hoặc người đang gộp blog WordPress bằng [pipeline chuyển từ WordPress](/chuyen-tu-wordpress). So với WordPress: xem [so sánh KDIGI CMS và WordPress](/so-sanh/kdigi-cms-vs-wordpress). Thử ngay ở [bản demo](/demo) hoặc xem toàn bộ [tính năng](/tinh-nang).
