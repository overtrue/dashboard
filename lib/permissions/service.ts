import "server-only"

import { eq, sql } from "drizzle-orm"

import { exampleDb } from "@/db/example/client"
import { admins, adminPermissions } from "@/db/example/schema"
import { DashboardError } from "@/lib/errors"
import { ADMIN_ACTIONS, isAdminAction, type AdminAction } from "@/lib/permissions/actions"
import {
  isValidPermissionResourceKey,
  listPermissionResourceKeys,
  type PermissionResourceKey,
} from "@/lib/permissions/resources"

export type PermissionMatrix = Record<PermissionResourceKey, AdminAction[]>

export async function listPermissionsForAdmin(adminId: number): Promise<PermissionMatrix> {
  const db = exampleDb()
  const rows = db
    .select({ resource: adminPermissions.resource, actions: adminPermissions.actions })
    .from(adminPermissions)
    .where(eq(adminPermissions.adminId, adminId))
    .all()

  const stored = new Map<string, AdminAction[]>()
  for (const row of rows) {
    if (!isValidPermissionResourceKey(row.resource)) continue
    const arr: AdminAction[] = []
    if (Array.isArray(row.actions)) {
      for (const v of row.actions) if (isAdminAction(v)) arr.push(v)
    }
    stored.set(row.resource, arr)
  }

  const out: PermissionMatrix = {} as PermissionMatrix
  for (const key of listPermissionResourceKeys()) {
    out[key] = stored.get(key) ?? []
  }
  return out
}

function dedupeActions(actions: AdminAction[]): AdminAction[] {
  return ADMIN_ACTIONS.filter((a) => actions.includes(a))
}

export function validatePermissionMatrix(input: unknown): PermissionMatrix {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new DashboardError("Invalid matrix payload", 400)
  }
  const out: PermissionMatrix = {} as PermissionMatrix
  for (const [resource, actions] of Object.entries(input as Record<string, unknown>)) {
    if (!isValidPermissionResourceKey(resource)) {
      throw new DashboardError(`Unknown resource: ${resource}`, 400)
    }
    if (!Array.isArray(actions)) {
      throw new DashboardError(`Invalid actions for ${resource}`, 400)
    }
    const filtered: AdminAction[] = []
    for (const a of actions) {
      if (!isAdminAction(a)) throw new DashboardError(`Unknown action "${a}"`, 400)
      filtered.push(a)
    }
    out[resource] = dedupeActions(filtered)
  }
  return out
}

export async function replacePermissionsForAdmin(
  adminId: number,
  matrix: PermissionMatrix
): Promise<void> {
  const db = exampleDb()
  const now = new Date().toISOString()
  const rows = Object.entries(matrix)
    .filter(([, actions]) => actions.length > 0)
    .map(([resource, actions]) => ({ adminId, resource, actions, createdAt: now, updatedAt: now }))

  db.delete(adminPermissions).where(eq(adminPermissions.adminId, adminId)).run()
  if (rows.length > 0) {
    db.insert(adminPermissions).values(rows).run()
  }
}

export async function countActiveSuperAdmins(): Promise<number> {
  const db = exampleDb()
  const [row] = db
    .select({ total: sql<number>`count(*)` })
    .from(admins)
    .where(sql`${admins.isSuper} = 1 AND ${admins.enabled} = 1 AND ${admins.deletedAt} IS NULL`)
    .all()
  return Number(row?.total ?? 0)
}

export async function isSuperAdmin(adminId: number): Promise<boolean> {
  const db = exampleDb()
  const [row] = db
    .select({ isSuper: admins.isSuper })
    .from(admins)
    .where(eq(admins.id, adminId))
    .limit(1)
    .all()
  return row?.isSuper === true || (row?.isSuper as unknown) === 1
}
