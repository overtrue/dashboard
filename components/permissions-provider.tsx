"use client"

import { createContext, useContext, type ReactNode } from "react"

import type { AdminAction } from "@/lib/permissions/actions"
import {
  canAccessDashboardResource,
  canAccessPermission,
  type SerializedPermissions,
} from "@/lib/permissions/access"
import type { PermissionResourceKey } from "@/lib/permissions/resources"

export type { SerializedPermissions }

type PermissionsContextValue = {
  perms: SerializedPermissions
  isSuper: boolean
}

const PermissionsContext = createContext<PermissionsContextValue>({
  perms: {},
  isSuper: false,
})

export function PermissionsProvider({
  children,
  perms = {},
  isSuper = false,
}: {
  children: ReactNode
  perms?: SerializedPermissions
  isSuper?: boolean
}) {
  return (
    <PermissionsContext.Provider value={{ perms, isSuper }}>{children}</PermissionsContext.Provider>
  )
}

export function usePermissions() {
  return useContext(PermissionsContext)
}

export function useIsSuperAdmin() {
  return useContext(PermissionsContext).isSuper
}

export function usePermission(resource: PermissionResourceKey, action: AdminAction): boolean {
  const { perms, isSuper } = useContext(PermissionsContext)
  return canAccessPermission({ perms, isSuper, resourceKey: resource, action })
}

export function useCanAccessDashboardResource(
  resourceName: string | undefined,
  action?: string
): boolean {
  const { perms, isSuper } = useContext(PermissionsContext)
  return canAccessDashboardResource({ perms, isSuper, resourceName, action })
}
