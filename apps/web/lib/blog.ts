import { existsSync } from "node:fs"
import path from "node:path"

import type { CmsImage, Post } from "@/lib/cms"
import { publicImageSize } from "@/lib/markdown"
import { absoluteUrl } from "@/lib/site"

export const postPath = (slug: string): string => `/blog/${slug}`
export const categoryPath = (slug: string, page = 1): string => (page > 1 ? `/blog/chuyen-muc/${slug}/trang/${page}` : `/blog/chuyen-muc/${slug}`)
export const authorPath = (slug: string): string => `/tac-gia/${slug}`
export const blogIndexPath = (page = 1): string => (page > 1 ? `/blog/trang/${page}` : "/blog")

/** Cover of a post: the CMS featured image, else a shipped `public/images/thumbs/<slug>.{webp,jpg,png}`, else null (OG falls back to the generated card). */
export function postCover(post: Post): CmsImage | null {
  if (post.image) return post.image
  for (const ext of ["webp", "jpg", "png"]) {
    const src = `/images/thumbs/${post.slug}.${ext}`
    if (existsSync(path.join(process.cwd(), "public", src))) {
      const size = publicImageSize(src)
      return { url: absoluteUrl(src), alt: post.title, width: size?.width ?? 1920, height: size?.height ?? 1080 }
    }
  }
  return null
}

/** Same first category first, then the newest others; never the post itself. */
export function relatedPosts(post: Post, all: Post[], limit = 3): Post[] {
  const others = all.filter((candidate) => candidate.slug !== post.slug)
  const category = post.categoryRefs[0]?.slug
  const same = category ? others.filter((candidate) => candidate.categoryRefs.some((ref) => ref.slug === category)) : []
  return [...same, ...others.filter((candidate) => !same.includes(candidate))].slice(0, limit)
}
