import { postPath } from "@/lib/blog"
import { listPosts } from "@/lib/cms"
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site"

export const revalidate = 3600

const escapeXml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")

export async function GET(): Promise<Response> {
  const posts = await listPosts(50)
  const last = posts.map((post) => post.updatedAt ?? post.publishedAt).filter(Boolean).sort().at(-1)
  const items = posts
    .map((post) => {
      const link = absoluteUrl(postPath(post.slug))
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ""}
      ${post.authorRef ? `<dc:creator>${escapeXml(post.authorRef.name)}</dc:creator>` : ""}
      ${post.categories.map((category) => `<category>${escapeXml(category)}</category>`).join("")}
      <description>${escapeXml(post.seoDescription ?? post.excerpt)}</description>
      <content:encoded><![CDATA[${post.contentHtml.replace(/]]>/g, "]]&gt;")}]]></content:encoded>
    </item>`
    })
    .join("\n")
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(`${SITE_NAME}: blog và nhật ký phát hành`)}</title>
    <link>${absoluteUrl("/blog")}</link>
    <atom:link href="${absoluteUrl("/rss.xml")}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>vi-VN</language>
    ${last ? `<lastBuildDate>${new Date(last).toUTCString()}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>
`
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" } })
}
