import { listPosts } from "@/lib/cms"
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site"

export const revalidate = 3600

const escapeXml = (text: string): string =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;")

export async function GET(): Promise<Response> {
  const posts = await listPosts(30)
  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${absoluteUrl(`/blog/${post.slug}`)}</link>
      <guid isPermaLink="true">${absoluteUrl(`/blog/${post.slug}`)}</guid>
      ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ""}
      <description>${escapeXml(post.excerpt)}</description>
    </item>`,
    )
    .join("\n")
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(`${SITE_NAME}: blog và nhật ký phát hành`)}</title>
    <link>${absoluteUrl("/blog")}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>vi-VN</language>
${items}
  </channel>
</rss>
`
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=0, s-maxage=3600" } })
}
