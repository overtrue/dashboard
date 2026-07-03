export const ADMIN_ACTIONS = ["read", "create", "update", "delete"] as const

export type AdminAction = (typeof ADMIN_ACTIONS)[number]

const ADMIN_ACTION_SET: ReadonlySet<string> = new Set(ADMIN_ACTIONS)

export function isAdminAction(value: unknown): value is AdminAction {
  return typeof value === "string" && ADMIN_ACTION_SET.has(value)
}
