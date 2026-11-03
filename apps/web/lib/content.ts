import { readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"

import matter from "gray-matter"

import { type IconName, requireIconName } from "@/lib/icons"
import { type Heading, htmlToText, renderInline, renderMarkdown } from "@/lib/markdown"

/**
 * Repo-authored pages: `content/pages/<route as directories>/index.md` (home = `content/pages/index.md`), YAML frontmatter + GFM body.
 * Authoring contract: local://opencms-content-contract.md. A page that has no file does not exist: not routed, not in nav, not in the sitemap.
 */
export const CONTENT_DIR = path.join(process.cwd(), "content", "pages")

export const SCHEMA_TYPES = ["WebPage", "TechArticle", "SoftwareApplication", "CollectionPage", "AboutPage", "ContactPage"] as const
export type SchemaType = (typeof SCHEMA_TYPES)[number]

export type FaqEntry = { q: string; a: string; aHtml: string; aText: string }

export type ContentPage = {
  /** `/tinh-nang/seo-json-ld`; `/` for home. */
  route: string
  file: string
  title: string
  description: string
  h1: string
  /** Short label for nav, breadcrumbs, cards. Defaults to h1. */
  navTitle: string
  /** lucide name from lib/icons.ts; shown on cards, mega menu and as the H1 badge. Null = default icon in lists, no badge. */
  icon: IconName | null
  /** One-line subtitle under the H1 (≤ 25 words). */
  lead: string | null
  primaryKeyword: string | null
  updated: string
  published: string | null
  heroImage: string | null
  heroAlt: string
  ogImage: string | null
  schema: SchemaType
  faq: FaqEntry[]
  related: string[]
  docs: string | null
  order: number
  group: string | null
  html: string
  /** Markdown body as authored (used by llms-full.txt). */
  source: string
  text: string
  headings: Heading[]
  wordCount: number
}

type Raw = Record<string, unknown>

const asString = (value: unknown): string | null => (typeof value === "string" && value.trim() !== "" ? value.trim() : null)

function fail(file: string, message: string): never {
  throw new Error(`content/pages: ${path.relative(process.cwd(), file)}: ${message}`)
}

function isoDate(file: string, value: unknown, field: string): string {
  const raw = value instanceof Date ? value.toISOString().slice(0, 10) : asString(value)
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) fail(file, `frontmatter "${field}" must be YYYY-MM-DD`)
  return raw
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (name.endsWith(".md")) out.push(full)
  }
  return out
}

export function routeOfFile(file: string): string {
  const rel = path.relative(CONTENT_DIR, file).split(path.sep).join("/").replace(/\.md$/, "")
  const parts = rel.split("/")
  if (parts[parts.length - 1] === "index") parts.pop()
  return parts.length ? `/${parts.join("/")}` : "/"
}

export function parseContentSource(file: string, raw: string): ContentPage | null {
  const parsed = matter(raw)
  const data = parsed.data as Raw
  if (data.draft === true) return null
  const route = routeOfFile(file)
  const title = asString(data.title) ?? fail(file, 'frontmatter "title" is required')
  const description = asString(data.description) ?? fail(file, 'frontmatter "description" is required')
  const updated = isoDate(file, data.updated, "updated")
  const schema = (asString(data.schema) ?? "WebPage") as SchemaType
  if (!SCHEMA_TYPES.includes(schema)) fail(file, `schema must be one of ${SCHEMA_TYPES.join(", ")}`)
  const heroImage = asString(data.heroImage)
  const rendered = renderMarkdown(parsed.content, { heroEager: heroImage === null })
  if (rendered.errors.length) fail(file, rendered.errors.join("; "))

  const faqRaw = data.faq
  if (faqRaw !== undefined && !Array.isArray(faqRaw)) fail(file, "faq must be a list of { q, a }")
  const faq = (faqRaw as Raw[] | undefined ?? []).map((entry, index): FaqEntry => {
    const q = asString(entry?.q) ?? fail(file, `faq[${index}].q is required`)
    const a = asString(entry?.a) ?? fail(file, `faq[${index}].a is required`)
    const aHtml = renderInline(a)
    return { q, a, aHtml, aText: htmlToText(aHtml) }
  })

  const related = Array.isArray(data.related) ? data.related.flatMap((r) => (typeof r === "string" ? [r] : [])) : []
  const h1 = asString(data.h1) ?? title
  const heroAlt = asString(data.heroAlt) ?? ""
  if (heroImage && !heroAlt) fail(file, "heroImage requires heroAlt (Vietnamese alt text)")
  const iconRaw = asString(data.icon)
  const icon: IconName | null = iconRaw ? requireIconName(iconRaw, `content/pages: ${path.relative(process.cwd(), file)}: frontmatter "icon"`) : null
  const lead = asString(data.lead)
  if (lead && lead.split(/\s+/).length > 25) fail(file, `frontmatter "lead" has ${lead.split(/\s+/).length} words, the limit is 25`)
  return {
    route,
    file,
    title,
    description,
    h1,
    navTitle: asString(data.navTitle) ?? h1,
    icon,
    lead,
    primaryKeyword: asString(data.primaryKeyword),
    updated,
    published: data.published === undefined ? null : isoDate(file, data.published, "published"),
    heroImage,
    heroAlt,
    ogImage: asString(data.ogImage),
    schema,
    faq,
    related,
    docs: asString(data.docs),
    order: typeof data.order === "number" ? data.order : 1000,
    group: asString(data.group),
    html: rendered.html,
    source: parsed.content.trim(),
    text: rendered.text,
    headings: rendered.headings,
    wordCount: rendered.text.split(/\s+/).filter(Boolean).length,
  }
}

let cache: ContentPage[] | null = null

/** All published repo pages (draft: true excluded). Cached in production, re-read on every call in dev so writers see edits. */
export function getContentPages(): ContentPage[] {
  if (cache && process.env.NODE_ENV === "production") return cache
  let files: string[] = []
  try {
    files = walk(CONTENT_DIR)
  } catch {
    files = []
  }
  const pages = files.flatMap((file) => parseContentSource(file, readFileSync(file, "utf8")) ?? [])
  const seen = new Set<string>()
  for (const page of pages) {
    if (seen.has(page.route)) fail(page.file, `duplicate route ${page.route}`)
    seen.add(page.route)
  }
  pages.sort((a, b) => a.order - b.order || a.route.localeCompare(b.route))
  cache = pages
  return pages
}

export const getContentPage = (route: string): ContentPage | null => getContentPages().find((page) => page.route === route) ?? null

export const parentRoute = (route: string): string | null => {
  if (route === "/") return null
  const idx = route.lastIndexOf("/")
  return idx <= 0 ? "/" : route.slice(0, idx)
}

/** Direct children (one level down) of a route. */
export const childPages = (route: string): ContentPage[] =>
  getContentPages().filter((page) => page.route !== "/" && parentRoute(page.route) === route)

/** Pages anywhere below a route. */
export const descendantPages = (route: string): ContentPage[] =>
  getContentPages().filter((page) => page.route !== route && page.route.startsWith(route === "/" ? "/" : `${route}/`))
