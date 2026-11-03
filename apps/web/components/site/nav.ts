import { DOCS_URL } from "@/lib/site"

export type NavItem = { label: string; href: string; external?: boolean }

/** Header navigation. Anchors start with `/` so they also work from /blog. */
export const NAV: NavItem[] = [
  { label: "Tính năng", href: "/#tinh-nang" },
  { label: "WordPress", href: "/#wordpress" },
  { label: "Tự host", href: "/#tu-host" },
  { label: "Demo", href: "/#demo" },
  { label: "Blog", href: "/blog" },
  { label: "Tài liệu", href: DOCS_URL, external: true },
]
