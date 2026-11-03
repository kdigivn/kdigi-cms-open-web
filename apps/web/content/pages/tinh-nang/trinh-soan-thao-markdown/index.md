---
title: "Trình soạn thảo Markdown cho CMS: Milkdown, slash menu"
description: "Soạn bài bằng Markdown với Milkdown: slash menu, dán từ Google Docs/Word, bảng, gallery, shortcode. Nội dung xuất HTML sạch, đúng cấu trúc cho SEO."
h1: "Trình soạn thảo Markdown (Milkdown) trong KDIGI CMS"
navTitle: "Trình soạn thảo Markdown"
primaryKeyword: "trình soạn thảo markdown"
updated: 2026-11-03
heroImage: /images/art/tinh-nang-trinh-soan-thao-markdown-hero.webp
heroAlt: "Tài liệu kính mờ với thanh tiêu đề xanh, bảng và ảnh nhỏ, cạnh một cây bút đất sét, đại diện cho trình soạn thảo Markdown"
schema: WebPage
faq:
  - q: "KDIGI CMS dùng trình soạn thảo nào?"
    a: "KDIGI CMS dùng Milkdown (lõi Crepe) làm trình soạn thảo Markdown. Trường lưu trữ là văn bản Markdown thuần, dạng CommonMark kèm GFM, gắn với giao diện soạn thảo trực quan. Slash menu, chọn media, chọn liên kết nội bộ và thanh công cụ nổi là các thành phần KDIGI viết thay cho phần mặc định của Crepe."
  - q: "Có dán được nội dung từ Google Docs hoặc Word không?"
    a: "Có. Khi clipboard chứa HTML (Google Docs, Word, trang web), trình soạn thảo chuyển sang GFM, tải các ảnh nhúng dạng data lên thư viện media và chèn kết quả thành một bước hoàn tác duy nhất. Văn bản thuần và Markdown được dán nguyên bản, không qua chuyển đổi."
  - q: "API trả về Markdown hay HTML?"
    a: "Qua REST, trường nội dung (ví dụ content) trả về HTML đã làm sạch, còn bản Markdown gốc nằm ở trường kèm hậu tố Md (ví dụ contentMd). GraphQL và Local API không render mà trả giá trị lưu thô. Vì vậy frontend nên đọc qua REST hoặc tự render từ contentMd."
  - q: "Shortcode trong KDIGI CMS dùng để làm gì?"
    a: "Shortcode là đoạn Markdown dùng lại như bảng giá, chính sách hay boilerplate, lưu trong collection shortcodes của từng site. Chèn bằng [sc name=\"ten\" /]; CMS mở rộng khi render HTML qua REST, lồng nhau tối đa 3 cấp. Tên không tồn tại hoặc vòng lặp sẽ cho ra chuỗi rỗng."
  - q: "HTML thô trong Markdown có an toàn không?"
    a: "Có. Markdown được render bằng markdown-it rồi qua sanitize-html với danh sách cho phép; script, style, iframe, thuộc tính style và trình xử lý sự kiện đều bị loại bỏ. Việc làm sạch nằm sẵn trong hàm markdownToHtml, nên mọi đường ra qua REST đều được bảo vệ mà không cần gọi thêm bước nào."
related:
  - /tinh-nang/thu-vien-media
  - /tinh-nang/seo-json-ld
  - /tinh-nang/headless-api
  - /tinh-nang/quy-trinh-bien-tap
  - /chuyen-tu-wordpress
docs: https://docs.opencms.kdigi.vn/huong-dan/soan-thao-markdown/
---

KDIGI CMS soạn nội dung bằng Markdown thông qua Milkdown: bạn viết trong giao diện trực quan, hệ thống lưu CommonMark kèm GFM, và REST trả về HTML đã làm sạch ở đúng khóa gốc. Trình soạn thảo có slash menu, chọn liên kết nội bộ bằng `@`, dán từ Google Docs hoặc Word, shortcode và tìm kiếm thay thế.

> **Tóm tắt nhanh**
>
> - **Nguồn sự thật là Markdown** (trường `contentMd`), không phải HTML hay JSON của trình soạn thảo.
> - **Slash menu `/`**: tiêu đề 1–6, danh sách, to-do, khối mã, trích dẫn, đường kẻ, liên kết, bảng, ảnh và shortcode.
> - **`@` chọn liên kết nội bộ** từ bài viết, trang, sản phẩm và landing **cùng site**.
> - **Dán từ Docs/Word** được chuyển sang GFM; ảnh nhúng tự tải lên thư viện media.
> - **HTML đầu ra được làm sạch** bằng `sanitize-html`; script và iframe không bao giờ lọt ra.

