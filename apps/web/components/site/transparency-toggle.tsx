"use client"

import { useSyncExternalStore } from "react"

const KEY = "kdigi-transparency"
const listeners = new Set<() => void>()

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
const read = () => document.documentElement.dataset.transparency === "reduced"

/** "Giảm độ trong suốt" (design system MUST): turns glass into solid surfaces. The saved value is applied early by /boot.js. */
export function TransparencyToggle() {
  const reduced = useSyncExternalStore(subscribe, read, () => false)
  const toggle = () => {
    const next = !read()
    if (next) document.documentElement.dataset.transparency = "reduced"
    else delete document.documentElement.dataset.transparency
    try {
      if (next) localStorage.setItem(KEY, "reduced")
      else localStorage.removeItem(KEY)
    } catch {
      /* storage blocked: the choice lasts until reload */
    }
    listeners.forEach((cb) => cb())
  }
  return (
    <button
      type="button"
      role="switch"
      aria-checked={reduced}
      onClick={toggle}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm text-muted-foreground hover:text-foreground md:min-h-0"
    >
      <span
        aria-hidden="true"
        className="relative inline-block h-5 w-9 rounded-full border border-input bg-card transition-colors data-[on=true]:bg-primary"
        data-on={reduced}
      >
        <span
          className="absolute top-0.5 left-0.5 size-3.5 rounded-full bg-muted-foreground transition-transform data-[on=true]:translate-x-4 data-[on=true]:bg-primary-foreground"
          data-on={reduced}
        />
      </span>
      Giảm độ trong suốt
    </button>
  )
}
