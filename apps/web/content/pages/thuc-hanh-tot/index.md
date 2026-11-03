---
title: "Thực hành tốt khi vận hành website với KDIGI CMS"
description: "Hướng dẫn thực hành tốt cho KDIGI CMS: SEO on-page, cấu trúc nội dung, bảo mật và phân quyền, hiệu năng và cache, sao lưu và nâng cấp. Chọn bài theo vai trò."
h1: "Thực hành tốt: SEO, nội dung, bảo mật, hiệu năng"
navTitle: "Thực hành tốt"
primaryKeyword: "website chuẩn seo"
updated: 2026-11-03
heroImage: /images/art/thuc-hanh-tot-hero.webp
heroAlt: "Hình minh họa trừu tượng về quy trình vận hành và tối ưu một hệ thống quản trị nội dung"
schema: CollectionPage
order: 40
faq:
  - q: "Nên đọc bài thực hành nào trước?"
    a: "Đọc theo giai đoạn. Đang dựng site: cấu trúc nội dung rồi SEO on-page. Chuẩn bị đưa lên production: bảo mật và phân quyền, sao lưu và nâng cấp. Đã có người dùng thật: hiệu năng và cache. Nếu chuyển từ WordPress, đọc thêm trang chuyển từ WordPress để có checklist di chuyển."
  - q: "Các hướng dẫn này áp dụng cho phiên bản KDIGI CMS nào?"
    a: "Nội dung được đối chiếu với tài liệu và CHANGELOG của KDIGI CMS 1.1.0 (phát hành 2026-11-03). Mỗi trang ghi ngày cập nhật. Khi bạn dùng bản khác, hãy đọc CHANGELOG giữa hai bản để biết biến môi trường mới hoặc thay đổi API trước khi áp dụng."
  - q: "Thực hành tốt khác gì tài liệu kỹ thuật?"
    a: "Tài liệu kỹ thuật mô tả mọi trường, endpoint và biến môi trường để tra cứu. Trang thực hành tốt chọn ra những quyết định có hệ quả lớn, sắp theo thứ tự làm việc, kèm checklist và lệnh thật, rồi dẫn về tài liệu gốc khi bạn cần chi tiết."
  - q: "Tôi có thể thử các thực hành này mà không cài đặt không?"
    a: "Có. Bản demo công khai tại app.opencms.kdigi.vn/admin cho phép đăng nhập vai trò editor để xem trình soạn thảo, SEO và thư viện media. Site demo được đặt lại mỗi đêm nên đừng nhập dữ liệu thật. Cấu hình hạ tầng như bảo mật hay sao lưu cần bản tự host."
related:
  - /tinh-nang/seo-json-ld
  - /chuyen-tu-wordpress
  - /tu-host
  - /demo
docs: https://docs.opencms.kdigi.vn/tham-khao/overview/
---

Thực hành tốt với KDIGI CMS xoay quanh năm nhóm việc: dựng cấu trúc nội dung đúng, cấu hình SEO on-page một lần cho cả site, phân quyền và bảo mật, giữ site nhanh nhờ cache và revalidate, và sao lưu trước mỗi lần nâng cấp. Mỗi bài dưới đây có checklist và lệnh thật.

> **Tóm tắt nhanh**
> - 5 bài hướng dẫn, mỗi bài đối chiếu với tài liệu và CHANGELOG của KDIGI CMS 1.1.0.
> - Thứ tự đề xuất: cấu trúc nội dung → SEO on-page → bảo mật → hiệu năng → sao lưu và nâng cấp.
> - KDIGI CMS là headless: giao diện công khai, cache và CDN do frontend và hạ tầng của bạn đảm nhiệm.
> - Quyết định khó đảo ngược nhất: slug, quy ước URL, vai trò người dùng, `PAYLOAD_PUBLIC_SERVER_URL`.

## Chọn bài theo mục tiêu

