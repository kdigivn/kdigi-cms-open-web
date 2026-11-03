import Image from "next/image"

import manifest from "@/public/screenshots/manifest.json"
import { cn } from "@/lib/utils"

export type ShotName = keyof typeof manifest

/**
 * Real screenshot of the live KDIGI CMS admin, shown in a browser frame. Files are WebP exports of
 * `opencms-shots/*.png` made by scripts/optimize-shots.py, with their pixel size in manifest.json (so the box is reserved: no layout shift).
 */
export function Shot({
  name,
  alt,
  url = "app.opencms.kdigi.vn/admin",
  priority = false,
  sizes,
  className,
}: {
  name: ShotName
  alt: string
  url?: string
  priority?: boolean
  sizes?: string
  className?: string
}) {
  const entry = manifest[name]
  return (
    <figure
      className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-lg [contain:paint]", className)}
    >
      <div aria-hidden="true" className="flex h-9 items-center gap-3 border-b border-border bg-secondary px-3.5">
        <span className="flex gap-1.5">
          <i className="size-2.5 rounded-full bg-[#ff5f57]" />
          <i className="size-2.5 rounded-full bg-[#febc2e]" />
          <i className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="min-w-0 flex-1 truncate rounded-md bg-card px-3 py-0.5 text-center text-xs text-muted-foreground">{url}</span>
      </div>
      <Image
        src={`/screenshots/${name}.webp`}
        width={entry.w}
        height={entry.h}
        alt={alt}
        priority={priority}
        unoptimized
        sizes={sizes}
        className="block h-auto w-full"
      />
    </figure>
  )
}
