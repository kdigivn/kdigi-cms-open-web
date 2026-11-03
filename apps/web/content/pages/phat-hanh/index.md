---
title: "Nhật ký phát hành KDIGI CMS (release notes)"
description: "Danh sách các phiên bản KDIGI CMS: tính năng mới, sửa lỗi và thay đổi quan trọng, lấy trực tiếp từ CHANGELOG của dự án, cập nhật theo từng bản phát hành."
h1: "Nhật ký phát hành KDIGI CMS"
navTitle: "Phát hành"
primaryKeyword: "kdigi cms"
updated: 2026-11-03
heroImage: /images/art/phat-hanh-hero.webp
heroAlt: "Hộp phát hành kính mờ với dải xanh và mũi tên đi lên, đại diện cho các bản phát hành của KDIGI CMS"
schema: CollectionPage
faq:
  - q: "Phiên bản mới nhất của KDIGI CMS là gì?"
    a: "Phiên bản mới nhất là 1.1.0, phát hành ngày 2026-11-03. Bản này thêm cơ chế bảo vệ tài khoản demo công khai (DEMO_ACCOUNT_EMAILS), lệnh pnpm demo:reset để đặt lại site demo, header x-revalidate-secret cho ping revalidate và chuyển tiếp các biến liên quan trong cả hai file compose. Mục Unreleased hiện đang trống."
  - q: "KDIGI CMS đánh số phiên bản theo quy tắc nào?"
    a: "Dự án theo Semantic Versioning và ghi CHANGELOG theo định dạng Keep a Changelog. Chính sách bảo mật cho biết bản vá bảo mật được phát hành cho minor mới nhất của dòng 1.x. CHANGELOG liệt kê thay đổi schema, biến môi trường mới và thay đổi phá vỡ API của từng bản phát hành, nên hãy đọc nó trước mỗi lần nâng cấp."
  - q: "Nâng cấp từ 1.0.0 lên 1.1.0 có cần migration không?"
    a: "Theo CHANGELOG, bản 1.0.1 thêm migration 20261103_052647_media_source_media_id (khóa ẩn sourceMediaId cho Media); bản 1.1.0 không ghi migration mới. Quy trình vẫn là sao lưu, lấy code mới và build lại; migration chưa áp dụng sẽ chạy tự động khi container khởi động. Hãy đọc CHANGELOG trước khi nâng cấp."
  - q: "Tôi theo dõi bản phát hành mới ở đâu?"
    a: "Nguồn chính thức là file CHANGELOG.md trong repo kdigivn/kdigi-cms-open và các tag phiên bản (v1.0.0, v1.0.1, v1.1.0) trên GitHub. Trang này được cập nhật từ CHANGELOG sau mỗi bản phát hành. Bạn cũng có thể Watch repo trên GitHub để nhận thông báo khi có bản mới."
related:
  - /tu-host
  - /thuc-hanh-tot/sao-luu-va-nang-cap
  - /chuyen-tu-wordpress
  - /ma-nguon-mo
  - /demo
docs: https://docs.opencms.kdigi.vn/
order: 4
---

Phiên bản mới nhất của KDIGI CMS là **1.1.0**, phát hành ngày 2026-11-03. Trang này liệt kê mọi bản phát hành (1.0.0, 1.0.1, 1.1.0) từ CHANGELOG của dự án, tuân theo Semantic Versioning, cùng cách nâng cấp an toàn. Mục Unreleased hiện trống.

> **Tóm tắt nhanh**
>
> - Bản mới nhất: **1.1.0** (2026-11-03). Trước đó: 1.0.1 và 1.0.0 (cùng ngày 2026-11-03).
> - Giấy phép MIT, xây trên Payload 3.90, Next.js 15 và PostgreSQL ([mã nguồn mở](/ma-nguon-mo)).
> - CHANGELOG theo định dạng Keep a Changelog; phiên bản theo Semantic Versioning.
> - Schema chỉ đổi bằng migration có timestamp; bản 1.0.1 thêm một migration.
> - Luôn sao lưu database và media trước khi nâng cấp ([hướng dẫn tự host](/tu-host)).

## Bản mới nhất: 1.1.0

**Ngày phát hành:** 2026-11-03. Bản này tập trung vào việc chạy một demo công khai an toàn và xác thực lời gọi revalidate.

### Thêm mới

