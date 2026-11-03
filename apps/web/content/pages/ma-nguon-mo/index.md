---
title: "KDIGI CMS mã nguồn mở: giấy phép MIT, GitHub"
description: "KDIGI CMS phát hành theo giấy phép MIT trên GitHub. Xem kho mã, hướng dẫn đóng góp, chính sách bảo mật và lộ trình chỉ gồm những gì đã có thật."
h1: "Mã nguồn mở: giấy phép MIT, kho mã và đóng góp"
navTitle: "Mã nguồn mở"
primaryKeyword: "cms mã nguồn mở"
updated: 2026-11-03
heroImage: /images/art/ma-nguon-mo-hero.webp
heroAlt: "Cây nhánh mã nguồn mở và ổ khoá mở bằng kính mờ trên đế đất sét, minh họa giấy phép MIT của KDIGI CMS"
schema: WebPage
faq:
  - q: "KDIGI CMS dùng giấy phép mã nguồn mở nào?"
    a: "KDIGI CMS phát hành theo giấy phép MIT, bản quyền 2026 KDIGI. MIT cho phép bạn dùng, sao chép, sửa, hợp nhất, xuất bản, phân phối, cấp phép lại và bán bản sao phần mềm, kể cả cho dự án thương mại, với điều kiện giữ nguyên thông báo bản quyền và nội dung giấy phép. Phần mềm được cung cấp nguyên trạng, không bảo hành."
  - q: "Tôi có được dùng KDIGI CMS cho khách hàng của agency không?"
    a: "Được. Giấy phép MIT không giới hạn mục đích thương mại hay số website. Bạn có thể cài một bản phục vụ nhiều site khách hàng nhờ mô hình multi-site, hoặc fork và tùy biến. Điều kiện duy nhất của MIT là giữ thông báo bản quyền và văn bản giấy phép trong các bản sao hoặc phần đáng kể của phần mềm."
  - q: "Làm sao đóng góp mã cho KDIGI CMS?"
    a: "Fork repo kdigivn/kdigi-cms-open, tạo nhánh từ main và gửi pull request nhỏ, mỗi PR một thay đổi logic. Trước đó chạy pnpm typecheck, pnpm lint, pnpm test và, nếu cần, pnpm test:integration. Commit theo Conventional Commits, cập nhật tài liệu và mục Unreleased của CHANGELOG. Thay đổi lớn nên mở issue trước để thống nhất hướng."
  - q: "Phát hiện lỗ hổng bảo mật thì báo ở đâu?"
    a: "Không mở issue công khai. Hãy dùng báo cáo riêng tư của GitHub tại github.com/kdigivn/kdigi-cms-open/security/advisories/new, kèm phiên bản, cách chạy, mô tả tác động và các bước tái hiện. Dự án cam kết phản hồi trong 3 ngày làm việc, cập nhật trạng thái trong 10 ngày làm việc và nhắm tới vá trước 90 ngày."
  - q: "Dự án có lộ trình (roadmap) công khai không?"
    a: "Hiện chưa có tài liệu roadmap riêng trong repo. Những gì đã phát hành nằm trong CHANGELOG (1.0.0, 1.0.1, 1.1.0), và mục Unreleased hiện để trống. Đề xuất tính năng được thu thập qua GitHub Issues bằng mẫu feature request; chúng tôi chỉ công bố tính năng sau khi nó đã được phát hành."
related:
  - /phat-hanh
  - /tu-host
  - /demo
  - /so-sanh/kdigi-cms-vs-wordpress
  - /thuc-hanh-tot
docs: https://docs.opencms.kdigi.vn/
---

KDIGI CMS là CMS headless nhiều website mã nguồn mở, phát hành theo giấy phép MIT (bản quyền 2026 KDIGI). Bạn được dùng, sửa, phân phối và bán lại, kể cả cho dự án thương mại. Mã nguồn công khai tại github.com/kdigivn/kdigi-cms-open, xây dựng trên Payload 3, Next.js 15 và PostgreSQL.

