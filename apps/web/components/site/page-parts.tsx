import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react"
import Link from "next/link"

import type { Crumb } from "@/lib/ia"
import type { Heading } from "@/lib/markdown"

import { formatDate } from "./post-card"

export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Đường dẫn" className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[14px] text-muted-foreground">
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1
          return (
            <li key={crumb.path} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {crumb.name}
                </span>
              ) : (
                <Link href={crumb.path} className="rounded hover:text-foreground hover:underline">
                  {crumb.name}
                </Link>
              )}
              {last ? null : <ChevronRight className="size-3.5" aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** "Mục lục" box; rendered only when the page has at least three H2/H3 headings. */
export function Toc({ headings }: { headings: Heading[] }) {
  if (headings.length < 3) return null
  return (
    <nav aria-label="Mục lục" className="rounded-2xl border border-border bg-card p-5 text-[15px]">
      <p className="mb-2 font-display text-base font-bold">Mục lục</p>
      <ol className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "pl-4" : undefined}>
            <a href={`#${heading.id}`} className="inline-flex min-h-8 items-center text-muted-foreground hover:text-primary-strong hover:underline">
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function UpdatedLine({ updated, className }: { updated: string; className?: string }) {
  return (
    <p className={className ?? "text-[14px] text-muted-foreground"}>
      Cập nhật lần cuối: <time dateTime={updated}>{formatDate(updated)}</time>
    </p>
  )
}

export type FaqRow = { q: string; aHtml: string }

/** Visible FAQ (native <details>, no client JS). The matching FAQPage JSON-LD is emitted by the page from the same entries. */
export function FaqBlock({ entries }: { entries: FaqRow[] }) {
  if (entries.length === 0) return null
  return (
    <section aria-labelledby="hoi-dap-title" className="mt-14">
      <h2 id="hoi-dap-title" className="font-display text-[clamp(22px,2.4vw,28px)] font-bold">
        Câu hỏi thường gặp
      </h2>
      <div className="mt-5 space-y-3">
        {entries.map((entry) => (
          <details key={entry.q} className="group rounded-2xl border border-border bg-card shadow-sm open:shadow-md">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-3.5 text-base font-semibold [&::-webkit-details-marker]:hidden">
              <h3 className="text-base font-semibold">{entry.q}</h3>
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="blog-prose px-5 pb-5 !text-[16px]" dangerouslySetInnerHTML={{ __html: entry.aHtml }} />
          </details>
        ))}
      </div>
    </section>
  )
}

export type CardItem = { href: string; title: string; description: string }

/** Grid of internal links with title + description: hub listings and "Đọc tiếp". */
export function CardGrid({ items, headingLevel = 3 }: { items: CardItem[]; headingLevel?: 2 | 3 }) {
  const Tag = `h${headingLevel}` as const
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <Tag className="text-lg leading-snug font-semibold text-foreground group-hover:text-primary-strong">{item.title}</Tag>
            <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">{item.description}</p>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function DocsLink({ href, label = "Đọc tài liệu kỹ thuật tương ứng" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      rel="noopener"
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-4 text-[15px] font-medium text-primary-strong hover:bg-accent"
    >
      {label}
      <ExternalLink className="size-4" aria-hidden="true" />
    </a>
  )
}
