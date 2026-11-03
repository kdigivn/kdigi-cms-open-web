import Image from "next/image"
import Link from "next/link"

import { postCover } from "@/lib/blog"
import type { Post } from "@/lib/cms"

/** Vietnamese date, fixed time zone so the server render and the browser agree. */
export function formatDate(iso: string | null): string {
  if (!iso) return ""
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" }).format(new Date(iso))
}

/** Post card used on the homepage and /blog. The cover reserves its 16:9 box, so the grid never shifts. */
export function PostCard({ post }: { post: Post }) {
  const cover = postCover(post)
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/blog/${post.slug}`} className="flex flex-1 flex-col rounded-2xl">
        <div className="relative aspect-video overflow-hidden bg-secondary">
          {cover ? (
            <Image
              src={cover.url}
              alt={cover.alt || post.title}
              fill
              unoptimized
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div aria-hidden="true" className="size-full bg-gradient-to-br from-accent to-secondary" />
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
            {post.categories[0] ? <span className="font-semibold text-cyan-text">{post.categories[0]}</span> : null}
            {post.publishedAt ? <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> : null}
          </div>
          <h3 className="text-lg leading-snug font-semibold text-foreground group-hover:text-primary-strong">{post.title}</h3>
          {post.excerpt ? <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">{post.excerpt}</p> : null}
        </div>
      </Link>
    </article>
  )
}