> **Tóm tắt nhanh**
>
> - Giấy phép: **MIT**, file `LICENSE` ở thư mục gốc repo, bản quyền 2026 KDIGI.
> - Repo: <https://github.com/kdigivn/kdigi-cms-open> (nhánh `main`, phiên bản hiện tại 1.1.0).
> - Công nghệ: Payload 3.90, Next.js 15 (App Router), React 19, PostgreSQL, Milkdown, TypeScript, pnpm.
> - Có sẵn `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1), `SECURITY.md` và mẫu issue/PR.
> - CI chạy typecheck, unit test, lint và integration test với PostgreSQL thật.
> - Lỗ hổng bảo mật báo riêng tư qua GitHub Security Advisories, không mở issue công khai.

![Ảnh chụp bảng điều khiển KDIGI CMS, phần mềm mã nguồn mở quản lý nhiều website](/images/shots/dashboard.webp)

## Giấy phép MIT nghĩa là gì với bạn

KDIGI CMS dùng MIT License, một giấy phép dễ dãi (permissive). Văn bản trong repo cho phép bất kỳ ai nhận một bản sao phần mềm và tài liệu đi kèm được "sử dụng, sao chép, sửa đổi, hợp nhất, xuất bản, phân phối, cấp phép lại và/hoặc bán" bản sao, miễn là giữ nguyên thông báo bản quyền và thông báo giấy phép. Phần mềm được cung cấp "nguyên trạng" và không có bảo hành.

| Bạn muốn | MIT có cho phép không |
| --- | --- |
| Dùng cho website của khách hàng, kể cả thu phí | Có |
| Cài một bản phục vụ nhiều website | Có (không giới hạn số site trong giấy phép) |
| Fork và sửa mã theo nhu cầu | Có |
| Phân phối lại bản đã sửa, kể cả đóng gói thương mại | Có, với điều kiện giữ thông báo bản quyền và giấy phép |
| Đòi tác giả bảo hành hay chịu trách nhiệm | Không, phần mềm cung cấp nguyên trạng |

Khi bạn gửi đóng góp, theo `CONTRIBUTING.md` bạn đồng ý đóng góp đó được cấp phép theo cùng giấy phép MIT. Đây là mô tả tóm lược chứ không phải tư vấn pháp lý; văn bản `LICENSE` trong repo là bản có hiệu lực.

## Nguồn gốc và phạm vi mã nguồn

Theo CHANGELOG, bản 1.0.0 là bản công khai đầu tiên, tách ra từ một hệ thống CMS đa website đã chạy production rồi tổng quát hóa cho agency, blogger, doanh nghiệp nhỏ và người đang rời WordPress. Khi mở mã nguồn, các module đặc thù miền nghiệp vụ, công cụ CDN tùy chọn, pipeline clone và mọi importer/fixture một lần cho từng site riêng của hệ thống gốc **không** được mang sang. Những gì có trong repo là sản phẩm tổng quát:

- Quản lý [nhiều website](/tinh-nang/quan-ly-nhieu-website) trong một bản cài, phân quyền `super-admin`, `admin`, `editor`, `author` ([phân quyền](/tinh-nang/phan-quyen-nguoi-dung)).
- Mô hình nội dung, [trình soạn thảo Markdown](/tinh-nang/trinh-soan-thao-markdown), [thư viện media](/tinh-nang/thu-vien-media), [SEO tích hợp với JSON-LD](/tinh-nang/seo-json-ld).
- REST và GraphQL cho [frontend tùy chọn](/tinh-nang/headless-api).
- Pipeline [di chuyển từ WordPress](/chuyen-tu-wordpress).
- Cấu hình [tự host](/tu-host) bằng Docker Compose và Coolify.

## Cấu trúc kho mã

| Thư mục/file | Vai trò |
| --- | --- |
| `src/` | Mã nguồn ứng dụng: collections, access, hooks, endpoints, importer WordPress, seed |
| `docs/` | Bộ tài liệu: getting started, configuration, deploy, upgrading, architecture, REST API, SEO, multi-site, media, roles, content Markdown, WordPress migration |
| `src/migrations/` | Migration PostgreSQL có timestamp; schema không bao giờ tự đồng bộ |
| `docker/`, `Dockerfile`, `docker-compose*.yml` | Đóng gói và triển khai |
| `e2e/` | Kiểm thử Playwright |
| `.github/` | CI, mẫu bug report, feature request và pull request |
| `AGENTS.md`, `CLAUDE.md` | Hướng dẫn cho trợ lý lập trình AI khi làm việc với repo |

Tài liệu đầy đủ được xuất bản tại [docs.opencms.kdigi.vn](https://docs.opencms.kdigi.vn/).

## Chạy thử và đóng góp mã

Yêu cầu: Node.js ≥ 20.9 (khuyến nghị 22), pnpm 10 (`corepack enable`) và Docker cho PostgreSQL.

```bash
git clone https://github.com/kdigivn/kdigi-cms-open.git
cd kdigi-cms-open
pnpm install --frozen-lockfile
cp .env.example .env        # đặt PAYLOAD_SECRET ngẫu nhiên ≥ 32 ký tự
docker compose up -d db     # chỉ PostgreSQL, cổng 5432
pnpm migrate                # áp dụng migration
pnpm dev                    # http://localhost:3000/admin
```

### Cách gửi một đóng góp

1. **Tìm hoặc mở issue.** Với thay đổi lớn hãy mở issue trước để thống nhất hướng; tìm trước để tránh trùng. Có mẫu cho bug report và feature request.
2. **Fork và tạo nhánh từ `main`.** Một thay đổi logic cho mỗi pull request, đủ nhỏ để review.
3. **Chạy bộ kiểm tra giống CI:**

   ```bash
   pnpm typecheck
   pnpm lint
   pnpm test                  # unit test (node:test + tsx, file *.test.ts đặt cạnh mã)
   pnpm test:integration      # cần PostgreSQL qua DATABASE_URI và PAYLOAD_INTEGRATION=1
   ```

   `next build` cố ý bỏ qua lint và typecheck, nên một bản build xanh chưa chứng minh được gì.
4. **Nếu đổi schema:** `pnpm payload migrate:create <tên-ngắn>`, rà soát SQL được sinh, `pnpm generate:types`, và `pnpm generate:importmap` nếu thêm hoặc đổi tên component admin. Migration phải đảo ngược được và không giả định database trống.
5. **Đổi hợp đồng REST công khai** thì cập nhật `docs/rest-api.md` trong cùng PR.
6. **Commit theo Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`), điền mẫu pull request, thêm test cho thay đổi hành vi và ghi vào mục **Unreleased** của CHANGELOG.

