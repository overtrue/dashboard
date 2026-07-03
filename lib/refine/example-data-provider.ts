import "server-only"

import { eq } from "drizzle-orm"
import { createRefineSQL } from "refine-sqlx"
import type { DataProvider } from "@refinedev/core"

import { exampleDb } from "@/db/example/client"
import { exampleSchema, admins } from "@/db/example/schema"
import { DashboardError } from "@/lib/errors"
import { hashPassword } from "@/lib/auth"
import { normalizeWriteValues } from "@/lib/data-utils"
import { createDrizzleGetList } from "@/lib/refine/drizzle-list"

type ExampleResource = keyof typeof exampleSchema

// Resources exposed via the generic /api/admin/[resource] endpoint
const exampleResources = new Set<ExampleResource>(["items", "admins", "auditLogs"])

function getExampleTable(resource: string) {
  if (!exampleResources.has(resource as ExampleResource)) {
    throw new DashboardError(`Unsupported example resource: ${resource}`, 404)
  }
  return exampleSchema[resource as ExampleResource]
}

/**
 * Pre-process admin write values:
 *  - Hash plain `password` field into `passwordHash`; strip `password` from payload
 *  - Normalize date-like fields
 */
async function processAdminVariables(
  variables: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const normalized = normalizeWriteValues(variables)
  if (typeof normalized.password === "string" && normalized.password.trim()) {
    normalized.passwordHash = await hashPassword(normalized.password.trim())
  }
  delete normalized.password
  return normalized
}

let baseProviderPromise: ReturnType<typeof createRefineSQL> | null = null
let exampleDataProviderPromise: Promise<DataProvider> | null = null

async function getBaseExampleProvider() {
  const db = exampleDb()
  baseProviderPromise ??= createRefineSQL({
    connection: db as never,
    schema: exampleSchema,
  })
  return baseProviderPromise
}

export async function getExampleDataProvider(): Promise<DataProvider> {
  exampleDataProviderPromise ??= (async () => {
    const base = (await getBaseExampleProvider()) as DataProvider
    const db = exampleDb()

    const customCreate: DataProvider["create"] = async ({ resource, variables }) => {
      if (resource === "admins") {
        const vals = await processAdminVariables(variables as Record<string, unknown>)
        const now = new Date().toISOString()
        const result = db
          .insert(admins)
          .values({ ...vals, createdAt: now, updatedAt: now } as never)
          .run()
        const id = Number(result.lastInsertRowid)
        const [row] = db.select().from(admins).where(eq(admins.id, id)).limit(1).all()
        return { data: row as never }
      }
      return base.create!({ resource, variables })
    }

    const customUpdate: DataProvider["update"] = async ({ resource, id, variables }) => {
      if (resource === "admins") {
        const vals = await processAdminVariables(variables as Record<string, unknown>)
        vals.updatedAt = new Date().toISOString()
        db.update(admins)
          .set(vals as never)
          .where(eq(admins.id, Number(id)))
          .run()
        const [row] = db
          .select()
          .from(admins)
          .where(eq(admins.id, Number(id)))
          .limit(1)
          .all()
        return { data: row as never }
      }
      return base.update!({ resource, id, variables })
    }

    return {
      ...base,
      create: customCreate,
      update: customUpdate,
      getList: createDrizzleGetList({
        db,
        getTable: getExampleTable,
      }),
    }
  })()

  return exampleDataProviderPromise as Promise<DataProvider>
}
