import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

import { PostGrid } from "@/components/site/blog-listing"
import { JsonLdScript } from "@/components/site/json-ld-script"
import { Breadcrumbs } from "@/components/site/page-parts"
import { Container } from "@/components/site/section"
import { authorPath } from "@/lib/blog"
import { type Author, listAuthors, listPosts, paginate } from "@/lib/cms"
import { breadcrumbs, graph, organization, person, website } from "@/lib/json-ld"
import { buildMetadata, fitDescription } from "@/lib/seo"

export const revalidate = 3600
export const dynamicParams = true

type PageProps = { params: Promise<{ slug: string }> }

async function findAuthor(slug: string): Promise<Author> {
  const author = (await listAuthors()).find((candidate) => candidate.slug === slug)
  if (!author) notFound()
  return author
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    return (await listAuthors()).map((author) => ({ slug: author.slug }))
  } catch {
    return []
  }
}

const bioOf = (author: Author): string =>
  fitDescription(
    `${author.name}${author.bio ? `: ${author.bio}` : ""} Tất cả bài viết của ${author.name} trên blog KDIGI CMS: hướng dẫn, so sánh CMS headless và nhật ký phát hành của dự án mã nguồn mở.`,
  )

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const author = await findAuthor((await params).slug)
  return buildMetadata({ title: `${author.name}: tác giả blog KDIGI CMS`, description: bioOf(author), route: authorPath(author.slug) })
}

export default async function AuthorPage({ params }: PageProps) {
  const author = await findAuthor((await params).slug)
  const posts = (await listPosts()).filter((post) => post.authorRef?.slug === author.slug)
  const result = paginate(posts, 1, Math.max(posts.length, 1))
  const route = authorPath(author.slug)
  const trail = [
    { name: "Trang chủ", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: author.name, path: route },
  ]
  return (
    <main id="main" tabIndex={-1}>
      <Container className="pt-10 pb-16 md:pt-14 md:pb-24">
        <Breadcrumbs trail={trail} />
        <header className="mb-10 flex max-w-3xl flex-col gap-5 sm:flex-row sm:items-center">
          {author.avatar ? (
            <Image src={author.avatar.url} alt={`Ảnh đại diện của ${author.name}`} width={96} height={96} unoptimized className="size-24 rounded-full border border-border object-cover" />
          ) : null}
          <div>
            <h1 className="t-display !text-[clamp(30px,4.4vw,46px)]">{author.name}</h1>
            {author.bio ? <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">{author.bio}</p> : null}
          </div>
        </header>
        <h2 className="mb-5 font-display text-[clamp(22px,2.4vw,28px)] font-bold">Bài viết của {author.name}</h2>
        <PostGrid result={result} />
      </Container>
      <JsonLdScript
        data={graph(
          organization(),
          website(),
          { ...person(author.name, route), "@type": "Person", ...(author.sameAs.length ? { sameAs: author.sameAs } : {}), ...(author.bio ? { description: author.bio } : {}) },
          breadcrumbs(trail),
        )}
      />
    </main>
  )
}
