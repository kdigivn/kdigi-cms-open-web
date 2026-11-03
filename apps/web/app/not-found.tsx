import type { Metadata } from "next"
import Link from "next/link"

import { ButtonLink } from "@/components/ui/button"
import { getSiteNav } from "@/lib/ia"

export const metadata: Metadata = { title: "Không tìm thấy trang", robots: { index: false } }

export default function NotFound() {
  const nav = getSiteNav()
  const links = [...nav.groups.flatMap((group) => (group.href ? [{ label: group.label, href: group.href }] : [])), { label: "Blog", href: "/blog" }]
  return (
    <main id="main" tabIndex={-1} className="mx-auto flex min-h-[60dvh] max-w-xl flex-col items-center justify-center px-5 py-24 text-center">
      <p className="eyebrow mb-3">Lỗi 404</p>
      <h1 className="t-h2">Không tìm thấy trang này</h1>
      <p className="mt-3 text-muted-foreground">Đường dẫn có thể đã đổi hoặc trang đã được gỡ. Thử một trong các mục dưới đây.</p>
      <div className="mt-6 flex gap-3">
        <ButtonLink href="/" variant="brand">
          Về trang chủ
        </ButtonLink>
        <ButtonLink href="/blog" variant="outline">
          Xem blog
        </ButtonLink>
      </div>
      <ul className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[15px]">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-primary-strong underline underline-offset-4">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
