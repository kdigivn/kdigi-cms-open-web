#!/usr/bin/env node
/**
 * check:seo: crawl the built site locally and fail on SEO/AIO/GEO regressions.
 *
 *   pnpm build && pnpm check:seo            starts `next start` on a free port and crawls it
 *   pnpm check:seo --url http://localhost:3000   crawl an already running server
 *
 * Fails (exit 1) on: missing/duplicate/overlong <title>, missing/duplicate/out-of-range meta description (140-160), missing or
 * multiple H1, missing/wrong canonical, missing OG/Twitter tags or unreachable og:image, lang != vi, <img> without alt or size,
 * JSON-LD that does not parse / has an unknown @type / lacks required fields / FAQPage not visible, broken internal links,
 * sitemap URLs that do not return 200, and orphan pages (in the sitemap but not reachable by links from `/`).
 */
import { spawn } from "node:child_process"
import { createServer } from "node:net"
import path from "node:path"
import process from "node:process"
import { setTimeout as sleep } from "node:timers/promises"

const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || "https://cms.kdigi.vn").replace(/\/+$/, "")
const CMS_ORIGIN = (process.env.NEXT_PUBLIC_APP_URL || "https://app.cms.kdigi.vn").replace(/\/+$/, "")
const TITLE_MAX = 60
const DESC_MIN = 140
const DESC_MAX = 160
const ALLOWED_TYPES = new Set([
  "Organization",
  "WebSite",
  "WebPage",
  "SoftwareApplication",
  "BreadcrumbList",
  "ListItem",
  "FAQPage",
  "Question",
  "Answer",
  "ItemList",
  "CollectionPage",
  "AboutPage",
  "ContactPage",
  "TechArticle",
  "BlogPosting",
  "Person",
  "Offer",
  "ImageObject",
])

const args = process.argv.slice(2)
const urlArg = args.includes("--url") ? args[args.indexOf("--url") + 1] : null

const failures = []
const fail = (page, message) => failures.push(`${page}: ${message}`)

const freePort = () =>
  new Promise((resolve, reject) => {
    const server = createServer()
    server.listen(0, () => {
      const { port } = server.address()
      server.close(() => resolve(port))
    })
    server.on("error", reject)
  })

async function startServer() {
  const port = await freePort()
  const child = spawn(path.join("node_modules", ".bin", "next"), ["start", "-p", String(port)], { stdio: ["ignore", "pipe", "pipe"], env: { ...process.env, NODE_ENV: "production" } })
  let log = ""
  child.stdout.on("data", (d) => (log += d))
  child.stderr.on("data", (d) => (log += d))
  const base = `http://127.0.0.1:${port}`
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(`${base}/api/health`)).ok) return { base, stop: () => child.kill("SIGTERM") }
    } catch {
      /* not up yet */
    }
    await sleep(500)
  }
  child.kill("SIGTERM")
  throw new Error(`next start did not become ready:\n${log}`)
}

const decode = (text) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
    .replace(/&nbsp;/g, " ")

const attrs = (tag) => {
  const out = {}
  for (const m of tag.matchAll(/([a-zA-Z:-]+)(?:="([^"]*)"|='([^']*)')?/g)) out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? "")
  return out
}

const metaOf = (html, key) => {
  for (const m of html.matchAll(/<meta\s+([^>]*?)\/?>/gi)) {
    const a = attrs(m[1])
    if ((a.name === key || a.property === key) && a.content !== undefined) return a.content
  }
  return null
}

const textOf = (html) =>
  decode(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " "),
  )

/** Internal path of an href, or null for external / non-navigational links. */
function internalPath(href, from) {
  if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(href)) return null
  let url
  try {
    url = new URL(href, `${SITE_ORIGIN}${from}`)
  } catch {
    return null
  }
  if (url.origin !== SITE_ORIGIN) return null
  return url.pathname + url.search
}

