import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { JsonLdScript } from "@/components/site/json-ld-script"
import { Breadcrumbs, Toc } from "@/components/site/page-parts"
import { formatDate, PostCard } from "@/components/site/post-card"
import { Container } from "@/components/site/section"
import { ButtonLink } from "@/components/ui/button"
import { authorPath, categoryPath, postCover, postPath, relatedPosts } from "@/lib/blog"
import { getPost, listPosts, readingMinutes } from "@/lib/cms"
import { blogPosting, breadcrumbs, graph, organization, website } from "@/lib/json-ld"
import { annotateHtmlHeadings } from "@/lib/markdown"
import { buildMetadata, fitDescription, ogImageFor } from "@/lib/seo"
import { DEMO } from "@/lib/site"

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
  const cover = postCover(post)
  return buildMetadata({
    title: post.seoTitle ?? post.title,
    description: fitDescription(post.seoDescription, post.excerpt, "Bài viết trên blog KDIGI CMS, CMS headless mã nguồn mở quản lý nhiều website."),
    route: postPath(post.slug),
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    image: cover ? { url: cover.url, width: cover.width ?? 1200, height: cover.height ?? 630 } : null,
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = await getPost((await params).slug)
  if (!post) notFound()
  const all = await listPosts()
  const related = relatedPosts(post, all)
  const cover = postCover(post)
  const minutes = readingMinutes(post)
  const { html, headings } = annotateHtmlHeadings(post.contentHtml)
  const category = post.categoryRefs[0]
  const trail = [
    { name: "Trang chủ", path: "/" },
    { name: "Blog", path: "/blog" },
    ...(category ? [{ name: category.name, path: categoryPath(category.slug) }] : []),
    { name: post.title, path: postPath(post.slug) },
  ]
  const schemaImage = cover?.url ?? ogImageFor(postPath(post.slug)).url

  return (
    <main id="main" tabIndex={-1}>
      <Container className="max-w-[1080px] pt-10 pb-16 md:pt-14 md:pb-24">
        <Breadcrumbs trail={trail} />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,820px)_240px]">
          <article className="min-w-0">
            <header>
              {category ? (
                <Link href={categoryPath(category.slug)} className="eyebrow mb-3 inline-block hover:underline">
                  {category.name}
                </Link>
              ) : null}
              <h1 className="t-display !text-[clamp(30px,4.4vw,46px)]">{post.title}</h1>
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-muted-foreground">
                {post.authorRef ? (
                  <Link href={authorPath(post.authorRef.slug)} rel="author" className="font-medium text-foreground hover:underline">
                    {post.authorRef.name}
                  </Link>
                ) : null}
                {post.publishedAt ? (
                  <span>
                    Đăng <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                  </span>
                ) : null}
                {post.updatedAt && post.updatedAt.slice(0, 10) !== post.publishedAt?.slice(0, 10) ? (
                  <span>
                    Cập nhật <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
                  </span>
                ) : null}
                {minutes ? <span>{minutes} phút đọc</span> : null}
              </p>
            </header>
            {cover ? (
              <Image
                src={cover.url}
                alt={cover.alt || post.title}
                width={cover.width ?? 1200}
                height={cover.height ?? 630}
                priority
                unoptimized
                sizes="(min-width: 1080px) 820px, 100vw"
                className="mt-8 h-auto w-full rounded-3xl border border-border"
              />
            ) : null}
            <div className="mt-6 lg:hidden">
              <Toc headings={headings} />
            </div>
            <div className="blog-prose mt-8" dangerouslySetInnerHTML={{ __html: html }} />

            {post.authorRef ? (
              <aside aria-label="Về tác giả" className="mt-12 rounded-2xl border border-border bg-card p-5">
                <p className="text-[14px] text-muted-foreground">Tác giả</p>
                <p className="mt-1 font-display text-lg font-bold">
                  <Link href={authorPath(post.authorRef.slug)} className="hover:underline">
                    {post.authorRef.name}
                  </Link>
                </p>
                {post.authorRef.bio ? <p className="mt-1 text-[15px] text-muted-foreground">{post.authorRef.bio}</p> : null}
              </aside>
            ) : null}

            <aside aria-label="Dùng thử KDIGI CMS" className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-md md:p-8">
              <h2 className="font-display text-xl font-bold">Muốn xem KDIGI CMS hoạt động?</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                Đăng nhập bản demo bằng tài khoản biên tập viên và thử viết một bài ngay trong trình duyệt.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/demo" variant="brand">
                  Xem tài khoản demo
                </ButtonLink>
                <ButtonLink href={DEMO.adminUrl} variant="outline" external>
                  Mở trang quản trị
                </ButtonLink>
              </div>
            </aside>

            {related.length ? (
              <section aria-labelledby="bai-lien-quan" className="mt-14">
                <h2 id="bai-lien-quan" className="font-display text-[clamp(22px,2.4vw,28px)] font-bold">
                  Bài viết liên quan
                </h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {related.slice(0, 2).map((item) => (
                    <PostCard key={item.id} post={item} />
                  ))}
                </div>
              </section>
            ) : null}
            <p className="mt-10 text-[14px] text-muted-foreground">
              Chính sách biên tập: bài viết do đội ngũ KDIGI biên soạn, thông tin sản phẩm đối chiếu với mã nguồn và tài liệu chính thức, thông tin về sản phẩm khác kèm nguồn dẫn. Xem thêm{" "}
              <Link href="/gioi-thieu" className="underline underline-offset-4">
                giới thiệu KDIGI
              </Link>
              .
            </p>
          </article>
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <Toc headings={headings} />
            </div>
          </aside>
        </div>
      </Container>
      <JsonLdScript data={graph(organization(), website(), blogPosting(post, schemaImage, post.wordCount), breadcrumbs(trail))} />
    </main>
  )
}
