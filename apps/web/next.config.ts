import { existsSync } from "node:fs"
import path from "node:path"
import type { NextConfig } from "next"

/** pnpm workspace root: standalone tracing must see `node_modules/.pnpm`, which lives above apps/web (server.js ends up in `.next/standalone/apps/web/`). */
function workspaceRoot(): string {
  let dir = process.cwd()
  for (;;) {
    if (existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) return process.cwd()
    dir = parent
  }
}

// `||`, not `??`: a Docker build ARG without a value arrives as an empty string and must fall back to the default too.
const DOCS_URL = (process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.opencms.kdigi.vn").replace(/\/+$/, "")
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://app.opencms.kdigi.vn").replace(/\/+$/, "")

/**
 * CSP (the "without nonces" policy of the Next.js CSP guide). Pages are static/ISR, so there is no per-request nonce, and the
 * App Router streams its flight data in inline scripts, which `script-src 'self'` alone blocks: the page then never hydrates
 * (measured: `script-src 'self'` + `experimental.sri` left `self.__next_f` undefined and the menu dead). Hence 'unsafe-inline'
 * for scripts, a recorded exception in MINDSET.md. Everything else is closed: same-origin scripts, no framing, no plugins,
 * images only from this origin and the CMS (post covers). Dev needs 'unsafe-eval' (React error stacks); production does not.
 */
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${APP_URL}`,
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ")

const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: CSP },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }] : []),
]

/**
 * Before the split, this host served the documentation (Astro Starlight). Those paths now live on the docs host:
 * `docs.opencms.kdigi.vn`. 301 so search engines transfer the old URLs; the path is kept 1:1 (locale prefix `/en/` included).
 * `/api/*` here is the app's own routes (health, cms/revalidate); only the former docs page `/api/rest-graphql` moved.
 */
const MOVED_TO_DOCS = ["/huong-dan", "/wordpress", "/tham-khao", "/pagefind", "/en", "/api/rest-graphql"]

/** Docs URLs end with `/` (Astro directory indexes): the first rule keeps it, so a crawler follows one hop instead of two. */
const movedToDocs = MOVED_TO_DOCS.flatMap((prefix) => [
  { source: `${prefix}/:path*/`, destination: `${DOCS_URL}${prefix}/:path*/`, statusCode: 301 as const },
  { source: `${prefix}/:path*`, destination: `${DOCS_URL}${prefix}/:path*`, statusCode: 301 as const },
])

const config: NextConfig = {
  poweredByHeader: false,
  output: "standalone",
  outputFileTracingRoot: workspaceRoot(),
  // Pages are read from content/pages at render time (ISR re-renders them on the server) and the OG card reads its fonts from disk.
  outputFileTracingIncludes: { "/**": ["./content/**/*", "./scripts/og-fonts/*.ttf"] },
  // Old docs URLs arrive with a trailing slash; let the redirect rules below see them as they are.
  skipTrailingSlashRedirect: true,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }]
  },
  async redirects() {
    return [
      ...movedToDocs,
      { source: "/sitemap-index.xml", destination: "/sitemap.xml", statusCode: 301 as const },
      { source: "/blog/rss.xml", destination: "/rss.xml", statusCode: 301 as const },
      { source: "/index.md", destination: `${DOCS_URL}/index.md`, statusCode: 301 as const },
      { source: "/og.png", destination: `${DOCS_URL}/og.png`, statusCode: 301 as const },
    ]
  },
}
export default config
