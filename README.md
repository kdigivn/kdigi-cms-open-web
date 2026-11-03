# KDIGI CMS Open Web

Website giới thiệu và tài liệu của [KDIGI CMS](https://github.com/kdigivn/kdigi-cms-open), chạy tại **https://opencms.kdigi.vn**.

The intro and documentation website for KDIGI CMS, an open-source (MIT) headless multi-site CMS.

- Astro 6 + [Starlight](https://starlight.astro.build): tiếng Việt (`/`) và tiếng Anh (`/en/`), sáng/tối, tìm kiếm không dấu (Pagefind), `llms.txt`, nút sao chép/xem markdown.
- Trang chủ là landing; hướng dẫn, "Di chuyển từ WordPress" và API viết trong `src/content/docs/`.
- Khu "Tham khảo kỹ thuật" (`/en/tham-khao/…`) là bản sao thư mục `docs/` của repo CMS (tiếng Anh).

## Chạy local

Cần Node.js 22.12+ và pnpm (qua `corepack enable`).

```bash
pnpm install
pnpm dev            # http://localhost:4321
pnpm build          # ra thư mục dist/
pnpm preview
```

## Kiểm tra

```bash
pnpm docs:check         # cấu trúc, sidebar, bản dịch, mermaid, liên kết, độ dễ đọc
pnpm build && pnpm docs:check:dist   # tệp bắt buộc, sitemap, llms.txt, markdown thô, tìm kiếm
```

## Cập nhật tài liệu kỹ thuật từ repo CMS

Trang trong `src/content/docs/en/tham-khao/` và `src/reference.json` do script sinh ra; không sửa tay.

```bash
pnpm sync:docs                              # nguồn mặc định: ../kdigi-cms-open/docs
node scripts/sync-docs.mjs /đường/dẫn/tới/kdigi-cms-open/docs
```

Script đổi link giữa các file docs thành đường dẫn của site, link tới mã nguồn thành URL GitHub. Sau khi sync, chạy `pnpm docs:check` rồi commit.

## Cấu trúc

| Đường dẫn | Nội dung |
| --- | --- |
| `src/content/docs/` | Trang tiếng Việt; `en/` là bản tiếng Anh cùng đường dẫn |
| `src/sidebar.mjs` | Cây tài liệu và các khu vực (tab trên header) |
| `src/components/` | Hero, khối trang chủ, header, footer, breadcrumb |
| `src/styles/` | Token và giao diện (không dùng Tailwind), xem [`DESIGN.md`](DESIGN.md) |
| `scripts/` | `sync-docs` và các script kiểm tra |
| `MINDSET.md` | Quyết định thiết kế và ngoại lệ so với chuẩn chung |

## Triển khai

`Dockerfile` build tĩnh (`pnpm build`) rồi phục vụ bằng nginx ở cổng 80, healthcheck tại `/version.txt` (chứa commit đang chạy, lấy từ build arg `SOURCE_COMMIT`). Trên Coolify: build pack Dockerfile, cổng 80, tên miền `opencms.kdigi.vn`, bật "Include Source Commit in Build".

```bash
docker build -t kdigi-cms-open-web --build-arg SOURCE_COMMIT=$(git rev-parse --short HEAD) .
docker run --rm -p 8080:80 kdigi-cms-open-web
```

## Giấy phép

[MIT](LICENSE). Font Ferry VN theo giấy phép OFL (`public/fonts/ferry-vn/OFL.txt`).
