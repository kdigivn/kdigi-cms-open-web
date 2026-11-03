---
title: "CMS cho website bán hàng: danh mục & SEO, không giỏ hàng"
description: "CMS cho website bán hàng kiểu danh mục: trang sản phẩm/dịch vụ, giá VND, JSON-LD Product+Offer, landing UTM. Không có giỏ hàng, thanh toán; nguồn mở MIT."
h1: "CMS cho website bán hàng dạng danh mục: làm được gì, không làm gì"
navTitle: "Website bán hàng"
icon: shopping-cart
lead: "Backend nội dung cho catalogue, bảng giá và landing. Không có giỏ hàng, thanh toán, tồn kho hay đơn hàng."
primaryKeyword: "CMS cho website bán hàng"
updated: 2026-11-03
heroImage: /images/art/giai-phap-website-ban-hang-hero.webp
heroAlt: "Minh họa website bán hàng dạng danh mục dùng KDIGI CMS làm backend nội dung"
order: 2
schema: WebPage
faq:
  - q: "KDIGI CMS có giỏ hàng và thanh toán không?"
    a: "Không. Collection products là trang sản phẩm hoặc dịch vụ có một dòng giá để hiển thị và sinh Offer cho SEO. Phần mua hàng phải do frontend hoặc dịch vụ thương mại riêng đảm nhiệm."
  - q: "Dữ liệu có cấu trúc Product được sinh thế nào?"
    a: "Mỗi lần lưu, CMS dựng @graph gồm Product (kèm Offer), ItemPage, BreadcrumbList, FAQPage. Offer chỉ xuất hiện khi currentPrice lớn hơn 0."
  - q: "Chuyển cửa hàng WooCommerce sang KDIGI CMS được không?"
    a: "Được một phần: sản phẩm, danh mục, thẻ, gallery và redirect 301. Đơn hàng, khách hàng, tồn kho và cổng thanh toán không được di chuyển."
related:
  - /tinh-nang/noi-dung-va-cau-truc
  - /tinh-nang/seo-json-ld
  - /tinh-nang/headless-api
  - /chuyen-tu-wordpress
  - /so-sanh/kdigi-cms-vs-wordpress
docs: https://docs.opencms.kdigi.vn/huong-dan/seo-json-ld/
---

Collection `products` là trang sản phẩm hoặc dịch vụ tổng quát: nội dung Markdown, một dòng giá, slider ảnh, FAQ, đánh giá sao. Phần mua hàng do frontend hoặc dịch vụ thương mại riêng lo.

> **Tóm tắt nhanh**
> - Một dòng giá, VND mặc định (hỗ trợ USD, EUR, GBP, JPY).
> - JSON-LD `Product` + `Offer`, breadcrumb theo `product-category`.
> - Landing dạng khối, trường `campaign` lưu UTM.
> - Có nhập sản phẩm WooCommerce.

## :shopping-cart: Phù hợp với loại website nào

| Mô hình | Phù hợp? | Lý do |
| --- | --- | --- |
| Catalogue, khách liên hệ qua Zalo, form, điện thoại | ✓ | Chỉ cần trang sản phẩm, giá hiển thị, SEO |
| Dịch vụ, gói giá, khóa học bán qua tư vấn | ✓ | `pricingTable`, `offerCards`, FAQ, landing |
| Blog nhiều, sản phẩm ít | ✓ | Blog, danh mục, liên kết nội bộ cùng một CMS |
| Giỏ hàng, mã giảm giá, vận chuyển | ✗ | Cần nền tảng thương mại chuyên dụng |
| Nhiều biến thể, quản lý tồn kho | ✗ | `prices[]` chỉ một dòng, không có tồn kho |

## :list-checks: Thiết lập đề xuất

:::steps
- :globe: **Tạo site** Khai báo `domain` để webhook revalidate trỏ đúng. Xem [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website).
- :tags: **Dựng danh mục** Taxonomies với `type = product-category`, có cây cha–con.
- :package: **Nhập sản phẩm** Điền `contentMd`, `excerpt`, ảnh, `hero.slider[]`, nhóm FAQ.
- :wand-sparkles: **Điền giá** Dòng duy nhất của `prices[]`: `originalPrice`, `currentPrice`, `currency`, `validUntil`.
- :search: **Đặt mẫu SEO** `Sites.seoTitles.products`. Xem [SEO và JSON-LD](/tinh-nang/seo-json-ld).
- :code: **Frontend gọi API** Lọc `where[tenant][equals]=<id>`. Xem [Headless API](/tinh-nang/headless-api).
:::

![Quản lý nội dung và SEO trong KDIGI CMS](/images/shots/seo.webp)

## :sparkles: Product và Offer

:::check
- `Offer` chỉ phát khi `prices[0].currentPrice > 0`
- `priceCurrency` lấy từ `currency`, mặc định `VND`
- `aggregateRating` chỉ khi đủ điều kiện (ngưỡng số đánh giá, bình luận đã duyệt)
- Mục FAQ thiếu câu hỏi hoặc đáp án bị bỏ khỏi `FAQPage`
:::

## :layout-template: Landing chiến dịch

Landing có 12 loại khối, ba `template` và trạng thái `archived` cho chiến dịch đã kết thúc. CMS lưu UTM và mục tiêu chuyển đổi; việc gắn tham số và đo lường do frontend làm. Xem [nội dung và cấu trúc](/tinh-nang/noi-dung-va-cau-truc).

## :refresh-cw: Chuyển từ WooCommerce

Pipeline 8 phase nhập `product`, `product_cat`, `product_tag`, giữ SEO Yoast/RankMath và redirect 301 từ permalink cũ. Xem [chuyển từ WordPress](/chuyen-tu-wordpress).

## :scale: Khi nào không phù hợp

:::pros-cons
**Ưu điểm**
- Catalogue, bảng giá, landing và blog trong một CMS
- JSON-LD Product trung thực với nội dung trang

**Hạn chế**
- Không có giỏ hàng, thanh toán, đơn hàng, tồn kho
- Không có biến thể hay nhiều mức giá
- Không có storefront dựng sẵn
:::

Xem thử trên [bản demo](/demo) hoặc [tự host](/tu-host).