function checkJsonLd(page, html) {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1])
  if (blocks.length === 0) fail(page, "no JSON-LD")
  const nodes = []
  for (const raw of blocks) {
    let data
    try {
      data = JSON.parse(raw)
    } catch (error) {
      fail(page, `JSON-LD does not parse: ${error.message}`)
      continue
    }
    const list = Array.isArray(data["@graph"]) ? data["@graph"] : [data]
    nodes.push(...list)
  }
  const types = (node) => (Array.isArray(node["@type"]) ? node["@type"] : node["@type"] ? [node["@type"]] : [])
  const visible = textOf(html)
  const walk = (node) => {
    if (!node || typeof node !== "object") return
    if (Array.isArray(node)) return node.forEach(walk)
    for (const type of types(node)) if (!ALLOWED_TYPES.has(type)) fail(page, `JSON-LD has unknown @type "${type}"`)
    const t = types(node)
    if (t.includes("FAQPage")) {
      const questions = node.mainEntity ?? []
      if (questions.length === 0) fail(page, "FAQPage without questions")
      for (const q of questions) {
        if (!q.name || !q.acceptedAnswer?.text) fail(page, "FAQPage question without name/acceptedAnswer.text")
        else if (!visible.includes(q.name)) fail(page, `FAQPage question is not visible on the page: "${q.name}"`)
      }
    }
    if (t.includes("BreadcrumbList")) {
      const items = node.itemListElement ?? []
      items.forEach((item, index) => {
        if (item.position !== index + 1 || !item.name || !item.item) fail(page, `BreadcrumbList item ${index + 1} needs sequential position, name and item`)
      })
    }
    if (t.includes("BlogPosting") || t.includes("TechArticle")) {
      for (const key of ["headline", "datePublished", "dateModified", "author", "image"]) if (!node[key]) fail(page, `${t[0]} lacks ${key}`)
    }
    if (t.includes("SoftwareApplication")) {
      for (const key of ["name", "applicationCategory", "offers"]) if (!node[key]) fail(page, `SoftwareApplication lacks ${key}`)
    }
    if (t.includes("Organization") && !node.name) fail(page, "Organization lacks name")
    if (t.includes("WebSite") && (!node.name || !node.url)) fail(page, "WebSite lacks name/url")
    if (t.includes("Person") && !node.name) fail(page, "Person lacks name")
    if (t.includes("ItemList") && !Array.isArray(node.itemListElement)) fail(page, "ItemList lacks itemListElement")
    for (const value of Object.values(node)) if (value && typeof value === "object") walk(value)
  }
  nodes.forEach(walk)
}

