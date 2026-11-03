---
title: "CMS cho website bán hàng: danh mục & SEO, không giỏ hàng"
description: "CMS cho website bán hàng kiểu danh mục: trang sản phẩm/dịch vụ, giá VND, JSON-LD Product+Offer, landing UTM. Không có giỏ hàng, thanh toán; nguồn mở MIT."
h1: "CMS cho website bán hàng dạng danh mục: làm được gì, không làm gì"
primaryKeyword: "CMS cho website bán hàng"
updated: 2026-11-03
heroImage: /images/art/giai-phap-website-ban-hang-hero.webp
heroAlt: "Minh họa website bán hàng dạng danh mục dùng KDIGI CMS làm backend nội dung"
navTitle: "Website bán hàng"
order: 2
schema: WebPage
faq:
  - q: "KDIGI CMS có giỏ hàng và thanh toán không?"
    a: "Không. CMS không có giỏ hàng, checkout, thanh toán, tồn kho hay đơn hàng. Collection products là trang sản phẩm/dịch vụ có một dòng giá để hiển thị và sinh dữ liệu Offer cho SEO. Phần mua hàng phải do frontend tự dựng hoặc tích hợp dịch vụ thương mại điện tử riêng."
  - q: "Một sản phẩm có thể có nhiều mức giá không?"
    a: "Không. Trường prices luôn có đúng một dòng gồm originalPrice, currentPrice, currency (VND mặc định, ngoài ra USD, EUR, GBP, JPY) và validUntil. Nếu cần biến thể, kích cỡ hoặc bảng giá nhiều gói, hãy dùng khối pricingTable của landing hoặc lưu dữ liệu đó ở hệ thống thương mại riêng."
  - q: "Dữ liệu có cấu trúc Product được sinh thế nào?"
    a: "Mỗi lần lưu sản phẩm, CMS dựng @graph gồm Product (kèm Offer), ItemPage, BreadcrumbList và FAQPage. Offer chỉ xuất hiện khi currentPrice lớn hơn 0, không bao giờ có ưu đãi giá 0. AggregateRating chỉ xuất hiện khi đủ ngưỡng số đánh giá và có bình luận đã duyệt."
  - q: "Chuyển cửa hàng WooCommerce sang KDIGI CMS được không?"
    a: "Được một phần: pipeline di chuyển nhập sản phẩm WooCommerce (product, product_cat, product_tag) vào products và taxonomies, giữ một giá chung, đưa gallery vào hero.slider kèm redirect 301. Đơn hàng, khách hàng, tồn kho và cổng thanh toán không được di chuyển."
  - q: "Khi nào nên chọn nền tảng thương mại điện tử chuyên dụng?"
    a: "Khi bạn cần thanh toán trực tuyến, giỏ hàng, quản lý tồn kho, biến thể sản phẩm, vận chuyển hoặc đơn hàng làm lõi vận hành. Lúc đó hãy dùng WooCommerce, Shopify hay dịch vụ tương đương; KDIGI CMS có thể đứng cạnh để quản lý nội dung blog và landing, nhưng không thay thế chúng."
related:
  - /tinh-nang/noi-dung-va-cau-truc
  - /tinh-nang/seo-json-ld
  - /tinh-nang/headless-api
  - /chuyen-tu-wordpress
  - /so-sanh/kdigi-cms-vs-wordpress
docs: https://docs.opencms.kdigi.vn/huong-dan/seo-json-ld/
---

KDIGI CMS làm tốt vai trò backend nội dung cho website bán hàng kiểu danh mục: trang sản phẩm hoặc dịch vụ, bảng giá, landing chiến dịch và SEO. Nó **không** có giỏ hàng, thanh toán, tồn kho hay quản lý đơn hàng; các phần đó phải nằm ở frontend hoặc dịch vụ thương mại riêng.

> **Tóm tắt nhanh**
> - `products` là trang sản phẩm/dịch vụ tổng quát: tiêu đề, nội dung Markdown, một dòng giá, slider ảnh, FAQ, đánh giá sao, danh mục `product-category`.
> - Tiền tệ mặc định VND; hỗ trợ USD, EUR, GBP, JPY. Không có biến thể, tồn kho, giỏ hàng, thanh toán, đơn hàng.
> - SEO: JSON-LD `Product` + `Offer`, breadcrumb theo `product-category`, mẫu tiêu đề `Sites.seoTitles.products`.
> - Landing dạng khối (`pricingTable`, `offerCards`, `cta`, `faq`…) với trường `campaign` có UTM.
> - Có nhập sản phẩm WooCommerce trong pipeline chuyển từ WordPress.
> - Đường dẫn công khai: `/product/{slug}/`; frontend dựng bằng Next.js, Astro hoặc tương đương.

## Phù hợp với loại website nào

