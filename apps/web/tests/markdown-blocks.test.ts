import path from "node:path"

import { describe, expect, it } from "vitest"

import { CONTENT_DIR, parseContentSource } from "@/lib/content"
import { ICON_NAMES, iconSvg } from "@/lib/icons"
import { renderMarkdown } from "@/lib/markdown"

const FILE = path.join(CONTENT_DIR, "thu-nghiem", "index.md")
const FRONT = "---\ntitle: T\ndescription: D\nupdated: 2026-11-03\n---\n"
const page = (body: string, front = FRONT) => parseContentSource(FILE, `${front}${body}`)

describe("icon registry", () => {
  it("has the contract names and renders every one as a decorative svg", () => {
    for (const name of ["database", "shield-check", "github", "triangle-alert", "file-text", "life-buoy"]) expect(ICON_NAMES).toContain(name)
    for (const name of ICON_NAMES) {
      const svg = iconSvg(name)
      expect(svg, name).toMatch(/^<svg [^>]*aria-hidden="true"[^>]*>(<[a-z]+ [^>]*\/>)+<\/svg>$/)
    }
  })
})

describe("unknown icons fail the build with the file path", () => {
  it("in a heading", () => {
    expect(() => page("## :no-such-icon: Tiêu đề\n")).toThrow(/thu-nghiem\/index\.md.*unknown icon "no-such-icon"/)
  })
  it("in a card", () => {
    expect(() => page(":::cards\n- :nope: **A** b\n:::\n")).toThrow(/thu-nghiem\/index\.md.*unknown icon "nope"/)
  })
  it("in frontmatter", () => {
    expect(() => page("x\n", FRONT.replace("---\ntitle", "---\nicon: nope\ntitle"))).toThrow(/thu-nghiem\/index\.md.*frontmatter "icon".*unknown icon "nope"/)
  })
  it("accepts a known frontmatter icon and a short lead, rejects a long lead", () => {
    expect(page("x\n", FRONT.replace("---\ntitle", "---\nicon: shield-check\nlead: Một dòng ngắn\ntitle"))).toMatchObject({ icon: "shield-check", lead: "Một dòng ngắn" })
    const long = Array.from({ length: 26 }, () => "từ").join(" ")
    expect(() => page("x\n", FRONT.replace("---\ntitle", `---\nlead: ${long}\ntitle`))).toThrow(/lead.*26 words/)
  })
})

describe("heading icons", () => {
  it("are stripped from the id and the TOC label but rendered as a badge", () => {
    const out = renderMarkdown("## :database: Mô hình nội dung\n\nx\n\n### :layers: Lớp con\n")
    expect(out.errors).toEqual([])
    expect(out.headings).toEqual([
      { id: "mo-hinh-noi-dung", text: "Mô hình nội dung", level: 2 },
      { id: "lop-con", text: "Lớp con", level: 3 },
    ])
    expect(out.html).toContain('<h2 id="mo-hinh-noi-dung"><span class="md-h-icon" aria-hidden="true"><svg')
    expect(out.html).not.toContain(":database:")
  })
  it("leaves ordinary colons alone", () => {
    const out = renderMarkdown("## Tỉ lệ 3:1 : tốt\n")
    expect(out.errors).toEqual([])
    expect(out.html).not.toContain("md-h-icon")
  })
})

