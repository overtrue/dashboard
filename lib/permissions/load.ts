import "server-only"

import { eq } from "drizzle-orm"

import { exampleDb } from "@/db/example/client"
import { adminPermissions } from "@/db/example/schema"
import { ADMIN_ACTIONS, isAdminAction, type AdminAction } from "@/lib/permissions/actions"
import {
  isValidPermissionResourceKey,
  type PermissionResourceKey,
} from "@/lib/permissions/resources"

export type AdminPermissionMap = Map<PermissionResourceKey, Set<AdminAction>>

export async function loadAdminPermissions(adminId: number): Promise<AdminPermissionMap> {
  const db = exampleDb()
  const rows = db
    .select({
      resource: adminPermissions.resource,
      actions: adminPermissions.actions,
    })
    .from(adminPermissions)
    .where(eq(adminPermissions.adminId, adminId))
    .all()

  const out: AdminPermissionMap = new Map()
  for (const row of rows) {
    if (!isValidPermissionResourceKey(row.resource)) continue
    const set = new Set<AdminAction>()
    const raw = row.actions
    if (Array.isArray(raw)) {
      for (const v of raw) if (isAdminAction(v)) set.add(v)
    }
    out.set(row.resource, set)
  }
  return out
}

export function serializePermissions(perms: AdminPermissionMap): Record<string, AdminAction[]> {
  const out: Record<string, AdminAction[]> = {}
  for (const [resource, set] of perms.entries()) {
    out[resource] = ADMIN_ACTIONS.filter((a) => set.has(a))
  }
  return out
}

const _requestCache = new WeakMap<Request, Promise<AdminPermissionMap>>()

export function getAdminPermissionsForRequest(
  request: Request,
  adminId: number
): Promise<AdminPermissionMap> {
  let p = _requestCache.get(request)
  if (!p) {
    p = loadAdminPermissions(adminId)
    _requestCache.set(request, p)
  }
  return p
}
