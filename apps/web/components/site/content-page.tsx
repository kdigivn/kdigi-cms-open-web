import Image from "next/image"

import { type ContentPage as Page, childPages } from "@/lib/content"
import { breadcrumbTrail, relatedPages } from "@/lib/ia"
import { breadcrumbs, faqPageFromEntries, graph, organization, pageNode, softwareApplication, website } from "@/lib/json-ld"
import { publicImageSize } from "@/lib/markdown"
import { ogImageFor } from "@/lib/seo"

import { Container } from "./section"
import { JsonLdScript } from "./json-ld-script"
import { Breadcrumbs, CardGrid, DocsLink, FaqBlock, Toc, UpdatedLine } from "./page-parts"

type Props = {
  page: Page
  /** Rendered after the body and the hub listing (e.g. latest posts on the home page). */
  after?: React.ReactNode
}

const toCard = (page: Page) => ({ href: page.route, title: page.navTitle, description: page.description })

/** The single layout for every repo page: breadcrumbs, H1, updated date, hero, TOC, body, hub listing, FAQ, docs link, related, JSON-LD. */
export function ContentPageView({ page, after }: Props) {
  const isHome = page.route === "/"
  const trail = breadcrumbTrail(page.route, page.navTitle)
  const children = childPages(page.route)
  const related = relatedPages(page)
  const hasChildrenList = children.length > 0
  const og = ogImageFor(page.route, page.ogImage)

  // group children by `group` when the hub uses it; otherwise one flat grid
  const groups = new Map<string, Page[]>()
  for (const child of children) {
    const key = child.group ?? ""
    groups.set(key, [...(groups.get(key) ?? []), child])
  }

  const nodes = [
    organization(),
    website(),
    ...(isHome || page.schema === "SoftwareApplication" ? [softwareApplication()] : []),
    pageNode({
      route: page.route,
      title: page.title,
      description: page.description,
      schema: page.schema,
      updated: page.updated,
      published: page.published,
      image: og.url,
      items: hasChildrenList ? children.map((child) => ({ name: child.navTitle, path: child.route })) : undefined,
    }),
    ...(isHome ? [] : [breadcrumbs(trail)]),
    ...(page.faq.length ? [faqPageFromEntries(page.faq)] : []),
  ]

  return (
    <main id="main" tabIndex={-1}>
      <Container className="max-w-[1080px] pt-10 pb-16 md:pt-14 md:pb-24">
        {isHome ? null : <Breadcrumbs trail={trail} />}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
          <article className="min-w-0">
            <header>
              <h1 className="t-display !text-[clamp(30px,4.4vw,46px)]">{page.h1}</h1>
              <UpdatedLine updated={page.updated} className="mt-3 text-[14px] text-muted-foreground" />
            </header>
            {page.heroImage ? (
              <HeroImage src={page.heroImage} alt={page.heroAlt} />
            ) : null}
            <div className="lg:hidden [&:not(:empty)]:mt-6">
              <Toc headings={page.headings} />
            </div>
            <div className="blog-prose mt-8" dangerouslySetInnerHTML={{ __html: page.html }} />

            {hasChildrenList ? (
              <section aria-labelledby="trong-muc-nay" className="mt-14">
                <h2 id="trong-muc-nay" className="font-display text-[clamp(22px,2.4vw,28px)] font-bold">
                  Trong mục này
                </h2>
                <div className="mt-5 space-y-8">
                  {[...groups.entries()].map(([group, pages]) => (
                    <div key={group}>
                      {group ? <h3 className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">{group}</h3> : null}
                      <CardGrid items={pages.map(toCard)} headingLevel={3} />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {after}
            <FaqBlock entries={page.faq.map((entry) => ({ q: entry.q, aHtml: entry.aHtml }))} />

            {page.docs ? (
              <div className="mt-10">
                <DocsLink href={page.docs} />
              </div>
            ) : null}

            {related.length ? (
              <section aria-labelledby="doc-tiep" className="mt-14">
                <h2 id="doc-tiep" className="font-display text-[clamp(22px,2.4vw,28px)] font-bold">
                  Đọc tiếp
                </h2>
                <div className="mt-5">
                  <CardGrid items={related.map(toCard)} />
                </div>
              </section>
            ) : null}
          </article>
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <Toc headings={page.headings} />
            </div>
          </aside>
        </div>
      </Container>
      <JsonLdScript data={graph(...nodes)} />
    </main>
  )
}

function HeroImage({ src, alt }: { src: string; alt: string }) {
  const size = publicImageSize(src)
  if (!size) throw new Error(`heroImage not found under public/: ${src}`)
  return (
    <Image
      src={src}
      alt={alt}
      width={size.width}
      height={size.height}
      priority
      unoptimized
      sizes="(min-width: 1080px) 780px, 100vw"
      className="mt-8 h-auto w-full rounded-3xl border border-border"
    />
  )
}
