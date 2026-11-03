import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { usedCategories } from "@/components/site/blog-index"
import { CategoryNav, PostGrid } from "@/components/site/blog-listing"
import { JsonLdScript } from "@/components/site/json-ld-script"
import { Breadcrumbs, UpdatedLine } from "@/components/site/page-parts"
import { Container } from "@/components/site/section"
import { categoryPath } from "@/lib/blog"
import { type Category, listPosts, paginate, type PostPage } from "@/lib/cms"
import { breadcrumbs, graph, organization, pageNode, website } from "@/lib/json-ld"
import { buildMetadata, fitDescription } from "@/lib/seo"

export const revalidate = 3600
export const dynamicParams = true

type PageProps = { params: Promise<{ slug: string; rest?: string[] }> }

type Resolved = { category: Category; result: PostPage; others: Category[] }

/** `/blog/chuyen-muc/<slug>` or `/blog/chuyen-muc/<slug>/trang/<n>` (n >= 2). Anything else, or a category without posts, is a 404. */
async function resolve({ params }: PageProps): Promise<Resolved> {
  const { slug, rest = [] } = await params
  let page = 1
  if (rest.length) {
    const n = Number(rest[1])
    if (rest.length !== 2 || rest[0] !== "trang" || !Number.isInteger(n) || n < 2) notFound()
    page = n
  }
  const categories = await usedCategories()
  const category = categories.find((candidate) => candidate.slug === slug)
  if (!category) notFound()
  const posts = (await listPosts()).filter((post) => post.categoryRefs.some((ref) => ref.slug === slug))
  const result = paginate(posts, page)
  if (page > result.totalPages) notFound()
  return { category, result, others: categories }
}

export async function generateStaticParams(): Promise<{ slug: string; rest: string[] }[]> {
  try {
    const categories = await usedCategories()
    const posts = await listPosts()
    return categories.flatMap((category) => {
      const count = posts.filter((post) => post.categoryRefs.some((ref) => ref.slug === category.slug)).length
      const pages = Math.max(1, Math.ceil(count / 12))
      return [
        { slug: category.slug, rest: [] },
        ...Array.from({ length: pages - 1 }, (_, index) => ({ slug: category.slug, rest: ["trang", String(index + 2)] })),
      ]
    })
  } catch {
    return []
  }
}

const descriptionOf = (category: Category): string =>
  fitDescription(
    category.seoDescription,
    category.description,
    `Các bài viết về ${category.name} trên blog KDIGI CMS: hướng dẫn thực hành, so sánh CMS headless, mẹo SEO và nhật ký phát hành mới nhất của dự án mã nguồn mở.`,
  )

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { category, result } = await resolve(props)
  const description = descriptionOf(category)
  return buildMetadata({
    title: `${category.seoTitle ?? `${category.name}: bài viết KDIGI CMS`}${result.page > 1 ? ` (trang ${result.page})` : ""}`,
    description: result.page > 1 ? fitDescription(`Trang ${result.page}: ${description}`) : description,
    route: categoryPath(category.slug, result.page),
  })
}

export default async function CategoryPage(props: PageProps) {
  const { category, result, others } = await resolve(props)
  const route = categoryPath(category.slug, result.page)
  const trail = [
    { name: "Trang chủ", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: category.name, path: categoryPath(category.slug) },
    ...(result.page > 1 ? [{ name: `Trang ${result.page}`, path: route }] : []),
  ]
  const updated = (result.posts[0]?.updatedAt ?? category.updatedAt ?? new Date().toISOString()).slice(0, 10)
  return (
    <main id="main" tabIndex={-1}>
      <Container className="pt-10 pb-16 md:pt-14 md:pb-24">
        <Breadcrumbs trail={trail} />
        <header className="mb-8 max-w-3xl">
          <h1 className="t-display !text-[clamp(30px,4.4vw,46px)]">{category.name}</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">{descriptionOf(category)}</p>
          <UpdatedLine updated={updated} className="mt-3 text-[14px] text-muted-foreground" />
        </header>
        <CategoryNav categories={others} activeSlug={category.slug} />
        <PostGrid result={result} hrefFor={(page) => categoryPath(category.slug, page)} />
      </Container>
      <JsonLdScript
        data={graph(
          organization(),
          website(),
          pageNode({
            route,
            title: category.name,
            description: descriptionOf(category),
            schema: "CollectionPage",
            updated,
            published: null,
            image: null,
            items: result.posts.map((post) => ({ name: post.title, path: `/blog/${post.slug}` })),
          }),
          breadcrumbs(trail),
        )}
      />
    </main>
  )
}
