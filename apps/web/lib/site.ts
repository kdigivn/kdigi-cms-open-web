/** Public constants of the homepage. Hosts come from the build environment (NEXT_PUBLIC_*), defaults are production. */

const trimSlash = (url: string): string => url.replace(/\/+$/, "")

export const SITE_URL = trimSlash(process.env.NEXT_PUBLIC_SITE_URL || "https://opencms.kdigi.vn")
export const DOCS_URL = trimSlash(process.env.NEXT_PUBLIC_DOCS_URL || "https://docs.opencms.kdigi.vn")
export const APP_URL = trimSlash(process.env.NEXT_PUBLIC_APP_URL || "https://app.opencms.kdigi.vn")

export const GITHUB_URL = "https://github.com/kdigivn/kdigi-cms-open"
export const KDIGI_URL = "https://kdigi.vn"

export const SITE_NAME = "KDIGI CMS"
export const SITE_TITLE = "KDIGI CMS: CMS headless AI-native mã nguồn mở"
export const SITE_DESCRIPTION =
  "KDIGI CMS là CMS headless AI-native, mã nguồn mở (MIT): nhiều website trong một trang quản trị, AI agent viết và đăng bài qua MCP với đúng quyền người dùng, soạn Markdown, SEO và JSON-LD sẵn, chuyển từ WordPress, tự host bằng Docker."

/** Public demo account (role editor, can only touch the `demo` site; content is reset nightly). */
export const DEMO = {
  adminUrl: `${APP_URL}/admin`,
  email: "demo@opencms.kdigi.vn",
  password: "Demo@2026",
} as const

/**
 * Sample websites: the same CMS site (`showcase`) rendered by six frameworks with one shared UI.
 * Hosted on Cloudflare Workers, noindex; source in the private repo kdigivn/kdigi-cms-showcase.
 */
export const SHOWCASE_SITES = [
  { framework: "Next.js", url: "https://kcms-nextjs.system-efc.workers.dev" },
  { framework: "Astro", url: "https://kcms-astro.system-efc.workers.dev" },
  { framework: "SvelteKit", url: "https://kcms-sveltekit.system-efc.workers.dev" },
  { framework: "Nuxt", url: "https://kcms-nuxt.system-efc.workers.dev" },
  { framework: "React", url: "https://kcms-react.system-efc.workers.dev" },
  { framework: "Angular", url: "https://kcms-angular.system-efc.workers.dev" },
] as const

export const docsLinks = {
  home: DOCS_URL,
  quickstart: `${DOCS_URL}/huong-dan/bat-dau-nhanh/`,
  docker: `${DOCS_URL}/huong-dan/cai-dat-docker/`,
  coolify: `${DOCS_URL}/huong-dan/trien-khai-coolify/`,
  wordpress: `${DOCS_URL}/wordpress/di-chuyen-tu-wordpress/`,
  api: `${DOCS_URL}/api/rest-graphql/`,
  multiSite: `${DOCS_URL}/huong-dan/nhieu-website/`,
  markdown: `${DOCS_URL}/huong-dan/soan-thao-markdown/`,
  seo: `${DOCS_URL}/huong-dan/seo-json-ld/`,
  media: `${DOCS_URL}/huong-dan/thu-vien-media/`,
  roles: `${DOCS_URL}/huong-dan/vai-tro-phan-quyen/`,
  aiAgents: `${DOCS_URL}/huong-dan/ai-agent-mcp/`,
} as const

export const absoluteUrl = (path: string): string => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path === "/" ? "" : path}`)
