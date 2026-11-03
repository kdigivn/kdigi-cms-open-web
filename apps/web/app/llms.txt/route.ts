import { listPosts } from "@/lib/cms"
import { absoluteUrl, DEMO, docsLinks, GITHUB_URL, SITE_DESCRIPTION } from "@/lib/site"

export const revalidate = 3600

/** /llms.txt (llmstxt.org): what the product is and where the machine-readable docs and posts live. */
export async function GET(): Promise<Response> {
  const posts = await listPosts()
  const postLines = posts.map((post) => `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)})${post.excerpt ? `: ${post.excerpt}` : ""}`)
  const body = `# KDIGI CMS

> ${SITE_DESCRIPTION}

## Sản phẩm

- [Trang chủ](${absoluteUrl("/")}): giới thiệu, tính năng, chuyển từ WordPress, tự host, demo trực tuyến
- [Demo trực tuyến](${DEMO.adminUrl}): tài khoản biên tập viên dùng chung, chỉ truy cập website demo
- [Mã nguồn (MIT)](${GITHUB_URL})

## Tài liệu

- [Tất cả tài liệu](${docsLinks.home}): hướng dẫn tiếng Việt và tài liệu kỹ thuật tiếng Anh
- [llms.txt của tài liệu](${docsLinks.home}/llms.txt): mục lục từng trang ở dạng Markdown
- [Bắt đầu nhanh](${docsLinks.quickstart})
- [Chuyển từ WordPress](${docsLinks.wordpress})
- [REST và GraphQL](${docsLinks.api})

## Bài viết

${postLines.join("\n")}
`
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" } })
}
