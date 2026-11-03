import type { MetadataRoute } from "next"

import { listPosts } from "@/lib/cms"
import { absoluteUrl } from "@/lib/site"

export const revalidate = 3600

const CMS_PAGES = ["gioi-thieu", "dieu-khoan", "quyen-rieng-tu"]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listPosts()
  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.7 },
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt ?? post.publishedAt ?? undefined,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...CMS_PAGES.map((slug) => ({ url: absoluteUrl(`/${slug}`), changeFrequency: "yearly" as const, priority: 0.3 })),
  ]
}
