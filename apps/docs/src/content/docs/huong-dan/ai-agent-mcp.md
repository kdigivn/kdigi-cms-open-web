---
title: AI agent và MCP
description: Kết nối Claude Code, Codex, Cursor, VS Code hay OMP với KDIGI CMS qua máy chủ MCP tích hợp sẵn và CLI kcms để viết, sửa, hẹn giờ, đăng bài và kiểm tra SEO.
---

KDIGI CMS là CMS AI-native: máy chủ [Model Context Protocol](https://modelcontextprotocol.io) có sẵn tại `POST /api/mcp`, nên AI agent (Claude Code, Codex, Cursor, VS Code, OMP…) đọc, viết, hẹn giờ, đăng bài và kiểm tra SEO trực tiếp trên CMS. Agent làm việc **với tư cách người dùng sở hữu API key**: đúng vai trò, đúng các site được gán, như khi người đó đăng nhập trang quản trị.

> Máy chủ MCP và CLI `kcms` có từ KDIGI CMS 1.2.0. Tài khoản demo công khai không tạo được API key, nên hãy thử trên bản [tự host](/huong-dan/cai-dat-docker/).

## Agent làm được gì

| Nhóm | Công cụ |
| --- | --- |
| Định danh, site | `whoami`, `list_sites`, `get_site` |
| Tìm và đọc | `search_content`, `get_content` (thân bài Markdown, SEO, `updatedAt`) |
| Viết | `create_post`, `create_page` (mặc định là bản nháp), `update_post`, `update_page` |
| Xuất bản | `set_status`: đăng, gỡ, hẹn giờ bằng `publishedAt` trong tương lai |
| Hoàn tác | `trash_content`, `restore_from_trash`, `list_versions`, `restore_version` |
| Chuyên mục, thẻ | `list_taxonomies`, `create_taxonomy` |
| Media | `search_media`, `import_media_from_url`, `update_media_alt` |
| SEO | `seo_audit`, `get_seo_report` (cùng bộ chấm điểm với trang quản trị) |
| Khác | `list_shortcodes`, `get_content_urls` |

Kèm theo: tài nguyên `kcms://guide/content` (quy tắc Markdown, shortcode, SEO) và hai prompt `write-post`, `refresh-seo`.

## 1. Tạo API key cho agent

Mỗi agent hoặc mỗi người nên có **một tài khoản riêng** với vai trò thấp nhất đủ dùng: `author` chỉ tạo bản nháp, `editor` được đăng và hẹn giờ. Tránh dùng key của `super-admin`.

1. Super admin vào **Người dùng**, tạo tài khoản (ví dụ `ai-writer@example.com`), chọn vai trò và site.
2. Mở tài khoản đó, bật **Kích hoạt API Key** (giao diện tiếng Anh: **Enable API Key**), sao chép key rồi **Lưu**.
3. Đặt key vào biến môi trường ở máy chạy agent: `export KCMS_API_KEY=change-me`.

Phiên đăng nhập bằng API key bị giới hạn trên mọi route REST, GraphQL và MCP: không đổi được email, mật khẩu, API key, vai trò hay site của tài khoản, không tạo người dùng, không xoá vĩnh viễn (chỉ chuyển vào thùng rác). Key bị lộ thì tắt **Kích hoạt API Key**.

## 2. Kết nối công cụ AI

Cách nhanh nhất là CLI `kcms`: nó ghi đúng tệp cấu hình cho từng công cụ và không chép key vào tệp.

```bash
npm install -g @kdigi/kcms-cli
export KCMS_API_KEY=change-me
kcms setup claude-code --url https://cms.example.com --write --with-skill
```

Thay `claude-code` bằng `codex`, `cursor`, `vscode`, `omp` hoặc `json`. Bỏ `--write` để chỉ in cấu hình ra màn hình. `--with-skill` cài thêm agent skill dạy quy trình biên tập an toàn: đọc trước khi sửa, viết bản nháp trước, chỉ đăng khi được yêu cầu.

Muốn tự cấu hình, ví dụ `.mcp.json` của Claude Code:

```json
{
  "mcpServers": {
    "kdigi": {
      "type": "http",
      "url": "https://cms.example.com/api/mcp",
      "headers": { "Authorization": "Bearer ${KCMS_API_KEY}" }
    }
  }
}
```

Cấu hình cho Codex, Cursor, VS Code, OMP và cầu nối stdio (`kcms mcp`) cho công cụ chỉ hỗ trợ stdio nằm ở [AI integration reference](/en/tham-khao/ai-integration/) (tiếng Anh).

## 3. Agent làm việc an toàn thế nào

- **Bản nháp trước.** Bài tạo mới là bản nháp; bản nháp không có URL công khai, agent gửi lại link trang quản trị để bạn duyệt.
- **Không ghi đè bài người khác vừa sửa.** Mọi lần sửa phải kèm `expectedUpdatedAt` lấy từ lần đọc gần nhất; có người lưu xen giữa thì lệnh báo `conflict` và không thay đổi gì.
- **Tôn trọng khoá biên tập.** Biên tập viên đang mở bài trong trang quản trị thì agent nhận lỗi `locked`, không chiếm khoá.
- **Đúng quyền, đúng site.** Author không đăng được bài; site không được gán thì agent không thấy.
- **Hoàn tác được.** Thùng rác và lịch sử phiên bản dùng như trong trang quản trị.
- **Có nhật ký.** Mỗi lần gọi công cụ ghi một dòng log `agent-op` (công cụ, người dùng, site, tài liệu, kết quả), không ghi nội dung hay key.

## 4. Dùng CLI không cần agent

`kcms` cũng là công cụ dòng lệnh: lấy bài về thành tệp Markdown có frontmatter, sửa bằng trình soạn thảo quen tay rồi gửi lên.

```bash
kcms login --url https://cms.example.com
kcms posts get my-post -o my-post.md
kcms posts update my-post.md
kcms media upload ./cover.webp --alt "Ảnh bìa"
kcms seo audit
```

## Vận hành

- Máy chủ MCP bật sẵn; đặt `MCP_ENABLED=false` để tắt (route trả 404). Xem [cấu hình](/en/tham-khao/configuration/).
- Đặt reverse proxy cho `/api/mcp` thời gian chờ tối thiểu 30 giây và giới hạn tần suất (CMS không tự giới hạn).
- Chỉ dùng HTTPS vì key đi trong header.
- ChatGPT và Claude.ai bản web cần OAuth, hiện chưa hỗ trợ; dùng công cụ desktop/CLI ở trên hoặc cầu nối stdio.

Danh sách công cụ đầy đủ, xử lý lỗi và kiểm tra kết nối: [AI integration reference](/en/tham-khao/ai-integration/). Quyền của từng vai trò: [Vai trò và phân quyền](/huong-dan/vai-tro-phan-quyen/).