- **Bảo vệ tài khoản demo công khai (tùy chọn):** biến `DEMO_ACCOUNT_EMAILS` (danh sách phân tách bằng dấu phẩy). Người dùng trong danh sách không đổi được email, mật khẩu, API key hay công tắc API key của chính mình và không tự xóa mình (`403`, thông báo song ngữ vi/en). Không đặt biến thì hành vi không đổi. Xem [bản demo trực tiếp](/demo).
- **`pnpm demo:reset`** (`src/seed/demo-reset.ts`): xóa vĩnh viễn toàn bộ nội dung của riêng site `demo`, nạp lại bằng dữ liệu demo seed và đặt lại các tài khoản trong `DEMO_ACCOUNT_EMAILS` (mật khẩu từ `DEMO_ACCOUNT_PASSWORD`, vai trò `editor`, chỉ site `demo`). Dành cho tác vụ chạy hằng đêm.
- **`REVALIDATE_SECRET`:** khi đặt, ping revalidate (job và nút thủ công của biên tập viên) gửi kèm header `x-revalidate-secret`, để frontend xác minh bên gọi. Không đặt thì ping không xác thực như trước. Xem [headless API](/tinh-nang/headless-api).
- Cả hai file compose chuyển tiếp `REVALIDATE_SECRET`, `DEMO_ACCOUNT_EMAILS` và `DEMO_ACCOUNT_PASSWORD`.
- README dẫn tới website dự án, tài liệu hosted và bản demo trực tiếp.

## Danh sách bản phát hành

