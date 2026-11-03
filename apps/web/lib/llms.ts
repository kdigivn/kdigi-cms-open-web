import { postPath } from "@/lib/blog"
import { listPosts, type Post } from "@/lib/cms"
import { type ContentPage, getContentPages } from "@/lib/content"
import { SECTIONS } from "@/lib/ia"
import { htmlToText } from "@/lib/markdown"
import { absoluteUrl, DEMO, docsLinks, GITHUB_URL, SITE_DESCRIPTION } from "@/lib/site"

const link = (title: string, url: string, note?: string): string => `- [${title}](${url})${note ? `: ${note}` : ""}`

const pageLine = (page: ContentPage): string => link(page.navTitle, absoluteUrl(page.route), page.description)
const postLine = (post: Post): string => link(post.title, absoluteUrl(postPath(post.slug)), post.seoDescription ?? (post.excerpt || undefined))

/** /llms.txt (llmstxt.org): curated index of the site, generated from the published pages and CMS posts. */
export async function buildLlmsTxt(): Promise<string> {
  const pages = getContentPages().filter((page) => page.route !== "/")
  const used = new Set<string>()
  const blocks: string[] = []
  for (const section of SECTIONS) {
    const inSection = pages.filter((page) => page.route === section.route || page.route.startsWith(`${section.route}/`))
    if (inSection.length === 0) continue
    inSection.forEach((page) => used.add(page.route))
    blocks.push(`## ${section.label}\n\n${inSection.map(pageLine).join("\n")}`)
  }
  const rest = pages.filter((page) => !used.has(page.route))
  if (rest.length) blocks.push(`## Trang khác\n\n${rest.map(pageLine).join("\n")}`)
  const posts = await listPosts()
  if (posts.length) blocks.push(`## Bài viết\n\n${posts.map(postLine).join("\n")}`)
  blocks.push(
    `## Tài liệu và mã nguồn\n\n${[
      link("Tất cả tài liệu", docsLinks.home, "hướng dẫn tiếng Việt và tài liệu kỹ thuật"),
      link("llms.txt của tài liệu", `${docsLinks.home}/llms.txt`),
      link("Bắt đầu nhanh", docsLinks.quickstart),
      link("REST và GraphQL", docsLinks.api),
      link("Mã nguồn (MIT)", GITHUB_URL),
      link("Demo trực tuyến", DEMO.adminUrl, "tài khoản biên tập viên dùng chung, chỉ truy cập website demo"),
    ].join("\n")}`,
  )
  const home = getContentPages().find((page) => page.route === "/")
  return `# KDIGI CMS\n\n> ${home?.description ?? SITE_DESCRIPTION}\n\n${blocks.join("\n\n")}\n`
}

/** /llms-full.txt: the Markdown of every published page and the plain text of every CMS post, in one file. */
export async function buildLlmsFullTxt(): Promise<string> {
  const pages = getContentPages()
  const posts = await listPosts()
  const parts = [`# KDIGI CMS: nội dung đầy đủ\n\n> ${SITE_DESCRIPTION}`]
  for (const page of pages) {
    const faq = page.faq.length ? `\n\n## Câu hỏi thường gặp\n\n${page.faq.map((entry) => `### ${entry.q}\n\n${entry.aText}`).join("\n\n")}` : ""
    parts.push(`# ${page.h1}\n\nURL: ${absoluteUrl(page.route)}\nCập nhật: ${page.updated}\n\n${page.source}${faq}`)
  }
  for (const post of posts) {
    parts.push(
      `# ${post.title}\n\nURL: ${absoluteUrl(postPath(post.slug))}\nĐăng: ${post.publishedAt?.slice(0, 10) ?? ""}${post.authorRef ? `\nTác giả: ${post.authorRef.name}` : ""}\n\n${htmlToText(post.contentHtml)}`,
    )
  }
  return `${parts.join("\n\n---\n\n")}\n`
}

export const TEXT_HEADERS = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" } as const
