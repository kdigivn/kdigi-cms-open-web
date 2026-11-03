import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

import { imageSize } from "image-size"
import MarkdownIt from "markdown-it"

/**
 * One Markdown pipeline for repo pages (`content/pages/**`) and for CMS HTML post-processing helpers.
 * Output is server-rendered HTML; no client JS.
 *  - headings get stable ids (GitHub-style slug of the Vietnamese text, accents stripped) and are collected for the TOC
 *  - `![alt](/images/...)` gets real width/height from the file (no CLS), lazy loading and `decoding=async`; the first image of a page can opt in to eager via `heroEager`
 *  - tables are wrapped in a horizontal scroll container
 *  - `> **Tóm tắt nhanh**` blockquote -> key-facts box; `> **Lưu ý**` / `**Mẹo**` / `**Cảnh báo**` -> callouts
 *  - external links get rel="noopener"
 */
export type Heading = { id: string; text: string; level: 2 | 3 }

export const slugify = (text: string): string =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const PUBLIC_DIR = path.join(process.cwd(), "public")

const dimensionCache = new Map<string, { width: number; height: number } | null>()
/** Pixel size of a file under public/ (`/images/...`), or null when it is not there. */
export function publicImageSize(src: string): { width: number; height: number } | null {
  if (!src.startsWith("/")) return null
  const cached = dimensionCache.get(src)
  if (cached !== undefined) return cached
  const file = path.join(PUBLIC_DIR, src.split("?")[0])
  let result: { width: number; height: number } | null = null
  if (existsSync(file)) {
    try {
      const size = imageSize(readFileSync(file))
      if (size.width && size.height) result = { width: size.width, height: size.height }
    } catch {
      result = null
    }
  }
  dimensionCache.set(src, result)
  return result
}

const CALLOUTS: Record<string, string> = {
  "tom tat nhanh": "keyfacts",
  "luu y": "note",
  "meo": "tip",
  "canh bao": "warning",
  "quan trong": "warning",
}

function createMarkdown() {
  const md = new MarkdownIt({ html: false, linkify: true, typographer: false })

  md.renderer.rules.table_open = () => '<div class="table-scroll" tabindex="0" role="region" aria-label="Bảng dữ liệu"><table>'
  md.renderer.rules.table_close = () => "</table></div>"

  const defaultLink = md.renderer.rules.link_open ?? ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = String(tokens[idx].attrGet("href") ?? "")
    if (/^https?:\/\//.test(href)) tokens[idx].attrSet("rel", "noopener")
    return defaultLink(tokens, idx, options, env, self)
  }

  md.renderer.rules.image = (tokens, idx, _options, rawEnv) => {
    const env = (rawEnv ?? {}) as MarkdownEnv
    const token = tokens[idx]
    const src = String(token.attrGet("src") ?? "")
    const alt = md.utils.escapeHtml(token.content)
    const size = publicImageSize(src)
    if (src.startsWith("/") && !size) env.errors?.push(`image not found under public/: ${src}`)
    if (!alt) env.errors?.push(`image without alt text: ${src}`)
    const eager = env.heroEager === true && !env.firstImageSeen
    env.firstImageSeen = true
    const dims = size ? ` width="${size.width}" height="${size.height}"` : ""
    const title = token.attrGet("title")?.toString()
    const img = `<img src="${md.utils.escapeHtml(src)}" alt="${alt}"${dims} loading="${eager ? "eager" : "lazy"}" decoding="async">`
    return title ? `<figure class="md-figure">${img}<figcaption>${md.utils.escapeHtml(title)}</figcaption></figure>` : img
  }

  md.core.ruler.push("headings-and-callouts", (state) => {
    const env = state.env as MarkdownEnv
    const used = new Map<string, number>()
    env.headings = []
    const tokens = state.tokens
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      if (token.type === "heading_open") {
        const inline = tokens[i + 1]
        const text = inline.children?.map((c) => (c.type === "text" || c.type === "code_inline" ? c.content : "")).join("") ?? inline.content
        let id = slugify(text) || "muc"
        const seen = used.get(id) ?? 0
        used.set(id, seen + 1)
        if (seen > 0) id = `${id}-${seen + 1}`
        token.attrSet("id", id)
        const level = Number(token.tag.slice(1))
        if (level === 2 || level === 3) env.headings.push({ id, text, level })
      }
      if (token.type === "blockquote_open") {
        // first inline of the quote: **Label** -> callout kind
        const inline = tokens[i + 2]
        const open = inline?.type === "inline" ? inline.children?.findIndex((c) => c.type === "strong_open") : -1
        const strong = open !== undefined && open >= 0 ? inline.children?.[open + 1] : undefined
        if (strong && open !== undefined && (open === 0 || inline.children?.slice(0, open).every((c) => c.content === ""))) {
          const kind = CALLOUTS[slugify(strong.content).replace(/-/g, " ")]
          if (kind) token.attrSet("class", `callout callout-${kind}`)
        }
      }
    }
    return true
  })

  return md
}

export type MarkdownEnv = { headings?: Heading[]; errors?: string[]; heroEager?: boolean; firstImageSeen?: boolean }

let instance: InstanceType<typeof MarkdownIt> | null = null
const markdown = () => (instance ??= createMarkdown())

export type Rendered = { html: string; headings: Heading[]; errors: string[]; text: string }

export function renderMarkdown(source: string, options: { heroEager?: boolean } = {}): Rendered {
  const env: MarkdownEnv = { errors: [], heroEager: options.heroEager }
  const html = markdown().render(source, env)
  return { html, headings: env.headings ?? [], errors: env.errors ?? [], text: htmlToText(html) }
}

export const renderInline = (source: string): string => markdown().renderInline(source)

const ENTITIES: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " }

export function htmlToText(html: string): string {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, " ")
    .trim()
}

/** Add ids to h2/h3 of CMS-authored HTML and return the headings for a TOC. Existing ids are kept. */
export function annotateHtmlHeadings(html: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = []
  const used = new Map<string, number>()
  const out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_m, lvl: string, attrs: string, inner: string) => {
    const text = htmlToText(inner)
    const existing = /\sid="([^"]+)"/i.exec(attrs)?.[1]
    let id = existing ?? (slugify(text) || "muc")
    if (!existing) {
      const seen = used.get(id) ?? 0
      used.set(id, seen + 1)
      if (seen > 0) id = `${id}-${seen + 1}`
    }
    headings.push({ id, text, level: Number(lvl) as 2 | 3 })
    return existing ? `<h${lvl}${attrs}>${inner}</h${lvl}>` : `<h${lvl}${attrs} id="${id}">${inner}</h${lvl}>`
  })
  return { html: out, headings }
}
