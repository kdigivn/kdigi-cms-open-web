import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { ButtonLink } from "@/components/ui/button"
import { GITHUB_URL } from "@/lib/site"

import { GitHubIcon } from "./icons"
import { MobileNav } from "./mobile-nav"
import { NAV } from "./nav"
import { ThemeToggle } from "./theme-toggle"

/** Sticky glass header (the frame is glass, the content under it is not). Fixed height = no layout shift. */
export function Header() {
  return (
    <header className="glass sticky top-3 z-40 mx-3 mt-3 h-[calc(var(--header-h)-12px)] rounded-full md:mx-auto md:w-[min(1180px,calc(100%-24px))]">
      <div className="flex h-full items-center gap-2 pr-2 pl-4 md:gap-4 md:pl-5">
        <Link href="/" aria-label="KDIGI CMS, trang chủ" className="rounded-lg">
          <Logo priority />
        </Link>
        <nav aria-label="Chính" className="mx-auto hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              {...(item.external ? { rel: "noopener" } : {})}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1 md:ml-0">
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
          <ButtonLink href="/#demo" variant="brand" className="hidden md:inline-flex">
            Dùng thử demo
          </ButtonLink>
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
