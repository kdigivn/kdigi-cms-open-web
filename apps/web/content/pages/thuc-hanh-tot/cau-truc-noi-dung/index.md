---
title: "Cấu trúc nội dung và taxonomy cho website hiệu quả"
description: "Cách tổ chức loại nội dung, danh mục, thẻ và liên kết pillar–cluster trong KDIGI CMS để tránh nội dung trùng lặp và giúp Google lẫn AI hiểu chủ đề."
h1: "Cấu trúc nội dung và taxonomy: danh mục, thẻ, pillar–cluster"
primaryKeyword: "cấu trúc nội dung website"
updated: 2026-11-03
heroImage: /images/shots/menu-tree.webp
heroAlt: "Trình chỉnh menu dạng cây kéo thả trong KDIGI CMS"
schema: TechArticle
faq:
  - q: "Khi nào dùng page, post, product hay landing?"
    a: "Page cho nội dung tĩnh như giới thiệu, liên hệ, chính sách. Post cho nội dung có ngày và tác giả (blog, tin, hướng dẫn). Product cho trang sản phẩm hoặc dịch vụ có giá. Landing cho trang chiến dịch ghép từ block. Chọn theo vai trò của trang, không theo giao diện muốn hiển thị."
  - q: "Nên dùng category hay tag?"
    a: "Dùng category làm khung chủ đề ổn định, có cây cha/con, mỗi bài thuộc ít chuyên mục. Dùng tag cho thuộc tính ngang, linh hoạt. Hãy đảm bảo mỗi category có nội dung mô tả riêng (contentMd) trên 500 từ, vì CMS đánh dấu taxonomy dưới ngưỡng này là nội dung mỏng."
  - q: "Shortcode dùng để làm gì và có giới hạn gì?"
    a: "Shortcode là đoạn Markdown tái sử dụng, chèn bằng [sc name=\"ten\" /]. Chúng thuộc từng site, lồng nhau tối đa 3 cấp, và tên không tìm thấy hoặc lặp vòng sẽ hiển thị rỗng. Vì đọc công khai, đừng lưu dữ liệu riêng tư trong shortcode."
  - q: "Đổi slug hoặc chuyển bài giữa chuyên mục có ảnh hưởng URL không?"
    a: "Đổi slug tự tạo redirect 301. Đổi chuyên mục không đổi URL vì bài viết nằm ở gốc site (/slug), chỉ breadcrumb đổi theo chuyên mục chính. Sản phẩm nằm dưới /product/, taxonomy product-category dưới /product-category/; có thể đổi quy ước này nếu frontend định tuyến khác."
  - q: "Một FAQ nên đặt ở bài viết hay ở collection FAQ?"
    a: "FAQ là collection riêng, mỗi tài liệu là một nhóm câu hỏi (group + items). Bài viết, trang, sản phẩm tham chiếu nhóm đó qua trường faqs, nhờ đó dùng lại được và sinh FAQPage JSON-LD. Hãy hiển thị cùng nội dung ấy ra trang để khớp với dữ liệu có cấu trúc."
related:
  - /tinh-nang/noi-dung-va-cau-truc
  - /tinh-nang/trinh-soan-thao-markdown
  - /thuc-hanh-tot/seo-onpage
  - /tinh-nang/quy-trinh-bien-tap
  - /giai-phap/blog-tin-tuc
docs: https://docs.opencms.kdigi.vn/tham-khao/collections/
---

Hãy chọn loại nội dung theo vai trò của trang: `pages` cho nội dung tĩnh, `posts` cho bài có ngày và tác giả, `products` cho trang sản phẩm/dịch vụ, `landings` cho trang chiến dịch dạng block. Phân loại bằng `taxonomies` (chuyên mục, thẻ), điều hướng bằng `menus`. Quyết định đúng ngay từ đầu giúp URL, breadcrumb và JSON-LD nhất quán.

> **Tóm tắt nhanh**
> - 4 loại nội dung chính: `pages`, `posts`, `products`, `landings`; mỗi loại có phiên bản (tối đa 30/tài liệu) và thùng rác.
> - Taxonomy có 4 `type`: `category`, `product-category`, `tag`, `custom`; hỗ trợ cây cha/con.
> - Slug duy nhất theo site (trừ tài liệu trong thùng rác); đổi slug tạo redirect 301.
> - Menu là cây kéo thả, 5 vị trí, độ sâu tối đa 10 cấp ở REST.
> - FAQ, shortcode, tác giả là collection riêng, dùng lại được nhiều nơi.

![Trình quản lý FAQ theo nhóm câu hỏi trong KDIGI CMS](/images/shots/faq.webp "FAQ là collection riêng: mỗi tài liệu là một nhóm câu hỏi")

## 1. Chọn loại nội dung

