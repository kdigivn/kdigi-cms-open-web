import { childPages, type ContentPage, getContentPage, getContentPages } from "@/lib/content"
import { DEFAULT_ICON, type IconName } from "@/lib/icons"
import { DOCS_URL } from "@/lib/site"

/**
 * Information architecture. Navigation and hubs are derived from the files in content/pages: a route without a file is simply absent
 * (no menu entry, no sitemap line, 404 if typed). Only the fallback copy of the four section hubs lives here.
 */
export type Section = {
  route: string
  label: string
  /** Fallback hub copy, used only when the section has published children but no `index.md` of its own. */
  title: string
  description: string
  h1: string
  lead: string
}

export const SECTIONS: Section[] = [
  {
    route: "/tinh-nang",
    label: "Tính năng",
    title: "Tính năng KDIGI CMS: đa website, SEO, media, API",
    description:
      "Toàn bộ tính năng của KDIGI CMS theo nhóm: quản lý nhiều website, soạn thảo Markdown, SEO và JSON-LD, thư viện media, phân quyền, API headless và quy trình biên tập.",
    h1: "Tính năng của KDIGI CMS",
    lead: "KDIGI CMS gom quản lý nhiều website, soạn thảo, SEO, media, phân quyền và API headless vào một trang quản trị. Mỗi trang dưới đây giải thích một nhóm tính năng.",
  },
  {
    route: "/giai-phap",
    label: "Giải pháp",
    title: "Giải pháp KDIGI CMS cho agency, doanh nghiệp, blog",
    description:
      "Cách dùng KDIGI CMS theo từng mô hình: agency quản lý nhiều website khách hàng, website doanh nghiệp, blog tin tức và website bán hàng, kèm cấu hình khuyến nghị",
    h1: "Giải pháp theo từng mô hình website",
    lead: "Mỗi mô hình website cần một cách thiết lập khác nhau. Chọn mô hình gần nhất để xem cấu hình KDIGI CMS khuyến nghị.",
  },
  {
    route: "/so-sanh",
    label: "So sánh",
    title: "So sánh KDIGI CMS với WordPress, Strapi, Payload",
    description:
      "So sánh KDIGI CMS với WordPress, Strapi, Payload, Ghost và Directus: mô hình dữ liệu, SEO, đa website, tự host và khi nào nên chọn từng giải pháp, có dẫn nguồn.",
    h1: "So sánh KDIGI CMS với các CMS khác",
    lead: "Các bài so sánh dưới đây nêu cả điểm mạnh lẫn giới hạn của KDIGI CMS, kèm tiêu chí chọn và nguồn dẫn chiếu cho thông tin về đối thủ.",
  },
  {
    route: "/thuc-hanh-tot",
    label: "Thực hành tốt",
    title: "Thực hành tốt khi vận hành website bằng KDIGI CMS",
    description:
      "Hướng dẫn thực hành tốt khi dùng KDIGI CMS: SEO on-page, cấu trúc nội dung và phân loại, checklist chuyển đổi, bảo mật phân quyền, hiệu năng, sao lưu và nâng cấp.",
    h1: "Thực hành tốt với KDIGI CMS",
    lead: "Các hướng dẫn ngắn, có thể làm theo từng bước, dựa trên cách KDIGI CMS thực sự hoạt động.",
  },
]

export const sectionOf = (route: string): Section | undefined => SECTIONS.find((section) => section.route === route)

/** CMS-authored legal/about pages the site renders when no repo file claims the slug. */
export const CMS_FALLBACK_SLUGS = ["gioi-thieu", "dieu-khoan", "quyen-rieng-tu"] as const

export const routeExists = (route: string): boolean =>
  getContentPage(route) !== null ||
  CMS_FALLBACK_SLUGS.some((slug) => route === `/${slug}`) ||
  (sectionOf(route) !== undefined && childPages(route).length > 0)

export type NavLink = { label: string; href: string; description?: string; external?: boolean; icon?: IconName }
export type NavGroup = { label: string; href: string | null; items: NavLink[] }
export type SiteNav = { groups: NavGroup[]; links: NavLink[]; cta: NavLink }

const pageLink = (page: ContentPage): NavLink => ({ label: page.navTitle, href: page.route, description: page.description, icon: page.icon ?? DEFAULT_ICON })

