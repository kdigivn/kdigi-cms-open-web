import Link from "next/link"

import { KdigiLockup } from "@/components/brand/logo"
import { getFooterColumns } from "@/lib/ia"
import { KDIGI_URL } from "@/lib/site"

import { TransparencyToggle } from "./transparency-toggle"

const isExternal = (href: string) => /^https?:\/\//.test(href)

export function Footer() {
  const COLUMNS = getFooterColumns()
  return (
    <footer className="mt-8 bg-ink text-ink-foreground">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <a href={KDIGI_URL} rel="noopener" aria-label="KDIGI, kdigi.vn" className="inline-block rounded-lg">
              <KdigiLockup onDark />
            </a>
            <p className="mt-4 max-w-xs text-[15px] leading-relaxed text-ink-muted">
              KDIGI CMS là sản phẩm mã nguồn mở do KDIGI duy trì, xây trên Payload, Next.js và PostgreSQL.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-3 text-sm font-semibold text-ink-foreground">{column.title}</h2>
              <ul className="space-y-1">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-9 items-center text-[15px] text-ink-muted transition-colors hover:text-ink-foreground"
                      {...(isExternal(link.href) ? { rel: "noopener" } : {})}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} KDIGI. Phát hành theo giấy phép MIT.{" "}
            <a href={KDIGI_URL} rel="noopener" className="underline underline-offset-4 hover:text-ink-foreground">
              kdigi.vn
            </a>
          </p>
          <div className="[&_button]:text-ink-muted [&_button:hover]:text-ink-foreground [&_span[data-on]]:border-white/40 [&_span[data-on=false]]:bg-transparent">
            <TransparencyToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}