### Quy ước mã nguồn

- TypeScript, tên file kebab-case mô tả rõ, test đặt cạnh mã.
- Kiểm soát truy cập là ranh giới bảo mật: mọi collection khai báo `access.*` tường minh; không dựa riêng vào bộ lọc của plugin multi-tenant.
- Collection nội dung có phiên bản, nên hook **không** được gọi lại `payload.update()` trên chính tài liệu của nó.
- Không bao giờ log hay trả về bí mật (thông tin lưu trữ từng site, API key).
- Tiếng Việt (`vi`) là locale mặc định, tiếng Anh (`en`) là fallback; giữ nhãn song ngữ trên các trường admin.
- Không đưa bí mật, dữ liệu khách hàng thật hay domain thật vào mã, fixture hoặc tài liệu; dùng `example.com` và `change-me`.

Dự án cũng ghi rõ bạn được dùng trợ lý lập trình AI với `AGENTS.md` và `CLAUDE.md`, nhưng bạn chịu trách nhiệm với những gì mình gửi.

### CI

Workflow `.github/workflows/ci.yml` chạy cho mọi pull request và mọi push lên `main`, không cần secret:

| Job | Làm gì |
| --- | --- |
| `verify` | Node 22, `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm test`, `pnpm lint` (đều chặn merge) |
| `integration` | Dựng PostgreSQL 16, áp dụng `pnpm migrate` lên database trống (đồng thời chứng minh cài mới hoạt động), rồi chạy `pnpm test:integration` |

## Chính sách bảo mật

Bản `1.x` mới nhất được vá bảo mật; các bản trước 1.0 không được hỗ trợ. **Đừng mở issue công khai cho lỗ hổng.** Báo riêng tư tại <https://github.com/kdigivn/kdigi-cms-open/security/advisories/new> và nêu:

- phiên bản hoặc commit, cách bạn chạy (Docker, VPS, Coolify…);
- mô tả lỗi và tác động (kẻ tấn công đọc, sửa hoặc chạy được gì);
- các bước tái hiện hoặc proof of concept;
- đề xuất sửa nếu có.

Dự án cam kết xác nhận trong **3 ngày làm việc**, cập nhật trạng thái trong **10 ngày làm việc**, ghi công người báo trong ghi chú phát hành trừ khi bạn yêu cầu không, và nhắm tới vá trong tối đa 90 ngày trước khi công bố.

Các vùng được quan tâm đặc biệt: cách ly dữ liệu giữa các site, rò rỉ bí mật (thông tin lưu trữ và API key), SSRF ở các tính năng tải từ máy chủ (`media/from-url`, importer WordPress), bypass kiểm soát lạm dụng ở endpoint công khai (bình luận, đánh giá), và XSS lưu trữ qua nội dung Markdown đã render. Ngoài phạm vi: lỗ hổng thư viện bên thứ ba không có tác động chứng minh được, kỹ thuật xã hội, tấn công từ chối dịch vụ bằng lưu lượng, và sự cố cần tài khoản `super-admin` bị chiếm (vai trò này được tin cậy theo thiết kế).

Nếu bạn vận hành, hãy theo phần bảo mật trong [hướng dẫn tự host](/tu-host) và [thực hành bảo mật, phân quyền](/thuc-hanh-tot/bao-mat-va-phan-quyen).

## Quy tắc ứng xử và cộng đồng

Dự án áp dụng Contributor Covenant 2.1 cho mọi không gian của dự án (issue, pull request, thảo luận, chat và sự kiện). Kênh chính thức là GitHub: [Issues](https://github.com/kdigivn/kdigi-cms-open/issues) cho lỗi và đề xuất; cấu hình mẫu issue tắt issue trống và dẫn bạn tới tài liệu cùng kênh báo bảo mật riêng. Bạn có thể thử sản phẩm ngay ở [bản demo](/demo) trước khi tham gia.

## Lộ trình

Repo hiện không có tài liệu roadmap riêng, và mục **Unreleased** trong CHANGELOG đang trống. Lịch sử thay đổi đã phát hành (1.0.0, 1.0.1, 1.1.0) nằm ở trang [Phát hành](/phat-hanh). Muốn đề xuất tính năng, hãy mở issue bằng mẫu *feature request*. Chúng tôi chỉ nêu trên website những gì đã có trong phiên bản phát hành.

## Nguồn

- Repo, LICENSE, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT: <https://github.com/kdigivn/kdigi-cms-open>
- MIT License (văn bản chuẩn của Open Source Initiative): <https://opensource.org/license/mit>
- Contributor Covenant 2.1: <https://www.contributor-covenant.org/version/2/1/code_of_conduct/>
- Tài liệu sản phẩm: <https://docs.opencms.kdigi.vn/>
