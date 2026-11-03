---
title: "AI agent và MCP: CMS AI-native | KDIGI CMS"
description: "KDIGI CMS có sẵn máy chủ MCP: Claude Code, Codex, Cursor, VS Code viết, hẹn giờ, đăng bài và kiểm tra SEO bằng API key, đúng vai trò và site của người dùng."
h1: "AI agent và MCP: KDIGI CMS là CMS AI-native"
navTitle: "AI agent và MCP"
primaryKeyword: "cms ai-native mcp"
icon: bot
lead: "Giao việc nội dung cho công cụ AI bạn đang dùng; nó làm trên CMS với đúng quyền bạn cấp."
updated: 2026-11-03
schema: TechArticle
order: 0
faq:
  - q: "MCP là gì?"
    a: "Model Context Protocol là chuẩn mở để công cụ AI gọi công cụ bên ngoài. KDIGI CMS là một máy chủ MCP tại `/api/mcp`, nên Claude Code, Codex, Cursor, VS Code, OMP dùng trực tiếp được."
  - q: "AI agent có đăng bài khi tôi chưa duyệt không?"
    a: "Bài mới luôn là bản nháp, trừ khi agent được yêu cầu đăng và tài khoản có quyền. Dùng tài khoản `author` cho agent thì nó không thể đăng; biên tập viên duyệt và đăng."
  - q: "Agent có ghi đè bài biên tập viên đang sửa không?"
    a: "Không. Mỗi lần sửa phải kèm `expectedUpdatedAt`; có người lưu xen giữa thì lệnh báo `conflict`. Bài đang mở trong trang quản trị thì agent nhận lỗi `locked` và dừng."
  - q: "Dùng được với ChatGPT hay Claude.ai bản web không?"
    a: "Chưa. Hai nền tảng này yêu cầu OAuth, máy chủ MCP của KDIGI CMS hiện chỉ nhận API key. Dùng công cụ desktop/CLI hoặc cầu nối stdio `kcms mcp`."
  - q: "Tính năng này có từ phiên bản nào?"
    a: "KDIGI CMS 1.2.0 (2026-11-03). CLI `@kdigi/kcms-cli` cài từ npm. Tài khoản demo công khai không tạo được API key, nên muốn thử MCP hãy [tự host](/tu-host) một bản."
related: [/tinh-nang/phan-quyen-nguoi-dung, /tinh-nang/quy-trinh-bien-tap, /tinh-nang/seo-json-ld, /tinh-nang/headless-api]
docs: https://docs.opencms.kdigi.vn/huong-dan/ai-agent-mcp/
---

KDIGI CMS có sẵn máy chủ MCP tại `/api/mcp`. Công cụ AI như Claude Code, Codex hay Cursor tìm, viết, hẹn giờ, đăng bài và kiểm tra SEO trực tiếp trên CMS, với tư cách người dùng sở hữu API key. Không plugin, không hệ thống đăng nhập thứ hai.

> **Tóm tắt nhanh**
>
> - Máy chủ MCP tích hợp, bật sẵn, 23 công cụ.
> - Xác thực bằng API key; đúng vai trò và site của người dùng.
> - Không ghi đè bài người khác, tôn trọng khoá biên tập.
> - CLI `kcms`: cấu hình công cụ AI bằng một lệnh, sửa bài như tệp Markdown.
> - Có từ KDIGI CMS 1.2.0.

:::stats
- **23** công cụ MCP
- **5** công cụ AI cấu hình bằng một lệnh
- **2** prompt sẵn: viết bài, làm mới SEO
:::

## :bot: Agent làm được gì

:::cards 3
- :search: **Tìm và đọc** Bài, trang của site; thân bài trả về dạng Markdown kèm SEO.
- :pen-line: **Viết bản nháp** Tạo bài, trang từ Markdown; sửa một phần, chỉ gửi trường đổi.
- :calendar-clock: **Đăng và hẹn giờ** Đăng, gỡ, hẹn giờ; author không có quyền này.
- :image: **Media** Tìm ảnh, nhập ảnh từ URL công khai, sửa alt.
- :tags: **Chuyên mục, thẻ** Liệt kê và tạo mới khi cần.
- :file-search: **Kiểm tra SEO** Cùng bộ chấm điểm với [trang quản trị](/tinh-nang/seo-json-ld).
:::

Kèm hướng dẫn nội dung `kcms://guide/content` (quy tắc Markdown, shortcode, mục tiêu SEO) để agent viết đúng chuẩn của site.

## :shield-check: An toàn như một biên tập viên

| Cơ chế | Agent nhận được gì |
| --- | --- |
| API key của một người dùng | Đúng vai trò và site của người đó; site khác coi như không tồn tại |
| `expectedUpdatedAt` khi sửa | Báo `conflict`, không ghi, nếu có người vừa lưu |
| Khoá biên tập của trang quản trị | Báo `locked` kèm tên người đang mở; không chiếm khoá |
| Giới hạn phiên API key | Không đổi email, mật khẩu, vai trò; không xoá vĩnh viễn |
| Nhật ký `agent-op` | Mỗi lần gọi một dòng log, không ghi nội dung hay key |

Chi tiết vai trò: [phân quyền người dùng](/tinh-nang/phan-quyen-nguoi-dung). Thùng rác và lịch sử phiên bản vẫn dùng như trong [quy trình biên tập](/tinh-nang/quy-trinh-bien-tap).

> **Mẹo** Tạo một tài khoản riêng cho mỗi agent với vai trò `author`: agent viết nháp, người biên tập duyệt và đăng.

## :plug: Kết nối trong ba bước

:::steps
- :key-round: **Tạo API key** Tạo người dùng cho agent, bật API key, đặt vào biến `KCMS_API_KEY`.
- :terminal: **Cấu hình công cụ AI** `kcms setup claude-code --write --with-skill`; tệp cấu hình không chứa key.
- :bot: **Giao việc** Ví dụ: "Viết bài nháp về chủ đề X, gắn chuyên mục Y, chấm SEO rồi gửi link duyệt".
:::

```bash
npm install -g @kdigi/kcms-cli
export KCMS_API_KEY=change-me
kcms setup claude-code --url https://cms.example.com --write --with-skill
```

`kcms setup` hỗ trợ `claude-code`, `codex`, `cursor`, `vscode`, `omp` và `json` (cấu hình chung). Công cụ chỉ chạy stdio thì dùng cầu nối `kcms mcp`.

## :terminal: CLI kcms cho người thích dòng lệnh

Không cần agent, `kcms` vẫn là cách nhanh để sửa nội dung: lấy bài về thành tệp Markdown có frontmatter, sửa trong trình soạn thảo quen tay, đẩy lên. Chỉ trường đã đổi được gửi, và lệnh dừng nếu bài đã bị người khác sửa.

```bash
kcms posts get my-post -o my-post.md
kcms posts update my-post.md
kcms seo audit
```

## :info: Giới hạn hiện tại

- Chưa có OAuth: ChatGPT và Claude.ai bản web chưa kết nối trực tiếp được.
- Không có công cụ đổi cấu hình site hay tài khoản qua MCP.
- CMS không tự giới hạn tần suất; đặt giới hạn ở reverse proxy.
- Tài khoản demo công khai không tạo được API key; thử MCP trên bản [tự host](/tu-host).

So với các CMS khác: xem [trang so sánh](/so-sanh). Cài đặt từng công cụ AI và xử lý lỗi: [hướng dẫn AI agent và MCP](https://docs.opencms.kdigi.vn/huong-dan/ai-agent-mcp/).
