import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { getDryRunConfirmVariant } from "../lib/operations/dry-run"

describe("dry-run action confirmation variant", () => {
  it("keeps destructive actions visually destructive", () => {
    assert.equal(getDryRunConfirmVariant("destructive"), "destructive")
  })

  it("uses default confirmation styling for reversible actions", () => {
    assert.equal(getDryRunConfirmVariant("default"), "default")
    assert.equal(getDryRunConfirmVariant("outline"), "default")
  })
})
