# KDIGI CMS Open Web: Mindset

## Tham chiếu

- Chuẩn chung: skill `khoi-system-design`, áp dụng mặc định toàn bộ. Dòng **MUST** không được lệch; dòng **Default** làm khác thì ghi ở mục "Ngoại lệ".

## Sản phẩm

- Mô tả: hai website công khai của KDIGI CMS (CMS headless đa website mã nguồn mở, MIT) trong một repo pnpm workspace. Repo CMS: https://github.com/kdigivn/kdigi-cms-open.
  - `apps/web` → https://opencms.kdigi.vn: trang giới thiệu (marketing) bằng Next.js, có bản demo trực tuyến, blog và FAQ lấy từ chính KDIGI CMS.
  - `apps/docs` → https://docs.opencms.kdigi.vn: tài liệu bằng Astro Starlight (không đổi nội dung so với trước khi tách).
  - CMS chạy ở https://app.opencms.kdigi.vn (repo riêng); trang chủ đọc nội dung của site `opencms`, tài khoản demo công khai chỉ vào được site `demo`.
- Người dùng chính: agency, blogger, doanh nghiệp nhỏ, người đang dùng WordPress muốn chuyển; developer đọc tài liệu API. Đọc chủ yếu trên desktop, một phần mobile.
- Thị trường/locale: tiếng Việt trước. `apps/docs` có thêm `/en/`; `apps/web` chỉ tiếng Việt (bản tiếng Anh chưa làm, CMS đã có sẵn locale `en`).
- Phạm vi `apps/web`: hero có ảnh chụp trang quản trị thật, giá trị cốt lõi, sáu mục tính năng (mỗi mục một ảnh chụp thật), chuyển từ WordPress, tự host bằng Docker, demo trực tuyến kèm tài khoản, mã nguồn mở, bài viết mới, FAQ, blog (`/blog`, `/blog/[slug]`), trang `gioi-thieu`/`dieu-khoan`/`quyen-rieng-tu`, SEO (metadata, JSON-LD, sitemap, robots, OG, RSS, `llms.txt`).
- Phạm vi `apps/docs`: hướng dẫn, "Di chuyển từ WordPress", tài liệu API, bản sao tài liệu kỹ thuật của repo CMS, SEO cơ bản; `/` là trang chủ tài liệu, không phải landing.
- Ngoài phạm vi: đăng nhập, form liên hệ, analytics, bình luận, thanh toán.

## Design system

- Template gốc: `apps/docs` từ `frontend/templates/docs-site/` (Astro Starlight); `apps/web` sao tối giản từ app web 1go.vn (Next.js): bộ token "Tech Blue · Liquid Glass", header kính, typography, nền mesh, dark mode. Spec giao diện của docs: [`apps/docs/DESIGN.md`](apps/docs/DESIGN.md).
- Font: Ferry VN (Text, Display Bold, Mono) self-host trong cả hai app.
- Brand: logo chính thức của KDIGI (repo `kdigivn/new-kdigivn`: `kdigi-mark.svg`, `kdigi-logo.svg`, `kdigi-logo-white.svg`, favicon), chép vào repo, không vẽ lại. Tên sản phẩm "KDIGI CMS" là chữ HTML cạnh dấu K.
- Token hoặc màu riêng: không, giữ bộ token của template. Màu logo `#4767EC` chỉ nằm trong file logo.
- Không chép khối shadcnblocks premium vào repo công khai này (giấy phép cấm phân phối): các section của `apps/web` tự viết bằng Tailwind và token.

## Frontend

