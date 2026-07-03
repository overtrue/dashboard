function stringifyCsvValue(value: unknown) {
  if (value === null || value === undefined) return ""

  if (
    value instanceof Date &&
    !Number.isNaN(value.getTime()) &&
    typeof value.toISOString === "function"
  ) {
    return value.toISOString()
  }

  if (typeof value === "string") return value
  if (typeof value === "bigint") return value.toString()
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

function hardenSpreadsheetFormula(text: string, originalValue: unknown) {
  if (typeof originalValue !== "string") return text
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text
}

export function escapeCsvCell(value: unknown) {
  const text = hardenSpreadsheetFormula(stringifyCsvValue(value), value)

  if (/[,"\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

export function toCsvText(records: Array<Record<string, unknown>>) {
  if (!records.length) return ""

  const columns = Array.from(
    records.reduce<Set<string>>((accumulator, record) => {
      Object.keys(record).forEach((column) => {
        accumulator.add(column)
      })

      return accumulator
    }, new Set())
  )

  const rows = records.map((record) =>
    columns
      .map((column) => escapeCsvCell(record[column] === undefined ? "" : record[column]))
      .join(",")
  )

  return [columns.join(","), ...rows].join("\n")
}
