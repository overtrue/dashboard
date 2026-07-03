import { exampleSchema } from "@/db/example/schema"

/**
 * A permission resource key is "<module>.<table>", e.g. "example.items".
 * This is what gets stored in the admin_permissions table.
 */
export type ModuleName = "example" | "operations"
export type PermissionResourceKey = `${ModuleName}.${string}`

export type ResourceEntry = {
  module: ModuleName
  tableName: string
}

const grantableExampleSchema = {
  items: exampleSchema.items,
  admins: exampleSchema.admins,
  auditLogs: exampleSchema.auditLogs,
}

/**
 * Virtual resources — operations that don't map to a physical table
 * but still need permission gates.
 */
const virtualResources: Array<{ module: ModuleName; tableName: string }> = [
  // Add virtual resources here as operation permissions need their own key:
  // { module: "operations", tableName: "example_operation" },
]

/**
 * Module schema registry. Add new DB modules here when you add them.
 * Each module's schema object should map grantable resource names to Drizzle tables.
 */
const moduleSchemas: Record<string, Record<string, unknown>> = {
  example: grantableExampleSchema,
}

let cache: {
  byResource: Map<string, PermissionResourceKey>
  allKeys: PermissionResourceKey[]
  byKey: Map<PermissionResourceKey, ResourceEntry>
} | null = null

function getTableName(table: unknown): string {
  const sym = Object.getOwnPropertySymbols(table as object).find(
    (s) => s.toString() === "Symbol(drizzle:Name)"
  )
  if (sym) return (table as Record<symbol, string>)[sym]
  return ""
}

function build() {
  if (cache) return cache

  const byResource = new Map<string, PermissionResourceKey>()
  const byKey = new Map<PermissionResourceKey, ResourceEntry>()
  const allKeys: PermissionResourceKey[] = []

  for (const [moduleName, schema] of Object.entries(moduleSchemas)) {
    for (const [resourceName, table] of Object.entries(schema)) {
      const tableName = getTableName(table) || resourceName
      const key = `${moduleName}.${tableName}` as PermissionResourceKey
      byResource.set(resourceName, key)
      if (!byKey.has(key)) {
        byKey.set(key, { module: moduleName as ModuleName, tableName })
        allKeys.push(key)
      }
    }
  }

  for (const { module, tableName } of virtualResources) {
    const key = `${module}.${tableName}` as PermissionResourceKey
    if (!byKey.has(key)) {
      byKey.set(key, { module, tableName })
      allKeys.push(key)
    }
  }

  cache = { byResource, allKeys, byKey }
  return cache
}

export function resolvePermissionResourceKey(resourceName: string): PermissionResourceKey | null {
  return build().byResource.get(resourceName) ?? null
}

export function listPermissionResourceKeys(): readonly PermissionResourceKey[] {
  return build().allKeys
}

export function isValidPermissionResourceKey(key: string): key is PermissionResourceKey {
  return build().byKey.has(key as PermissionResourceKey)
}

export function getPermissionResourceMeta(key: PermissionResourceKey): ResourceEntry | undefined {
  return build().byKey.get(key)
}