## Markdown là gì?

Markdown là ngôn ngữ đánh dấu nhẹ: bạn viết văn bản thuần với ký hiệu đơn giản (`##` cho tiêu đề, `**đậm**`, `- ` cho danh sách, `[chữ](url)` cho liên kết) rồi công cụ chuyển thành HTML. KDIGI CMS dùng CommonMark kèm phần mở rộng GFM (bảng, danh sách việc cần làm, gạch ngang chữ), nên một bài viết là tệp văn bản đọc được ở mọi nơi.

## Vì sao KDIGI CMS chọn Markdown?

Markdown là định dạng văn bản thuần, dễ so sánh phiên bản, dễ di chuyển và không bị khóa vào một trình soạn thảo. Với CMS headless, đây cũng là lợi thế: frontend nhận HTML sạch ở khóa quen thuộc, còn nếu cần bạn vẫn có thể lấy Markdown gốc để render theo cách riêng. Mô hình lưu trữ nằm trong hàm `markdownHtmlField()` (`src/fields/markdown-html-field.ts`), trả về hai trường cho mỗi nội dung:

| Trường | Kiểu | Vai trò |
| --- | --- | --- |
| `{name}Md` (ví dụ `contentMd`) | `textarea`, hiển thị trong admin | **Nguồn sự thật**, CommonMark + GFM mà biên tập viên viết |
| `{name}` (ví dụ `content`) | `richText` (Lexical), ẩn khỏi admin | Lưu trữ cũ; hook `afterRead` của nó là nơi biến `{name}Md` thành HTML cho REST |

Hiện nay mô hình này áp dụng cho `posts`, `pages`, `products` (`content` và `notice`), `taxonomies`, `shortcodes` và khối `content` của `landings` (`bodyMd`). Câu trả lời FAQ của collection `faqs` là một textarea Markdown đơn, chuyển HTML bằng cùng đường ống.

## Giao diện soạn thảo

Trình soạn thảo là Milkdown (lõi Crepe) và được tải bằng `next/dynamic` với `ssr: false` vì cần API của trình duyệt. Trường chỉ lưu Markdown thuần, thành phần giao diện không bao giờ sinh HTML. Các tính năng sẵn có của Crepe như `BlockEdit`, `ImageBlock`, `Latex` và `Toolbar` bị tắt, được thay bằng thành phần KDIGI: slash menu, block handle, thanh công cụ nổi khi chọn văn bản và hộp thoại chọn media.

Ngoài ra còn có thanh phác thảo (outline) bên cạnh, tìm và thay thế (`Ctrl/Cmd+F`, `Ctrl/Cmd+Shift+H`) và bảng trợ giúp phím tắt (`Ctrl/Cmd+/`) liệt kê mọi phím tắt cùng quy tắc nhập Markdown.

![Trình soạn thảo Markdown trong trang chỉnh sửa bài viết](/images/shots/editor.webp)

### Slash menu

Gõ `/` để mở menu lệnh. Menu chia ba nhóm:

| Nhóm | Lệnh |
| --- | --- |
| Cơ bản | Văn bản, tiêu đề 1–6, danh sách gạch đầu dòng, danh sách đánh số, to-do, khối mã, trích dẫn, đường kẻ |
| Phổ biến | Liên kết, bảng, ảnh (mở hộp thoại media) |
| Snippet | Các shortcode của site; chỉ hiện khi site có ít nhất một. Gõ `/snippet` hoặc `/shortcode` để liệt kê |

Danh sách Snippet được tải một lần mỗi lần mở trình soạn thảo từ `/api/shortcodes` (tối đa 100, sắp theo tiêu đề), chỉ gồm shortcode của đúng site đang sửa. Chọn một shortcode sẽ chèn `[sc name="..."/]`.

![Slash menu mở trong trình soạn thảo](/images/shots/editor-slash.webp)

### Chọn liên kết nội bộ bằng `@`

Gõ `@` ở đầu một từ (không phải trong địa chỉ email) để tìm trong `posts`, `pages`, `products` và `landings` **của cùng site** theo tiêu đề hoặc slug, không phân biệt dấu (debounce 150 ms, 8 kết quả mỗi collection). Nhấn Enter để chèn liên kết Markdown gồm tiêu đề và đường dẫn tương đối của tài liệu; Escape đóng menu và giữ lại chuỗi `@truy-vấn` đã gõ.

