---
title: "Nhật ký phát hành KDIGI CMS (release notes)"
description: "Danh sách các phiên bản KDIGI CMS: tính năng mới, sửa lỗi và thay đổi quan trọng, lấy trực tiếp từ CHANGELOG của dự án, cập nhật theo từng bản phát hành."
h1: "Nhật ký phát hành KDIGI CMS"
navTitle: "Phát hành"
icon: rocket
lead: "Mỗi bản phát hành một danh sách ngắn: thêm gì, sửa gì, có migration hay không."
primaryKeyword: "kdigi cms"
updated: 2026-11-03
heroImage: /images/art/phat-hanh-hero.webp
heroAlt: "Hộp phát hành kính mờ với dải xanh và mũi tên đi lên, đại diện cho các bản phát hành của KDIGI CMS"
schema: CollectionPage
faq:
  - q: "Phiên bản mới nhất của KDIGI CMS là gì?"
    a: "1.2.0, phát hành 2026-11-03: bản AI-native với máy chủ MCP tại /api/mcp, CLI kcms và giới hạn mới cho phiên API key. Bản này không có migration mới."
  - q: "KDIGI CMS đánh số phiên bản theo quy tắc nào?"
    a: "Semantic Versioning, CHANGELOG theo định dạng Keep a Changelog. Bản vá bảo mật phát hành cho minor mới nhất của dòng 1.x. Hãy đọc CHANGELOG trước mỗi lần nâng cấp."
  - q: "Nâng cấp từ 1.1.0 lên 1.2.0 có cần migration không?"
    a: "Không. 1.2.0 không thêm migration. Lưu ý thay đổi hành vi: phiên API key không còn đổi được tài khoản, vai trò, site và không xoá vĩnh viễn. Luôn sao lưu trước khi nâng cấp."
  - q: "Tôi theo dõi bản phát hành mới ở đâu?"
    a: "File CHANGELOG.md và các tag phiên bản (v1.0.0 đến v1.2.0) trong repo kdigivn/kdigi-cms-open trên GitHub. Bạn có thể Watch repo để nhận thông báo."
related:
  - /tu-host
  - /thuc-hanh-tot/sao-luu-va-nang-cap
  - /chuyen-tu-wordpress
  - /ma-nguon-mo
  - /demo
docs: https://docs.opencms.kdigi.vn/
order: 4
---

Phiên bản mới nhất là **1.2.0** (2026-11-03), bản AI-native. Trang này tóm tắt các bản 1.0.0 đến 1.2.0 từ CHANGELOG của dự án.

> **Tóm tắt nhanh**
>
> - Bản mới nhất: **1.2.0**; trước đó 1.1.0, 1.0.1 và 1.0.0.
> - Semantic Versioning; CHANGELOG theo Keep a Changelog.
> - Schema chỉ đổi bằng migration; 1.0.1 thêm một migration.
> - Sao lưu database và media trước khi nâng cấp.

:::stats
- **1.2.0** bản mới nhất
- **4** bản phát hành
- **23** công cụ MCP cho AI agent
:::

## :bot: Bản mới nhất: 1.2.0, KDIGI CMS AI-native

AI agent làm việc trực tiếp trên CMS, với đúng quyền của người dùng sở hữu API key. Không có migration mới.

:::cards 3
- :bot: **Máy chủ MCP** `POST /api/mcp`, 23 công cụ cho AI agent; bật sẵn, tắt bằng `MCP_ENABLED=false`. [AI agent và MCP](/tinh-nang/ai-agent-mcp).
- :terminal: **CLI kcms** `@kdigi/kcms-cli`: sửa bài như tệp Markdown, `kcms setup` cho Claude Code, Codex, Cursor, VS Code, OMP.
- :key-round: **Siết phiên API key** Trên mọi route REST/GraphQL: không đổi tài khoản, vai trò, site; không xoá vĩnh viễn.
:::

> **Lưu ý** Đây là thay đổi hành vi: script dùng API key để xoá vĩnh viễn hoặc sửa tài khoản sẽ bị từ chối (`403`). Sửa thêm: cập nhật một phần qua REST/GraphQL không còn ghi đè `excerpt` hay xoá `seo.breadcrumbs`.

## :rocket: 1.1.0: tài khoản demo và revalidate có xác thực

Tập trung vào chạy demo công khai an toàn và xác thực lời gọi revalidate.