- `apps/web`: Next.js 16 (App Router), React 19, Tailwind 4, pnpm. Section là server component; client chỉ cho menu mobile, đổi giao diện sáng/tối, sao chép, "Giảm độ trong suốt".
- Nội dung từ CMS (đọc ở server, REST công khai, không bao giờ từ trình duyệt): FAQ (`faqs`), bài viết (`posts`), trang pháp lý (`pages`) của site `opencms`. Copy hero và tính năng viết cứng trong code.
- ISR: trang render sẵn, làm mới tối đa mỗi giờ, và ngay khi CMS gọi `POST /api/cms/revalidate` (header `x-revalidate-secret`, so sánh hằng thời gian với `REVALIDATE_SECRET`; thiếu biến thì route trả 503). Mọi lần đọc CMS gắn tag `cms` nên một webhook làm mới cả trang chủ, blog, sitemap.
- CMS lỗi thì trang không dựng được và ISR giữ bản tốt gần nhất, không cache một trang thiếu FAQ/bài viết.
- Ảnh: minh hoạ đất sét + kính tạo bằng Codex `image_gen` (`apps/web/illustrations-src`, style lock trong `keys.py`, tách nền chroma bằng `process.py`); ảnh chụp trang quản trị thật xuất sang WebP bằng `scripts/optimize-shots.py`; ảnh OG ghép bằng `scripts/gen-og.py`. Mọi ảnh có kích thước thật trong manifest nên không dịch chuyển bố cục.
- A11y: skip link, focus ring 2px, nút ≥ 44px trên điện thoại, `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast`, nút "Giảm độ trong suốt".

## Kiến trúc

- Dạng hệ thống: `apps/docs` tĩnh (nginx); `apps/web` là Node server nhỏ (Next.js standalone) cho ISR và webhook. Không DB, auth, payment trong repo này.
- Service và stack: Next.js 16 + Tailwind 4 (web), Astro 6 + Starlight + Pagefind (docs), CMS ngoài (Payload) làm nguồn nội dung.

## Hạ tầng

- Deploy: Coolify (server đặt ở VN), hai app cùng repo, build pack Dockerfile, build context là gốc repo:
  - `apps/docs/Dockerfile` (cổng 80) → `docs.opencms.kdigi.vn`.
  - `apps/web/Dockerfile` (cổng 3000, biến `CMS_URL`, `CMS_SITE_KEY`, `REVALIDATE_SECRET`) → `opencms.kdigi.vn`.
  - Cả hai tự build khi có commit mới trên `main` (webhook GitHub dùng chung), mỗi app chỉ theo đường dẫn của mình (`apps/<app>/**` và các tệp workspace ở gốc).
- Đường dẫn tài liệu cũ trên `opencms.kdigi.vn` (`/huong-dan`, `/wordpress`, `/tham-khao`, `/en`, `/api/rest-graphql`, `/pagefind`) chuyển 301 sang `docs.opencms.kdigi.vn` (`next.config.ts`).
- CI/CD, secrets, monitoring: không có secret trong repo; `REVALIDATE_SECRET` chỉ nằm trong biến môi trường Coolify và CMS. Monitoring bằng Uptime Kuma đặt ngoài repo này.

## Ngoại lệ so với chuẩn chung

| Dòng **Default** trong `khoi-system-design` | Dự án này làm gì | Lý do |
| --- | --- | --- |
| Site public: Cloudflare Workers (static assets) | Coolify (VM ở VN), nginx cho docs và Node cho web | Hạ tầng KDIGI CMS đã chạy trên Coolify, không thêm tài khoản; khách chính ở VN nên TTFB từ VN thấp |
| Làm việc trên `develop`, `main` là release | Chỉ dùng nhánh `main`, commit thẳng | Repo nhỏ, một người duy trì; Coolify build lại mỗi lần có commit mới trên `main` |
| CSP không `unsafe-inline` cho script (route ISR: `script-src 'self'` + `experimental.sri`) | `apps/web`: `script-src 'self' 'unsafe-inline'`, còn lại đóng (không framing, ảnh chỉ từ origin và CMS, không plugin) | Đã thử đúng cấu hình chuẩn: `script-src 'self'` + `experimental.sri` làm trang không hydrate (script inline mang dữ liệu flight của App Router bị chặn, menu chết). Nonce buộc render động, tắt ISR và cache, trái với trang tĩnh. `apps/docs` (nginx, tĩnh) giữ header riêng ở `security-headers.inc` |
| UI từ shadcnblocks premium qua CLI + MCP | Section tự viết bằng Tailwind và token | Repo công khai, giấy phép shadcnblocks cấm phân phối khối premium |
| Screenshot hướng dẫn bằng `/ck:agent-browser` | `apps/docs`: chưa có screenshot trong bài; `apps/web`: ảnh chụp trang quản trị thật do agent trình duyệt chụp | Docs mô tả bằng lệnh và cấu hình |