| Mô hình | Phù hợp? | Lý do |
| --- | --- | --- |
| Catalogue hàng hóa, khách liên hệ/đặt qua Zalo, form, điện thoại | Có | Chỉ cần trang sản phẩm, giá hiển thị, SEO |
| Website dịch vụ, gói giá, khóa học bán qua tư vấn | Có | `pricingTable`, `offerCards`, FAQ, landing |
| Content-led commerce: blog nhiều, sản phẩm ít | Có | Blog, danh mục, internal link cùng một CMS |
| Cửa hàng có giỏ hàng, mã giảm giá, vận chuyển | Không | Cần nền tảng thương mại chuyên dụng |
| Bán nhiều biến thể (size/màu), quản lý tồn kho | Không | `prices[]` chỉ một dòng, không có tồn kho |

## Thiết lập đề xuất

1. **Tạo site** cho cửa hàng trong Sites (xem [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website)); khai báo `domain` để webhook revalidate trỏ đúng.
2. **Dựng danh mục** trong Taxonomies với `type = product-category`, có cây cha–con. Tách riêng với `category` của blog; đây là thiết kế có chủ đích để khớp `product_cat` của WooCommerce.
3. **Nhập sản phẩm** trong Products: điền `contentMd`, `excerpt`, ảnh đại diện, `hero.slider[]` (nhiều ảnh) hoặc `hero.slideVideo` (YouTube/TikTok), nhóm FAQ và `noticeMd` cho khối lưu ý.
4. **Điền giá** ở dòng duy nhất của `prices[]`: `originalPrice`, `currentPrice`, `currency`, `validUntil`.
5. **Đặt mẫu SEO** tại `Sites.seoTitles.products` (mặc định `%title% %sep% %sitename%`, mô tả `%excerpt%`). Xem [SEO và JSON-LD](/tinh-nang/seo-json-ld).
6. **Làm landing chiến dịch** trong Landings: ghép các khối `hero`, `offerCards`, `pricingTable`, `testimonials`, `faq`, `cta`; điền `campaign.utmSource`, `utmMedium`, `utmCampaign`, `conversionGoal`, `abTestId`.
7. **Phân quyền:** giao `author` cho người nhập liệu (không được xuất bản), `editor` duyệt đăng. Xem [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung).
8. **Frontend gọi API:** lọc theo site bằng `where[tenant][equals]=<id>`, vì API đọc công khai không tự giới hạn theo site. Chi tiết ở [Headless API](/tinh-nang/headless-api).

![Quản lý nội dung và SEO trong KDIGI CMS](/images/shots/seo.webp)

## Dữ liệu Product và Offer

Quy tắc hiện có trong tài liệu SEO của KDIGI CMS:

- `offers` chỉ được phát khi `prices[0].currentPrice > 0`; thiếu giá hoặc giá 0 thì bỏ `Offer` và ghi cảnh báo.
- `priceValidUntil` lấy từ `prices[0].validUntil`; `priceCurrency` lấy từ `currency` (mặc định `VND`).
- `aggregateRating` chỉ xuất hiện khi điểm trung bình dưới 5 **và** hoặc bật `aggregateRatingOverride`, hoặc số đánh giá đạt `knowledgeGraph.minReviewsForAggregate` (mặc định 10) kèm ít nhất một bình luận đã duyệt. Sao nhập từ WooCommerce không tự sinh `aggregateRating`.
- Mục FAQ thiếu câu hỏi hoặc đáp án bị bỏ khỏi `FAQPage`.

Điều này giữ dữ liệu có cấu trúc trung thực với nội dung trang, thay vì phát đại trà.

## Landing chiến dịch

Landing có `layout` gồm 12 loại khối và `template` (`default`, `wide`, `fullscreen`), `schemaType` (`WebPage`, `FAQPage`, `Article`, `Product`, `Event`) và `status` `archived` cho chiến dịch đã kết thúc. Nội dung hiển thị qua block; CMS **lưu** thông tin UTM và mục tiêu chuyển đổi, còn việc gắn tham số vào liên kết và đo lường là việc của frontend. Quy trình soạn nội dung ở [nội dung và cấu trúc](/tinh-nang/noi-dung-va-cau-truc).

## Chuyển từ WooCommerce

Pipeline 8 phase (kèm cổng review và `pg_dump` trước khi ghi DB không phải local) nhập `product`, `product_cat`, `product_tag` thành `products` và taxonomies; gallery vào `hero.slider`, giá vào `prices[0]`, giữ FAQ, đánh giá, bình luận, SEO Yoast/RankMath, cùng redirect 301 từ permalink cũ. Xem [chuyển từ WordPress](/chuyen-tu-wordpress).

## Khi nào KHÔNG phù hợp

- Cần **giỏ hàng, checkout, thanh toán thẻ/ví, đơn hàng, tồn kho, vận chuyển**: chọn WooCommerce, Shopify hoặc backend thương mại riêng.
- Cần biến thể, nhiều mức giá, giá theo nhóm khách: `prices[]` chỉ có một dòng.
- Cần quản lý kho, SKU, đồng bộ sàn: nằm ngoài phạm vi.
- Muốn có storefront dựng sẵn: không có; bạn tự xây hoặc thuê.

Kiến trúc tách đôi vẫn khả thi: KDIGI CMS giữ blog, danh mục và landing; dịch vụ thương mại xử lý đơn hàng; frontend nối hai bên.

Xem thử trên [bản demo](/demo) hoặc [tự host bằng Docker Compose](/tu-host).
