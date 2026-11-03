import { existsSync } from "node:fs"
import path from "node:path"

import type { Metadata } from "next"

import { publicImageSize } from "@/lib/markdown"
import { absoluteUrl, SITE_NAME } from "@/lib/site"

export type SeoInput = {
  /** Final `<title>` text (no suffix is appended). */
  title: string
  description: string
  route: string
  /** Absolute URL or `/images/...` path of a 1200x630 image; falls back to `public/images/og/<route-key>.webp`, then the dynamic `/og/...` route. */
  image?: { url: string; width?: number; height?: number; alt?: string } | string | null
  type?: "website" | "article"
  publishedTime?: string | null
  modifiedTime?: string | null
  noindex?: boolean
}

/**
 * Meta description for CMS-authored content: the first candidate already within 140-160 chars, else the candidates joined and cut at a
 * word boundary (with an ellipsis) so it never exceeds 160.
 */
export function fitDescription(...candidates: (string | null | undefined)[]): string {
  const texts = candidates.map((candidate) => candidate?.replace(/\s+/g, " ").trim() ?? "").filter(Boolean)
  const inRange = texts.find((text) => text.length >= 140 && text.length <= 160)
  if (inRange) return inRange
  const joined = texts.join(" ")
  if (joined.length <= 160) return joined
  const cut = joined.slice(0, 159)
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`
}

/** `/tinh-nang/seo-json-ld` -> `tinh-nang-seo-json-ld` (the key ImageStudio uses for og/ and art/ files). */
export const routeKey = (route: string): string => (route === "/" ? "home" : route.replace(/^\/|\/$/g, "").replace(/\//g, "-"))

export function ogImageFor(route: string, explicit?: string | null): { url: string; width: number; height: number } {
  const key = routeKey(route)
  const candidates = [explicit, `/images/og/${key}.jpg`, `/images/og/${key}.webp`, `/images/og/${key}.png`].filter((c): c is string => !!c)
  for (const candidate of candidates) {
    if (/^https?:\/\//.test(candidate)) return { url: candidate, width: 1200, height: 630 }
    if (existsSync(path.join(process.cwd(), "public", candidate))) {
      const size = publicImageSize(candidate)
      return { url: absoluteUrl(candidate), width: size?.width ?? 1200, height: size?.height ?? 630 }
    }
  }
  return { url: absoluteUrl(`/og${route === "/" ? "" : route}`), width: 1200, height: 630 }
}

export function buildMetadata(input: SeoInput): Metadata {
  const url = absoluteUrl(input.route)
  const image =
    typeof input.image === "string" || input.image == null
      ? ogImageFor(input.route, input.image)
      : { width: 1200, height: 630, ...input.image }
  const images = [{ url: image.url, width: image.width, height: image.height, alt: input.title }]
  return {
    title: { absolute: input.title },
    description: input.description,
    alternates: { canonical: url },
    robots: input.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: input.type ?? "website",
      locale: "vi_VN",
      siteName: SITE_NAME,
      url,
      title: input.title,
      description: input.description,
      images,
      ...(input.type === "article"
        ? { publishedTime: input.publishedTime ?? undefined, modifiedTime: input.modifiedTime ?? undefined }
        : {}),
    },
    twitter: { card: "summary_large_image", title: input.title, description: input.description, images: [image.url] },
  }
}
