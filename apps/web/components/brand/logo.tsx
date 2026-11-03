import Image from "next/image"

import { cn } from "@/lib/utils"

/** KDIGI mark (official asset, always logo blue) + the product name set in HTML so it uses the site font. */
export function Logo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} translate="no">
      <Image src="/brand/kdigi-mark.svg" width={74} height={74} alt="" aria-hidden="true" priority={priority} className="size-8" unoptimized />
      <span className="font-display text-[19px] font-bold tracking-tight text-foreground">KDIGI CMS</span>
    </span>
  )
}

/** Official KDIGI lockup (K + wordmark + tagline). `onDark` swaps to the white file. */
export function KdigiLockup({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  return (
    <Image
      src={onDark ? "/brand/kdigi-logo-white.svg" : "/brand/kdigi-logo.svg"}
      width={296}
      height={78}
      alt="KDIGI, Aspire to Digital Innovation"
      className={cn("h-11 w-auto", className)}
      unoptimized
    />
  )
}
