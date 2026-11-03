---
title: Soạn thảo Markdown
description: Trình soạn thảo WYSIWYG của KDIGI CMS lưu Markdown thuần, API trả về HTML đã render, hỗ trợ shortcode theo từng site.
---

Nội dung bài viết, trang, danh mục và FAQ được soạn bằng trình soạn thảo dựa trên [Milkdown](https://milkdown.dev). Bạn gõ và định dạng trực quan, còn thứ được lưu là Markdown thuần, dễ sao lưu, so sánh phiên bản và mang đi nơi khác.

## Cách dữ liệu được lưu và trả về

- Trình soạn lưu Markdown vào trường có hậu tố `Md` (ví dụ `contentMd`).
- Khi frontend gọi REST, CMS trả **HTML đã render** ở trường gốc (`content`). Frontend không cần tự parse Markdown.
- Nếu trường `Md` có nội dung thì Markdown luôn là nguồn đúng.

## Ảnh và media

Chèn ảnh từ [thư viện media](/huong-dan/thu-vien-media/) ngay trong trình soạn. Ảnh được lưu trên đĩa hoặc Cloudflare R2 tuỳ cấu hình của site.

## Shortcode

Shortcode là đoạn nội dung dùng lại, quản lý trong collection **Shortcodes** của từng site, ví dụ khối quảng cáo, hộp lưu ý hay thông tin liên hệ. Bạn chèn shortcode vào bài bằng cú pháp `[sc …]`; CMS mở rộng nó khi trả dữ liệu qua REST, chỉ trong phạm vi site hiện tại và tối đa ba cấp lồng nhau.

## Soạn thảo là Markdown, không phải HTML tuỳ ý

Vì lưu Markdown nên bạn nhận cấu trúc sạch: tiêu đề, danh sách, bảng, ảnh, liên kết, khối mã. Nếu cần một thành phần phức tạp hơn, hãy làm nó thành shortcode hoặc block của trang landing thay vì chèn HTML thủ công.

Chi tiết kỹ thuật ở [Markdown content reference](/en/tham-khao/content-markdown/) (tiếng Anh).
