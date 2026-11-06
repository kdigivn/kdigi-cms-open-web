---
title: "Cấu trúc nội dung và taxonomy cho website hiệu quả"
description: "Cách tổ chức loại nội dung, danh mục, thẻ và liên kết pillar–cluster trong KDIGI CMS để tránh nội dung trùng lặp và giúp Google lẫn AI hiểu chủ đề."
h1: "Cấu trúc nội dung và taxonomy: danh mục, thẻ, pillar–cluster"
navTitle: "Cấu trúc nội dung"
icon: layout-template
lead: "Chọn loại nội dung theo vai trò của trang, giữ chuyên mục nông, chốt slug sớm."
primaryKeyword: "cấu trúc nội dung website"
updated: 2026-11-03
heroImage: /images/shots/menu-tree.webp
heroAlt: "Trình chỉnh menu dạng cây kéo thả trong KDIGI CMS"
schema: TechArticle
faq:
  - q: "Khi nào dùng page, post, product hay landing?"
    a: "Page cho nội dung tĩnh. Post cho nội dung có ngày và tác giả. Product cho trang sản phẩm hoặc dịch vụ có giá. Landing cho trang chiến dịch ghép từ block."
  - q: "Nên dùng category hay tag?"
    a: "Category làm khung chủ đề ổn định, có cây cha/con. Tag cho thuộc tính ngang. Taxonomy có contentMd dưới 500 từ bị CMS đánh dấu là nội dung mỏng."
  - q: "Shortcode dùng để làm gì và giới hạn gì?"
    a: "Shortcode là đoạn Markdown dùng lại, chèn bằng [sc name=\"ten\" /]. Thuộc từng site, lồng tối đa 3 cấp, đọc công khai nên đừng lưu dữ liệu riêng tư."
  - q: "Đổi slug hoặc chuyển bài giữa chuyên mục có ảnh hưởng URL không?"
    a: "Đổi slug tự tạo redirect 301. Đổi chuyên mục không đổi URL vì bài nằm ở gốc site (/slug), chỉ breadcrumb đổi theo chuyên mục chính."
  - q: "FAQ nên đặt ở bài viết hay ở collection FAQ?"
    a: "FAQ là collection riêng, mỗi tài liệu là một nhóm câu hỏi. Bài, trang, sản phẩm tham chiếu qua trường faqs để dùng lại và sinh FAQPage JSON-LD."
related:
  - /tinh-nang/noi-dung-va-cau-truc
  - /tinh-nang/trinh-soan-thao-markdown
  - /thuc-hanh-tot/seo-onpage
  - /tinh-nang/quy-trinh-bien-tap
  - /giai-phap/blog-tin-tuc
docs: https://docs.cms.kdigi.vn/tham-khao/collections/
---

Dùng `pages` cho nội dung tĩnh, `posts` cho bài có ngày và tác giả, `products` cho sản phẩm/dịch vụ, `landings` cho trang chiến dịch. Chọn đúng từ đầu giúp URL, breadcrumb và JSON-LD nhất quán.

> **Tóm tắt nhanh**
> - Bốn loại nội dung, mỗi loại có tối đa 30 phiên bản và thùng rác.
> - Taxonomy có 4 `type`: `category`, `product-category`, `tag`, `custom`.
> - Slug duy nhất theo site; đổi slug tạo redirect 301.
> - Menu là cây kéo thả, 5 vị trí.

![Trình quản lý FAQ theo nhóm câu hỏi trong KDIGI CMS](/images/shots/faq.webp "FAQ là collection riêng: mỗi tài liệu là một nhóm câu hỏi")

## :boxes: Chọn loại nội dung

:::cards 2
- :file-text: **Trang tĩnh** `pages`: giới thiệu, liên hệ, chính sách, trang trụ cột; có `isPillarPage`.
- :newspaper: **Bài viết** `posts`: có ngày và tác giả, loại `blog`, `news`, `guide`.
- :package: **Sản phẩm, dịch vụ** `products`: đúng một dòng giá, không có giỏ hàng. Xem [website bán hàng](/giai-phap/website-ban-hang).
- :layout-template: **Landing** `landings`: trang chiến dịch ghép từ block, có `campaign` (UTM).
:::

