import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { parseJsonParam, toErrorResponse } from "../lib/api-utils"
import { DashboardError } from "../lib/errors"

// Minimal mock: refine-sqlx errors only need the correct `code` to be recognised.
class RecordNotFoundErrorMock extends Error {
  code = "RECORD_NOT_FOUND"
  constructor(resource: string, id: unknown) {
    super(`Record with id ${id} not found in ${resource}`)
    this.name = "RecordNotFoundError"
  }
}

class UnknownRefineErrorMock extends Error {
  code = "SOMETHING_ELSE"
  constructor() {
    super("something else")
    this.name = "UnknownRefineError"
  }
}

async function readJson(response: Response) {
  return (await response.json()) as { message?: unknown }
}

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

  it("passes through DashboardError status and message", async () => {
    const response = toErrorResponse(new DashboardError("bad request", 400))
    assert.equal(response.status, 400)
    const body = await readJson(response)
    assert.equal(body.message, "bad request")
  })

  it("maps refine-sqlx RecordNotFoundError to 404 with original message", async () => {
    const response = toErrorResponse(
      new RecordNotFoundErrorMock("users", 64641863886441)
    )
    assert.equal(response.status, 404)
    const body = await readJson(response)
    assert.equal(
      body.message,
      "Record with id 64641863886441 not found in users"
    )
  })

  it("falls back to 500 for unknown refine-sqlx codes", async () => {
    const response = toErrorResponse(new UnknownRefineErrorMock())
    assert.equal(response.status, 500)
    const body = await readJson(response)
    assert.equal(body.message, "Internal server error")
  })

  it("falls back to 500 for non-Error inputs", async () => {
    const response = toErrorResponse("plain string error")
    assert.equal(response.status, 500)
    const body = await readJson(response)
    assert.equal(body.message, "Internal server error")
  })
})