| Loại | Dùng cho | Trường đặc trưng |
| --- | --- | --- |
| `pages` | Giới thiệu, liên hệ, chính sách, trang trụ cột | `pageType` (`default`/`blog`/`landing`), `isPillarPage`; `sitemapPriority` mặc định 0,6 |
| `posts` | Blog, tin tức, hướng dẫn | `type` (`blog`/`news`/`guide`), `author`, `categories`, `excerpt`, `wordCount` tự tính; ưu tiên 0,7 |
| `products` | Sản phẩm, dịch vụ, gói | `prices[]` (đúng một dòng), `hero.slider`, `noticeMd`, đánh giá sao; ưu tiên 0,8 |
| `landings` | Trang chiến dịch | `layout` (block), `campaign` (UTM, mục tiêu), `template`, `schemaType`; ưu tiên 0,5 |

Nguyên tắc chọn nhanh:

1. Có ngày đăng, tác giả và nằm trong dòng thời gian? → `posts`.
2. Là trang tồn tại lâu, ít đổi? → `pages`.
3. Có giá hoặc là thứ bạn bán? → `products` (lưu ý đây là trang giới thiệu sản phẩm, không có giỏ hàng; xem [website bán hàng](/giai-phap/website-ban-hang)).
4. Có mục tiêu chuyển đổi, ghép từ hero, bảng giá, CTA, FAQ? → `landings`.

Landing hỗ trợ các block `hero`, `content`, `imageGallery`, `testimonials`, `cta`, `faq`, `stats`, `pricingTable`, `blogFeed`, `offerCards`, `embed`, `divider`. Trạng thái của landing có thêm `archived` (không công khai). Chi tiết mô hình: [nội dung và cấu trúc](/tinh-nang/noi-dung-va-cau-truc).

## 2. Thiết kế taxonomy

`taxonomies` có bốn `type`:

| `type` | Mục đích |
| --- | --- |
| `category` | Chuyên mục blog, có `parent` để tạo cây |
| `product-category` | Danh mục sản phẩm (tách khỏi `category` có chủ đích, khớp `product_cat` của WooCommerce) |
| `tag` | Thẻ ngang |
| `custom` | Taxonomy tùy biến; `customType` giữ tên gốc khi nhập từ WordPress |

Một `(type, slug)` là duy nhất trong site, nên `category` và `tag` có thể trùng slug. **Quy tắc thực hành:**

- **Cây nông**: 1–2 cấp. Cây sâu làm breadcrumb dài và loãng sức mạnh liên kết.
- **Mỗi bài thuộc 1 chuyên mục chính** (breadcrumb lấy chuyên mục tìm thấy đầu tiên khớp `Sites.breadcrumbs.primaryTaxonomyPost`), thêm tag vừa phải.
- **Viết nội dung cho trang chuyên mục**: taxonomy có `contentMd` riêng và SEO riêng; CMS đánh dấu nội dung dưới `THIN_CONTENT_THRESHOLD = 500` từ là mỏng.
- Dùng trường tùy chọn `tier`/`cluster` trên bài viết để ghi cụm chủ đề cho đội biên tập (CMS không tự render hay dùng cho gợi ý liên kết).

Taxonomy không có trạng thái/thùng rác nhưng có lịch sử phiên bản (30).

## 3. Quy ước slug và URL

Slug tự sinh từ tiêu đề (bỏ dấu, `đ` → `d`, mọi ký tự khác `[a-z0-9]` thành `-`), không đa ngôn ngữ và duy nhất theo site giữa các tài liệu chưa vào thùng rác. Một vài điều cần biết:

- Tài liệu trong thùng rác **giữ slug**. Khôi phục vào slug đã bị chiếm sẽ báo lỗi song ngữ (`makeGuardRestoreSlugConflict`).
- Đường dẫn công khai trong breadcrumb, JSON-LD và redirect đến từ `slug-url-prefix-map.ts`: sản phẩm ở `/product/{slug}`, `product-category` ở `/product-category/…`, còn lại ở gốc.
- Nếu frontend của bạn định tuyến khác (ví dụ `/blog/{slug}`), hãy sửa bảng này **và** hàm `publicPathFor` trong `src/lib/frontend-public-path.ts` để liên kết “xem trên site” và bộ chọn liên kết `@` đúng.

## 4. Menu dạng cây

`menus` là một tài liệu cho mỗi `location` mỗi site: `PRIMARY`, `SECONDARY_MENU`, `MOBILE_MENU`, `FOOTER_MENU`, `LOGGEDIN_ACCOUNT_MENU`. Biên tập bằng trình kéo thả `MenuTreeField`. REST **không** trả `tree` mà trả `items` đã chiếu theo ngôn ngữ, mỗi mục có `label`, `url`, `order`, `parentId`, `children`; độ sâu tối đa 10 cấp.

