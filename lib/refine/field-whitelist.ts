import "server-only"

import { getTableColumns } from "drizzle-orm"
import type { Table } from "drizzle-orm"

import { exampleSchema } from "@/db/example/schema"
import { DashboardError } from "@/lib/errors"

// Register all module schemas here. Add new schemas when adding new modules.
const schemas: Record<string, Table>[] = [exampleSchema as Record<string, Table>]

const cache = new Map<string, Set<string>>()

function resolveTable(resource: string): Table | null {
  for (const schema of schemas) {
    if (resource in schema) return schema[resource]
  }
  return null
}

export function getAllowedFields(resource: string): Set<string> {
  const cached = cache.get(resource)
  if (cached) return cached

  const table = resolveTable(resource)
  if (!table) throw new DashboardError(`Unknown resource: ${resource}`, 404)

  const cols = getTableColumns(table)
  const names = new Set<string>()
  for (const [tsName, col] of Object.entries(cols)) {
    names.add(tsName)
    const dbName = (col as { name?: unknown }).name
    if (typeof dbName === "string" && dbName.length > 0) names.add(dbName)
  }

  cache.set(resource, names)
  return names
}

export function assertFieldsAllowed(resource: string, fields: string[]): void {
  if (fields.length === 0) return
  const allow = getAllowedFields(resource)
  for (const field of fields) {
    if (!allow.has(field)) throw new DashboardError(`Field not allowed: ${field}`, 400)
  }
}

export function collectFilterFields(filters: unknown): string[] {
  const out: string[] = []
  const visit = (value: unknown) => {
    if (!value) return
    if (Array.isArray(value)) {
      for (const item of value) visit(item)
      return
    }
    if (typeof value !== "object") return
    const obj = value as Record<string, unknown>
    if (typeof obj.field === "string") out.push(obj.field)
    if ("value" in obj && Array.isArray(obj.value)) visit(obj.value)
  }
  visit(filters)
  return out
}

export function collectSorterFields(sorters: unknown): string[] {
  if (!Array.isArray(sorters)) return []
  const out: string[] = []
  for (const item of sorters) {
    if (
      item &&
      typeof item === "object" &&
      typeof (item as { field?: unknown }).field === "string"
    ) {
      out.push((item as { field: string }).field)
    }
  }
  return out
}
