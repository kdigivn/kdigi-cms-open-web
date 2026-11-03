import type { Metadata } from "next"

import { blogIndexPath } from "@/lib/blog"
import { type Category, listCategories, listPosts, paginate } from "@/lib/cms"
import { breadcrumbs, graph, organization, website } from "@/lib/json-ld"
import { buildMetadata, fitDescription } from "@/lib/seo"

import { CategoryNav, PostGrid } from "./blog-listing"
import { JsonLdScript } from "./json-ld-script"
import { Breadcrumbs, UpdatedLine } from "./page-parts"
import { Container } from "./section"

const TITLE = "Blog KDIGI CMS: hướng dẫn, so sánh CMS và bản phát hành"
const DESCRIPTION =
  "Bài viết về KDIGI CMS và CMS headless: so sánh với WordPress, Strapi, Payload, hướng dẫn SEO, JSON-LD, chuyển từ WordPress, tự host và các bản phát hành."

export function blogIndexMetadata(page: number): Metadata {
  return buildMetadata({
    title: page > 1 ? `Blog KDIGI CMS, trang ${page}` : TITLE,
    description: page > 1 ? fitDescription(`Trang ${page}: ${DESCRIPTION}`) : DESCRIPTION,
    route: blogIndexPath(page),
  })
}

/** Categories that have at least one published post. */
export async function usedCategories(): Promise<Category[]> {
  const [categories, posts] = await Promise.all([listCategories(), listPosts()])
  const used = new Set(posts.flatMap((post) => post.categoryRefs.map((ref) => ref.slug)))
  return categories.filter((category) => used.has(category.slug))
}

export async function BlogIndex({ page }: { page: number }) {
  const [posts, categories] = await Promise.all([listPosts(), usedCategories()])
  const result = paginate(posts, page)
  const trail = [
    { name: "Trang chủ", path: "/" },
    { name: "Blog", path: "/blog" },
    ...(result.page > 1 ? [{ name: `Trang ${result.page}`, path: blogIndexPath(result.page) }] : []),
  ]
  const latest = posts[0]?.updatedAt ?? posts[0]?.publishedAt
  return (
    <main id="main" tabIndex={-1}>
      <Container className="pt-10 pb-16 md:pt-14 md:pb-24">
        <Breadcrumbs trail={trail} />
        <header className="mb-8 max-w-3xl">
          <h1 className="t-display !text-[clamp(30px,4.4vw,46px)]">Blog KDIGI CMS</h1>
          <p className="mt-4 text-[17px] leading-relaxed text-muted-foreground">
            Hướng dẫn thực hành, so sánh CMS và nhật ký phát hành của KDIGI CMS, viết và đăng bằng chính KDIGI CMS.
          </p>
          {latest ? <UpdatedLine updated={latest.slice(0, 10)} className="mt-3 text-[14px] text-muted-foreground" /> : null}
        </header>
        <CategoryNav categories={categories} />
        <PostGrid result={result} />
        <p className="mt-12 text-[14px] text-muted-foreground">
          Bài viết do đội ngũ KDIGI biên soạn; thông tin sản phẩm đối chiếu với mã nguồn và tài liệu chính thức, thông tin về sản phẩm khác kèm nguồn dẫn. Theo dõi qua{" "}
          <a href="/rss.xml" className="underline underline-offset-4">
            RSS
          </a>
          .
        </p>
      </Container>
      <JsonLdScript data={graph(organization(), website(), breadcrumbs(trail))} />
    </main>
  )
}
