import "server-only"

import type { NextRequest } from "next/server"

import { DashboardError } from "@/lib/errors"
import { getAdminPermissionsForRequest } from "@/lib/permissions/load"
import { requireActiveAdmin, type AdminProfile } from "@/lib/permissions/admin-profile"
import type { AdminAction } from "@/lib/permissions/actions"
import {
  resolvePermissionResourceKey,
  type PermissionResourceKey,
} from "@/lib/permissions/resources"

/**
 * Route handler authorization entry point.
 *
 * `resource` can be either a dashboard resource name (e.g. "items", "admins")
 * or an already-resolved "<module>.<table>" key.
 *
 * Flow:
 *   - No/invalid session → 401
 *   - Account disabled or deleted → 403
 *   - isSuper === true → bypass permission table
 *   - Resource maps to no permission key → fail closed so missing registration is visible
 *   - Otherwise → check admin_permissions table
 */
export async function requirePermission(
  request: NextRequest,
  resource: string,
  action: AdminAction
): Promise<AdminProfile> {
  const { profile } = await requireActiveAdmin(request)

  if (profile.isSuper) return profile

  let resourceKey: PermissionResourceKey | null
  if (resource.includes(".")) {
    resourceKey = resource as PermissionResourceKey
  } else {
    resourceKey = resolvePermissionResourceKey(resource)
  }

  if (!resourceKey) {
    throw new DashboardError(`Unknown protected resource: ${resource}`, 404)
  }

  const perms = await getAdminPermissionsForRequest(request, profile.id)
  const granted = perms.get(resourceKey)
  if (!granted || !granted.has(action)) {
    throw new DashboardError(`No ${action} permission on ${resourceKey}`, 403)
  }
  return profile
}
