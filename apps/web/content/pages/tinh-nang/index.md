---
title: "Tính năng KDIGI CMS: đa website, Markdown, SEO, API"
description: "Toàn bộ tính năng KDIGI CMS: quản lý nhiều website, trình soạn Markdown, SEO và JSON-LD, thư viện media, phân quyền, headless API, quy trình biên tập."
h1: "Tính năng của KDIGI CMS"
navTitle: "Tính năng"
primaryKeyword: "tính năng kdigi cms"
icon: sparkles
lead: "Tám nhóm tính năng cho một CMS headless: nhiều website, Markdown, SEO, media, phân quyền, API, nội dung và biên tập."
updated: 2026-11-03
heroImage: /images/art/tinh-nang-hero.webp
heroAlt: "Lưới các ô kính mờ quanh một ô xanh trung tâm, tượng trưng cho bản đồ tính năng KDIGI CMS"
schema: CollectionPage
faq:
  - q: "KDIGI CMS có phải là CMS headless không?"
    a: "Có. KDIGI CMS gồm trang quản trị và API REST/GraphQL, không kèm giao diện website. Bạn dựng frontend bằng Next.js, Astro hay Nuxt, rồi lấy nội dung qua API."
  - q: "KDIGI CMS có hỗ trợ tiếng Việt không?"
    a: "Có. Nội dung có hai ngôn ngữ `vi` (mặc định) và `en` kèm fallback; giao diện quản trị cũng có tiếng Việt và tiếng Anh. Trình tạo slug tự bỏ dấu."
  - q: "Tính năng AI SEO có bắt buộc không?"
    a: "Không. AI SEO chỉ chạy khi bạn đặt `DEEPSEEK_API_KEY` và `DEEPSEEK_MODEL`. Mẫu tiêu đề, JSON-LD và kiểm tra SEO đều chạy mà không cần AI."
related:
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/trinh-soan-thao-markdown
  - /tinh-nang/seo-json-ld
  - /chuyen-tu-wordpress
  - /so-sanh
docs: https://docs.opencms.kdigi.vn/
---

KDIGI CMS là CMS headless mã nguồn mở (MIT): một trang quản trị và API cho nhiều website. Mỗi nhóm tính năng dưới đây có trang riêng, mô tả đúng theo tài liệu mã nguồn.

> **Tóm tắt nhanh**
>
> - Một bản cài phục vụ nhiều website.
> - Soạn Markdown; API trả HTML đã làm sạch.
> - SEO và JSON-LD tạo sẵn khi lưu.
> - Bốn vai trò, gán theo từng website.
> - Docker Compose chạy bằng một lệnh.

## :layers: Tám nhóm tính năng

:::cards
- :layers: **Nhiều website** Mỗi site có thương hiệu, SEO và menu riêng. [Xem chi tiết](/tinh-nang/quan-ly-nhieu-website)
- :pen-line: **Soạn Markdown** Milkdown, slash menu, dán từ Docs hoặc Word. [Xem chi tiết](/tinh-nang/trinh-soan-thao-markdown)
- :search: **SEO và JSON-LD** Mẫu tiêu đề, đồ thị `@graph`, kiểm tra SEO. [Xem chi tiết](/tinh-nang/seo-json-ld)
- :image: **Thư viện media** Thư mục, sửa ảnh, lưu ổ đĩa hoặc R2. [Xem chi tiết](/tinh-nang/thu-vien-media)
- :shield-check: **Phân quyền** Bốn vai trò, giới hạn theo website. [Xem chi tiết](/tinh-nang/phan-quyen-nguoi-dung)
- :code: **Headless API** REST, GraphQL và webhook revalidate. [Xem chi tiết](/tinh-nang/headless-api)
- :database: **Nội dung và cấu trúc** Trang, bài viết, sản phẩm, landing, taxonomy. [Xem chi tiết](/tinh-nang/noi-dung-va-cau-truc)
- :calendar-clock: **Quy trình biên tập** Lịch, hẹn giờ, phiên bản, thùng rác. [Xem chi tiết](/tinh-nang/quy-trinh-bien-tap)
:::

![Danh sách website trong KDIGI CMS](/images/shots/sites.webp)

## :gauge: Con số chính

:::stats
- **4** vai trò người dùng
- **2** ngôn ngữ nội dung: vi, en
- **30** phiên bản tối đa mỗi tài liệu
- **5** vị trí menu mỗi site
:::

## :map: Di chuyển và vận hành

:::cards 2
- :refresh-cw: **Chuyển từ WordPress** Pipeline ba giai đoạn, có cổng duyệt và sao lưu. [Xem chi tiết](/chuyen-tu-wordpress)
- :server: **Tự host** `docker compose up` là chạy; có sẵn tệp cho Coolify. [Xem chi tiết](/tu-host)
:::

## :scale: Khi nào nên chọn KDIGI CMS?

:::pros-cons
**Ưu điểm**

- Gộp nhiều website vào một hệ thống
- SEO có cấu trúc, JSON-LD tự sinh
- Tự host, kiểm soát dữ liệu
- Có pipeline rời WordPress

**Hạn chế**

- Không có giao diện website dựng sẵn
- Không có hệ sinh thái theme/plugin
:::

Cần so sánh có nguồn dẫn? Xem [trang so sánh](/so-sanh).

## :rocket: Thử ngay

:::cards
- :eye: **Demo trực tuyến** Đăng nhập bằng tài khoản biên tập công khai. [Mở demo](/demo)
- :book-open: **Tài liệu kỹ thuật** Hướng dẫn chi tiết từng tính năng. [Đọc tài liệu](https://docs.opencms.kdigi.vn/)
- :boxes: **Tổng quan dự án** Quay lại [trang chủ KDIGI CMS](/).
:::