async function main() {
  const server = urlArg ? { base: urlArg.replace(/\/+$/, ""), stop: () => {} } : await startServer()
  const { base } = server
  const statusCache = new Map()
  const status = async (p) => {
    if (!statusCache.has(p)) {
      const res = await fetch(`${base}${p}`, { redirect: "follow" }).catch(() => null)
      statusCache.set(p, res ? res.status : 0)
      await res?.body?.cancel()
    }
    return statusCache.get(p)
  }

  try {
    const sitemapRes = await fetch(`${base}/sitemap.xml`)
    if (!sitemapRes.ok) throw new Error(`/sitemap.xml answered ${sitemapRes.status}`)
    const sitemapPaths = [...(await sitemapRes.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(decode(m[1])).pathname)
    if (sitemapPaths.length === 0) fail("/sitemap.xml", "no URLs")

    // BFS over anchors from `/`: reachability (orphans) + the set of pages to inspect.
    const reachable = new Set(["/"])
    const queue = ["/"]
    const pages = new Map()
    while (queue.length) {
      const p = queue.shift()
      const res = await fetch(`${base}${p}`, { redirect: "follow" }).catch(() => null)
      if (!res || !res.ok) {
        fail(p, `status ${res ? res.status : "unreachable"}`)
        continue
      }
      if (!(res.headers.get("content-type") ?? "").includes("text/html")) continue
      const html = await res.text()
      pages.set(p, html)
      for (const m of html.matchAll(/<a\s+([^>]*)>/gi)) {
        const target = internalPath(attrs(m[1]).href, p)
        if (!target) continue
        const clean = target.split("#")[0].split("?")[0]
        if (/\.(xml|txt|png|jpe?g|webp|svg|ico|woff2?)$/i.test(clean) || clean.startsWith("/_next") || clean.startsWith("/api/")) continue
        if (!reachable.has(clean)) {
          reachable.add(clean)
          queue.push(clean)
        }
      }
    }
    for (const p of sitemapPaths) {
      if (!pages.has(p)) {
        const res = await fetch(`${base}${p}`).catch(() => null)
        if (!res || !res.ok) fail(p, `in sitemap but status ${res ? res.status : "unreachable"}`)
        else pages.set(p, await res.text())
      }
      if (!reachable.has(p) && p !== "/") fail(p, "orphan page: in the sitemap but no link reaches it from /")
    }

    const titles = new Map()
    const descriptions = new Map()
    for (const [p, html] of pages) {
      const robots = metaOf(html, "robots") ?? ""
      if (/noindex/i.test(robots)) continue
      const url = `${SITE_ORIGIN}${p === "/" ? "" : p}`

      const titleTags = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)]
      if (titleTags.length !== 1) fail(p, `${titleTags.length} <title> tags`)
      const title = decode(titleTags[0]?.[1] ?? "").trim()
      if (!title) fail(p, "empty title")
      if (title.length > TITLE_MAX) fail(p, `title ${title.length} chars > ${TITLE_MAX}: "${title}"`)
      if (titles.has(title)) fail(p, `duplicate title with ${titles.get(title)}: "${title}"`)
      titles.set(title, p)

      const description = metaOf(html, "description")
      if (!description) fail(p, "missing meta description")
      else {
        if (description.length < DESC_MIN || description.length > DESC_MAX) fail(p, `meta description ${description.length} chars, want ${DESC_MIN}-${DESC_MAX}`)
        if (descriptions.has(description)) fail(p, `duplicate meta description with ${descriptions.get(description)}`)
        descriptions.set(description, p)
      }

      const h1s = [...html.matchAll(/<h1[\s>]/gi)].length
      if (h1s !== 1) fail(p, `${h1s} <h1> elements, want 1`)

      const canonical = [...html.matchAll(/<link\s+([^>]*?)\/?>/gi)].map((m) => attrs(m[1])).find((a) => a.rel === "canonical")
      if (!canonical?.href) fail(p, "missing canonical")
      else if (canonical.href.replace(/\/$/, "") !== url) fail(p, `canonical ${canonical.href} != ${url}`)

      if (!/<html[^>]*\blang="vi"/i.test(html)) fail(p, 'html lang is not "vi"')
      for (const key of ["og:title", "og:description", "og:image", "og:url", "twitter:card", "twitter:image"]) if (!metaOf(html, key)) fail(p, `missing ${key}`)
      const ogImage = metaOf(html, "og:image")
      if (ogImage) {
        const target = internalPath(ogImage, p)
        if (target) {
          if ((await status(target)) !== 200) fail(p, `og:image ${target} answered ${await status(target)}`)
        } else if (ogImage.startsWith(CMS_ORIGIN)) {
          const res = await fetch(ogImage).catch(() => null)
          await res?.body?.cancel()
          if (!res?.ok) fail(p, `og:image ${ogImage} answered ${res ? res.status : "unreachable"}`)
        } else fail(p, `og:image is not on this site or the CMS: ${ogImage}`)
      }

      for (const m of html.matchAll(/<img\s+([^>]*?)\/?>/gi)) {
        const a = attrs(m[1])
        const where = (a.src ?? "").slice(0, 80)
        if (!("alt" in a)) fail(p, `<img> without alt: ${where}`)
        else if (a.alt === "" && a["aria-hidden"] !== "true" && a.role !== "presentation") fail(p, `<img> with empty alt and no aria-hidden: ${where}`)
        if (!a.width || !a.height) if (!/\bfill\b|data-nimg="fill"/.test(m[1]) && a["data-nimg"] !== "fill") fail(p, `<img> without width/height: ${where}`)
      }

      checkJsonLd(p, html)

      for (const m of html.matchAll(/<a\s+([^>]*)>/gi)) {
        const target = internalPath(attrs(m[1]).href, p)
        if (!target) continue
        const clean = target.split("#")[0]
        if (clean === "" || clean.startsWith("/_next")) continue
        const code = await status(clean)
        if (code !== 200) fail(p, `broken internal link ${clean} (${code})`)
      }
    }

    for (const endpoint of ["/robots.txt", "/llms.txt", "/llms-full.txt", "/rss.xml"]) {
      if ((await status(endpoint)) !== 200) fail(endpoint, `status ${await status(endpoint)}`)
    }
    const robotsTxt = await (await fetch(`${base}/robots.txt`)).text()
    for (const bot of ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot"]) {
      if (!robotsTxt.includes(`User-Agent: ${bot}`)) fail("/robots.txt", `no rule for ${bot}`)
    }
    process.stdout.write(`check:seo crawled ${pages.size} pages, ${sitemapPaths.length} in sitemap\n`)
  } finally {
    server.stop()
  }
}

try {
  await main()
} catch (error) {
  failures.push(`crawl: ${error.message}`)
}

if (failures.length) {
  process.stderr.write(`check:seo FAILED (${failures.length})\n${failures.map((f) => `  - ${f}`).join("\n")}\n`)
  process.exit(1)
}
process.stdout.write("check:seo OK\n")
