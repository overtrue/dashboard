import type { InferSelectModel } from "drizzle-orm"
import { admins, auditLogs } from "@/db/example/schema"
import { PLACEHOLDER_TEXT } from "@/lib/placeholder"
import type { EntityBadgeTone } from "@/components/entity-ui"

export type AdminRecord = InferSelectModel<typeof admins>
export type AuditLogRecord = InferSelectModel<typeof auditLogs>

// ── Admin state ───────────────────────────────────────────────────────────────

export type AdminState = "active" | "disabled" | "deleted"

export function getAdminState(admin: AdminRecord): AdminState {
  if (admin.deletedAt) return "deleted"
  return admin.enabled ? "active" : "disabled"
}

export const adminStateTone: Record<AdminState, EntityBadgeTone> = {
  active: "default",
  disabled: "secondary",
  deleted: "destructive",
}

// ── Audit log ─────────────────────────────────────────────────────────────────

export type AuditActionTone = "create" | "update" | "delete"

export const auditActionTone: Record<AuditActionTone, EntityBadgeTone> = {
  create: "default",
  update: "secondary",
  delete: "destructive",
}

export function formatDateTimeLabel(value: string | null | undefined): string {
  if (!value) return PLACEHOLDER_TEXT
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
}

export function formatNullable(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return PLACEHOLDER_TEXT
  return String(value)
}
