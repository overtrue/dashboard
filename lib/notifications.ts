/**
 * Pluggable notification hooks for the dashboard.
 *
 * Override these callbacks to integrate with your own notification systems
 * (Slack, WeChat Work, Discord, email, etc.).
 *
 * Usage example in your app setup:
 *
 *   import { setNotificationHandlers } from "@/lib/notifications"
 *
 *   setNotificationHandlers({
 *     onAuditLog: async (entry) => {
 *       if (entry.action !== "read") {
 *         await slack.post(`${entry.adminName} performed ${entry.action} on ${entry.resource}`)
 *       }
 *     },
 *   })
 */

export type AuditNotification = {
  action: string
  resource: string
  resourceId?: string
  adminName?: string
  changes?: Record<string, { from: unknown; to: unknown }>
}

export type NotificationHandlers = {
  onAuditLog?: (entry: AuditNotification) => Promise<void> | void
}

let handlers: NotificationHandlers = {}

export function setNotificationHandlers(h: NotificationHandlers): void {
  handlers = h
}

export async function onAuditLog(entry: AuditNotification): Promise<void> {
  await handlers.onAuditLog?.(entry)
}
