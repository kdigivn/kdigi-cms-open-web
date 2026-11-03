import Link from "next/link"

import type { Category, PostPage } from "@/lib/cms"
import { blogIndexPath, categoryPath } from "@/lib/blog"
import { cn } from "@/lib/utils"

import { PostCard } from "./post-card"

/** Category chips: "Tất cả" + one per category that has posts. */
export function CategoryNav({ categories, activeSlug }: { categories: Pick<Category, "name" | "slug">[]; activeSlug?: string }) {
  if (categories.length === 0) return null
  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-10 items-center rounded-full border px-4 text-[14px] font-medium",
      active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-accent",
    )
  return (
    <nav aria-label="Chuyên mục" className="mb-8 flex flex-wrap gap-2">
      <Link href="/blog" className={chip(!activeSlug)} aria-current={!activeSlug ? "page" : undefined}>
        Tất cả
      </Link>
      {categories.map((category) => (
        <Link key={category.slug} href={categoryPath(category.slug)} className={chip(activeSlug === category.slug)} aria-current={activeSlug === category.slug ? "page" : undefined}>
          {category.name}
        </Link>
      ))}
    </nav>
  )
}

export function Pagination({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (page: number) => string }) {
  if (totalPages <= 1) return null
  const numbers = Array.from({ length: totalPages }, (_, index) => index + 1)
  const item = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border px-3 text-[15px] font-medium"
  return (
    <nav aria-label="Phân trang" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={cn(item, "border-border bg-card hover:bg-accent")}>
          Trang trước
        </Link>
      ) : null}
      {numbers.map((n) => (
        <Link
          key={n}
          href={hrefFor(n)}
          aria-current={n === page ? "page" : undefined}
          aria-label={`Trang ${n}`}
          className={cn(item, n === page ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-accent")}
        >
          {n}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} rel="next" className={cn(item, "border-border bg-card hover:bg-accent")}>
          Trang sau
        </Link>
      ) : null}
    </nav>
  )
}

export function PostGrid({ result, hrefFor = blogIndexPath }: { result: PostPage; hrefFor?: (page: number) => string }) {
  if (result.posts.length === 0) return <p className="text-center text-muted-foreground">Chưa có bài viết nào.</p>
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {result.posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <Pagination page={result.page} totalPages={result.totalPages} hrefFor={hrefFor} />
    </>
  )
}
