# KDIGI CMS Open Web: Mindset

## Tham chiếu

- Chuẩn chung: skill `khoi-system-design`, áp dụng mặc định toàn bộ. Dòng **MUST** không được lệch; dòng **Default** làm khác thì ghi ở mục "Ngoại lệ".

## Sản phẩm

- Mô tả: site giới thiệu và tài liệu công khai của KDIGI CMS (CMS headless đa website mã nguồn mở, MIT), chạy ở https://opencms.kdigi.vn. Repo CMS: https://github.com/kdigivn/kdigi-cms-open.
- Người dùng chính: agency, blogger, doanh nghiệp nhỏ, người đang dùng WordPress muốn chuyển; developer đọc tài liệu API. Đọc chủ yếu trên desktop, một phần mobile.
- Thị trường/locale: tiếng Việt trước (`/`), tiếng Anh sau (`/en/`).
- Phạm vi bản đầu: landing (hero, tính năng, bắt đầu nhanh, WordPress, GitHub/MIT), hướng dẫn, trang "Di chuyển từ WordPress", tài liệu API, bản sao tài liệu kỹ thuật của repo CMS, SEO cơ bản (title/description, OG image, sitemap, robots, llms.txt).
- Ngoài phạm vi: đăng nhập, form liên hệ, blog, analytics, bản demo trực tuyến của CMS.

## Design system

- Template gốc: `frontend/templates/docs-site/` (Astro Starlight) của skill, giữ nguyên bộ token "Tech Blue · Liquid Glass" và chrome; viết lại trang chủ thành landing. Spec giao diện: [`DESIGN.md`](DESIGN.md).
- Font và brand: Ferry VN self-host (template). Logo là dấu "layers" xanh Tech Blue kèm tên "KDIGI CMS" bằng chữ HTML.
- Token hoặc màu riêng: không, dùng nguyên `src/styles/tokens.css`.

## Frontend

- Tính năng bắt buộc: theo `frontend/README.md` (mục Docs site): tiếng Việt trước, tiếng Anh sau, light/dark, copy/xem markdown trên mỗi trang, tìm kiếm không dấu, `llms.txt`.
- Tính năng riêng: tài liệu kỹ thuật (`/en/tham-khao/…`) là bản sao `docs/` của repo CMS, sinh bằng `pnpm sync:docs` rồi commit.

## Kiến trúc

- Dạng hệ thống: site tĩnh, một repo, không backend, lý do: nội dung như nhau cho mọi khách, không có dữ liệu theo người dùng.
- Service và stack: Astro 6 + Starlight, pnpm, Pagefind (tìm kiếm), không có auth/DB/payment/email.

## Hạ tầng

- Deploy: Coolify (server đặt ở VN), build pack Dockerfile (build tĩnh → nginx), tên miền `opencms.kdigi.vn`, TLS do proxy của Coolify cấp. Coolify tự build lại khi có commit mới trên `main`.
- CI/CD, secrets, monitoring: không có secret trong repo. Monitoring bằng Uptime Kuma đặt ngoài repo này.

## Ngoại lệ so với chuẩn chung

| Dòng **Default** trong `khoi-system-design` | Dự án này làm gì | Lý do |
| --- | --- | --- |
| Site public: Cloudflare Workers (static assets) | Coolify (VM ở VN), nginx | Hạ tầng KDIGI CMS đã chạy trên Coolify, không thêm tài khoản; site tĩnh nhỏ nên TTFB từ VN vẫn thấp |
| Làm việc trên `develop`, `main` là release | Một commit khởi tạo trên `main` (và `develop` trỏ cùng commit) | Repo mới công khai, chưa có lịch sử |
| Minh hoạ tạo bằng Codex `image_gen` | SVG viết tay (`src/assets/illustrations/`) | Ảnh gọn nhẹ, hai biến thể sáng/tối, không cần quy trình tách nền cho bản đầu |
| Screenshot hướng dẫn bằng `/ck:agent-browser` | Chưa có screenshot trong bài | Docs mô tả bằng lệnh và cấu hình; thêm khi giao diện quản trị ổn định |
