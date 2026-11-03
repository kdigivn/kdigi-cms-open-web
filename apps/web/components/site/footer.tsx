import Link from "next/link"

import { KdigiLockup } from "@/components/brand/logo"
import { getFooter } from "@/lib/ia"
import { KDIGI_URL } from "@/lib/site"

import { TransparencyToggle } from "./transparency-toggle"

const isExternal = (href: string) => /^https?:\/\//.test(href)

const linkClass = "inline-flex min-h-8 items-center text-sm text-ink-muted transition-colors hover:text-ink-foreground"

export function Footer() {
  const { columns, legal } = getFooter()
  return (
    <footer className="mt-8 bg-ink text-ink-foreground">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-14 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <a href={KDIGI_URL} rel="noopener" aria-label="KDIGI, kdigi.vn" className="inline-block shrink-0 self-start rounded-lg md:self-auto">
            <KdigiLockup onDark />
          </a>
          <p className="max-w-md text-[15px] leading-relaxed text-ink-muted md:text-right">
            KDIGI CMS là sản phẩm mã nguồn mở do KDIGI duy trì, xây trên Payload, Next.js và PostgreSQL.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-white/10 pt-10 sm:grid-cols-3 lg:grid-cols-5">
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h2 className="mb-3 text-sm font-semibold text-ink-foreground">
                {column.href ? (
                  <Link href={column.href} className="hover:underline hover:underline-offset-4">
                    {column.title}
                  </Link>
                ) : (
                  column.title
                )}
              </h2>
              <ul className="space-y-0.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={linkClass} {...(isExternal(link.href) ? { rel: "noopener" } : {})}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-ink-muted md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p>
              © {new Date().getFullYear()} KDIGI · Giấy phép MIT ·{" "}
              <a href={KDIGI_URL} rel="noopener" className="underline underline-offset-4 hover:text-ink-foreground">
                kdigi.vn
              </a>
            </p>
            {legal.length > 0 ? (
              <nav aria-label="Pháp lý">
                <ul className="flex flex-wrap gap-x-5 gap-y-1">
                  {legal.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="hover:text-ink-foreground hover:underline hover:underline-offset-4">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : null}
          </div>
          <div className="[&_button]:text-ink-muted [&_button:hover]:text-ink-foreground [&_span[data-on]]:border-white/40 [&_span[data-on=false]]:bg-transparent">
            <TransparencyToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}
