import Image from "next/image"

import manifest from "@/public/illustrations/manifest.json"
import { cn } from "@/lib/utils"

export type IllustrationName = keyof typeof manifest

type IllustrationProps = {
  name: IllustrationName
  className?: string
  /** Decorative use: empty alt + aria-hidden (default false: the manifest alt text is used). */
  decorative?: boolean
  priority?: boolean
  sizes?: string
}

/**
 * Pre-rendered 3D "clay + glass" illustration (Codex image_gen, keyed to transparent WebP by illustrations-src/process.py).
 * Width/height/alt come from public/illustrations/manifest.json, so the box is reserved before the image loads (no layout shift).
 * A key missing from the manifest fails the type check and the build: no silent placeholders.
 */
export function Illustration({ name, className, decorative = false, priority = false, sizes }: IllustrationProps) {
  const entry = manifest[name]
  return (
    <Image
      src={`/illustrations/${name}.webp`}
      width={entry.w}
      height={entry.h}
      alt={decorative ? "" : entry.alt}
      aria-hidden={decorative || undefined}
      priority={priority}
      unoptimized
      sizes={sizes}
      draggable={false}
      className={cn("h-auto w-full select-none", className)}
    />
  )
}
