import type { AdminAction } from "@/lib/permissions/actions"
import type { PermissionResourceKey } from "@/lib/permissions/resources"

type DashboardModule = "example" | "operations"
type DashboardNavGroup = "overview" | "resources" | "operations" | "system"

export type { DashboardModule, DashboardNavGroup }

export type DashboardResourceDefinition = {
  name: string
  module: DashboardModule
  label: string
  sidebarLabel?: string
  list?: string
  show?: string
  create?: string
  edit?: string
  hide?: boolean
  parent?: string
  group?: DashboardNavGroup
  permissionKey?: PermissionResourceKey
  requiredAction?: AdminAction
}

const dashboardResourceDefinitions: DashboardResourceDefinition[] = [
  // ── Resources ───────────────────────────────────────────────────────────────
  {
    name: "items",
    module: "example",
    label: "Items",
    sidebarLabel: "Items",
    list: "/dashboard/resources/items",
    show: "/dashboard/resources/items/show/:id",
    group: "resources",
    permissionKey: "example.items",
    requiredAction: "read",
  },

  // ── Operations ──────────────────────────────────────────────────────────────
  {
    name: "example-operation",
    module: "operations",
    label: "Example Operation",
    sidebarLabel: "Example Operation",
    list: "/dashboard/operations/example",
    group: "operations",
    permissionKey: "example.items",
    requiredAction: "update",
  },

  // ── System ───────────────────────────────────────────────────────────────────
  {
    name: "admins",
    module: "example",
    label: "Admins",
    sidebarLabel: "Admins",
    list: "/dashboard/resources/admins",
    show: "/dashboard/resources/admins/show/:id",
    create: "/dashboard/resources/admins/create",
    edit: "/dashboard/resources/admins/edit/:id",
    group: "system",
    permissionKey: "example.admins",
    requiredAction: "read",
  },
  {
    name: "auditLogs",
    module: "example",
    label: "Audit Logs",
    sidebarLabel: "Audit Logs",
    list: "/dashboard/resources/audit-logs",
    show: "/dashboard/resources/audit-logs/show/:id",
    group: "system",
    permissionKey: "example.audit_logs",
    requiredAction: "read",
  },
]

export const dashboardRefineResources = dashboardResourceDefinitions.map(
  ({ name, list, show, create, edit, label, sidebarLabel, hide, parent }) => ({
    name,
    ...(list ? { list } : {}),
    ...(show ? { show } : {}),
    ...(create ? { create } : {}),
    ...(edit ? { edit } : {}),
    meta: {
      label: sidebarLabel ?? label,
      ...(hide ? { hide: true } : {}),
      ...(parent ? { parent } : {}),
    },
  })
)

export function getDashboardResource(name: string) {
  return dashboardResourceDefinitions.find((resource) => resource.name === name)
}

export function getDashboardResourceDisplayName(resource: DashboardResourceDefinition): string {
  return resource.sidebarLabel ?? resource.label ?? resource.name
}

export function getDashboardResourcesByGroup(group: DashboardNavGroup) {
  return dashboardResourceDefinitions.filter(
    (resource) => resource.group === group && !resource.hide && resource.list
  )
}
