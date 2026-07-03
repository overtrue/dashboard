import { getDashboardResource } from "@/lib/dashboard-resources"
import type { AdminAction } from "@/lib/permissions/actions"
import { isAdminAction } from "@/lib/permissions/actions"
import type { PermissionResourceKey } from "@/lib/permissions/resources"

export type SerializedPermissions = Record<string, AdminAction[]>

export function normalizeDashboardAction(action: string | undefined): AdminAction {
  switch (action) {
    case "list":
    case "show":
      return "read"
    case "edit":
      return "update"
    default:
      return isAdminAction(action) ? action : "read"
  }
}

export function canAccessPermission({
  perms,
  isSuper,
  resourceKey,
  action,
}: {
  perms: SerializedPermissions
  isSuper: boolean
  resourceKey?: PermissionResourceKey | null
  action: AdminAction
}): boolean {
  if (!resourceKey) return true
  if (isSuper) return true
  return perms[resourceKey]?.includes(action) ?? false
}

export function canAccessDashboardResource({
  perms,
  isSuper,
  resourceName,
  action,
}: {
  perms: SerializedPermissions
  isSuper: boolean
  resourceName?: string
  action?: string
}): boolean {
  if (!resourceName) return true
  const resource = getDashboardResource(resourceName)
  if (!resource?.permissionKey) return true

  return canAccessPermission({
    perms,
    isSuper,
    resourceKey: resource.permissionKey,
    action: normalizeDashboardAction(action ?? resource.requiredAction),
  })
}
