import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { escapeCsvCell, toCsvText } from "../lib/export/csv"

describe("CSV export", () => {
  it("quotes cells that contain separators or newlines", () => {
    assert.equal(escapeCsvCell('hello, "dashboard"\nnext'), '"hello, ""dashboard""\nnext"')
  })

  it("hardens string cells that spreadsheet apps could execute as formulas", () => {
    assert.equal(escapeCsvCell("=cmd|calc"), "'=cmd|calc")
    assert.equal(escapeCsvCell("+SUM(1,1)"), `"'+SUM(1,1)"`)
    assert.equal(escapeCsvCell("-10"), "'-10")
    assert.equal(escapeCsvCell(-10), "-10")
  })

  it("creates stable CSV text with unioned columns", () => {
    assert.equal(
      toCsvText([
        { id: 1, name: "Alpha" },
        { id: 2, status: "active" },
      ]),
      ["id,name,status", "1,Alpha,", "2,,active"].join("\n")
    )
  })
})
