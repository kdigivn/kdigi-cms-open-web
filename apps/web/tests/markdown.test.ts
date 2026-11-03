import { describe, expect, it } from "vitest"

import { annotateHtmlHeadings, renderMarkdown, slugify } from "@/lib/markdown"
import { paginate, type Post } from "@/lib/cms"

describe("slugify", () => {
  it("strips Vietnamese accents and đ", () => {
    expect(slugify("Cách bật mẫu SEO cho website")).toBe("cach-bat-mau-seo-cho-website")
    expect(slugify("Đa website")).toBe("da-website")
  })
})

describe("renderMarkdown", () => {
  it("adds heading ids, collects h2/h3, wraps tables and classes key-facts quotes", () => {
    const out = renderMarkdown("## Một\n\n### Hai\n\n## Một\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n> **Tóm tắt nhanh**\n> - x\n")
    expect(out.headings.map((h) => h.id)).toEqual(["mot", "hai", "mot-2"])
    expect(out.html).toContain('<div class="table-scroll"')
    expect(out.html).toContain('class="callout callout-keyfacts"')
  })
  it("reports images without alt text or missing files", () => {
    expect(renderMarkdown("![](/images/missing-file.webp)").errors.length).toBe(2)
  })
  it("escapes raw HTML", () => {
    expect(renderMarkdown("<script>x</script>").html).not.toContain("<script>")
  })
})

describe("annotateHtmlHeadings", () => {
  it("adds ids to CMS headings and keeps existing ones", () => {
    const out = annotateHtmlHeadings('<h2>Mục lục</h2><h3 id="keep">Con</h3>')
    expect(out.html).toContain('<h2 id="muc-luc">')
    expect(out.headings.map((h) => h.id)).toEqual(["muc-luc", "keep"])
  })
})

describe("paginate", () => {
  const posts = Array.from({ length: 25 }, (_, i) => ({ id: String(i) }) as Post)
  it("slices and clamps", () => {
    expect(paginate(posts, 1).posts).toHaveLength(12)
    expect(paginate(posts, 3).posts).toHaveLength(1)
    expect(paginate(posts, 99).page).toBe(3)
    expect(paginate([], 1).totalPages).toBe(1)
  })
})
