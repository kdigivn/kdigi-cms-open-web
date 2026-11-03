import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ContentPageView } from "@/components/site/content-page"
import { JsonLdScript } from "@/components/site/json-ld-script"
import { Container } from "@/components/site/section"
import { Breadcrumbs, UpdatedLine } from "@/components/site/page-parts"
import { getPage } from "@/lib/cms"
import { type ContentPage, childPages, getContentPage } from "@/lib/content"
import { allContentRoutes, breadcrumbTrail, CMS_FALLBACK_SLUGS, sectionOf } from "@/lib/ia"
import { breadcrumbs, graph, organization, website } from "@/lib/json-ld"
import { buildMetadata } from "@/lib/seo"

export const revalidate = 3600
// Only routes that have a file (or a CMS fallback slug) exist; anything else is a 404.
export const dynamicParams = false

type PageProps = { params: Promise<{ slug: string[] }> }

const routeOf = (slug: string[]): string => `/${slug.join("/")}`

export function generateStaticParams(): { slug: string[] }[] {
  const routes = new Set([...allContentRoutes().filter((route) => route !== "/"), ...CMS_FALLBACK_SLUGS.map((slug) => `/${slug}`)])
  return [...routes].map((route) => ({ slug: route.split("/").filter(Boolean) }))
}

/** A section hub (/giai-phap, ...) without its own index.md: auto-listing of the published children, copy from lib/ia.ts. */
function autoHub(route: string): ContentPage | null {
  const section = sectionOf(route)
  if (!section) return null
  return {
    route,
    file: "(auto hub)",
    title: section.title,
    description: section.description,
    h1: section.h1,
    navTitle: section.label,
    primaryKeyword: null,
    updated: childPages(route).map((child) => child.updated).sort().at(-1) ?? "2026-11-03",
    published: null,
    heroImage: null,
    heroAlt: "",
    ogImage: null,
    schema: "CollectionPage",
    faq: [],
    related: [],
    docs: null,
    order: 0,
    group: null,
    html: `<p>${section.lead}</p>`,
    source: section.lead,
    text: section.lead,
    headings: [],
    wordCount: 0,
  }
}

const contentOrHub = (route: string): ContentPage | null => getContentPage(route) ?? autoHub(route)

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const route = routeOf((await params).slug)
  const page = contentOrHub(route)
  if (page) return buildMetadata({ title: page.title, description: page.description, route, image: page.ogImage })
  const cms = await getPage(route.slice(1))
  if (!cms) return { title: "Không tìm thấy trang", robots: { index: false } }
  return buildMetadata({
    title: `${cms.title} | KDIGI CMS`,
    description: cms.seoDescription ?? `${cms.title} của KDIGI CMS, CMS headless mã nguồn mở quản lý nhiều website trong một trang quản trị.`,
    route,
  })
}

export default async function RoutePage({ params }: PageProps) {
  const route = routeOf((await params).slug)
  const page = contentOrHub(route)
  if (page) return <ContentPageView page={page} />

  const cms = await getPage(route.slice(1))
  if (!cms) notFound()
  const trail = breadcrumbTrail(route, cms.title)
  return (
    <main id="main" tabIndex={-1}>
      <Container className="max-w-[820px] py-12 md:py-20">
        <Breadcrumbs trail={trail} />
        <article>
          <h1 className="t-display !text-[clamp(30px,4.4vw,46px)]">{cms.title}</h1>
          {cms.updatedAt ? <UpdatedLine updated={cms.updatedAt.slice(0, 10)} className="mt-3 text-[14px] text-muted-foreground" /> : null}
          <div className="blog-prose mt-8" dangerouslySetInnerHTML={{ __html: cms.contentHtml }} />
        </article>
      </Container>
      <JsonLdScript data={graph(organization(), website(), breadcrumbs(trail))} />
    </main>
  )
}
