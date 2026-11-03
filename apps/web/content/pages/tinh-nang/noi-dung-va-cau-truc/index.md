---
title: "Mô hình nội dung: bài viết, sản phẩm, taxonomy | KDIGI CMS"
description: "Mô hình nội dung gồm trang, bài viết, sản phẩm, landing, taxonomy, tác giả, FAQ, menu dạng cây, redirect, bình luận, đánh giá, phiên bản và thùng rác."
h1: "Nội dung và cấu trúc: trang, bài viết, sản phẩm, taxonomy"
navTitle: "Nội dung và cấu trúc"
primaryKeyword: "mô hình nội dung"
icon: database
lead: "Trang, bài viết, sản phẩm, landing cùng taxonomy, menu, FAQ và redirect, tất cả gắn với một website."
updated: 2026-11-03
heroImage: "/images/art/tinh-nang-noi-dung-va-cau-truc-hero.webp"
heroAlt: "Cây nút đất sét và kính mờ cạnh chồng thẻ nội dung, đại diện cho mô hình nội dung và phân loại"
schema: "TechArticle"
faq:
  - q: "KDIGI CMS có những loại nội dung nào?"
    a: "Bốn loại chính: `pages`, `posts`, `products` và `landings`. Kèm theo là `taxonomies`, `authors`, `menus`, `faqs`, `shortcodes`, `redirects`, `comments` và `media`, đều gắn với một website qua `tenant`."
  - q: "Slug có trùng được giữa các website không?"
    a: "Có. Slug duy nhất theo từng site và chỉ tính các bản chưa vào thùng rác. Khôi phục vào slug đã bị chiếm thì CMS báo lỗi rõ ràng."
  - q: "Đổi slug có làm mất SEO không?"
    a: "Không, miễn là frontend áp dụng danh sách redirect. Hook `autoRedirectOnSlugChange` tự tạo redirect 301 từ đường dẫn cũ sang mới và không bao giờ chặn việc lưu."
  - q: "Nội dung có đa ngôn ngữ không?"
    a: "Có hai ngôn ngữ `vi` (mặc định) và `en`, bật fallback: trường thiếu bản `en` lấy bản `vi`. REST nhận tham số `locale`."
related:
  - /tinh-nang/quy-trinh-bien-tap
  - /tinh-nang/trinh-soan-thao-markdown
  - /tinh-nang/seo-json-ld
  - /tinh-nang/headless-api
  - /thuc-hanh-tot/cau-truc-noi-dung
docs: "https://docs.opencms.kdigi.vn/en/tham-khao/collections/"
---

Nội dung chia thành bốn loại chính, nhóm phân loại và điều hướng, cùng nhóm hỗ trợ. Mọi thứ gắn với một website qua `tenant`; slug duy nhất theo từng site.

> **Tóm tắt nhanh**
>
> - 4 loại nội dung; slug duy nhất theo site.
> - Taxonomy dạng cây, 4 loại.
> - Menu kéo thả, 5 vị trí, nhãn vi/en.
> - Tối đa 30 phiên bản; có thùng rác.
> - Tự động: slug, tóm tắt, tác giả, redirect.

![Danh sách bài viết: tab trạng thái, loại, ngày đăng, bình luận](/images/shots/posts-list.webp)

## :boxes: Bốn loại nội dung

:::cards 2
- :newspaper: **Posts** Blog, tin tức, hướng dẫn (`type`: `blog`, `news`, `guide`).
- :file-text: **Pages** Trang tĩnh; `pageType` là `default`, `blog` hoặc `landing`.
- :shopping-cart: **Products** Trang sản phẩm hoặc dịch vụ: giá, hero, khối thông báo.
- :layout-template: **Landings** Trang marketing dựng từ 12 loại block, kèm chiến dịch UTM.
:::

## :tags: Phân loại và tác giả

:::cards
- :tags: **Taxonomy** `category`, `product-category`, `tag`, `custom`; có cây cha-con.
- :users: **Tác giả** Hồ sơ E-E-A-T với `sameAs`; email không lộ qua API.
- :list-checks: **FAQ** Nhóm câu hỏi dạng Markdown, gắn vào bài để sinh FAQPage ([SEO](/tinh-nang/seo-json-ld)).
:::

![Danh sách chuyên mục và thẻ (taxonomies) của một website](/images/shots/taxonomies.webp "Taxonomies: chuyên mục và thẻ của site")

## :map: Menu dạng cây

Mỗi site có một menu cho mỗi vị trí: `PRIMARY`, `SECONDARY_MENU`, `MOBILE_MENU`, `FOOTER_MENU`, `LOGGEDIN_ACCOUNT_MENU`. Chỉnh bằng bộ dựng kéo thả, lồng tối đa 10 cấp. REST trả `items` thay vì `tree` ([Headless API](/tinh-nang/headless-api)).

![Bộ dựng cây menu PRIMARY: kéo thả, lồng cấp, nhãn VI/EN](/images/shots/menu-tree.webp)

## :link: Redirect, shortcode, bình luận

:::cards
- :arrow-right: **Redirect** `301` mặc định hoặc `302`; chỉ đường dẫn nội bộ; tự tạo khi đổi slug.
- :package: **Shortcode** Đoạn Markdown dùng lại theo site, gọi bằng `[sc name="ten" /]`.
- :heart-handshake: **Bình luận và đánh giá** Bình luận có kiểm duyệt; đánh giá sao mỗi IP một phiếu.
:::

## :history: Phiên bản, thùng rác, hẹn giờ

:::check
- Xuất bản là trường `status` (`draft` hoặc `published`)
- Tối đa 30 phiên bản; có History, diff, Restore
- Thùng rác cho pages, posts, products, landings, faqs, shortcodes
- Hẹn giờ bằng `publishedAt` ở tương lai
:::

Chi tiết ở [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap).

## :languages: Đa ngôn ngữ

Nội dung có `vi` (mặc định) và `en`; trường thiếu `en` rơi về `vi`. Tiêu đề, nội dung, văn bản SEO, FAQ, nhãn menu và shortcode đều dịch được. Ngôn ngữ giao diện admin cấu hình riêng.

## :workflow: Tự động khi lưu

| Hook | Tác dụng |
| --- | --- |
| `autoRedirectOnSlugChange` | Tạo redirect 301 khi đổi slug |
| `autoFillExcerpt`, `autoFillAuthor`, `postsWordCount` | Điền tóm tắt, tác giả, đếm từ |
| `makeGenerateJsonLdHook` | Dựng JSON-LD, không tạo thêm phiên bản |
| `triggerRevalidate` | Xếp job làm mới frontend |

## :list-checks: Thực hành tốt

:::check
- Bài có ngày và tác giả → `posts`; trang ít đổi → `pages`
- Giữ `category` cho blog, `product-category` cho cửa hàng
- Dùng FAQ nhóm và shortcode thay vì sao chép đoạn văn
- Để trống `seo.title` khi mẫu của site đã đủ tốt
:::

Xem [thực hành cấu trúc nội dung](/thuc-hanh-tot/cau-truc-noi-dung), soạn bài ở [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown) và [Collections trên docs](https://docs.opencms.kdigi.vn/en/tham-khao/collections/).