- Đường dẫn là đường dẫn tương đối của site, lấy từ hàm `publicPathFor()`: sản phẩm thành `/product/{slug}`, còn bài viết, trang và landing thành `/{slug}`. Nếu frontend của bạn dùng route khác, chỉ cần đổi hàm đó.
- Mặc định chỉ liệt kê tài liệu **đang công khai** (`status = published` và `publishedAt` trống hoặc đã qua). Công tắc bản nháp/đã hẹn giờ cho phép chọn cả phần còn lại, nhưng khi chèn sẽ hỏi xác nhận vì tiêu đề và slug sẽ lộ khi trang lên sóng.
- Tìm kiếm dùng phiên đăng nhập của chính bạn nên quy tắc truy cập collection vẫn được áp dụng.

Liên kết nội bộ là yếu tố SEO quan trọng; xem thêm [SEO và JSON-LD](/tinh-nang/seo-json-ld), nơi bộ chấm điểm kiểm tra tối thiểu một liên kết nội bộ Markdown.

## Dán nội dung và ảnh

- **Ảnh dán hoặc kéo thả** được tải lên `/api/media` và chèn dạng `![alt](url)`. Với Payload 3, các trường `alt` (bắt buộc), `folder` và `tenant` phải nằm trong phần JSON `_payload` của multipart, nếu không request bị trả về 400 — client upload tự viết của bạn cần làm giống vậy.
- **Dán giàu định dạng** (Google Docs, Word, trang web): HTML trong clipboard được chuyển sang GFM bằng `src/lib/html-to-gfm.ts`, ảnh nhúng dạng `data:` được tải lên, và toàn bộ được chèn như **một bước hoàn tác**. Văn bản thuần và Markdown được dán nguyên bản.
- **Lệnh `/image`** mở hộp thoại media với ba tab: Tải lên, Thư viện và URL, giới hạn trong site của tài liệu. Tab URL tải lại ảnh từ xa về kho lưu trữ qua `POST /api/media/from-url` có chống SSRF.

Chi tiết về thư viện xem [thư viện media](/tinh-nang/thu-vien-media).

## Shortcode: nội dung dùng lại theo site

Shortcode là đoạn Markdown (bảng giá, chính sách, đoạn quảng bá) lưu trong collection `shortcodes` và nhúng vào bất kỳ trường Markdown nào:

```md
[sc name="pet-policy" /]
[sc name="pet-policy"][/sc]
```

Quy tắc mở rộng, theo `src/lib/shortcodes/expand-shortcodes.ts`:

| Quy tắc | Hành vi |
| --- | --- |
| Kích hoạt | Chỉ khi Markdown chứa chuỗi `[sc` |
| Phạm vi | Chỉ shortcode của **cùng site** với tài liệu đang đọc |
| Ngôn ngữ | Đọc theo `req.locale` |
| Lồng nhau | Tối đa 3 cấp; sâu hơn cho ra chuỗi rỗng |
| Vòng lặp | Tên đã có trên đường mở rộng hiện tại cho ra chuỗi rỗng |
| Tên không có hoặc rỗng | Cho ra chuỗi rỗng |
| Kết quả | Được bao bằng dòng trống để bảng và danh sách parse đúng |

`name` khớp `[a-z0-9-]+`, được chuẩn hóa khi lưu (chữ thường, bỏ dấu, ký tự khác thành `-`) và là duy nhất trong từng site. Shortcode đọc công khai được, nên đừng lưu dữ liệu riêng tư trong đó. Vì trình soạn thảo ghi `[` thành `\[`, thẻ gõ trong editor được lưu ở dạng escape và vẫn được nhận diện.

## API trả gì cho frontend?

Hook `afterRead` chỉ chạy với REST, và có thứ tự ưu tiên rõ ràng:

| Trạng thái `{name}Md` | Giá trị trả về cho `{name}` |
| --- | --- |
| Chuỗi không rỗng | Mở rộng shortcode (nếu có `[sc`), rồi `markdownToHtml()`, rồi chèn kích thước ảnh: một chuỗi **HTML** |
| `''` (rỗng) | `null` — Markdown là nguồn quyết định và nói "không có nội dung" |
| `null`/`undefined` | Dự phòng cho dữ liệu cũ: chuyển giá trị Lexical sang HTML |

