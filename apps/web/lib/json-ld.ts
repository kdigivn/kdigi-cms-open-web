import { absoluteUrl, GITHUB_URL, KDIGI_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site"
import type { FaqGroup, Post } from "@/lib/cms"

/**
 * schema.org builders. Every node that names the product or the company points at the same `@id`s, so search and answer engines
 * see one entity (KDIGI CMS, made by KDIGI) instead of a new one per page.
 */
export type JsonLd = Record<string, unknown>

const ORG_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`
const APP_ID = `${SITE_URL}/#software`

const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()

export const organization = (): JsonLd => ({
  "@type": "Organization",
  "@id": ORG_ID,
  name: "KDIGI",
  url: KDIGI_URL,
  logo: absoluteUrl("/brand/kdigi-mark.svg"),
  sameAs: [GITHUB_URL],
})

export const website = (): JsonLd => ({
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: SITE_URL,
  name: SITE_NAME,
  inLanguage: "vi-VN",
  publisher: { "@id": ORG_ID },
})

export const softwareApplication = (): JsonLd => ({
  "@type": "SoftwareApplication",
  "@id": APP_ID,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Linux, Docker",
  license: `${GITHUB_URL}/blob/main/LICENSE`,
  codeRepository: GITHUB_URL,
  offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
  publisher: { "@id": ORG_ID },
})

export const faqPage = (groups: FaqGroup[]): JsonLd => ({
  "@type": "FAQPage",
  mainEntity: groups.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: stripHtml(item.answerHtml) },
    })),
  ),
})

export const blogPosting = (post: Post): JsonLd => ({
  "@type": "BlogPosting",
  "@id": absoluteUrl(`/blog/${post.slug}`) + "#post",
  headline: post.title,
  description: post.seoDescription ?? post.excerpt,
  url: absoluteUrl(`/blog/${post.slug}`),
  inLanguage: "vi-VN",
  datePublished: post.publishedAt ?? undefined,
  dateModified: post.updatedAt ?? post.publishedAt ?? undefined,
  image: post.image ? [post.image.url] : [absoluteUrl("/opengraph-image")],
  author: post.author ? { "@type": "Person", name: post.author } : { "@id": ORG_ID },
  publisher: { "@id": ORG_ID },
  isPartOf: { "@id": WEBSITE_ID },
})

export const breadcrumbs = (items: { name: string; path: string }[]): JsonLd => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })),
})

export const graph = (...nodes: JsonLd[]): JsonLd => ({ "@context": "https://schema.org", "@graph": nodes })