Chi tiết mô hình: [nội dung và cấu trúc](/tinh-nang/noi-dung-va-cau-truc).

## :tags: Thiết kế taxonomy

| `type` | Mục đích |
| --- | --- |
| `category` | Chuyên mục blog, có `parent` tạo cây |
| `product-category` | Danh mục sản phẩm, tách khỏi `category` |
| `tag` | Thẻ ngang |
| `custom` | Tùy biến, giữ tên gốc khi nhập từ WordPress |

:::check
- Cây nông: 1–2 cấp
- Mỗi bài thuộc một chuyên mục chính
- Viết `contentMd` riêng cho trang chuyên mục (trên 500 từ)
- Dùng `tier`/`cluster` để ghi cụm chủ đề cho đội biên tập
:::

## :link: Slug và URL

Slug tự sinh từ tiêu đề (bỏ dấu, `đ` → `d`) và duy nhất theo site. Tài liệu trong thùng rác vẫn giữ slug. Sản phẩm nằm ở `/product/{slug}`, `product-category` ở `/product-category/…`, còn lại ở gốc.

> **Mẹo** Frontend định tuyến khác (ví dụ `/blog/{slug}`) thì sửa `slug-url-prefix-map.ts` và `publicPathFor` trong `src/lib/frontend-public-path.ts`.

## :map: Menu dạng cây

`menus` có một tài liệu cho mỗi `location` mỗi site: `PRIMARY`, `SECONDARY_MENU`, `MOBILE_MENU`, `FOOTER_MENU`, `LOGGEDIN_ACCOUNT_MENU`. REST trả `items` đã chiếu theo ngôn ngữ, độ sâu tối đa 10 cấp.

:::check
- Menu chính ≤ 7 mục cấp 1
- Trang trụ cột ở cấp 1, bài con ở cấp 2
- Footer chứa trang pháp lý
:::

## :book-open: FAQ, tác giả, shortcode

:::cards
- :life-buoy: **FAQ** Một tài liệu là một nhóm câu hỏi; gắn qua `faqs` để sinh `FAQPage`.
- :heart-handshake: **Tác giả** `authors` có `bio`, `avatar`, `sameAs[]`; email không bao giờ trả qua API.
- :code: **Shortcode** `[sc name="chinh-sach-doi-tra" /]`, lồng tối đa 3 cấp, riêng từng site.
:::

## :history: Vòng đời nội dung

| Tình huống | Cơ chế |
| --- | --- |
| Đăng theo lịch | `publishedAt` ở tương lai |
| Quay lại bản cũ | History/Diff/Restore, 30 phiên bản |
| Xóa nhầm | Thùng rác; `admin` trở lên xóa vĩnh viễn |
| Hết hạn chiến dịch | Landing chuyển `archived` |

> **Lưu ý** Cache frontend chỉ làm mới khi có lưu, không theo đồng hồ. Xem [hiệu năng và cache](/thuc-hanh-tot/hieu-nang-va-cache).

## :workflow: Pillar–cluster trong KDIGI CMS

:::steps
- :file-text: **Trang trụ cột** `pages` với `isPillarPage`, nội dung dài, có FAQ.
- :tags: **Chuyên mục** `category` có mô tả `contentMd` riêng.
- :pen-line: **Bài con** `posts` thuộc một chuyên mục chính, ghi cụm vào `cluster`/`tier`.
- :link: **Liên kết** Bài con trỏ lên trụ cột; dùng bộ chọn `@` trong editor.
:::

`tier` và `cluster` chỉ là siêu dữ liệu; CMS không tự dựng liên kết từ chúng. Mỗi truy vấn chính chỉ nên có một trang đích.

## :list-checks: Checklist cấu trúc

:::check
- Mỗi loại nội dung có mục đích rõ
- Chuyên mục ≤ 2 cấp, có mô tả và SEO riêng
- Slug ngắn, ổn định; đã quy ước tiền tố URL ở frontend
- Menu chính khớp cụm chủ đề, không trang mồ côi
:::

Thử trên [bản demo](/demo), hoặc đọc [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap) để giao việc cho đội.
