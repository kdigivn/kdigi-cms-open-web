import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Container } from "@/components/site/section"
import { JsonLdScript } from "@/components/site/json-ld-script"
import { formatDate } from "@/components/site/post-card"
import { ButtonLink } from "@/components/ui/button"
import { getPost, listPosts } from "@/lib/cms"
import { blogPosting, breadcrumbs, graph } from "@/lib/json-ld"
import { absoluteUrl, DEMO } from "@/lib/site"

export const revalidate = 3600
// Slugs not known at build time (a post published later) are rendered on first request and then cached like the others.
export const dynamicParams = true

type PageProps = { params: Promise<{ slug: string }> }

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    return (await listPosts()).map((post) => ({ slug: post.slug }))
  } catch {
    return [] // CMS unreachable while building: pages are generated on demand instead
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost((await params).slug)
  if (!post) return { title: "Không tìm thấy bài viết", robots: { index: false } }
  const description = post.seoDescription ?? (post.excerpt || undefined)
  const title = post.seoTitle ?? post.title
  const url = absoluteUrl(`/blog/${post.slug}`)
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt ?? undefined,
      images: post.image ? [{ url: post.image.url, width: post.image.width ?? undefined, height: post.image.height ?? undefined }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: post.image ? [post.image.url] : undefined },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPost((await params).slug)
  if (!post) notFound()
  const readingMinutes = post.wordCount ? Math.max(1, Math.round(post.wordCount / 200)) : null

  return (
    <main id="main" tabIndex={-1}>
      <Container className="max-w-[820px] pt-10 pb-16 md:pt-14 md:pb-24">
        <Link href="/blog" className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-lg text-[15px] font-medium text-primary-strong hover:underline">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Tất cả bài viết
        </Link>
        <article>
          <header>
            {post.categories[0] ? <p className="eyebrow mb-3">{post.categories[0]}</p> : null}
            <h1 className="t-display !text-[clamp(30px,4.4vw,46px)]">{post.title}</h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-muted-foreground">
              {post.author ? <span>{post.author}</span> : null}
              {post.publishedAt ? <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time> : null}
              {readingMinutes ? <span>{readingMinutes} phút đọc</span> : null}
            </p>
          </header>
          {post.image ? (
            <Image
              src={post.image.url}
              alt={post.image.alt}
              width={post.image.width ?? 1200}
              height={post.image.height ?? 630}
              priority
              unoptimized
              sizes="(min-width: 820px) 820px, 100vw"
              className="mt-8 h-auto w-full rounded-3xl border border-border"
            />
          ) : null}
          <div className="blog-prose mt-8" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </article>

        <aside aria-label="Dùng thử KDIGI CMS" className="mt-14 rounded-3xl border border-border bg-card p-6 shadow-md md:p-8">
          <h2 className="font-display text-xl font-bold">Muốn xem KDIGI CMS hoạt động?</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
            Đăng nhập bản demo bằng tài khoản biên tập viên và thử viết một bài ngay trong trình duyệt.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/#demo" variant="brand">
              Xem tài khoản demo
            </ButtonLink>
            <ButtonLink href={DEMO.adminUrl} variant="outline" external>
              Mở trang quản trị
            </ButtonLink>
          </div>
        </aside>
      </Container>
      <JsonLdScript
        data={graph(
          blogPosting(post),
          breadcrumbs([
            { name: "Trang chủ", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        )}
      />
    </main>
  )
}
