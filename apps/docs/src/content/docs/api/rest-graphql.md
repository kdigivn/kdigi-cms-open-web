---
title: REST và GraphQL
description: Dùng KDIGI CMS làm headless CMS. Đọc nội dung theo từng website qua REST hoặc GraphQL, kèm quy ước về site, Markdown, SEO và bình luận.
---

KDIGI CMS là headless: trang quản trị ở `/admin`, còn website công khai là frontend bạn tự chọn (Next.js, Astro, Nuxt, PHP…). Frontend lấy nội dung qua REST hoặc GraphQL do [Payload](https://payloadcms.com) cung cấp sẵn.

## REST

Mỗi collection có một endpoint `/api/<collection>`:

```bash
# 5 bài viết mới nhất của một site
curl "https://cms.example.com/api/posts?where[tenant][equals]=<site-id>&sort=-publishedAt&limit=5"

# một bài theo slug
curl "https://cms.example.com/api/posts?where[tenant][equals]=<site-id>&where[slug][equals]=chao-the-gioi"
```

Các collection nội dung chính: `posts`, `pages`, `products`, `landings`, `taxonomies`, `menus`, `faqs`, `authors`, `redirects`, `media`, `sites`. Tham số truy vấn của Payload (`where`, `sort`, `limit`, `page`, `depth`, `locale`) dùng bình thường.

## GraphQL

Endpoint `/api/graphql`. Trình playground bị tắt ở production và độ phức tạp truy vấn bị giới hạn. Lưu ý: việc render Markdown sang HTML chỉ áp dụng cho REST, nên consumer GraphQL cần tự xử lý trường `*Md`.

## Quy ước cần nhớ

- **Luôn lọc theo site.** Đọc công khai không tự lọc site, bạn phải thêm `where[tenant][equals]=<site-id>`. Xem [Nhiều website](/huong-dan/nhieu-website/).
- **Chỉ nội dung đã xuất bản** mới trả về cho khách ẩn danh: trạng thái `published` và đã đến giờ đăng.
- **Markdown đã render.** REST trả HTML ở trường gốc (`content`), nguồn Markdown nằm ở trường `contentMd`. Shortcode đã được mở rộng. Xem [Soạn thảo Markdown](/huong-dan/soan-thao-markdown/).
- **SEO**: `seo.title` và `seo.description` rỗng nghĩa là dùng mẫu của site; frontend thay biến khi dựng thẻ. `seo.jsonLd` là đồ thị JSON-LD dựng sẵn. Xem [SEO và JSON-LD](/huong-dan/seo-json-ld/).
- **Ngôn ngữ**: nội dung mặc định `vi`, có `en`; truyền `locale` để chọn, bản thiếu sẽ fallback.
- **Menu** trả về dạng cây trong `items`.
- **Site config**: collection `sites` đọc công khai nhưng khoá bí mật (R2…) không bao giờ lộ ra.

## Xác thực

Đọc nội dung đã xuất bản không cần đăng nhập. Để đọc bản nháp hoặc ghi dữ liệu, dùng tài khoản và API key của người dùng:

```bash
curl -H "Authorization: users API-Key <api-key>" "https://cms.example.com/api/posts?where[status][equals]=draft"
```

Tạo API key trong hồ sơ người dùng ở trang quản trị. Quyền của key giống quyền của vai trò người đó. Xem [Vai trò và phân quyền](/huong-dan/vai-tro-phan-quyen/).

## Bình luận và làm mới cache

- Gửi bình luận qua endpoint riêng `POST /api/comments/create` (cần `postId` hoặc `productId` và khoá site), mặc định ở trạng thái chờ duyệt. Đặt `RECAPTCHA_SECRET` để bật xác minh reCAPTCHA.
- Mỗi lần lưu nội dung, CMS xếp job gọi `POST https://<tên miền site>/api/cms/revalidate` để frontend làm mới cache. Cần `ENABLE_JOBS_AUTORUN=true` trên một instance.

Quy ước đầy đủ ở [REST API reference](/en/tham-khao/rest-api/) (tiếng Anh).
