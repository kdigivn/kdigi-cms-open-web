---
title: "Thực hành tốt khi vận hành website với KDIGI CMS"
description: "Hướng dẫn thực hành tốt cho KDIGI CMS: SEO on-page, cấu trúc nội dung, bảo mật và phân quyền, hiệu năng và cache, sao lưu và nâng cấp. Chọn bài theo vai trò."
h1: "Thực hành tốt: SEO, nội dung, bảo mật, hiệu năng"
navTitle: "Thực hành tốt"
icon: list-checks
lead: "Năm bài ngắn, mỗi bài có checklist và lệnh thật. Chọn bài theo việc bạn đang làm."
primaryKeyword: "website chuẩn seo"
updated: 2026-11-03
heroImage: /images/art/thuc-hanh-tot-hero.webp
heroAlt: "Hình minh họa trừu tượng về quy trình vận hành và tối ưu một hệ thống quản trị nội dung"
schema: CollectionPage
order: 40
faq:
  - q: "Nên đọc bài thực hành nào trước?"
    a: "Đang dựng site: cấu trúc nội dung rồi SEO on-page. Chuẩn bị production: bảo mật, sao lưu và nâng cấp. Đã có người dùng thật: hiệu năng và cache."
  - q: "Các hướng dẫn này áp dụng cho phiên bản nào?"
    a: "Nội dung đối chiếu với tài liệu và CHANGELOG của KDIGI CMS 1.2.0 (2026-11-03). Dùng bản khác thì đọc CHANGELOG giữa hai bản trước khi áp dụng."
related:
  - /tinh-nang/seo-json-ld
  - /chuyen-tu-wordpress
  - /tu-host
  - /demo
docs: https://docs.cms.kdigi.vn/tham-khao/overview/
---

Thực hành tốt xoay quanh năm nhóm việc: cấu trúc nội dung, SEO on-page, bảo mật, hiệu năng và sao lưu. KDIGI CMS chỉ là admin và API, nên cache và CDN thuộc về frontend và hạ tầng của bạn.

> **Tóm tắt nhanh**
> - Năm bài, đối chiếu với CHANGELOG 1.2.0.
> - Thứ tự: nội dung → SEO → bảo mật → hiệu năng → sao lưu.
> - Khó đảo ngược nhất: slug, quy ước URL, vai trò, `PAYLOAD_PUBLIC_SERVER_URL`.

## :book-open: Chọn bài theo mục tiêu

:::cards
- :layout-template: **Dựng site mới** [Cấu trúc nội dung](/thuc-hanh-tot/cau-truc-noi-dung): loại nội dung, chuyên mục, slug, menu.
- :search: **Lên top, rich result** [SEO on-page](/thuc-hanh-tot/seo-onpage): mẫu tiêu đề, JSON-LD, Open Graph, redirect.
- :shield-check: **Lên production** [Bảo mật và phân quyền](/thuc-hanh-tot/bao-mat-va-phan-quyen): checklist triển khai, vai trò, bí mật.
- :gauge: **Site chậm hoặc không cập nhật** [Hiệu năng và cache](/thuc-hanh-tot/hieu-nang-va-cache): revalidate, job runner, truy vấn gọn.
- :hard-drive: **Sắp nâng cấp** [Sao lưu và nâng cấp](/thuc-hanh-tot/sao-luu-va-nang-cap): backup, migration, rollback.
:::

## :rocket: Lộ trình 5 bước cho site mới

:::steps
- :boxes: **Cấu trúc** Chốt loại nội dung, cây chuyên mục ≤ 2 cấp, quy ước slug, menu, tác giả.
- :settings: **Cấu hình site** `domain`, `defaultLanguage`, `seoTitles`, `knowledgeGraph`. Xem [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website).
- :users: **Phân quyền** Vai trò tối thiểu, gán đúng site. Xem [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung).
- :link: **Tích hợp frontend** Lọc `tenant`, nối webhook revalidate. Xem [API headless](/tinh-nang/headless-api).
- :history: **Vận hành** Sao lưu hằng đêm, khôi phục thử mỗi tháng, đọc CHANGELOG trước khi nâng cấp.
:::

## :sparkles: Nguyên tắc chung

:::cards 2
- :settings: **Cấu hình ở site** Mẫu SEO, danh tính tổ chức, ảnh OG đặt ở `Sites`; ghi đè từng bài khi cần.
- :lock: **Quyền tối thiểu** Ranh giới thật là access predicate; frontend luôn lọc `where[tenant][equals]=<id>`.
- :git-branch: **Schema qua migration** Sao lưu → migrate → kiểm tra, mỗi lần nâng cấp.
- :eye: **Đừng tin một tín hiệu** `GET /api/health` chỉ báo tiến trình sống; điểm SEO chỉ là checklist.
:::

## :cloud-upload: Đang chuyển từ WordPress

Làm theo [chuyển từ WordPress](/chuyen-tu-wordpress), rồi rà [SEO on-page](/thuc-hanh-tot/seo-onpage) và [sao lưu](/thuc-hanh-tot/sao-luu-va-nang-cap) trước khi chuyển DNS.

Thử trên [bản demo](/demo) hoặc [tự host](/tu-host); chọn mô hình theo [giải pháp cho agency](/giai-phap/agency) hoặc [doanh nghiệp](/giai-phap/doanh-nghiep).