| Phiên bản | Ngày | Điểm chính | Chuyển schema |
| --- | --- | --- | --- |
| [1.1.0](https://github.com/kdigivn/kdigi-cms-open/compare/v1.0.1...v1.1.0) | 2026-11-03 | Bảo vệ tài khoản demo, `pnpm demo:reset`, `REVALIDATE_SECRET` | Không ghi trong CHANGELOG |
| [1.0.1](https://github.com/kdigivn/kdigi-cms-open/compare/v1.0.0...v1.0.1) | 2026-11-03 | Sửa lỗi pipeline di chuyển WordPress (phase media, chạy lại, host có cổng) | Có: `20261103_052647_media_source_media_id` |
| [1.0.0](https://github.com/kdigivn/kdigi-cms-open/releases/tag/v1.0.0) | 2026-11-03 | Bản công khai đầu tiên (MIT) | Migration nền `20261103_042515_initial` |

## 1.0.1 (2026-11-03): sửa lỗi di chuyển WordPress

Bản vá này chỉ chứa sửa lỗi cho [pipeline chuyển từ WordPress](/chuyen-tu-wordpress):

- **Phase media:** collection `Media` có thêm khóa ẩn `sourceMediaId` dùng để tránh nhập trùng (migration `20261103_052647_media_source_media_id`). Thiếu khóa này, mọi lần tra cứu media đều thất bại nên ảnh đại diện, slider và ảnh trong thân bài không được nhập.
- **Chạy lại:** media chỉ tham chiếu bằng URL (logo site, ảnh OG) được định danh bằng hash của URL nguồn và không bị tải lên lại mỗi lần chạy.
- **Host nguồn có cổng** (ví dụ `127.0.0.1:8080`) được khớp đúng khi viết lại canonical, menu và link nội bộ.
- `--dry-run` trên database trống không còn báo các đích ảnh trong bài còn thiếu là lỗi.

> **Lưu ý** Nếu bạn dự định chuyển từ WordPress, hãy dùng từ 1.0.1 trở lên.

## 1.0.0 (2026-11-03): bản công khai đầu tiên

KDIGI CMS (giấy phép MIT) là CMS headless nhiều website trên Payload 3.90, Next.js 15 và PostgreSQL. Nó được tách ra từ một hệ thống đa website đã chạy production và tổng quát hóa cho agency, blogger, doanh nghiệp nhỏ và người chuyển khỏi WordPress.

| Nhóm | Có trong 1.0.0 |
| --- | --- |
| Nhiều website | Một bản cài phục vụ nhiều website; mỗi tài liệu `Sites` giữ thương hiệu, SEO mặc định, liên hệ/footer, domain và (tùy chọn) thông tin lưu trữ riêng; nội dung cách ly theo site bằng access predicate tường minh ([nhiều website](/tinh-nang/quan-ly-nhieu-website)) |
| Vai trò | `super-admin`, `admin`, `editor`, `author` kèm gán site; chỉ super-admin đổi `role` hoặc site của người dùng, người dùng không tự nâng quyền ([phân quyền](/tinh-nang/phan-quyen-nguoi-dung)) |
| Mô hình nội dung | Pages, posts, products, landings (block), taxonomies, authors, menus (cây), FAQs, shortcodes, redirects, comments (có reCAPTCHA), rating events; collection nội dung có phiên bản và đa ngôn ngữ (`vi` mặc định, `en` có fallback) ([nội dung và cấu trúc](/tinh-nang/noi-dung-va-cau-truc)) |
| Trình soạn thảo | Markdown-first (Milkdown): slash menu, chọn media/link, shortcode, HTML đã làm sạch ở đúng khóa REST gốc ([trình soạn thảo](/tinh-nang/trinh-soan-thao-markdown)) |
| Media | Thư viện có thư mục, trình sửa ảnh, nhập từ URL (chống SSRF), chuyển WebP khi upload cho site dùng R2; mặc định lưu trên ổ đĩa, tùy chọn Cloudflare R2 theo site ([thư viện media](/tinh-nang/thu-vien-media)) |
| SEO | Đồ thị JSON-LD, mẫu tiêu đề/mô tả kiểu RankMath, kiểm tra SEO, gợi ý liên kết nội bộ, tạo nội dung SEO bằng AI tùy chọn (DeepSeek, bật bằng `DEEPSEEK_API_KEY` và `DEEPSEEK_MODEL`) ([SEO và JSON-LD](/tinh-nang/seo-json-ld)) |
| Công cụ biên tập | Lịch nội dung / bảng điều khiển biên tập, thùng rác và khôi phục ([quy trình biên tập](/tinh-nang/quy-trinh-bien-tap)) |
| Tích hợp frontend | REST và GraphQL, job revalidate ISR, bộ phân giải URL tài liệu cho frontend ([headless API](/tinh-nang/headless-api)) |
| Di chuyển | Pipeline WordPress (thô, chuẩn hóa, nhập) kèm runbook ([chuyển từ WordPress](/chuyen-tu-wordpress)) |
| Triển khai | Khởi động một lệnh bằng Docker Compose (PostgreSQL và app), site demo kèm nội dung mẫu ([tự host](/tu-host)) |
| Dự án | Bộ tài liệu trong `docs/`, Code of Conduct, Contributing, Security policy, mẫu issue/PR, CI |

**Không mang sang từ hệ thống gốc:** các module đặc thù miền nghiệp vụ, công cụ CDN tùy chọn, pipeline clone và mọi importer hay fixture một lần cho từng site riêng.

## Cách nâng cấp một bản cài

1. **Đọc CHANGELOG** của mọi phiên bản giữa bản bạn đang chạy và bản đích: tìm mục "Breaking", biến môi trường mới và thay đổi ảnh hưởng phản hồi REST mà frontend dùng.
2. **Sao lưu** database (`pg_dump`) và volume media; xem [sao lưu và nâng cấp](/thuc-hanh-tot/sao-luu-va-nang-cap).
3. **Lấy code mới và build lại:**

   ```bash
   git fetch --tags && git checkout v1.1.0
   docker compose up -d --build   # entrypoint chạy payload migrate trước khi khởi động
   ```

   Với Coolify, redeploy; không dùng Docker: `pnpm install --frozen-lockfile && pnpm build && pnpm migrate && pnpm start`.
4. **Cập nhật biến môi trường** nếu CHANGELOG thêm mới (ví dụ `REVALIDATE_SECRET` từ 1.1.0, tùy chọn).
5. **Kiểm tra:** đăng nhập `/admin`, mở vài tài liệu mỗi collection, tải một ảnh, gọi một URL công khai từ frontend. `GET /api/health` chỉ chứng minh tiến trình còn sống, không chứng minh schema đã mới.

Nâng cấp CMS trước, rồi mới nâng cấp frontend dùng trường mới. Nếu cần quay lại, chỉ redeploy image cũ khi nó đọc được schema đã migrate; nếu không, khôi phục bản sao lưu ở bước 2. Chi tiết nằm trong mục nâng cấp của trang [tự host](/tu-host).

## Nguồn

- CHANGELOG của KDIGI CMS (định dạng [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), phiên bản theo [Semantic Versioning](https://semver.org/)): <https://github.com/kdigivn/kdigi-cms-open/blob/main/CHANGELOG.md>
- Tag và so sánh phiên bản: <https://github.com/kdigivn/kdigi-cms-open/releases/tag/v1.0.0>
- Quy trình nâng cấp: `docs/upgrading.md` trong repo <https://github.com/kdigivn/kdigi-cms-open>
