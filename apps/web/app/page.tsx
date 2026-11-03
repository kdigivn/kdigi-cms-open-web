import type { Metadata } from "next"

import { JsonLdScript } from "@/components/site/json-ld-script"
import { Container } from "@/components/site/section"
import { Demo } from "@/components/site/sections/demo"
import { Faq } from "@/components/site/sections/faq"
import { FinalCta } from "@/components/site/sections/final-cta"
import { Features } from "@/components/site/sections/features"
import { Hero } from "@/components/site/sections/hero"
import { LatestPosts } from "@/components/site/sections/latest-posts"
import { Migration } from "@/components/site/sections/migration"
import { OpenSource } from "@/components/site/sections/opensource"
import { SelfHost } from "@/components/site/sections/selfhost"
import { ValueProps } from "@/components/site/sections/value-props"
import { type FaqGroup, getFaqGroups, listPosts } from "@/lib/cms"
import { getContentPage } from "@/lib/content"
import { faqPage, graph, organization, softwareApplication, website } from "@/lib/json-ld"
import { buildMetadata } from "@/lib/seo"
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site"

// ISR: rebuilt at most hourly, and immediately when the CMS calls POST /api/cms/revalidate (literal required by Next).
export const revalidate = 3600

export function generateMetadata(): Metadata {
  const page = getContentPage("/")
  if (page) return buildMetadata({ title: page.title, description: page.description, route: "/", image: page.ogImage })
  return { title: { absolute: SITE_TITLE }, description: SITE_DESCRIPTION, alternates: { canonical: SITE_URL } }
}

/**
 * The marketing home: the rich section components. `content/pages/index.md`, when present, supplies the metadata, an extra FAQ group
 * (merged with the CMS FAQ, same question never twice) and its body as the "KDIGI CMS là gì" long-form section after the features.
 */
export default async function HomePage() {
  const content = getContentPage("/")
  const [cmsGroups, posts] = await Promise.all([getFaqGroups(), listPosts(3)])

  const cmsQuestions = new Set(cmsGroups.flatMap((group) => group.items.map((item) => item.question)))
  const extra: FaqGroup[] = content
    ? [
        {
          id: "content-home",
          group: "Về KDIGI CMS",
          items: content.faq.filter((entry) => !cmsQuestions.has(entry.q)).map((entry) => ({ question: entry.q, answerHtml: entry.aHtml })),
        },
      ].filter((group) => group.items.length > 0)
    : []
  const groups = [...extra, ...cmsGroups]

  return (
    <main id="main" tabIndex={-1}>
      <Hero />
      <ValueProps />
      <Features />
      {content ? (
        <section id="kdigi-cms-la-gi" aria-label="KDIGI CMS là gì" className="py-16 md:py-24">
          <Container className="max-w-[820px]">
            <div className="blog-prose" dangerouslySetInnerHTML={{ __html: content.html }} />
          </Container>
        </section>
      ) : null}
      <Migration />
      <SelfHost />
      <Demo />
      <OpenSource />
      <LatestPosts posts={posts} />
      <Faq groups={groups} />
      <FinalCta />
      <JsonLdScript data={graph(organization(), website(), softwareApplication(), faqPage(groups))} />
    </main>
  )
}
