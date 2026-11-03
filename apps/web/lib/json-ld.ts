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

export const blogPosting = (post: Post, image: string, wordCount?: number | null): JsonLd => ({
  "@type": "BlogPosting",
  "@id": absoluteUrl(`/blog/${post.slug}`) + "#post",
  headline: post.title,
  description: post.seoDescription ?? post.excerpt,
  url: absoluteUrl(`/blog/${post.slug}`),
  mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  inLanguage: "vi-VN",
  datePublished: post.publishedAt ?? undefined,
  dateModified: post.updatedAt ?? post.publishedAt ?? undefined,
  image: [image],
  ...(wordCount ? { wordCount } : {}),
  ...(post.categories[0] ? { articleSection: post.categories[0] } : {}),
  author: post.authorRef
    ? {
        "@type": "Person",
        "@id": `${absoluteUrl(`/tac-gia/${post.authorRef.slug}`)}#person`,
        name: post.authorRef.name,
        url: absoluteUrl(`/tac-gia/${post.authorRef.slug}`),
      }
    : { "@id": ORG_ID },
  publisher: { "@id": ORG_ID },
  isPartOf: { "@id": WEBSITE_ID },
})

export const breadcrumbs = (items: { name: string; path: string }[]): JsonLd => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })),
})

export const graph = (...nodes: JsonLd[]): JsonLd => ({ "@context": "https://schema.org", "@graph": nodes })

export const faqPageFromEntries = (entries: { q: string; aText: string }[]): JsonLd => ({
  "@type": "FAQPage",
  mainEntity: entries.map((entry) => ({ "@type": "Question", name: entry.q, acceptedAnswer: { "@type": "Answer", text: entry.aText } })),
})

export type PageLdInput = {
  route: string
  title: string
  description: string
  schema: "WebPage" | "TechArticle" | "SoftwareApplication" | "CollectionPage" | "AboutPage" | "ContactPage"
  updated: string
  published: string | null
  image: string | null
  items?: { name: string; path: string }[]
}

/** Node for a repo page. SoftwareApplication pages describe the product; hubs carry an ItemList of their children; guides are TechArticle. */
export function pageNode(input: PageLdInput): JsonLd {
  const url = absoluteUrl(input.route)
  const common = {
    "@id": `${url}#webpage`,
    url,
    name: input.title,
    description: input.description,
    inLanguage: "vi-VN",
    dateModified: input.updated,
    datePublished: input.published ?? input.updated,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORG_ID },
    ...(input.image ? { primaryImageOfPage: { "@type": "ImageObject", url: input.image }, image: input.image } : {}),
  }
  if (input.schema === "TechArticle") {
    return { ...common, "@type": "TechArticle", "@id": `${url}#article`, headline: input.title, author: { "@id": ORG_ID }, mainEntityOfPage: url }
  }
  if (input.schema === "SoftwareApplication") return { ...common, "@type": ["WebPage"], about: { "@id": APP_ID } }
  if (input.schema === "CollectionPage") {
    return {
      ...common,
      "@type": "CollectionPage",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: (input.items ?? []).map((item, index) => ({ "@type": "ListItem", position: index + 1, url: absoluteUrl(item.path), name: item.name })),
      },
    }
  }
  return { ...common, "@type": input.schema }
}

export const person = (name: string, path: string): JsonLd => ({
  "@type": "Person",
  "@id": `${absoluteUrl(path)}#person`,
  name,
  url: absoluteUrl(path),
  worksFor: { "@id": ORG_ID },
})
