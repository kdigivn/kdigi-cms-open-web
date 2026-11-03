import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Container } from "@/components/site/section"
import { JsonLdScript } from "@/components/site/json-ld-script"
import { getPage } from "@/lib/cms"
import { breadcrumbs, graph } from "@/lib/json-ld"
import { absoluteUrl } from "@/lib/site"

export const revalidate = 3600
// Only the pages the footer links to; any other single-segment path is a 404 (static routes such as /blog win before this one).
export const dynamicParams = false

/** Slugs of the CMS `pages` documents this site renders. Create the page in the CMS first, then add its slug here and in the footer. */
const PAGE_SLUGS = ["gioi-thieu", "dieu-khoan", "quyen-rieng-tu"] as const

type PageProps = { params: Promise<{ slug: string }> }

export function generateStaticParams(): { slug: string }[] {
  return PAGE_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getPage((await params).slug)
  if (!page) return { title: "Không tìm thấy trang", robots: { index: false } }
  return {
    title: page.title,
    description: page.seoDescription ?? undefined,
    alternates: { canonical: absoluteUrl(`/${page.slug}`) },
  }
}

export default async function CmsPageRoute({ params }: PageProps) {
  const page = await getPage((await params).slug)
  if (!page) notFound()
  return (
    <main id="main" tabIndex={-1}>
      <Container className="max-w-[820px] py-12 md:py-20">
        <article>
          <h1 className="t-display !text-[clamp(30px,4.4vw,46px)]">{page.title}</h1>
          <div className="blog-prose mt-8" dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
        </article>
      </Container>
      <JsonLdScript
        data={graph(
          breadcrumbs([
            { name: "Trang chủ", path: "/" },
            { name: page.title, path: `/${page.slug}` },
          ]),
        )}
      />
    </main>
  )
}
