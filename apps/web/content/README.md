# opencms.kdigi.vn authoring contract (SiteFrame)

Repo: /root/khoi-workspace/kdigi/kdigi-cms-open-web/apps/web. Writers ONLY create/edit files under `apps/web/content/pages/**`. No code edits.

## File → URL
`content/pages/<route as directories>/index.md` → `/<route>`. Examples: `content/pages/index.md` = `/`; `content/pages/tinh-nang/index.md` = `/tinh-nang` (hub); `content/pages/tinh-nang/seo-json-ld/index.md` = `/tinh-nang/seo-json-ld`.
- No file = page does not exist (no nav entry, no sitemap line). Do NOT create stubs.
- Hubs (`/tinh-nang`, `/giai-phap`, `/so-sanh`, `/thuc-hanh-tot`): the layout auto-appends a "Trong mục này" card list of every published child page. A section with children but no `index.md` gets an auto hub (generic copy), so write an `index.md` for each hub.
- Nav (header mega-menu + footer) is generated from published pages: the four sections above (children listed) + Tài nguyên (`/chuyen-tu-wordpress`, `/tu-host`, `/phat-hanh`, `/ma-nguon-mo`) + Blog + Tài liệu; CTA = `/demo` when that page exists.
- `/gioi-thieu`, `/dieu-khoan`, `/quyen-rieng-tu` fall back to the CMS pages when there is no file; a file wins.

## Frontmatter (YAML)
```yaml
---
title: "Tính năng SEO và JSON-LD của KDIGI CMS"      # REQUIRED. Final <title>, ≤ 60 chars, unique. No suffix is appended.
description: "…140-160 ký tự…"                        # REQUIRED. meta description, 140-160 chars, unique.
h1: "SEO và JSON-LD trong KDIGI CMS"                  # optional (default = title). Exactly one H1 per page: NEVER put `# ` in the body.
navTitle: "SEO và JSON-LD"                            # optional short label for menus/breadcrumbs/cards (default = h1)
icon: shield-check                                    # optional page icon (lucide name from lib/icons.ts): hub/related cards, mega menu, H1 badge. Unknown name fails the build
lead: "Một dòng tóm tắt, tối đa 25 từ."                # optional subtitle under the H1 (larger text); > 25 words fails the build
primaryKeyword: "cms seo json-ld"                     # optional but expected; check:seo warns if absent from title/H1
updated: 2026-11-03                                   # REQUIRED YYYY-MM-DD, shown as "Cập nhật lần cuối" + dateModified
published: 2026-10-20                                 # optional
heroImage: /images/shots/site-seo.webp                # optional, a file under apps/web/public (dimensions read from the file)
heroAlt: "Tab Trang & SEO của website trong KDIGI CMS" # REQUIRED when heroImage is set
ogImage: /images/og/tinh-nang-seo-json-ld.jpg         # optional; default = public/images/og/<route-key>.{webp,png}, else generated card /og/<route>
schema: TechArticle                                   # WebPage (default) | TechArticle (guides) | SoftwareApplication (home, features hub) | CollectionPage (hubs) | AboutPage | ContactPage
faq:                                                  # optional; rendered visibly at the end AND emitted as FAQPage JSON-LD
  - q: "KDIGI CMS có hỗ trợ JSON-LD không?"
    a: "Có. Mỗi bài có …. Inline Markdown (link, **đậm**, `code`) được phép."
related: [/tinh-nang/thu-vien-media, /thuc-hanh-tot/seo-on-page]   # optional routes; siblings are auto-added up to 4
docs: https://docs.opencms.kdigi.vn/huong-dan/seo-json-ld/   # optional docs link button (feature pages SHOULD have it)
order: 3                                              # optional sort among siblings (hub listing / nav), lower first
group: "Nội dung"                                     # optional grouping heading inside a hub listing
draft: true                                           # optional: file is ignored entirely (not routed, not in sitemap)
---
```
`route-key` = route with `/`→`-` (`tinh-nang-seo-json-ld`), home = `home`. Unknown/bad values fail the build with the file path.

## Body = GFM Markdown (rendered by markdown-it)
- Start with the **answer-first paragraph** (≤ 60 words) directly under the (auto) H1, then a key-facts blockquote.
- Headings: `##` and `###` only (they get ids and feed the auto TOC, shown when ≥ 3 headings). `####` ok. Never `#`.
- Key facts: `> **Tóm tắt nhanh**` then a bullet list inside the quote → styled box. Callouts: `> **Lưu ý** …`, `> **Mẹo** …`, `> **Cảnh báo** …`.
- Tables: GFM pipe tables (auto horizontal scroll). Ordered how-to steps: `1. 2. 3.` lists. Code: fenced blocks with a language.
- Images: `![mô tả tiếng Việt cụ thể](/images/shots/editor.webp "chú thích tùy chọn")` — alt is REQUIRED (empty alt fails the build), file must exist under `public/` (width/height are auto-filled, lazy-loaded). A title string becomes the visible caption.
  - Real product shots: `/images/shots/<name>.webp`; art: `/images/art/<page-key>-hero.webp`, `-sec1.webp`; OG: `/images/og/<key>.jpg`; thumbs `/images/thumbs/…`.