```bash
curl -s 'https://cms.example.com/api/menus?where[tenant][equals]=1&where[location][equals]=PRIMARY&locale=vi&limit=1'
```

Thực hành: menu chính ≤ 7 mục cấp 1; đặt trang trụ cột ở cấp 1, bài con ở cấp 2; footer chứa trang pháp lý. Menu và FAQ gửi revalidate theo cả site khi đổi.

## 5. FAQ, tác giả và shortcode

- **FAQ**: một tài liệu = một nhóm (`group`) gồm các cặp `question`/`answer` (Markdown, đa ngôn ngữ, có phiên bản và thùng rác). Gắn vào bài/trang/sản phẩm qua `faqs` để sinh `FAQPage`. Chỉ cặp đủ cả hai vế mới được xuất.
- **Tác giả** (`authors`): bút danh công khai với `bio`, `avatar`, `sameAs[]`; email không bao giờ trả về qua API. Đây là nền cho trang tác giả và tín hiệu E-E-A-T.
- **Shortcode**: đoạn Markdown dùng lại (chính sách, bảng giá, lời kêu gọi). Cú pháp `[sc name="chinh-sach-doi-tra" /]`; tên chỉ gồm `[a-z0-9-]`, duy nhất theo site, lồng tối đa 3 cấp. Trong editor, gõ `/` rồi `snippet` để chèn. Lưu hay xóa shortcode sẽ revalidate frontend của site.

## 6. Nội dung Markdown

Thân bài viết lưu ở `contentMd` (nguồn thật) và REST trả HTML đã làm sạch ở khóa `content`. Các thẻ ngoài danh sách cho phép (`script`, `style`, `iframe`, thuộc tính `style`, `on*`) bị loại. Quy tắc nhớ: chuỗi rỗng `''` nghĩa là “không có nội dung”, `null` mới là “chưa lưu từ khi chuyển sang Markdown”. Xem [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown).

## 7. Vòng đời nội dung

| Tình huống | Cơ chế |
| --- | --- |
| Đăng theo lịch | Đặt `publishedAt` trong tương lai; tài liệu chỉ hiện công khai từ thời điểm đó |
| Quay lại bản cũ | History/Diff/Restore (30 phiên bản mỗi tài liệu) |
| Xóa nhầm | Chuyển vào thùng rác; chỉ `admin` trở lên xóa vĩnh viễn |
| Hết hạn chiến dịch | Landing chuyển `archived` |

Lưu ý: tài liệu hẹn giờ xuất hiện ở request đầu tiên sau mốc giờ, nhưng **cache frontend chỉ được làm mới khi có lưu**, không theo đồng hồ — hãy lên kế hoạch revalidate (xem [hiệu năng và cache](/thuc-hanh-tot/hieu-nang-va-cache)).

## Ví dụ cấu trúc pillar–cluster

Mô hình pillar–cluster dùng một trang trụ cột cho mỗi chủ đề lớn và nhiều bài con liên kết qua lại. Trong KDIGI CMS:

| Thành phần | Cách dựng | Ví dụ |
| --- | --- | --- |
| Trang trụ cột | `pages` với `isPillarPage` bật, nội dung dài, có FAQ | “Hướng dẫn SEO website” |
| Chuyên mục | `taxonomies` `category` với mô tả `contentMd` riêng | “SEO on-page” |
| Bài con (cluster) | `posts` thuộc đúng một chuyên mục chính, ghi cụm vào `cluster`/`tier` | “Meta description là gì” |
| Liên kết | Bài con trỏ lên trụ cột; trụ cột liệt kê bài con; dùng gợi ý liên kết nội bộ | Bộ chọn `@` trong editor |
| Menu | Trụ cột ở cấp 1, chuyên mục ở cấp 2 | `PRIMARY` |

Các trường `tier` và `cluster` chỉ là siêu dữ liệu cho đội biên tập và frontend; CMS không tự dựng liên kết hay trang cụm từ chúng. Tránh nội dung trùng lặp: mỗi truy vấn chính chỉ có **một** trang đích, và chuyên mục không nên lặp lại nguyên văn bài viết.

## Checklist cấu trúc

- [ ] Mỗi loại nội dung có mục đích rõ, không dùng `posts` cho trang tĩnh.
- [ ] Chuyên mục ≤ 2 cấp, mỗi chuyên mục có mô tả dài và SEO riêng.
- [ ] Slug ngắn, ổn định; đã quy ước tiền tố URL ở frontend.
- [ ] Menu chính khớp với cụm chủ đề, không trang mồ côi.
- [ ] FAQ và shortcode được đặt tên có hệ thống.

Cấu hình các thành phần này trên [bản demo](/demo), hoặc đọc về [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap) để giao việc cho đội.
