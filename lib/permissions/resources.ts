import "server-only"

export {
  getPermissionResourceMeta,
  isValidPermissionResourceKey,
  listPermissionResourceKeys,
  resolvePermissionResourceKey,
} from "@/lib/permissions/resource-registry"
export type {
  ModuleName,
  PermissionResourceKey,
  ResourceEntry,
} from "@/lib/permissions/resource-registry"
