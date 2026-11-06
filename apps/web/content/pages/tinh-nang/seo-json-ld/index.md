---
title: "SEO và JSON-LD tích hợp sẵn trong KDIGI CMS"
description: "Trường SEO, mẫu title kiểu RankMath, đồ thị JSON-LD, ảnh OG dự phòng, kiểm tra SEO, gợi ý internal link và AI SEO tùy chọn ngay trong trình soạn thảo."
h1: "SEO on-page và JSON-LD tự động trong KDIGI CMS"
navTitle: "SEO và JSON-LD"
primaryKeyword: "json-ld"
icon: search
lead: "Trường SEO, mẫu tiêu đề kiểu Rank Math, JSON-LD tự sinh khi lưu và công cụ kiểm tra ngay trong CMS."
updated: 2026-11-03
heroImage: /images/art/tinh-nang-seo-json-ld-hero.webp
heroAlt: "Kính lúp kính mờ cạnh biểu đồ cột và đồ thị nút, đại diện cho SEO và JSON-LD"
schema: WebPage
faq:
  - q: "JSON-LD được tạo tự động hay phải viết tay?"
    a: "Tự động. Mỗi lần lưu, CMS dựng đồ thị schema.org vào `seo.jsonLd.raw` dưới dạng thẻ script hoàn chỉnh. Frontend chỉ cần chèn nguyên văn."
  - q: "Vì sao `seo.title` trong API thường để trống?"
    a: "Đó là thiết kế: trống nghĩa là dùng mẫu của site. Đổi mẫu thì mọi tài liệu chưa ghi đè đổi theo ngay. Đừng điền sẵn hàng loạt vì sẽ đóng băng giá trị."
  - q: "Có bắt buộc dùng AI để viết SEO không?"
    a: "Không. AI SEO chỉ bật khi đặt `DEEPSEEK_API_KEY` và `DEEPSEEK_MODEL`. Thiếu khóa thì các tính năng SEO khác vẫn chạy bình thường."
  - q: "Đổi slug có làm mất thứ hạng không?"
    a: "CMS giảm rủi ro: đổi slug trong admin tự tạo redirect 301 từ đường dẫn cũ sang mới. Frontend phải áp dụng danh sách redirect; script ngoài admin phải tự tạo."
related:
  - /tinh-nang/trinh-soan-thao-markdown
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/headless-api
  - /thuc-hanh-tot/seo-onpage
  - /so-sanh/kdigi-cms-vs-wordpress
docs: https://docs.cms.kdigi.vn/huong-dan/seo-json-ld/
---

Tiêu đề và mô tả là **mẫu có biến**, giải quyết lúc render; JSON-LD schema.org được tự sinh khi lưu vào `seo.jsonLd.raw`. Bạn không cần plugin SEO riêng.

> **Tóm tắt nhanh**
>
> - Mẫu theo site, ghi đè theo từng tài liệu.
> - JSON-LD `@graph` sinh khi lưu, chèn nguyên văn.
> - Ảnh Open Graph có chuỗi dự phòng.
> - Điểm SEO 0–100 và `GET /api/seo/audit`.
> - Đổi slug tự tạo redirect 301.

![Tab SEO của một site: ảnh Open Graph mặc định và danh tính Knowledge Graph](/images/shots/site-seo.webp)

## :layout-template: Mẫu thay vì giá trị lưu cứng

:::steps
- :settings: **Mẫu của site** `Sites.seoTitles`: admin đặt một lần cho mỗi nhóm nội dung.
- :pen-line: **Ghi đè từng tài liệu** `seo.title`, `seo.description`. Để trống là dùng mẫu.
- :code: **Frontend giải quyết** Khi render, theo cùng quy tắc ưu tiên.
:::

Biến thường dùng: `%title%`, `%sitename%`, `%sep%`, `%excerpt%`, `%category%`, `%focuskw%`.

