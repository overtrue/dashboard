import { int, sqliteTable, text } from "drizzle-orm/sqlite-core"

import type { AdminAction } from "@/lib/permissions/actions"

// ── items ─────────────────────────────────────────────────────────────────────

export const items = sqliteTable("items", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  status: text("status", { enum: ["active", "archived", "deleted"] })
    .notNull()
    .default("active"),
  description: text("description"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// ── admins ────────────────────────────────────────────────────────────────────

export const admins = sqliteTable("admins", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  nickname: text("nickname"),
  isSuper: int("is_super", { mode: "boolean" }).notNull().default(false),
  enabled: int("enabled", { mode: "boolean" }).notNull().default(true),
  lastLoginAt: text("last_login_at"),
  lastLoginIp: text("last_login_ip"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  deletedAt: text("deleted_at"),
})

// ── audit_logs ────────────────────────────────────────────────────────────────

export const auditLogs = sqliteTable("audit_logs", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  adminId: int("admin_id", { mode: "number" }),
  adminName: text("admin_name"),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  changes: text("changes", { mode: "json" }).$type<
    Record<string, { from: unknown; to: unknown }>
  >(),
  context: text("context", { mode: "json" }).$type<Record<string, unknown>>(),
  ip: text("ip"),
  userAgent: text("user_agent"),
  duration: int("duration"),
  status: text("status").notNull().default("success"),
  errorMessage: text("error_message"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

// ── admin_permissions ─────────────────────────────────────────────────────────

export const adminPermissions = sqliteTable("admin_permissions", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  adminId: int("admin_id", { mode: "number" }).notNull(),
  resource: text("resource").notNull(),
  actions: text("actions", { mode: "json" }).$type<AdminAction[]>().notNull(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
})

export const exampleSchema = { items, admins, auditLogs, adminPermissions }
