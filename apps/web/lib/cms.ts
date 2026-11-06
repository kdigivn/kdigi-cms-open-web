/**
 * Server-side reads from KDIGI CMS (public REST, anonymous, see the CMS docs/rest-api.md). Never called from the browser.
 *
 * Contract: the site (tenant) is resolved once by `siteKey`; FAQs and posts are then filtered by `where[tenant][equals]=<id>`.
 * Every request carries the `cms` cache tag, so POST /api/cms/revalidate drops all of them at once. A failing CMS throws:
 * a page that cannot be rendered keeps serving its last good ISR copy instead of caching an empty section.
 */

export const CMS_TAG = "cms"
/** Safety net when no webhook arrives: pages and CMS reads refresh at most this late. */
export const CMS_REVALIDATE_SECONDS = 3600

const CMS_URL = (process.env.CMS_URL || "https://app.cms.kdigi.vn").replace(/\/+$/, "")
const CMS_SITE_KEY = process.env.CMS_SITE_KEY || "opencms"
const CMS_TIMEOUT_MS = 10_000

export type FaqItem = { question: string; answerHtml: string }
export type FaqGroup = { id: string; group: string; items: FaqItem[] }

export type CmsImage = { url: string; alt: string; width: number | null; height: number | null }

export type Post = {
  id: string
  slug: string
  title: string
  excerpt: string
  contentHtml: string
  publishedAt: string | null
  updatedAt: string | null
  image: CmsImage | null
  categories: string[]
  categoryRefs: CategoryRef[]
  author: string | null
  authorRef: Author | null
  wordCount: number | null
  seoTitle: string | null
  seoDescription: string | null
}

type Json = Record<string, unknown>

const isRecord = (value: unknown): value is Json => typeof value === "object" && value !== null && !Array.isArray(value)
const str = (value: unknown): string | null => (typeof value === "string" && value.trim() !== "" ? value : null)
const num = (value: unknown): number | null => (typeof value === "number" && Number.isFinite(value) ? value : null)

/** Media URLs come back relative (`/api/media/file/x.png`) or absolute; always return an absolute https URL. */
export function absoluteMediaUrl(url: string, base: string = CMS_URL): string {
  return /^https?:\/\//.test(url) ? url : `${base}${url.startsWith("/") ? "" : "/"}${url}`
}

export function parseImage(raw: unknown, base: string = CMS_URL): CmsImage | null {
  if (!isRecord(raw)) return null // an id (depth 0) or null
  const url = str(raw.url)
  if (!url) return null
  return { url: absoluteMediaUrl(url, base), alt: str(raw.alt) ?? "", width: num(raw.width), height: num(raw.height) }
}

export function parseFaqGroups(docs: unknown): FaqGroup[] {
  if (!Array.isArray(docs)) return []
  return docs.flatMap((doc): FaqGroup[] => {
    if (!isRecord(doc) || !Array.isArray(doc.items)) return []
    const items = doc.items.flatMap((item): FaqItem[] => {
      if (!isRecord(item)) return []
      const question = str(item.question)
      const answerHtml = str(item.answer)
      return question && answerHtml ? [{ question, answerHtml }] : []
    })
    return items.length ? [{ id: String(doc.id), group: str(doc.group) ?? "", items }] : []
  })
}

export function parsePost(doc: unknown, base: string = CMS_URL): Post | null {
  if (!isRecord(doc)) return null
  const slug = str(doc.slug)
  const title = str(doc.title)
  if (!slug || !title) return null
  const seo = isRecord(doc.seo) ? doc.seo : {}
  const categoryDocs = Array.isArray(doc.categories) ? doc.categories.filter(isRecord) : []
  const categories = categoryDocs.flatMap((c) => (str(c.name) ? [str(c.name) as string] : []))
  const categoryRefs = categoryDocs.flatMap((c): CategoryRef[] =>
    str(c.name) && str(c.slug) ? [{ id: String(c.id), name: str(c.name) as string, slug: str(c.slug) as string }] : [],
  )
  const authorRef = parseAuthor(doc.author, base)
  const author = authorRef?.name ?? (isRecord(doc.author) ? str(doc.author.name) : null)
  return {
    id: String(doc.id),
    slug,
    title,
    excerpt: str(doc.excerpt) ?? "",
    contentHtml: str(doc.content) ?? "",
    publishedAt: str(doc.publishedAt),
    updatedAt: str(doc.updatedAt),
    image: parseImage(doc.featuredImage, base),
    categories,
    categoryRefs,
    author,
    authorRef,
    wordCount: num(doc.wordCount),
    seoTitle: str(seo.title),
    seoDescription: str(seo.description),
  }
}

async function cmsGet(path: string, params: Record<string, string>): Promise<unknown> {
  const url = new URL(`/api/${path}`, CMS_URL)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(CMS_TIMEOUT_MS),
    next: { revalidate: CMS_REVALIDATE_SECONDS, tags: [CMS_TAG] },
  })
  if (!res.ok) throw new Error(`CMS ${path} answered ${res.status}`)
  return res.json()
}

const docsOf = (body: unknown): unknown => (isRecord(body) ? body.docs : undefined)

