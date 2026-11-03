import { describe, expect, it } from "vitest"

import { absoluteMediaUrl, parseFaqGroups, parseImage, parsePost } from "@/lib/cms"

const BASE = "https://cms.example.com"

describe("absoluteMediaUrl", () => {
  it("prefixes relative media paths with the CMS origin", () => {
    expect(absoluteMediaUrl("/api/media/file/a.png", BASE)).toBe(`${BASE}/api/media/file/a.png`)
    expect(absoluteMediaUrl("api/media/file/a.png", BASE)).toBe(`${BASE}/api/media/file/a.png`)
  })
  it("keeps absolute URLs", () => {
    expect(absoluteMediaUrl("https://cdn.example.com/a.png", BASE)).toBe("https://cdn.example.com/a.png")
  })
})

describe("parseImage", () => {
  it("returns null for ids (depth 0), null and objects without a url", () => {
    expect(parseImage(7, BASE)).toBeNull()
    expect(parseImage(null, BASE)).toBeNull()
    expect(parseImage({ alt: "x" }, BASE)).toBeNull()
  })
  it("reads url, alt and size", () => {
    expect(parseImage({ url: "/api/media/file/a.png", alt: "Ảnh", width: 1200, height: 630 }, BASE)).toEqual({
      url: `${BASE}/api/media/file/a.png`,
      alt: "Ảnh",
      width: 1200,
      height: 630,
    })
  })
})

describe("parseFaqGroups", () => {
  it("keeps only items with both question and answer, and drops empty groups", () => {
    const groups = parseFaqGroups([
      { id: 1, group: "Chung", items: [{ question: "A?", answer: "<p>a</p>" }, { question: "B?", answer: "" }, { question: "", answer: "<p>c</p>" }] },
      { id: 2, group: "Rỗng", items: [{ question: "", answer: "" }] },
      { id: 3, group: "Không có items" },
    ])
    expect(groups).toEqual([{ id: "1", group: "Chung", items: [{ question: "A?", answerHtml: "<p>a</p>" }] }])
  })
  it("tolerates non-array input", () => {
    expect(parseFaqGroups(undefined)).toEqual([])
    expect(parseFaqGroups({})).toEqual([])
  })
})

describe("parsePost", () => {
  const doc = {
    id: 4,
    title: "Chuyển từ WordPress",
    slug: "chuyen-tu-wordpress",
    excerpt: "Tóm tắt",
    content: "<h2>Mục</h2>",
    publishedAt: "2026-11-03T06:53:38.869Z",
    updatedAt: "2026-11-03T07:00:00.000Z",
    featuredImage: { url: "/api/media/file/x.png", alt: "x", width: 1200, height: 630 },
    categories: [{ name: "Hướng dẫn" }, 12],
    author: { name: "Đội ngũ KDIGI" },
    wordCount: 400,
    seo: { title: null, description: "Mô tả SEO" },
  }
  it("maps the REST document", () => {
    const post = parsePost(doc, BASE)
    expect(post).toMatchObject({
      id: "4",
      slug: "chuyen-tu-wordpress",
      contentHtml: "<h2>Mục</h2>",
      categories: ["Hướng dẫn"],
      author: "Đội ngũ KDIGI",
      seoTitle: null,
      seoDescription: "Mô tả SEO",
    })
    expect(post?.image?.url).toBe(`${BASE}/api/media/file/x.png`)
  })
  it("rejects documents without slug or title", () => {
    expect(parsePost({ id: 1, title: "x" }, BASE)).toBeNull()
    expect(parsePost({ id: 1, slug: "x" }, BASE)).toBeNull()
    expect(parsePost(null, BASE)).toBeNull()
  })
})