:::cards 3
- :shield-check: **Bảo vệ tài khoản demo** Tùy chọn qua `DEMO_ACCOUNT_EMAILS`: không đổi được email, mật khẩu, API key. [Xem demo](/demo).
- :refresh-cw: **Đặt lại demo** `pnpm demo:reset` xóa nội dung site `demo`, nạp lại mẫu, đặt lại tài khoản; dành cho tác vụ hằng đêm.
- :key-round: **Revalidate có xác thực** `REVALIDATE_SECRET` gửi header `x-revalidate-secret`. [Headless API](/tinh-nang/headless-api).
:::

Hai file compose chuyển tiếp thêm `REVALIDATE_SECRET`, `DEMO_ACCOUNT_EMAILS` và `DEMO_ACCOUNT_PASSWORD`. Không đặt biến nào thì hành vi không đổi.

## :package: Danh sách bản phát hành

| Phiên bản | Ngày | Điểm chính | Chuyển schema |
| --- | --- | --- | --- |
| [1.2.0](https://github.com/kdigivn/kdigi-cms-open/releases/tag/v1.2.0) | 2026-11-03 | AI-native: máy chủ MCP, CLI `kcms`, siết phiên API key | Không |
| [1.1.0](https://github.com/kdigivn/kdigi-cms-open/compare/v1.0.1...v1.1.0) | 2026-11-03 | Bảo vệ tài khoản demo, `pnpm demo:reset`, `REVALIDATE_SECRET` | Không ghi trong CHANGELOG |
| [1.0.1](https://github.com/kdigivn/kdigi-cms-open/compare/v1.0.0...v1.0.1) | 2026-11-03 | Sửa lỗi pipeline chuyển WordPress | Có: `20261103_052647_media_source_media_id` |
| [1.0.0](https://github.com/kdigivn/kdigi-cms-open/releases/tag/v1.0.0) | 2026-11-03 | Bản công khai đầu tiên (MIT) | Migration nền `20261103_042515_initial` |

## :settings: 1.0.1: sửa lỗi chuyển WordPress

:::cards 2
- :image: **Phase media** Thêm khóa ẩn `sourceMediaId`; trước đó ảnh đại diện, slider, ảnh trong bài không được nhập.
- :history: **Chạy lại** Media chỉ có URL (logo, ảnh OG) không bị tải lên lại mỗi lần.
- :link: **Host có cổng** Nguồn như `127.0.0.1:8080` được khớp khi viết lại canonical, menu, link nội bộ.
- :check: **Dry-run** Trên database trống không còn báo lỗi sai về ảnh trong bài.
:::

> **Lưu ý** Nếu định [chuyển từ WordPress](/chuyen-tu-wordpress), hãy dùng từ 1.0.1 trở lên.

## :sparkles: 1.0.0: bản công khai đầu tiên

CMS headless nhiều website (MIT) trên Payload 3.90, Next.js 15 và PostgreSQL, tách ra từ một hệ thống đã chạy production.

:::cards 3
- :layers: **Nhiều website, vai trò** Dữ liệu tách theo site; 4 vai trò. [Nhiều website](/tinh-nang/quan-ly-nhieu-website).
- :file-text: **Mô hình nội dung** Pages, posts, products, landings, menus, FAQs, redirects, comments. [Nội dung](/tinh-nang/noi-dung-va-cau-truc).
- :pen-line: **Soạn thảo và media** Milkdown, thư viện media, trình sửa ảnh. [Trình soạn thảo](/tinh-nang/trinh-soan-thao-markdown).
- :search: **SEO** JSON-LD, mẫu tiêu đề, audit, AI SEO tùy chọn. [SEO và JSON-LD](/tinh-nang/seo-json-ld).
- :zap: **Tích hợp frontend** REST, GraphQL, job revalidate ISR.
- :server: **Triển khai và dự án** Docker Compose một lệnh, tài liệu `docs/`, CI. [Tự host](/tu-host).
:::

## :refresh-cw: Cách nâng cấp

:::steps
- **Đọc CHANGELOG** Mọi phiên bản giữa bản của bạn và bản đích.
- **Sao lưu** Database và media ([sao lưu và nâng cấp](/thuc-hanh-tot/sao-luu-va-nang-cap)).
- **Lấy code mới, build lại** Coolify thì redeploy.
- **Cập nhật biến môi trường** Nếu CHANGELOG thêm mới.
- **Kiểm tra** Đăng nhập `/admin`, tải một ảnh, gọi một URL công khai.
:::

```bash
git fetch --tags && git checkout v1.2.0
docker compose up -d --build   # entrypoint chạy payload migrate trước khi khởi động
```

Chi tiết và cách quay lại: mục nâng cấp của trang [tự host](/tu-host).