- Links: internal links as root paths (`/tinh-nang/seo-json-ld`) — they must resolve (check:seo fails on broken ones). Docs links as full `https://docs.opencms.kdigi.vn/...` URLs. ≥ 3 contextual internal links per page.
- Raw HTML is NOT allowed (escaped). No JSX/MDX components.
- Language Vietnamese; every product claim must be verifiable in /root/khoi-workspace/kdigi/kdigi-cms-open.

## Visual blocks and icons (short pages, scannable in 30 s)
Icons are lucide names from the allowlist in `apps/web/lib/icons.ts` (read it for the full list; unknown names fail the build with the file path). Blocks are fenced by `:::name` … `:::` (own line each, no nesting) and hold ONE bullet list. Raw HTML stays escaped.

```markdown
## :database: Mô hình nội dung          <- icon badge before the heading; stripped from the id and the TOC

:::cards            <- or `:::cards 2` / `:::cards 3` to force columns (default: 2 for 2 or 4 items, else 3)
- :layers: **Nhiều website** Một trang quản trị cho mọi site.
- :shield-check: **Phân quyền** 4 vai trò, giới hạn theo website.
- :search: **SEO sẵn có** Tiêu đề, mô tả, JSON-LD cho từng bài.
:::

:::steps            <- numbered timeline; `:icon:` optional, **Title** required
- :cloud-upload: **Xuất dữ liệu** Chạy lệnh export, nhận file JSON.
- **Kiểm tra bản nháp** Xem trước trên staging.
:::

:::stats            <- 2-4 big numbers: **number** then label
- **25+** bài viết mẫu
- **4** vai trò phân quyền
:::

:::check            <- two-column list with check icons
- Sao lưu trước khi nâng cấp
- Chạy migrate trên staging
:::

:::pros-cons        <- first group = green checks, second = muted x
**Ưu điểm**

- Dữ liệu nằm ở máy chủ của bạn

**Hạn chế**

- Tự vận hành
:::
```
- Card/step items are one paragraph: `:icon:` + `**Title**` + ≤ 20 words (inline Markdown and links allowed; no nested lists or images).
- Automatic, no syntax: callouts (`> **Lưu ý**`, `**Mẹo**`, `**Cảnh báo**`) get Info / Lightbulb / TriangleAlert icons; `> **Tóm tắt nhanh**` bullets get check icons; a table cell that is exactly `✓` / `✗` / `có` / `không` becomes a check / x icon (with screen-reader text).
- A mistake (unknown icon, unclosed `:::`, wrong item shape) fails the build with the file path and the line inside the body.

## Complete example: `content/pages/tinh-nang/seo-json-ld/index.md`
```markdown
---
title: "SEO và JSON-LD trong KDIGI CMS: trường, mẫu, audit"
description: "KDIGI CMS có sẵn trường SEO cho mỗi bài, mẫu tiêu đề kiểu RankMath, đồ thị JSON-LD, ảnh OG dự phòng và công cụ audit SEO. Xem từng tính năng và cách bật."
h1: "SEO và JSON-LD trong KDIGI CMS"
navTitle: "SEO và JSON-LD"
primaryKeyword: "cms hỗ trợ seo json-ld"
updated: 2026-11-03
heroImage: /images/shots/site-seo.webp
heroAlt: "Tab Trang & SEO của website trong trang quản trị KDIGI CMS"
schema: TechArticle
faq:
  - q: "KDIGI CMS có tự sinh JSON-LD không?"
    a: "Có. Trang xuất bản ra đồ thị JSON-LD (Organization, WebSite, Article…). Chi tiết xem [tài liệu SEO](https://docs.opencms.kdigi.vn/huong-dan/seo-json-ld/)."
related: [/tinh-nang/headless-api, /thuc-hanh-tot/seo-on-page]
docs: https://docs.opencms.kdigi.vn/huong-dan/seo-json-ld/
---

KDIGI CMS cho phép nhập tiêu đề SEO, mô tả và ảnh OG cho từng bài, rồi tự xuất JSON-LD ra API để website của bạn in vào trang. Bạn không cần plugin SEO riêng.

> **Tóm tắt nhanh**
> - Trường SEO riêng cho bài viết, trang, sản phẩm.
> - Mẫu tiêu đề/mô tả theo từng website.
> - JSON-LD xuất theo đồ thị `@graph`.

## Các trường SEO

| Trường | Dùng để | Giới hạn gợi ý |
|---|---|---|
| Tiêu đề SEO | thẻ `<title>` | ≤ 60 ký tự |
| Mô tả SEO | meta description | 140-160 ký tự |

![Tab SEO của một bài viết với các trường tiêu đề, mô tả và ảnh OG](/images/shots/seo.webp "Tab SEO trong trình soạn bài")

## Cách bật mẫu SEO cho website

1. Mở **Website → Trang & SEO**.
2. Nhập mẫu tiêu đề, ví dụ `%title% | %site%`.
3. Lưu rồi mở một bài để xem kết quả.

> **Lưu ý** Mẫu chỉ áp dụng cho website đang chọn.

## Liên quan
Xem thêm [API headless](/tinh-nang/headless-api) và [thực hành SEO on-page](/thuc-hanh-tot/seo-on-page).
```

## Checks you can run (from apps/web)
`pnpm dev` then open the route; `pnpm check:seo` (after `pnpm build`) validates title/description length, H1, canonical, alt, JSON-LD, broken links, orphans.
