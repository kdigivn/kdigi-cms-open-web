---
title: "CMS cho agency: quản lý nhiều website khách hàng"
description: "Agency quản lý nhiều website khách hàng trên một CMS: phân quyền theo site, quy trình duyệt bài, tự host và không phí bản quyền theo website."
h1: "Giải pháp KDIGI CMS cho agency"
navTitle: "Agency"
icon: boxes
lead: "Một bản cài, một database, nhiều website khách. Thêm khách mới là nhập dữ liệu, không phải deploy lại."
primaryKeyword: "CMS cho agency"
updated: 2026-11-03
heroImage: /images/art/giai-phap-agency-hero.webp
heroAlt: "Ba cửa sổ website kính mờ cùng nối về một khối xanh, đại diện cho agency quản lý nhiều site khách hàng"
schema: WebPage
faq:
  - q: "Một bản cài quản lý được bao nhiêu site khách?"
    a: "Tài liệu không đặt giới hạn cứng: mỗi website là một bản ghi trong collection Sites. Giới hạn thực tế phụ thuộc máy chủ và PostgreSQL của bạn, nên hãy tự đo tải trên hạ tầng thật."
  - q: "Nhân viên của khách có thấy dữ liệu khách khác không?"
    a: "Không, nếu bạn gán đúng site. Người dùng không phải super-admin chỉ đọc và ghi trong các site ở trường tenants; ranh giới này do access predicate trong mã thực thi."
  - q: "Freelancer viết cho nhiều khách thì phân quyền thế nào?"
    a: "Vai trò là toàn cục theo người dùng. Gán freelancer vai trò author và thêm các site họ được làm; họ chỉ sửa bài của mình và không xuất bản được."
  - q: "Frontend của khách có tự biết mình thuộc site nào không?"
    a: "Không. Mỗi frontend phải lấy id site theo siteKey rồi thêm where[tenant][equals]=<id> vào mọi truy vấn. Thiếu điều kiện này, truy vấn ẩn danh trả nội dung đã xuất bản của mọi site."
  - q: "Chuyển site WordPress của khách sang KDIGI CMS có mất SEO không?"
    a: "Pipeline di chuyển đọc dữ liệu Yoast hoặc RankMath, giữ ngày xuất bản và tự sinh redirect 301 từ permalink cũ. Giao diện, plugin và nội dung page builder không được chuyển."
related:
  - /tinh-nang/quan-ly-nhieu-website
  - /tinh-nang/phan-quyen-nguoi-dung
  - /chuyen-tu-wordpress
  - /tinh-nang/seo-json-ld
  - /tu-host
docs: https://docs.cms.kdigi.vn/huong-dan/nhieu-website/
---

Mỗi khách là một document trong collection Sites; nội dung, media, menu và cấu hình SEO gắn với site đó. Agency quản trị tất cả ở một nơi, còn frontend của từng khách vẫn tách riêng.

> **Tóm tắt nhanh**
> - Một deployment, một database, nhiều frontend.
> - Bốn vai trò xếp bậc: `super-admin` > `admin` > `editor` > `author`.
> - SEO và media cấu hình riêng từng site.
> - CMS chỉ có admin và API, không có giao diện công khai.

## :layers: Vì sao gom về một CMS

:::cards
- :boxes: **Một nơi quản trị** Thay nhiều bản WordPress rời bằng một trang admin. So sánh ở [KDIGI CMS vs WordPress](/so-sanh/kdigi-cms-vs-wordpress).
- :database: **Dữ liệu tách theo site** `pages`, `posts`, `products`, `media`… đều có trường `tenant` trỏ về Sites.
- :server: **Vận hành gọn** Một image Docker, một PostgreSQL, một nơi sao lưu. Xem [tự host](/tu-host).
:::

![Danh sách site trong trang quản trị KDIGI CMS](/images/shots/sites.webp)

## :rocket: Onboarding một khách mới

:::steps
- :globe: **Tạo site** Sites → Create: nhập `siteKey`, `domain` (không có `https://`) và `defaultLanguage`.
- :users: **Gán người dùng** Thêm một dòng `tenants` cho mỗi site; người chưa được gán không thấy gì.
- :cloud-upload: **Nhập nội dung** Có WordPress thì chạy [pipeline di chuyển](/chuyen-tu-wordpress) vào đúng `siteKey`.
- :search: **Cấu hình SEO** Điền `seoTitles`, `knowledgeGraph` và mã GA4/GTM. Xem [SEO và JSON-LD](/tinh-nang/seo-json-ld).
- :link: **Nối frontend** Lọc truy vấn bằng `where[tenant][equals]=<id>` và nhận `POST /api/cms/revalidate`.
:::

> **Cảnh báo** Thiếu bộ lọc `tenant`, truy vấn ẩn danh trả nội dung đã xuất bản của mọi site. Hãy kiểm tra điều này khi review code.

> **Mẹo** Mỗi khách có thể có một tài khoản riêng cho AI agent, chỉ gán đúng site của khách đó. Agent kết nối qua MCP bằng API key của tài khoản ấy nên không thấy site khác. Xem [AI agent và MCP](/tinh-nang/ai-agent-mcp).

## :shield-check: Phân quyền theo site

| Vai trò | Phạm vi | Dùng cho |
| --- | --- | --- |
| `super-admin` | Mọi site | Agency: tạo site, gán người dùng, sửa `r2` |
| `admin` | Site được gán | Đầu mối phía khách: cài đặt, xuất bản, xóa vĩnh viễn |
| `editor` | Site được gán | Biên tập: xuất bản, duyệt bình luận |
| `author` | Site được gán | Freelancer: chỉ sửa bài của mình, không xuất bản |

Chi tiết ở [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung).

## :settings: Cài đặt riêng từng site

| Hạng mục | Riêng từng site? |
| --- | --- |
| Nội dung, taxonomy, menu, FAQ, redirect, bình luận | có |
| Media (backend lưu trữ chọn theo site) | có |
| `seoTitles`, `knowledgeGraph`, GA4/GTM | có |
| Người dùng, vai trò, ngôn ngữ, biến môi trường | không |

## :clock: Chi phí và vận hành

Nâng cấp bằng `git pull && docker compose up -d --build`; migration chạy khi khởi động. Sao lưu `pg_dump` kèm volume `media_data`; hàng đợi revalidate chỉ chạy khi `ENABLE_JOBS_AUTORUN=true` trên đúng một instance. Chúng tôi không công bố con số chi phí hay benchmark. Xem [sao lưu và nâng cấp](/thuc-hanh-tot/sao-luu-va-nang-cap).

## :scale: Khi nào không phù hợp

:::pros-cons
**Ưu điểm**
- Gom quản trị nhiều khách về một nơi
- Phân quyền theo site, tự host, không phí theo website

**Hạn chế**
- Không có giao diện dựng sẵn: mỗi khách cần một frontend
- Vai trò là toàn cục: một người cần hai vai trò thì phải có hai tài khoản
- Các site dùng chung database và biến môi trường
- Nội dung page builder WordPress không được chuyển
:::

Xem thử trang quản trị tại [demo](/demo), hoặc dựng bản riêng theo [tự host](/tu-host).
