export const dynamic = "force-dynamic"

/** Liveness only (no CMS call): a CMS outage must not make Coolify restart this container. `version` = deployed commit. */
export function GET(): Response {
  return Response.json({ status: "ok", version: process.env.GIT_SHA ?? "dev" }, { headers: { "Cache-Control": "no-store" } })
}
