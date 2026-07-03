import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { getSafeLoginRedirect } from "../lib/login-redirect"

describe("login redirect target", () => {
  it("preserves relative dashboard destinations", () => {
    assert.equal(
      getSafeLoginRedirect("/dashboard/resources/items/show/1"),
      "/dashboard/resources/items/show/1"
    )
  })

  it("falls back when the destination is missing or outside dashboard", () => {
    assert.equal(getSafeLoginRedirect(null), "/dashboard")
    assert.equal(getSafeLoginRedirect("/login"), "/dashboard")
    assert.equal(getSafeLoginRedirect("/api/admin/items"), "/dashboard")
  })

  it("rejects absolute and protocol-relative URLs", () => {
    assert.equal(getSafeLoginRedirect("https://example.com/dashboard"), "/dashboard")
    assert.equal(getSafeLoginRedirect("//example.com/dashboard"), "/dashboard")
  })
})
