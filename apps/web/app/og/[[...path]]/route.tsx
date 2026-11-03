import { readFile } from "node:fs/promises"
import path from "node:path"

import { ImageResponse } from "next/og"

import { getPost } from "@/lib/cms"
import { allContentRoutes } from "@/lib/ia"
import { getContentPage } from "@/lib/content"
import { SITE_NAME, SITE_TITLE } from "@/lib/site"

export const revalidate = 86400

const FONT_DIR = path.join(process.cwd(), "scripts", "og-fonts")

export function generateStaticParams(): { path: string[] }[] {
  return allContentRoutes().map((route) => ({ path: route === "/" ? [] : route.split("/").filter(Boolean) }))
}

async function titleFor(segments: string[]): Promise<string> {
  const route = `/${segments.join("/")}`
  const page = getContentPage(route)
  if (page) return page.h1
  if (segments[0] === "blog" && segments[1]) return (await getPost(segments[1]))?.title ?? SITE_TITLE
  return SITE_TITLE
}

/** Generated 1200x630 card for pages without a shipped OG image (public/images/og/<key>.jpg wins when present). */
export async function GET(_request: Request, { params }: { params: Promise<{ path?: string[] }> }): Promise<ImageResponse> {
  const segments = (await params).path ?? []
  const [title, display, text] = await Promise.all([
    titleFor(segments),
    readFile(path.join(FONT_DIR, "FerryVNDisplay-Bold.ttf")),
    readFile(path.join(FONT_DIR, "FerryVNText-SemiBold.ttf")),
  ])
  const size = title.length > 70 ? 54 : 66
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "linear-gradient(135deg, #F2F6FF 0%, #BFD3FF 100%)",
          color: "#0B1220",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Text", fontSize: 34, color: "#1E5AF0" }}>
          <div style={{ width: 18, height: 18, borderRadius: 6, background: "#4767EC" }} />
          {SITE_NAME}
        </div>
        <div style={{ fontFamily: "Display", fontSize: size, lineHeight: 1.18, fontWeight: 700, maxWidth: 1000 }}>{title}</div>
        <div style={{ fontFamily: "Text", fontSize: 28, color: "#4B5A74" }}>opencms.kdigi.vn</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Display", data: display, weight: 700, style: "normal" },
        { name: "Text", data: text, weight: 600, style: "normal" },
      ],
    },
  )
}
