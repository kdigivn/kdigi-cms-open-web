import type { MetadataRoute } from "next"

import { authorPath, categoryPath, postPath } from "@/lib/blog"
import { getPage, listAuthors, listPosts } from "@/lib/cms"
import { getContentPage, getContentPages } from "@/lib/content"
import { allContentRoutes, CMS_FALLBACK_SLUGS } from "@/lib/ia"
import { absoluteUrl } from "@/lib/site"

export const revalidate = 3600

type Entry = MetadataRoute.Sitemap[number]

/** Every indexable URL with a real lastmod: repo pages (frontmatter `updated`), CMS posts, categories with posts, authors, CMS legal pages. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, authors] = await Promise.all([listPosts(), listAuthors()])
  const newest = posts.map((post) => post.updatedAt ?? post.publishedAt ?? "").sort().at(-1) || undefined

  const entries: Entry[] = []
  const known = new Set(allContentRoutes())
  for (const route of known) {
    const page = getContentPage(route)
    const lastModified = page?.updated ?? getContentPages().filter((p) => p.route.startsWith(`${route}/`)).map((p) => p.updated).sort().at(-1)
    entries.push({ url: absoluteUrl(route), lastModified, changeFrequency: route === "/" ? "weekly" : "monthly", priority: route === "/" ? 1 : 0.8 })
  }

  for (const slug of CMS_FALLBACK_SLUGS) {
    if (known.has(`/${slug}`)) continue
    const cms = await getPage(slug)
    if (cms) entries.push({ url: absoluteUrl(`/${slug}`), lastModified: cms.updatedAt ?? undefined, changeFrequency: "yearly", priority: 0.3 })
  }

  entries.push({ url: absoluteUrl("/blog"), lastModified: newest, changeFrequency: "weekly", priority: 0.7 })
  const seenCategories = new Map<string, string | undefined>()
  for (const post of posts) {
    for (const ref of post.categoryRefs) {
      const current = seenCategories.get(ref.slug)
      const candidate = post.updatedAt ?? post.publishedAt ?? undefined
      if (!seenCategories.has(ref.slug) || (candidate && (!current || candidate > current))) seenCategories.set(ref.slug, candidate)
    }
  }
  for (const [slug, lastModified] of seenCategories) {
    entries.push({ url: absoluteUrl(categoryPath(slug)), lastModified, changeFrequency: "weekly", priority: 0.5 })
  }
  for (const post of posts) {
    entries.push({
      url: absoluteUrl(postPath(post.slug)),
      lastModified: post.updatedAt ?? post.publishedAt ?? undefined,
      changeFrequency: "monthly",
      priority: 0.6,
    })
  }
  for (const author of authors) {
    if (!posts.some((post) => post.authorRef?.slug === author.slug)) continue
    entries.push({ url: absoluteUrl(authorPath(author.slug)), lastModified: author.updatedAt ?? undefined, changeFrequency: "monthly", priority: 0.4 })
  }
  return entries
}