| Bạn đang... | Đọc | Kết quả |
| --- | --- | --- |
| Dựng site mới, chọn loại nội dung và chuyên mục | [Cấu trúc nội dung và taxonomy](/thuc-hanh-tot/cau-truc-noi-dung) | Mô hình nội dung, slug, menu, FAQ, shortcode nhất quán |
| Muốn lên top và có rich result | [SEO on-page](/thuc-hanh-tot/seo-onpage) | Mẫu tiêu đề, JSON-LD, Open Graph, redirect, audit |
| Chuẩn bị đưa lên production | [Bảo mật và phân quyền](/thuc-hanh-tot/bao-mat-va-phan-quyen) | Checklist triển khai, vai trò tối thiểu, bí mật |
| Site chậm hoặc không cập nhật sau khi đăng | [Hiệu năng và cache](/thuc-hanh-tot/hieu-nang-va-cache) | Webhook revalidate, job runner, truy vấn gọn, media |
| Sắp nâng cấp hoặc chưa có bản sao lưu | [Sao lưu và nâng cấp](/thuc-hanh-tot/sao-luu-va-nang-cap) | Lịch backup, migration, rollback, khôi phục thử |

## Lộ trình 5 bước cho một site mới

1. **Cấu trúc** — chốt loại nội dung, cây chuyên mục (≤ 2 cấp), quy ước slug và tiền tố URL; tạo menu và tác giả. Xem [cấu trúc nội dung](/thuc-hanh-tot/cau-truc-noi-dung).
2. **Cấu hình site** — domain, `defaultLanguage`, `seoTitles`, `knowledgeGraph`, `socialProfiles`, ảnh OG mặc định. Xem [quản lý nhiều website](/tinh-nang/quan-ly-nhieu-website).
3. **Phân quyền** — tạo người dùng theo vai trò tối thiểu và gán đúng site; cộng tác viên là `author`. Xem [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung).
4. **Tích hợp frontend** — lọc `tenant` ở mọi truy vấn, nối webhook revalidate, bật `ENABLE_JOBS_AUTORUN=true` trên một instance. Xem [API headless](/tinh-nang/headless-api).
5. **Vận hành** — sao lưu hằng đêm, khôi phục thử mỗi tháng, đọc CHANGELOG trước nâng cấp.

## Nguyên tắc chung

### Cấu hình ở site, không ở từng bài

Tiêu đề SEO, mẫu mô tả, danh tính tổ chức và ảnh OG mặc định thuộc về `Sites`. Ghi đè ở từng tài liệu chỉ khi cần. Nhờ đó đổi một lần, cả site cập nhật mà không phải lưu lại hàng trăm bài.

### Quyền tối thiểu, ranh giới là access predicate

Bộ chọn site trong admin chỉ là tiện ích giao diện; ranh giới thật là các predicate truy cập ở từng collection. Và vì đọc ẩn danh không tự lọc theo site, frontend phải thêm `where[tenant][equals]=<id>` ở mọi truy vấn.

### Mọi thứ thay đổi schema đều đi qua migration

Schema không bao giờ đồng bộ tự động. Vì vậy mỗi lần nâng cấp có một điểm kiểm soát rõ ràng: sao lưu → migrate → kiểm tra.

### Đừng tin vào một tín hiệu duy nhất

`GET /api/health` chỉ báo tiến trình còn sống, không báo schema đã cập nhật hay job đã chạy. Điểm SEO chỉ là checklist, không phải thứ hạng. Hãy kết hợp kiểm tra thủ công sau mỗi thay đổi lớn.

## Dành cho người đang chuyển từ WordPress

Pipeline di chuyển giữ nội dung, media, menu, SEO Yoast/Rank Math và tạo redirect 301 từ permalink cũ. Hãy làm theo [trang chuyển từ WordPress](/chuyen-tu-wordpress), rồi quay lại đây để rà [SEO on-page](/thuc-hanh-tot/seo-onpage) và [sao lưu](/thuc-hanh-tot/sao-luu-va-nang-cap) trước khi chuyển DNS.

## Thực hành trên bản demo hoặc bản tự host

- [Bản demo](/demo) để thử editor, SEO, media với tài khoản `editor`.
- [Tự host](/tu-host) để làm bảo mật, cache, sao lưu trên hạ tầng của bạn.
- Chọn mô hình triển khai theo nhu cầu ở [giải pháp cho agency](/giai-phap/agency) hoặc [doanh nghiệp](/giai-phap/doanh-nghiep).
