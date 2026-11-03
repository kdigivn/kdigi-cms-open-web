import { revalidatePath, revalidateTag } from "next/cache"
import { NextResponse } from "next/server"

import { CMS_TAG } from "@/lib/cms"
import { isAuthorized, REVALIDATE_HEADER } from "@/lib/revalidate-auth"

export const dynamic = "force-dynamic"

/**
 * Webhook of the CMS `revalidateFrontend` job: POST { collection, id, slug } with the shared secret in `x-revalidate-secret`.
 * Idempotent and cheap: it expires every CMS read (tag `cms`) and the pages that render them, so the next request rebuilds them.
 * Closed (503) while REVALIDATE_SECRET is not configured; wrong or missing secret = 401.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const expected = process.env.REVALIDATE_SECRET
  if (!expected) return NextResponse.json({ ok: false, error: "revalidation is not configured" }, { status: 503 })
  if (!isAuthorized(request.headers.get(REVALIDATE_HEADER), expected)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  const body: unknown = await request.json().catch(() => null)
  const slug = typeof body === "object" && body !== null && "slug" in body && typeof body.slug === "string" ? body.slug : null

  revalidateTag(CMS_TAG, { expire: 0 })
  revalidatePath("/", "layout")
  return NextResponse.json({ ok: true, revalidated: true, slug, at: new Date().toISOString() })
}
