import type { Metadata } from "next"

import { JsonLdScript } from "@/components/site/json-ld-script"
import { Faq } from "@/components/site/sections/faq"
import { FinalCta } from "@/components/site/sections/final-cta"
import { Hero } from "@/components/site/sections/hero"
import { Features } from "@/components/site/sections/features"
import { LatestPosts } from "@/components/site/sections/latest-posts"
import { Migration } from "@/components/site/sections/migration"
import { OpenSource } from "@/components/site/sections/opensource"
import { SelfHost } from "@/components/site/sections/selfhost"
import { Demo } from "@/components/site/sections/demo"
import { ValueProps } from "@/components/site/sections/value-props"
import { getFaqGroups, listPosts } from "@/lib/cms"
import { faqPage, graph, organization, softwareApplication, website } from "@/lib/json-ld"
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@/lib/site"

// ISR: rebuilt at most hourly, and immediately when the CMS calls POST /api/cms/revalidate (literal required by Next).
export const revalidate = 3600

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: SITE_URL },
}

export default async function HomePage() {
  const [faqGroups, posts] = await Promise.all([getFaqGroups(), listPosts(3)])
  return (
    <main id="main" tabIndex={-1}>
      <Hero />
      <ValueProps />
      <Features />
      <Migration />
      <SelfHost />
      <Demo />
      <OpenSource />
      <LatestPosts posts={posts} />
      <Faq groups={faqGroups} />
      <FinalCta />
      <JsonLdScript data={graph(organization(), website(), softwareApplication(), faqPage(faqGroups))} />
    </main>
  )
}