> **Lưu ý** `seo.title` trống trong API là đúng thiết kế. Đổi mẫu của site có hiệu lực ngay với mọi tài liệu chưa ghi đè.

## :workflow: JSON-LD tự sinh

Hook chạy sau mỗi lần lưu `pages`, `posts`, `products`, `landings`, `taxonomies`. Nó ghi bằng một lệnh `UPDATE` nên không tạo thêm phiên bản.

| Loại | Node chính |
| --- | --- |
| `posts` | `BlogPosting`, `Person`, `BreadcrumbList`, `WebSite`, `Organization` |
| `pages` | `WebPage` (hoặc `ContactPage`, `AboutPage`), `BreadcrumbList`, `FAQPage` |
| `products`, `landings` | `Product` kèm `Offer`, `ItemPage`, `FAQPage` |
| `taxonomies` | `CollectionPage`, `BreadcrumbList` |

```tsx
<div dangerouslySetInnerHTML={{ __html: post.seo.jsonLd.raw }} />
```

:::check
- `offers` chỉ xuất khi giá hiện tại lớn hơn 0
- `aggregateRating` cần đủ lượt đánh giá hoặc bật override
- `FAQPage` bỏ mục thiếu câu hỏi hoặc câu trả lời
- Mọi ký tự `<` được escape thành `\u003c`
:::

## :image: Ảnh Open Graph

Thứ tự dự phòng: `seo.openGraph.image` → `featuredImage` → `Sites.seoDefaults.ogImage`. JSON-LD dùng cùng thứ tự nên thẻ meta và đồ thị luôn khớp nhau.

## :gauge: Công cụ kiểm tra

:::cards 2
- :gauge: **Điểm SEO** 0–100 trong trình soạn thảo: từ khóa, độ dài, liên kết nội bộ.
- :list-checks: **Kiểm tra SEO** `GET /api/seo/audit` liệt kê tài liệu thiếu sót, xấu nhất trước.
- :link: **Gợi ý liên kết nội bộ** `GET /api/seo/internal-link-suggest`, tối đa 10 gợi ý.
- :bot: **AI SEO (tùy chọn)** Gợi ý tiêu đề, mô tả, alt; cần `DEEPSEEK_API_KEY` và `DEEPSEEK_MODEL`.
:::

![Thẻ Kiểm tra SEO trên bảng điều khiển liệt kê tài liệu cần cải thiện](/images/shots/dashboard-seo-audit.webp "Thẻ Kiểm tra SEO trên bảng điều khiển")

## :history: Slug và redirect

Slug tự sinh từ tiêu đề (bỏ dấu, `đ` thành `d`). Đổi slug của tài liệu đã có thì CMS tạo redirect `301` và xếp job làm mới cache cho slug cũ. Hook không bao giờ chặn việc lưu.

## :rocket: Quy trình cho site mới

:::steps
- **Điền danh tính** `knowledgeGraph`, `socialProfiles`, `seoDefaults.ogImage` ở tab Trang & SEO của [site](/tinh-nang/quan-ly-nhieu-website).
- **Đặt mẫu** `seoTitles` cho từng nhóm, giữ tiêu đề ≤ 60 ký tự.
- **Nhập từ khóa chính** Ở `seo.focusKeywords`, theo dõi điểm trong trình soạn thảo.
- **Chèn JSON-LD** Dùng `seo.jsonLd.raw` ở frontend và kiểm tra bằng công cụ dữ liệu có cấu trúc.
- **Chạy audit** Định kỳ để tìm tài liệu `noindex` hay canonical hỏng.
:::

Xem thêm [SEO on-page với KDIGI CMS](/thuc-hanh-tot/seo-onpage), [so sánh với WordPress](/so-sanh/kdigi-cms-vs-wordpress) và [tài liệu SEO](https://docs.cms.kdigi.vn/huong-dan/seo-json-ld/). Soạn bài ở [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown); quay lại [tính năng](/tinh-nang).
