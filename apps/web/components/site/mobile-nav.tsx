"use client"

import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useId, useState } from "react"

import { Button, ButtonLink } from "@/components/ui/button"
import { DEMO } from "@/lib/site"

import { NAV } from "./nav"

/** Phone menu: a full-width panel under the header. Esc and any link close it; the page behind does not scroll while it is open. */
export function MobileNav() {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.documentElement.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.documentElement.style.overflow = ""
    }
  }, [open])

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? "Đóng menu" : "Mở menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </Button>
      {open ? (
        <nav
          id={panelId}
          aria-label="Menu chính"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-[calc(100dvh-var(--header-h)-24px)] overflow-y-auto rounded-3xl border bg-popover p-3 shadow-lg"
        >
          <ul className="flex flex-col">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center rounded-xl px-4 text-base font-medium hover:bg-accent"
                  {...(item.external ? { rel: "noopener" } : {})}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink href={DEMO.adminUrl} variant="brand" size="lg" external className="mt-2 w-full">
            Dùng thử bản demo
          </ButtonLink>
        </nav>
      ) : null}
    </div>
  )
}
