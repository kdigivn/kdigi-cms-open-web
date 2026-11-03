import { describe, expect, it } from "vitest"

import { isAuthorized } from "@/lib/revalidate-auth"

describe("isAuthorized", () => {
  it("accepts the exact secret", () => {
    expect(isAuthorized("s3cret-value", "s3cret-value")).toBe(true)
  })
  it("rejects a wrong secret, including one of a different length", () => {
    expect(isAuthorized("s3cret-valuX", "s3cret-value")).toBe(false)
    expect(isAuthorized("short", "s3cret-value")).toBe(false)
    expect(isAuthorized("s3cret-value-longer", "s3cret-value")).toBe(false)
  })
  it("rejects a missing header", () => {
    expect(isAuthorized(null, "s3cret-value")).toBe(false)
    expect(isAuthorized("", "s3cret-value")).toBe(false)
  })
  it("never matches while the secret is not configured (the route stays closed)", () => {
    expect(isAuthorized("anything", undefined)).toBe(false)
    expect(isAuthorized("", "")).toBe(false)
    expect(isAuthorized(null, "")).toBe(false)
  })
})
