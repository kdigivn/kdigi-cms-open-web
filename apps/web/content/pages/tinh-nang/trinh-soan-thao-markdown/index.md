---
title: "Trình soạn thảo Markdown cho CMS: Milkdown, slash menu"
description: "Soạn bài bằng Markdown với Milkdown: slash menu, dán từ Google Docs/Word, bảng, gallery, shortcode. Nội dung xuất HTML sạch, đúng cấu trúc cho SEO."
h1: "Trình soạn thảo Markdown (Milkdown) trong KDIGI CMS"
navTitle: "Trình soạn thảo Markdown"
primaryKeyword: "trình soạn thảo markdown"
icon: pen-line
lead: "Viết trong giao diện trực quan, lưu Markdown thuần, và nhận HTML đã làm sạch qua REST."
updated: 2026-11-03
heroImage: /images/art/tinh-nang-trinh-soan-thao-markdown-hero.webp
heroAlt: "Tài liệu kính mờ với thanh tiêu đề xanh, bảng và ảnh nhỏ, cạnh một cây bút đất sét, đại diện cho trình soạn thảo Markdown"
schema: WebPage
faq:
  - q: "Có dán được nội dung từ Google Docs hoặc Word không?"
    a: "Có. HTML trong clipboard được chuyển sang GFM, ảnh nhúng dạng data được tải lên thư viện media, và cả lần dán là một bước hoàn tác. Văn bản thuần và Markdown được dán nguyên bản."
  - q: "API trả về Markdown hay HTML?"
    a: "Qua REST, trường `content` là HTML đã làm sạch, còn Markdown gốc ở `contentMd`. GraphQL và Local API trả giá trị lưu thô, nên frontend nên đọc qua REST."
  - q: "Shortcode dùng để làm gì?"
    a: "Là đoạn Markdown dùng lại (bảng giá, chính sách), lưu theo từng site và chèn bằng `[sc name=\"ten\" /]`. CMS mở rộng khi render qua REST, lồng tối đa 3 cấp."
  - q: "HTML thô trong Markdown có an toàn không?"
    a: "Có. Đầu ra qua `markdown-it` rồi `sanitize-html` với danh sách cho phép; script, style, iframe, thuộc tính style và trình xử lý sự kiện đều bị loại."
related:
  - /tinh-nang/thu-vien-media
  - /tinh-nang/seo-json-ld
  - /tinh-nang/headless-api
  - /tinh-nang/quy-trinh-bien-tap
  - /chuyen-tu-wordpress
docs: https://docs.cms.kdigi.vn/huong-dan/soan-thao-markdown/
---

KDIGI CMS soạn bài bằng Milkdown (lõi Crepe). Nguồn sự thật là Markdown (`contentMd`, CommonMark + GFM); REST trả HTML đã làm sạch ở khóa `content`.

> **Tóm tắt nhanh**
>
> - Nguồn sự thật là Markdown, không phải HTML.
> - Slash menu `/`: tiêu đề, bảng, ảnh, shortcode.
> - `@` chèn liên kết nội bộ cùng site.
> - Dán từ Docs hoặc Word thành GFM.
> - HTML đầu ra qua `sanitize-html`.

![Trình soạn thảo Markdown trong trang chỉnh sửa bài viết](/images/shots/editor.webp)

## :wand-sparkles: Điểm nổi bật

:::cards
- :terminal: **Slash menu** Gõ `/` để chọn tiêu đề 1–6, danh sách, bảng, ảnh, khối mã.
- :link: **Liên kết nội bộ** Gõ `@` để tìm bài, trang, sản phẩm, landing cùng site.
- :file-text: **Dán từ Docs/Word** HTML chuyển sang GFM, ảnh nhúng tự tải lên.
- :image: **Ảnh** Dán, kéo thả hoặc nhập từ URL vào [thư viện media](/tinh-nang/thu-vien-media).
- :package: **Shortcode** `[sc name="ten" /]` dùng lại đoạn Markdown theo site.
- :search: **Tìm và thay thế** `Ctrl/Cmd+F`; bảng phím tắt ở `Ctrl/Cmd+/`.
:::

![Slash menu mở trong trình soạn thảo](/images/shots/editor-slash.webp)

> **Mẹo** Liên kết nội bộ là yếu tố SEO: bộ chấm điểm kiểm tra tối thiểu một liên kết nội bộ. Xem [SEO và JSON-LD](/tinh-nang/seo-json-ld).

## :code: API trả gì cho frontend

| Kênh đọc | `content` trả về |
| --- | --- |
| REST | HTML đã render và làm sạch |
| GraphQL | JSON Lexical thô, không mở rộng shortcode |
| Local API | JSON Lexical thô |

Cần HTML ngoài REST thì đọc `contentMd` rồi tự render. Xem [Headless API](/tinh-nang/headless-api).

## :shield-check: Đầu ra an toàn

:::check
- Loại `<script>`, `<style>`, `<iframe>`
- Loại thuộc tính `style` và trình xử lý sự kiện
- Thêm `width`/`height` cho ảnh, giảm dịch chuyển bố cục
- Shortcode chỉ mở rộng trong cùng site
:::

> **Lưu ý** Gallery hai cột của WordPress được giữ nguyên khi chuyển, hiển thị như khối chỉ đọc. Xem [chuyển từ WordPress](/chuyen-tu-wordpress).

## :list-checks: Quy trình viết bài

:::steps
- **Dựng khung** Gõ `/` để chọn H2, H3.
- **Dán bản nháp** Từ Google Docs; kiểm tra lại bảng và ảnh.
- **Chèn liên kết** Dùng `@` tới vài bài liên quan.
- **Đặt SEO** Từ khóa chính ở tab SEO.
- **Lưu và đăng** Qua [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap).
:::

Chi tiết kỹ thuật: [Soạn thảo Markdown](https://docs.cms.kdigi.vn/huong-dan/soan-thao-markdown/). Quay lại [tổng hợp tính năng](/tinh-nang).
