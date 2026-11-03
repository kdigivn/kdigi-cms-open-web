---
title: "KDIGI CMS mã nguồn mở: giấy phép MIT, GitHub"
description: "KDIGI CMS phát hành theo giấy phép MIT trên GitHub. Xem kho mã, hướng dẫn đóng góp, chính sách bảo mật và lộ trình chỉ gồm những gì đã có thật."
h1: "Mã nguồn mở: giấy phép MIT, kho mã và đóng góp"
navTitle: "Mã nguồn mở"
icon: github
lead: "Giấy phép MIT: dùng, sửa, phân phối và bán lại, kể cả cho dự án thương mại."
primaryKeyword: "cms mã nguồn mở"
updated: 2026-11-03
heroImage: /images/art/ma-nguon-mo-hero.webp
heroAlt: "Cây nhánh mã nguồn mở và ổ khoá mở bằng kính mờ trên đế đất sét, minh họa giấy phép MIT của KDIGI CMS"
schema: WebPage
faq:
  - q: "KDIGI CMS dùng giấy phép mã nguồn mở nào?"
    a: "Giấy phép MIT, bản quyền 2026 KDIGI. Bạn được dùng, sửa, phân phối và bán bản sao, kể cả cho dự án thương mại, với điều kiện giữ thông báo bản quyền và giấy phép. Phần mềm cung cấp nguyên trạng, không bảo hành."
  - q: "Tôi có được dùng KDIGI CMS cho khách hàng của agency không?"
    a: "Được. MIT không giới hạn mục đích thương mại hay số website. Bạn có thể cài một bản phục vụ nhiều site khách hàng, hoặc fork và tùy biến, miễn là giữ thông báo bản quyền và giấy phép."
  - q: "Làm sao đóng góp mã cho KDIGI CMS?"
    a: "Fork repo kdigivn/kdigi-cms-open, tạo nhánh từ main và gửi pull request nhỏ. Chạy pnpm typecheck, lint, test trước; commit theo Conventional Commits, cập nhật CHANGELOG. Thay đổi lớn nên mở issue trước."
  - q: "Phát hiện lỗ hổng bảo mật thì báo ở đâu?"
    a: "Không mở issue công khai. Dùng báo cáo riêng tư của GitHub (Security Advisories) của repo kdigivn/kdigi-cms-open. Dự án cam kết phản hồi trong 3 ngày làm việc và nhắm tới vá trong 90 ngày."
  - q: "Dự án có lộ trình (roadmap) công khai không?"
    a: "Hiện chưa có tài liệu roadmap riêng. Những gì đã phát hành nằm trong CHANGELOG, mục Unreleased đang trống. Đề xuất tính năng gửi qua GitHub Issues bằng mẫu feature request."
related:
  - /phat-hanh
  - /tu-host
  - /demo
  - /so-sanh/kdigi-cms-vs-wordpress
  - /thuc-hanh-tot
docs: https://docs.opencms.kdigi.vn/
---

KDIGI CMS là CMS headless nhiều website, phát hành theo giấy phép MIT (bản quyền 2026 KDIGI). Mã nguồn công khai tại `github.com/kdigivn/kdigi-cms-open`, xây trên Payload 3, Next.js 15 và PostgreSQL.

> **Tóm tắt nhanh**
>
> - Giấy phép **MIT**, file `LICENSE` ở gốc repo.
> - Repo `kdigivn/kdigi-cms-open`, phiên bản hiện tại 1.1.0.
> - Có Contributing, Code of Conduct, Security policy, mẫu issue/PR.
> - CI chạy typecheck, unit test, lint, integration test.
> - Báo lỗ hổng bảo mật riêng tư, không mở issue công khai.

![Ảnh chụp bảng điều khiển KDIGI CMS, phần mềm mã nguồn mở quản lý nhiều website](/images/shots/dashboard.webp)

## :scale: Giấy phép MIT với bạn

| Bạn muốn | MIT cho phép |
| --- | --- |
| Dùng cho website khách hàng, kể cả thu phí | có |
| Cài một bản phục vụ nhiều website | có |
| Fork và sửa mã theo nhu cầu | có |
| Phân phối lại bản đã sửa, kể cả đóng gói thương mại | có |
| Đòi tác giả bảo hành | không |

Điều kiện duy nhất: giữ thông báo bản quyền và văn bản giấy phép. Đóng góp của bạn cũng được cấp phép MIT. Đây là tóm lược, không phải tư vấn pháp lý; văn bản `LICENSE` trong repo mới có hiệu lực.

