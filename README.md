# KDIGI CMS Open Web

Hai website công khai của [KDIGI CMS](https://github.com/kdigivn/kdigi-cms-open), CMS headless AI-native, đa website, mã nguồn mở (MIT), trong một pnpm workspace.

The two public websites of KDIGI CMS, an AI-native, open-source (MIT) headless multi-site CMS, in one pnpm workspace.

| App | URL | Công nghệ |
| --- | --- | --- |
| [`apps/web`](apps/web) | https://cms.kdigi.vn | Next.js 16 (ISR), Tailwind 4: trang giới thiệu, demo trực tuyến, blog. FAQ, bài viết và trang pháp lý đọc từ chính KDIGI CMS |
| [`apps/docs`](apps/docs) | https://docs.cms.kdigi.vn | Astro 6 + [Starlight](https://starlight.astro.build): hướng dẫn, di chuyển WordPress, API, tài liệu kỹ thuật (vi, en) |

CMS chạy ở https://app.cms.kdigi.vn (repo riêng, [`kdigi-cms-open`](https://github.com/kdigivn/kdigi-cms-open)). Quyết định thiết kế và ngoại lệ so với chuẩn chung: [`MINDSET.md`](MINDSET.md).

## Chạy local

Cần Node.js 22.12+ và pnpm (qua `corepack enable`).

```bash
pnpm install
pnpm dev:web     # http://localhost:3000  (cần CMS_URL, xem apps/web/.env.example)
pnpm dev:docs    # http://localhost:4321
pnpm build       # build cả hai app
```

## Kiểm tra

```bash
pnpm typecheck && pnpm lint && pnpm test     # web: tsc, eslint, vitest (logic thuần); docs: astro check
pnpm docs:check                              # docs: cấu trúc, sidebar, bản dịch, liên kết, độ dễ đọc
pnpm --filter docs build && pnpm --filter docs docs:check:dist   # docs: tệp bắt buộc, sitemap, llms.txt, tìm kiếm
```

## `apps/web`

- Nội dung CMS đọc ở server (REST công khai) và render theo ISR: làm mới tối đa mỗi giờ, và ngay khi CMS gọi `POST /api/cms/revalidate` với header `x-revalidate-secret` (so với biến `REVALIDATE_SECRET`; thiếu biến thì route trả 503).
- Biến môi trường: xem [`apps/web/.env.example`](apps/web/.env.example). `CMS_URL` phải truy cập được lúc build, vì trang được render sẵn.
- Ảnh minh hoạ tạo bằng Codex (`apps/web/illustrations-src`: `gen.sh`, `process.py`), ảnh chụp trang quản trị thật xuất bằng `scripts/optimize-shots.py`, ảnh OG ghép bằng `scripts/gen-og.py`.
- Đường dẫn tài liệu cũ trên `cms.kdigi.vn` chuyển 301 sang `docs.cms.kdigi.vn` (`next.config.ts`).

## `apps/docs`

- Trang chủ `/` là trang chủ tài liệu; hướng dẫn, "Di chuyển từ WordPress" và API viết trong `apps/docs/src/content/docs/`.
- Khu "Tham khảo kỹ thuật" (`/en/tham-khao/…`) là bản sao thư mục `docs/` của repo CMS, sinh bằng script, không sửa tay:

```bash
pnpm sync:docs                                   # nguồn mặc định: ../kdigi-cms-open/docs
pnpm --filter docs exec node scripts/sync-docs.mjs /đường/dẫn/tới/kdigi-cms-open/docs
```

Sau khi sync chạy `pnpm docs:check` rồi commit. Cấu trúc và giao diện: [`apps/docs/DESIGN.md`](apps/docs/DESIGN.md).

## Triển khai

Hai app cùng repo, Coolify build pack Dockerfile, build context là gốc repo:

| App | Dockerfile | Cổng | Tên miền | Theo dõi đường dẫn |
| --- | --- | --- | --- | --- |
| docs | `apps/docs/Dockerfile` | 80 (nginx, healthcheck `/version.txt`) | `docs.cms.kdigi.vn` | `apps/docs/**` + tệp workspace ở gốc |
| web | `apps/web/Dockerfile` | 3000 (healthcheck `/api/health`) | `cms.kdigi.vn` | `apps/web/**` + tệp workspace ở gốc |

Bật "Include Source Commit in Build" để `SOURCE_COMMIT` đi vào `/version.txt` (docs) và `/api/health` (web).

```bash
docker build -f apps/docs/Dockerfile -t kdigi-docs --build-arg SOURCE_COMMIT=$(git rev-parse --short HEAD) .
docker build -f apps/web/Dockerfile  -t kdigi-web  --build-arg CMS_URL=https://app.cms.kdigi.vn .
```

## Giấy phép

[MIT](LICENSE). Font Ferry VN theo giấy phép OFL (`apps/*/public/fonts/ferry-vn/OFL.txt`). Logo KDIGI là tài sản thương hiệu của KDIGI.
