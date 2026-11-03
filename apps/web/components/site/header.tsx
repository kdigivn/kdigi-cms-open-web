import { ChevronDown } from "lucide-react"
import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { ButtonLink } from "@/components/ui/button"
import { getSiteNav } from "@/lib/ia"
import { GITHUB_URL } from "@/lib/site"

import { GitHubIcon } from "./icons"
import { MobileNav } from "./mobile-nav"
import { ThemeToggle } from "./theme-toggle"

const linkClass = "rounded-lg px-3 py-2 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"

/** Sticky glass header with a CSS-only mega menu (hover and focus-within, no client JS). Entries come from the published pages. */
export function Header() {
  const nav = getSiteNav()
  return (
    <header className="glass sticky top-3 z-40 mx-3 mt-3 h-[calc(var(--header-h)-12px)] rounded-full md:mx-auto md:w-[min(1180px,calc(100%-24px))]">
      <div className="flex h-full items-center gap-2 pr-2 pl-4 md:gap-4 md:pl-5">
        <Link href="/" aria-label="KDIGI CMS, trang chủ" className="rounded-lg">
          <Logo priority />
        </Link>
        <nav aria-label="Chính" className="mx-auto hidden items-center gap-0.5 lg:flex">
          {nav.groups.map((group) => (
            <div key={group.label} className="group relative">
              {group.href ? (
                <Link href={group.href} className={`${linkClass} inline-flex items-center gap-1`}>
                  {group.label}
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                </Link>
              ) : (
                <button type="button" className={`${linkClass} inline-flex items-center gap-1`} aria-haspopup="true">
                  {group.label}
                  <ChevronDown className="size-3.5" aria-hidden="true" />
                </button>
              )}
              <div className="invisible absolute top-full left-1/2 z-50 w-[min(560px,90vw)] -translate-x-1/2 pt-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <ul className="grid gap-1 rounded-3xl border border-border bg-popover p-3 shadow-lg sm:grid-cols-2">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="block rounded-xl px-3 py-2.5 hover:bg-accent">
                        <span className="block text-[15px] font-semibold text-foreground">{item.label}</span>
                        {item.description ? <span className="mt-0.5 line-clamp-2 block text-[13px] text-muted-foreground">{item.description}</span> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
          {nav.links.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass} {...(item.external ? { rel: "noopener" } : {})}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="KDIGI CMS trên GitHub"
            className="hidden size-10 items-center justify-center rounded-xl text-foreground hover:bg-accent md:inline-flex"
          >
            <GitHubIcon className="size-5" />
          </a>
          <ThemeToggle />
          <ButtonLink href={nav.cta.href} variant="brand" className="hidden md:inline-flex">
            {nav.cta.label}
          </ButtonLink>
          <MobileNav nav={nav} />
        </div>
      </div>
    </header>
  )
}