## :boxes: Có gì trong repo

:::cards 3
- :layers: **Nhiều website** Một bản cài, 4 vai trò. [Nhiều website](/tinh-nang/quan-ly-nhieu-website), [phân quyền](/tinh-nang/phan-quyen-nguoi-dung).
- :pen-line: **Soạn thảo, media, SEO** [Markdown](/tinh-nang/trinh-soan-thao-markdown), [media](/tinh-nang/thu-vien-media), [JSON-LD](/tinh-nang/seo-json-ld).
- :zap: **REST và GraphQL** Cho [frontend tùy chọn](/tinh-nang/headless-api).
- :refresh-cw: **Chuyển từ WordPress** Pipeline [thô, chuẩn hóa, nhập](/chuyen-tu-wordpress).
- :server: **Tự host** Docker Compose và Coolify: [hướng dẫn](/tu-host).
- :book-open: **Tài liệu** Bộ `docs/` đầy đủ tại [docs.opencms.kdigi.vn](https://docs.opencms.kdigi.vn/).
:::

> **Lưu ý** Theo CHANGELOG, mã tách ra từ một hệ thống đã chạy production. Module đặc thù nghiệp vụ, công cụ CDN, pipeline clone và importer một lần cho từng site riêng không được mang sang.

## :code: Cấu trúc kho mã

| Thư mục | Vai trò |
| --- | --- |
| `src/` | Collections, access, hooks, endpoints, importer WordPress, seed |
| `src/migrations/` | Migration PostgreSQL có timestamp; schema không tự đồng bộ |
| `docs/` | Bộ tài liệu: cấu hình, deploy, REST API, SEO, multi-site, vai trò |
| `docker/`, `Dockerfile`, `docker-compose*.yml` | Đóng gói và triển khai |
| `e2e/`, `.github/` | Kiểm thử Playwright, CI, mẫu issue/PR |

## :git-branch: Cách đóng góp

:::steps
- :github: **Mở hoặc tìm issue** Thay đổi lớn nên thống nhất hướng trước.
- :git-branch: **Fork, tạo nhánh từ main** Một thay đổi logic cho mỗi pull request.
- :list-checks: **Chạy kiểm tra như CI** `next build` bỏ qua lint và typecheck, nên build xanh chưa đủ.
- :database: **Đổi schema thì thêm migration** Phải đảo ngược được, không giả định database trống.
- :pen-line: **Commit và ghi CHANGELOG** Theo Conventional Commits; ghi vào mục Unreleased.
:::

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:integration   # cần PostgreSQL qua DATABASE_URI và PAYLOAD_INTEGRATION=1
```

Cài môi trường phát triển: [bắt đầu nhanh](https://docs.opencms.kdigi.vn/huong-dan/bat-dau-nhanh/). Quy ước chính:

:::check
- Mọi collection khai báo `access.*` tường minh
- Không log hay trả về bí mật (thông tin lưu trữ, API key)
- `vi` là locale mặc định, `en` là fallback
- Dùng `example.com` và `change-me`, không đưa domain hay bí mật thật vào mã
:::

## :shield-check: Chính sách bảo mật

:::stats
- **3** ngày làm việc để xác nhận báo cáo
- **10** ngày làm việc để cập nhật trạng thái
- **90** ngày tối đa để vá trước khi công bố
:::

> **Cảnh báo** Đừng mở issue công khai cho lỗ hổng. Báo riêng tại [GitHub Security Advisories](https://github.com/kdigivn/kdigi-cms-open/security/advisories/new) kèm phiên bản, cách chạy, tác động và bước tái hiện.

Bản `1.x` mới nhất được vá bảo mật. Khi vận hành, theo phần bảo mật trong [hướng dẫn tự host](/tu-host) và [bảo mật, phân quyền](/thuc-hanh-tot/bao-mat-va-phan-quyen).

## :heart-handshake: Quy tắc ứng xử

Dự án áp dụng Contributor Covenant 2.1. Kênh chính thức là [GitHub Issues](https://github.com/kdigivn/kdigi-cms-open/issues). Muốn thử trước khi tham gia, dùng [bản demo](/demo).

## :map: Lộ trình

Repo chưa có tài liệu roadmap riêng và mục **Unreleased** đang trống. Lịch sử thay đổi ở trang [phát hành](/phat-hanh); website chỉ nêu những gì đã có trong phiên bản phát hành.
