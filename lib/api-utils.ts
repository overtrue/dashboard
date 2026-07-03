import { NextResponse } from "next/server"

import { DashboardError } from "@/lib/errors"

export function toErrorResponse(error: unknown) {
  if (error instanceof DashboardError) {
    return NextResponse.json({ message: error.message }, { status: error.statusCode })
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
