import { NextResponse } from "next/server"

import { DashboardError } from "@/lib/errors"

/**
 * refine-sqlx errors carry a stable `code` (e.g. RECORD_NOT_FOUND / TABLE_NOT_FOUND).
 * A request for a record that does not exist is not a server-side failure, so map
 * these to the appropriate 4xx status instead of surfacing them as 500 Internal
 * server error to the client.
 */
const REFINE_SQL_ERROR_STATUS: Record<string, number> = {
  RECORD_NOT_FOUND: 404,
  TABLE_NOT_FOUND: 404,
  COLUMN_NOT_FOUND: 400,
  UNSUPPORTED_OPERATOR: 400,
  INVALID_FIELD_VALUE: 400,
  MISSING_REQUIRED_FIELD: 400,
  ID_TYPE_CONVERSION_ERROR: 400,
  ACCESS_DENIED: 403,
  OPTIMISTIC_LOCK_ERROR: 409,
  FEATURE_NOT_ENABLED: 501,
}

function mapRefineSqlErrorStatus(error: unknown): number | null {
  if (!(error instanceof Error)) {
    return null
  }

  const code = (error as { code?: unknown }).code
  if (typeof code !== "string") {
    return null
  }

  return REFINE_SQL_ERROR_STATUS[code] ?? null
}

export function toErrorResponse(error: unknown) {
  if (error instanceof DashboardError) {
    return NextResponse.json({ message: error.message }, { status: error.statusCode })
  }

  const refineSqlStatus = mapRefineSqlErrorStatus(error)
  if (refineSqlStatus !== null) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ message }, { status: refineSqlStatus })
  }

  console.error("[api] unexpected error:", formatErrorChain(error))
  return NextResponse.json({ message: "Internal server error" }, { status: 500 })
}

function formatErrorChain(error: unknown, depth = 0): string {
  if (depth > 5) return "<error chain too deep>"
  if (!error) return String(error)
  if (error instanceof Error) {
    const e = error as Error & { cause?: unknown; code?: string | number }
    const meta: string[] = []
    if (e.code) meta.push(`code=${e.code}`)
    const head = `${e.name}: ${e.message}${meta.length ? ` (${meta.join(", ")})` : ""}`
    const causeStr = e.cause ? `\n  caused by: ${formatErrorChain(e.cause, depth + 1)}` : ""
    const stackStr = depth === 0 && e.stack ? `\n${e.stack}` : ""
    return head + causeStr + stackStr
  }
  return String(error)
}

export function parseJsonParam<T>(value: string | null, name = "parameter"): T | undefined {
  if (!value) return undefined
  try {
    return JSON.parse(value) as T
  } catch {
    throw new DashboardError(`Invalid JSON for ${name}`, 400)
  }
}