function sectionGroup(section: Section): NavGroup | null {
  const items = childPages(section.route).map(pageLink)
  if (items.length === 0 && !getContentPage(section.route)) return null
  return { label: section.label, href: routeExists(section.route) ? section.route : null, items }
}

function singles(routes: string[]): NavLink[] {
  return routes.flatMap((route) => {
    const page = getContentPage(route)
    return page ? [pageLink(page)] : []
  })
}

/** Header mega-menu groups, plain links and the CTA; also used by the mobile menu. */
export function getSiteNav(): SiteNav {
  const groups = SECTIONS.flatMap((section) => sectionGroup(section) ?? [])
  const resources = singles(["/chuyen-tu-wordpress", "/tu-host", "/phat-hanh", "/ma-nguon-mo"])
  const links: NavLink[] = [
    { label: "Blog", href: "/blog" },
    { label: "Tài liệu", href: DOCS_URL, external: true },
  ]
  const demo = getContentPage("/demo")
  return {
    groups: [
      ...groups,
      ...(resources.length ? [{ label: "Tài nguyên", href: null, items: resources }] : []),
    ],
    links,
    cta: demo ? { label: "Dùng thử demo", href: "/demo" } : { label: "Dùng thử demo", href: "/#demo" },
  }
}

export type FooterColumn = { title: string; href: string | null; links: NavLink[] }
export type FooterData = { columns: FooterColumn[]; legal: NavLink[] }

/** Footer: one column per section (heading links to the hub) + "Tài nguyên"; legal pages go in the bottom bar. */
export function getFooter(): FooterData {
  const columns: FooterColumn[] = []
  for (const section of SECTIONS) {
    const group = sectionGroup(section)
    if (!group) continue
    columns.push({ title: section.label, href: group.href, links: group.items })
  }
  columns.push({
    title: "Tài nguyên",
    href: null,
    links: [
      ...singles(["/chuyen-tu-wordpress", "/tu-host", "/demo", "/ma-nguon-mo", "/phat-hanh"]),
      { label: "Blog", href: "/blog" },
      { label: "Tài liệu", href: DOCS_URL, external: true },
    ],
  })
  const legalLabels: Record<string, string> = {
    "/gioi-thieu": "Giới thiệu",
    "/lien-he": "Liên hệ",
    "/dieu-khoan": "Điều khoản",
    "/quyen-rieng-tu": "Quyền riêng tư",
  }
  const legal = Object.entries(legalLabels)
    .filter(([route]) => routeExists(route))
    .map(([route, label]) => ({ label, href: route }))
  return { columns, legal }
}

export type Crumb = { name: string; path: string }

/** Home > ancestors that exist > the page itself. A missing intermediate hub is skipped, never linked. */
export function breadcrumbTrail(route: string, ownName: string): Crumb[] {
  const trail: Crumb[] = [{ name: "Trang chủ", path: "/" }]
  const parts = route.split("/").filter(Boolean)
  for (let i = 1; i < parts.length; i++) {
    const ancestor = `/${parts.slice(0, i).join("/")}`
    const page = getContentPage(ancestor)
    const section = sectionOf(ancestor)
    if (page && routeExists(ancestor)) trail.push({ name: page.navTitle, path: ancestor })
    else if (section && routeExists(ancestor)) trail.push({ name: section.label, path: ancestor })
  }
  trail.push({ name: ownName, path: route })
  return trail
}

/** Manual `related` first, then siblings under the same parent, then the parent's other children; never the page itself. */
export function relatedPages(page: ContentPage, limit = 4): ContentPage[] {
  const picked: ContentPage[] = []
  const add = (candidate: ContentPage | null) => {
    if (candidate && candidate.route !== page.route && !picked.some((p) => p.route === candidate.route)) picked.push(candidate)
  }
  for (const route of page.related) add(getContentPage(route))
  const parent = page.route.split("/").slice(0, -1).join("/") || "/"
  if (parent !== "/") for (const sibling of childPages(parent)) add(sibling)
  return picked.slice(0, limit)
}

/** Every route the site can serve from repo content, including auto hubs. */
export function allContentRoutes(): string[] {
  const routes = new Set(getContentPages().map((page) => page.route))
  for (const section of SECTIONS) if (routeExists(section.route)) routes.add(section.route)
  return [...routes]
}
