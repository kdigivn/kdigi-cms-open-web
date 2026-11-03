---
title: "CMS cho website doanh nghiệp chuẩn SEO"
description: "Website doanh nghiệp chuẩn SEO với trang giới thiệu, dịch vụ, tin tức, FAQ và JSON-LD tự động; tự host để kiểm soát dữ liệu và chi phí dài hạn."
h1: "Giải pháp KDIGI CMS cho website doanh nghiệp"
navTitle: "Doanh nghiệp"
icon: building-2
lead: "Trang giới thiệu, dịch vụ, tin tức và FAQ có phân quyền, lịch sử phiên bản, dữ liệu nằm trên hạ tầng của bạn."
primaryKeyword: "website doanh nghiệp chuẩn SEO"
updated: 2026-11-03
heroImage: /images/art/giai-phap-doanh-nghiep-hero.webp
heroAlt: "Toà tháp kính mờ ba tầng với mái xanh, đại diện cho website doanh nghiệp"
schema: WebPage
faq:
  - q: "KDIGI CMS có phù hợp làm website giới thiệu công ty không?"
    a: "Có, nếu bạn chấp nhận mô hình headless: CMS cung cấp admin và API cho pages, landings, products, FAQ, menu; giao diện công khai phải dựng riêng bằng Next.js, Astro hoặc framework khác."
  - q: "Quy trình duyệt bài hoạt động thế nào?"
    a: "Author tạo bản nháp của mình nhưng không xuất bản được. Editor trở lên xem lại rồi chuyển sang published. Chỉ có hai trạng thái draft và published, không có chuỗi duyệt nhiều bước."
  - q: "Dữ liệu doanh nghiệp được lưu và sao lưu ra sao?"
    a: "Dữ liệu nằm trong PostgreSQL của bạn, media ở volume cục bộ hoặc bucket Cloudflare R2. Sao lưu bằng pg_dump cộng volume media; tài liệu triển khai có sẵn lệnh."
  - q: "Có chính sách báo lỗi bảo mật không?"
    a: "Có, trong SECURITY.md: báo riêng tư qua GitHub Security Advisories, phản hồi trong 3 ngày làm việc, cập nhật trong 10 ngày, mục tiêu công bố tối đa 90 ngày."
  - q: "Website song ngữ Việt - Anh được hỗ trợ đến đâu?"
    a: "Nội dung có hai locale vi (mặc định) và en; thiếu giá trị en thì API lấy giá trị vi. Thêm ngôn ngữ thứ ba cần sửa cấu hình mã nguồn."
related:
  - /tinh-nang/quy-trinh-bien-tap
  - /tinh-nang/phan-quyen-nguoi-dung
  - /tinh-nang/seo-json-ld
  - /tu-host
  - /tinh-nang/noi-dung-va-cau-truc
  - /thuc-hanh-tot/seo-onpage
docs: https://docs.opencms.kdigi.vn/tham-khao/deploy/
---

KDIGI CMS là CMS headless cho website công ty có nhiều người biên tập: bạn quản trị nội dung trong admin và dựng giao diện công khai riêng. Giấy phép MIT, tự host bằng Docker Compose hoặc Coolify.

> **Tóm tắt nhanh**
> - Nội dung ở `pages`, `landings`, `products`, `posts`, `faqs`, `menus`.
> - Hai ngôn ngữ `vi` và `en`, thiếu `en` thì lấy `vi`.
> - `author` không xuất bản; `editor` trở lên duyệt.
> - Tối đa 30 phiên bản mỗi tài liệu, có thùng rác.

## :boxes: Cấu trúc nội dung cho website công ty

:::cards
- :file-text: **Trang tĩnh** `pages`: giới thiệu, liên hệ, chính sách.
- :layout-template: **Landing chiến dịch** `landings` dạng block: hero, cta, faq, stats, pricingTable…
- :briefcase: **Dịch vụ, sản phẩm** `products` với một dòng giá; không có giỏ hàng hay thanh toán.
- :newspaper: **Tin tức** `posts` loại `blog`, `news`, `guide`.
- :book-open: **FAQ** Gắn vào tài liệu để sinh FAQPage JSON-LD.
- :map: **Menu** Cây nhiều cấp, kéo thả trong admin.
:::

Xem [nội dung và cấu trúc](/tinh-nang/noi-dung-va-cau-truc) và [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown).

![Trình soạn thảo bài viết trong KDIGI CMS](/images/shots/editor.webp)

## :workflow: Quy trình duyệt bài đề xuất

:::steps
- :users: **Tạo tài khoản** Super-admin tạo người dùng và gán site ở trường `tenants`.
- :pen-line: **Soạn thảo** Nhân viên nội dung là `author`, tạo bản `draft` và chỉ sửa tài liệu của mình.
- :check: **Duyệt** Editor sửa nếu cần, đặt `status = published`; muốn hẹn giờ thì đặt `publishedAt` tương lai.
- :history: **Sửa bài đang live** Editor sửa, hoặc dùng History để Restore phiên bản cũ.
:::

Chi tiết ở [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap) và [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung).

![Bảng vai trò và phân quyền](/images/shots/roles.webp)

## :languages: Song ngữ vi/en

Cấu hình `locales: ['vi', 'en']`, mặc định `vi`, có fallback. Frontend gọi API với `?locale=vi` hoặc `?locale=en`; `defaultLanguage` của site quyết định ngôn ngữ JSON-LD.

## :search: Chuẩn SEO

:::check
- Điền `seoTitles` cho từng loại nội dung
- Điền `knowledgeGraph`: tên, logo, điện thoại, địa chỉ, giờ mở cửa
- Ánh xạ `pageGroup` cho `ABOUT`, `CONTACT`, `PRIVACY_POLICY`
- Gắn `faqs` vào trang dịch vụ
- Frontend chèn nguyên văn `seo.jsonLd.raw` vào `<head>`
- Đổi slug thì CMS tự tạo redirect 301
:::

> **Lưu ý** JSON-LD không đảm bảo thứ hạng, nó chỉ cung cấp dữ liệu có cấu trúc. Xem [SEO và JSON-LD](/tinh-nang/seo-json-ld) và [SEO on-page](/thuc-hanh-tot/seo-onpage).

## :hard-drive: Sở hữu dữ liệu và vận hành

:::cards
- :server: **Tự host** Một server Next.js cổng 3000 cùng PostgreSQL. Xem [tự host](/tu-host).
- :refresh-cw: **Sao lưu, nâng cấp** `pg_dump` định kỳ cộng volume media; đọc CHANGELOG trước khi `git pull`.
- :lock: **Bảo mật** `PAYLOAD_SECRET` từ 32 ký tự, HTTPS, tạo `super-admin` ngay sau khi triển khai.
:::

`SECURITY.md` quy định báo lỗi riêng tư, phản hồi trong 3 ngày làm việc. Đừng chạy `SEED_DEMO` trên bản cài thật.

## :scale: Khi nào không phù hợp

:::pros-cons
**Ưu điểm**
- Dữ liệu và chi phí nằm trong tay bạn
- Phân quyền, phiên bản, JSON-LD sẵn có

**Hạn chế**
- Không có theme: cần đội dựng frontend
- Không có duyệt nhiều cấp, chỉ `draft` và `published`
- Không có giỏ hàng; `products` chỉ một dòng giá
- Chỉ hai ngôn ngữ; tự host nghĩa là bạn lo sao lưu và bảo mật
:::

Dùng thử ở [demo](/demo), hoặc triển khai theo [tự host](/tu-host).
