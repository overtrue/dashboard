import "server-only"

import { exampleDb } from "@/db/example/client"
import { auditLogs } from "@/db/example/schema"
import { onAuditLog, type AuditNotification } from "@/lib/notifications"

export type AuditAction = "create" | "update" | "delete"

export type AuditEntry = {
  adminId?: number
  adminName?: string
  action: AuditAction
  resource: string
  resourceId?: string
  changes?: Record<string, { from: unknown; to: unknown }>
  context?: Record<string, unknown>
  ip?: string
  userAgent?: string
  startedAt?: number
  status?: "success" | "error"
  errorMessage?: string
}

export async function writeAuditLog(entry: AuditEntry): Promise<void> {
  try {
    const db = exampleDb()
    const duration =
      entry.startedAt && entry.startedAt > 0 ? Math.round(Date.now() - entry.startedAt) : undefined

    db.insert(auditLogs)
      .values({
        adminId: entry.adminId ?? null,
        adminName: entry.adminName ?? null,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId ?? null,
        changes: entry.changes ?? null,
        context: entry.context ?? null,
        ip: entry.ip?.slice(0, 45) ?? null,
        userAgent: entry.userAgent?.slice(0, 512) ?? null,
        duration: duration ?? null,
        status: entry.status ?? "success",
        errorMessage: entry.errorMessage ?? null,
      })
      .run()

    const notification: AuditNotification = {
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      adminName: entry.adminName,
      changes: entry.changes,
    }
    void Promise.resolve(onAuditLog(notification)).catch(() => {})
  } catch (error) {
    console.error("[audit] failed to write audit log:", error)
  }
}

export function getRequestMeta(request: Request) {
  return {
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      undefined,
    userAgent: request.headers.get("user-agent") ?? undefined,
  }
}