Việc phân biệt `''` với `null` là chủ ý: một tài liệu đã lưu từ khi chuyển sang Markdown vẫn phải xóa được nội dung của nó.

| Kênh đọc | `content` trả về |
| --- | --- |
| REST (`/api/posts?...`) | Chuỗi HTML đã render và làm sạch |
| GraphQL | JSON Lexical thô, không render, không mở rộng shortcode |
| Local API trong hook, script, endpoint | JSON Lexical thô |

Nếu endpoint hay script của bạn cần HTML, hãy đọc `{name}Md` rồi tự gọi `expandShortcodesInMarkdown()` và `markdownToHtml()`. Xem [Headless API](/tinh-nang/headless-api).

### Làm sạch HTML

`markdownToHtml()` render bằng `markdown-it` (với `html: true`, `breaks: false`, `linkify: true`) rồi cho qua `sanitize-html`, đây là ranh giới bảo mật. Thẻ cho phép gồm `h1`–`h6`, `p`, `br`, `hr`, `strong`, `em`, `del`, `s`, `code`, `pre`, `blockquote`, `ul`, `ol`, `li`, `a`, `img`, các thẻ bảng, `div`, `span`, `figure` và `figcaption`. `<script>`, `<style>`, `<iframe>`, thuộc tính `style` và trình xử lý sự kiện không bao giờ ra tới đầu ra.

### Kích thước ảnh, không còn giật bố cục

Ảnh Markdown không có kích thước nên ảnh tải lười dễ co về 0×0 cho đến khi tải xong. Sau khi render, `injectImageDimensions()` thêm `width` và `height` vào mọi `<img>` chưa có, khi `src` khớp `url` hoặc `externalUrl` của một tài liệu media cùng site. Bản đồ URL → kích thước được tải theo site và cache 5 phút; Markdown đã lưu không bị sửa. Nhờ đó trang giảm dịch chuyển bố cục (CLS).

## Gallery WordPress được giữ nguyên

Gallery hai cột của WordPress sau khi di chuyển vẫn được bảo toàn: `contentMd` giữ khối HTML `div.gallery.gallery-columns-2` (`figure.gallery-item`, `figcaption.gallery-caption`), và trình soạn thảo coi nó là một khối chỉ đọc nên sửa đoạn văn xung quanh không làm hỏng gallery. Xem [chuyển từ WordPress](/chuyen-tu-wordpress).

## Bản địa hóa

Cấu hình `localization` có `vi` (mặc định) và `en` với fallback. Với `localized: true`, cả `{name}Md` và `{name}` đều được địa hóa nên HTML theo locale của request (`?locale=en`). Khi chuyển ngôn ngữ, trình soạn thảo được dựng lại sau một khoảng ngắn để các phím gõ cuối được lưu vào ngôn ngữ cũ. Đây là bản địa hóa nội dung, tách biệt với ngôn ngữ giao diện admin.

## Thêm một trường nội dung Markdown mới

Dành cho nhà phát triển mở rộng CMS:

1. Dùng `markdownHtmlField('name', { localized: true })` trong collection thay vì khai báo trường `richText`.
2. Tạo migration bằng `pnpm payload migrate:create`; migration thêm cột `name_md` và `name`.
3. Frontend đọc HTML từ `name` qua REST và Markdown từ `nameMd`.
4. Trong hook và script, đọc `nameMd` rồi tự render, đừng dựa vào `name` ngoài REST.
5. Nếu cần shortcode, bảo đảm tài liệu có giá trị `tenant`, nếu không thẻ sẽ giữ nguyên dạng chữ.

## Quy trình viết một bài đề xuất

1. Gõ `/` để chọn tiêu đề H2, H3 và cấu trúc bài.
2. Dán nội dung nháp từ Google Docs; kiểm tra lại bảng và ảnh sau chuyển đổi.
3. Dùng `@` chèn liên kết nội bộ tới ít nhất vài bài liên quan.
4. Chèn shortcode cho phần lặp lại như bảng giá hay chính sách.
5. Đặt SEO và từ khóa chính ở tab SEO, xem [SEO và JSON-LD](/tinh-nang/seo-json-ld).
6. Lưu nháp, xem lịch sử phiên bản và đăng qua [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap).

Tài liệu kỹ thuật đầy đủ: [Soạn thảo Markdown trên docs.opencms.kdigi.vn](https://docs.opencms.kdigi.vn/huong-dan/soan-thao-markdown/). Quay lại [tổng hợp tính năng](/tinh-nang).