describe("blocks", () => {
  it("cards: grid columns, icon tile, bold title, escaped raw HTML", () => {
    const out = renderMarkdown(
      ":::cards\n- :layers: **Nhiều website** Một trang quản trị. <script>alert(1)</script>\n- :search: **SEO** [liên kết](/tinh-nang) <img src=x onerror=alert(1)>\n- :zap: **Nhanh** Có `code`.\n:::\n",
    )
    expect(out.errors).toEqual([])
    expect(out.html).toContain('<ul class="md-cards md-cols-3" role="list">')
    expect(out.html).toContain('<strong class="md-title">Nhiều website</strong>')
    expect(out.html).toContain('<span class="md-icon"><svg')
    expect(out.html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;")
    expect(out.html).toContain("&lt;img src=x onerror=alert(1)&gt;")
    expect(out.html).not.toContain("<script")
    expect(out.html).not.toMatch(/<img src=x/)
    expect(out.html).toContain('<a href="/tinh-nang">liên kết</a>')
  })
  it("cards: modifier forces columns, 4 items default to 2", () => {
    const item = (n: number) => `- :zap: **T${n}** d\n`
    expect(renderMarkdown(`:::cards 3\n${item(1)}${item(2)}${item(3)}${item(4)}:::\n`).html).toContain("md-cols-3")
    expect(renderMarkdown(`:::cards\n${item(1)}${item(2)}${item(3)}${item(4)}:::\n`).html).toContain("md-cols-2")
    expect(renderMarkdown(`:::cards 5\n${item(1)}:::\n`).errors.join()).toContain("column count must be 2 or 3")
  })
  it("cards: a card needs an icon and a bold title", () => {
    expect(renderMarkdown(":::cards\n- **A** b\n:::\n").errors.join()).toContain("must start with :icon: then **Title**")
  })
  it("steps: ordered list, optional icon, title required", () => {
    const out = renderMarkdown(":::steps\n- :cloud-upload: **Xuất** Chạy lệnh.\n- **Kiểm tra** Xem trước.\n:::\n")
    expect(out.errors).toEqual([])
    expect(out.html).toContain('<ol class="md-steps">')
    expect(out.html).toContain('class="md-svg md-title-icon"')
    expect(out.html).toContain("</ol>")
    expect(renderMarkdown(":::steps\n- chỉ chữ\n:::\n").errors.join()).toContain("must start with **Title**")
  })
  it("stats: number + label", () => {
    const out = renderMarkdown(":::stats\n- **25+** bài viết mẫu\n- **4** vai trò\n:::\n")
    expect(out.errors).toEqual([])
    expect(out.html).toContain('<strong class="md-stat-num">25+</strong> <span class="md-stat-label">bài viết mẫu</span>')
  })
  it("check: check icons, list semantics", () => {
    const out = renderMarkdown(":::check\n- Sao lưu\n- Chạy migrate\n:::\n")
    expect(out.errors).toEqual([])
    expect(out.html).toContain('<ul class="md-check" role="list">')
    expect(out.html.match(/md-check-icon md-yes/g)).toHaveLength(2)
  })
  it("pros-cons: two groups with check / x icons", () => {
    const out = renderMarkdown(":::pros-cons\n**Ưu điểm**\n\n- Nhanh\n- Rẻ\n\n**Hạn chế**\n\n- Ít plugin\n:::\n")
    expect(out.errors).toEqual([])
    expect(out.html).toContain("md-pc-pros")
    expect(out.html).toContain("md-pc-cons")
    expect(out.html.match(/md-check-icon md-yes/g)).toHaveLength(3)
    expect(out.html.match(/md-check-icon md-no/g)).toHaveLength(2)
    expect(renderMarkdown(":::pros-cons\n**Ưu điểm**\n\n- a\n:::\n").errors.join()).toContain("exactly two groups")
  })
  it("rejects unknown blocks, nesting and stray closers", () => {
    expect(renderMarkdown(":::banner\n- a\n:::\n").errors.join()).toContain('unknown block ":::banner"')
    expect(renderMarkdown(":::cards\n:::steps\n- a\n:::\n").errors.join()).toContain("nesting is not supported")
    expect(renderMarkdown("x\n\n:::\n").errors.join()).toContain("stray")
  })
})

describe("unclosed blocks", () => {
  it("fail with the file path and the opening line", () => {
    const run = () => page("Intro\n\n:::cards\n- :zap: **A** b\n")
    expect(run).toThrow(/content\/pages: .*thu-nghiem\/index\.md: .*unclosed ":::cards" block opened at line 3/)
  })
})

describe("automatic upgrades", () => {
  it("adds icons to callouts and check icons to the key-facts list", () => {
    const out = renderMarkdown("> **Tóm tắt nhanh**\n> - một\n> - hai\n\n> **Lưu ý** x\n\n> **Mẹo** y\n\n> **Cảnh báo** z\n")
    expect(out.html.match(/md-callout-icon/g)).toHaveLength(4)
    expect(out.html).toContain('class="callout callout-keyfacts"')
    expect(out.html).toContain('<ul class="md-keyfacts-list" role="list">')
    expect(out.html.match(/md-li-icon/g)).toHaveLength(2)
  })
  it("renders yes/no table cells as icons with screen-reader text", () => {
    const out = renderMarkdown("| a | b | c |\n|---|---|---|\n| ✓ | ✗ | Có |\n| không | x | ✓ nhưng |\n")
    expect(out.html.match(/class="md-yn md-yes"/g)).toHaveLength(2)
    expect(out.html.match(/class="md-yn md-no"/g)).toHaveLength(2)
    expect(out.html).toContain('<span class="md-sr">Có</span>')
    expect(out.html).toContain('<span class="md-sr">Không</span>')
    expect(out.html).toContain("<td>x</td>")
    expect(out.html).toContain("<td>✓ nhưng</td>")
  })
})
