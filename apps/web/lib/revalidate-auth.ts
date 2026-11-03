import { timingSafeEqual } from "node:crypto"

export const REVALIDATE_HEADER = "x-revalidate-secret"

/** Constant-time comparison of the shared secret. An unset or empty expected secret never matches (the route stays closed). */
export function isAuthorized(received: string | null, expected: string | undefined): boolean {
  if (!expected || !received) return false
  const a = Buffer.from(received)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}
