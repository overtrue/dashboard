import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { parseJsonParam } from "../lib/api-utils"
import { DashboardError } from "../lib/errors"

describe("API utilities", () => {
  it("parses optional JSON query parameters", () => {
    assert.equal(parseJsonParam(null), undefined)
    assert.deepEqual(parseJsonParam('{"pageSize":25}', "pagination"), { pageSize: 25 })
  })

  it("reports invalid JSON query parameters as client errors", () => {
    assert.throws(
      () => parseJsonParam("{", "filters"),
      (error) =>
        error instanceof DashboardError &&
        error.statusCode === 400 &&
        error.message === "Invalid JSON for filters"
    )
  })
})