async function siteId(): Promise<string> {
  const docs = docsOf(await cmsGet("sites", { "where[siteKey][equals]": CMS_SITE_KEY, depth: "0", limit: "1", "select[id]": "true" }))
  const first = Array.isArray(docs) ? docs[0] : undefined
  if (!isRecord(first) || first.id === undefined) throw new Error(`CMS site "${CMS_SITE_KEY}" not found`)
  return String(first.id)
}

export async function getFaqGroups(): Promise<FaqGroup[]> {
  const tenant = await siteId()
  return parseFaqGroups(docsOf(await cmsGet("faqs", { "where[tenant][equals]": tenant, limit: "20", depth: "0", locale: "vi" })))
}

export async function listPosts(limit = 200): Promise<Post[]> {
  const tenant = await siteId()
  const docs = docsOf(
    await cmsGet("posts", { "where[tenant][equals]": tenant, sort: "-publishedAt", limit: String(limit), depth: "1", locale: "vi" }),
  )
  return Array.isArray(docs) ? docs.flatMap((doc) => parsePost(doc) ?? []) : []
}

export async function getPost(slug: string): Promise<Post | null> {
  const tenant = await siteId()
  const docs = docsOf(
    await cmsGet("posts", { "where[tenant][equals]": tenant, "where[slug][equals]": slug, limit: "1", depth: "1", locale: "vi" }),
  )
  return Array.isArray(docs) ? parsePost(docs[0]) : null
}

export type CmsPage = { slug: string; title: string; contentHtml: string; updatedAt: string | null; seoDescription: string | null }

/** Legal / about pages (`pages` collection, published only). Returns null when the slug does not exist. */
export async function getPage(slug: string): Promise<CmsPage | null> {
  const tenant = await siteId()
  const docs = docsOf(
    await cmsGet("pages", { "where[tenant][equals]": tenant, "where[slug][equals]": slug, limit: "1", depth: "0", locale: "vi" }),
  )
  const doc = Array.isArray(docs) ? docs[0] : undefined
  if (!isRecord(doc)) return null
  const title = str(doc.title)
  if (!title) return null
  const seo = isRecord(doc.seo) ? doc.seo : {}
  return { slug, title, contentHtml: str(doc.content) ?? "", updatedAt: str(doc.updatedAt), seoDescription: str(seo.description) }
}

export type CategoryRef = { id: string; name: string; slug: string }
export type Category = CategoryRef & { description: string | null; contentHtml: string; updatedAt: string | null; seoTitle: string | null; seoDescription: string | null }
export type Author = { id: string; name: string; slug: string; bio: string | null; avatar: CmsImage | null; sameAs: string[]; updatedAt: string | null }

export function parseCategory(doc: unknown): Category | null {
  if (!isRecord(doc)) return null
  const name = str(doc.name)
  const slug = str(doc.slug)
  if (!name || !slug) return null
  const seo = isRecord(doc.seo) ? doc.seo : {}
  return {
    id: String(doc.id),
    name,
    slug,
    description: str(doc.description),
    contentHtml: str(doc.content) ?? "",
    updatedAt: str(doc.updatedAt),
    seoTitle: str(seo.title),
    seoDescription: str(seo.description),
  }
}

export function parseAuthor(doc: unknown, base: string = CMS_URL): Author | null {
  if (!isRecord(doc)) return null
  const name = str(doc.name)
  const slug = str(doc.slug)
  if (!name || !slug) return null
  const sameAs = Array.isArray(doc.sameAs)
    ? doc.sameAs.flatMap((entry) => (typeof entry === "string" ? [entry] : isRecord(entry) && str(entry.url) ? [str(entry.url) as string] : []))
    : []
  return { id: String(doc.id), name, slug, bio: str(doc.bio), avatar: parseImage(doc.avatar, base), sameAs, updatedAt: str(doc.updatedAt) }
}

/** Categories (`taxonomies` with type=category) of the site. */
export async function listCategories(): Promise<Category[]> {
  const tenant = await siteId()
  const docs = docsOf(
    await cmsGet("taxonomies", { "where[tenant][equals]": tenant, "where[type][equals]": "category", limit: "100", depth: "0", locale: "vi" }),
  )
  return Array.isArray(docs) ? docs.flatMap((doc) => parseCategory(doc) ?? []) : []
}

export async function listAuthors(): Promise<Author[]> {
  const tenant = await siteId()
  const docs = docsOf(await cmsGet("authors", { "where[tenant][equals]": tenant, limit: "100", depth: "1", locale: "vi" }))
  return Array.isArray(docs) ? docs.flatMap((doc) => parseAuthor(doc) ?? []) : []
}

/** Posts per page on every blog listing. */
export const POSTS_PER_PAGE = 12

export type PostPage = { posts: Post[]; page: number; totalPages: number; total: number }

/** Slice a (newest-first) list into a page; `page` is clamped to the valid range. */
export function paginate(posts: Post[], page: number, perPage: number = POSTS_PER_PAGE): PostPage {
  const totalPages = Math.max(1, Math.ceil(posts.length / perPage))
  const current = Math.min(Math.max(1, page), totalPages)
  return { posts: posts.slice((current - 1) * perPage, current * perPage), page: current, totalPages, total: posts.length }
}

/** Reading time in whole minutes (Vietnamese ~200 words per minute); null when the CMS has no word count. */
export const readingMinutes = (post: Post): number | null => (post.wordCount ? Math.max(1, Math.round(post.wordCount / 200)) : null)
