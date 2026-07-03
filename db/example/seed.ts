/**
 * Seeds the example SQLite database with initial data.
 * Run: pnpm db:seed  (after pnpm db:push)
 *
 * Default accounts seeded:
 *   superadmin — admin / admin123  (override: DASHBOARD_SUPERADMIN_USERNAME / _PASSWORD)
 *   operator   — operator / operator123  (read-only on all resources)
 */

import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { eq } from "drizzle-orm"
import { scryptSync, randomBytes } from "node:crypto"
import type { AdminAction } from "@/lib/permissions/actions"
import * as schema from "./schema"

const dbPath = process.env.EXAMPLE_DB_PATH ?? "./example.db"
const sqlite = new Database(dbPath)
sqlite.pragma("journal_mode = WAL")
sqlite.pragma("foreign_keys = ON")

const db = drizzle(sqlite, { schema })

function hashPassword(password: string): string {
  const salt = randomBytes(16)
  const key = scryptSync(password, salt, 64)
  return `${salt.toString("hex")}:${key.toString("hex")}`
}

// ── Items ──────────────────────────────────────────────────────────────────────
const existingItems = db.select().from(schema.items).limit(1).all()
if (existingItems.length === 0) {
  db.insert(schema.items)
    .values([
      {
        name: "AI intake queue",
        status: "active",
        description: "Tracks inbound automation requests waiting for operator review.",
        createdAt: "2026-06-26T07:37:00.000Z",
        updatedAt: "2026-06-26T07:37:00.000Z",
      },
      {
        name: "Billing exception review",
        status: "active",
        description: "Flags accounts with invoice mismatches before the nightly export.",
        createdAt: "2026-06-26T08:12:00.000Z",
        updatedAt: "2026-06-26T08:12:00.000Z",
      },
      {
        name: "Moderation backlog",
        status: "active",
        description: "Prioritizes content reports by severity and last reviewer action.",
        createdAt: "2026-06-26T09:04:00.000Z",
        updatedAt: "2026-06-26T09:04:00.000Z",
      },
      {
        name: "Partner onboarding",
        status: "active",
        description: "Monitors verification steps for new marketplace partners.",
        createdAt: "2026-06-26T10:18:00.000Z",
        updatedAt: "2026-06-26T10:18:00.000Z",
      },
      {
        name: "Support escalation board",
        status: "active",
        description: "Collects high-priority tickets that need manager acknowledgement.",
        createdAt: "2026-06-26T11:25:00.000Z",
        updatedAt: "2026-06-26T11:25:00.000Z",
      },
      {
        name: "Risk review samples",
        status: "active",
        description: "Queues sampled transactions for manual review and audit evidence.",
        createdAt: "2026-06-26T12:30:00.000Z",
        updatedAt: "2026-06-26T12:30:00.000Z",
      },
      {
        name: "Feature flag rollout",
        status: "active",
        description: "Tracks staged enablement, owner approval, and rollback readiness.",
        createdAt: "2026-06-26T13:45:00.000Z",
        updatedAt: "2026-06-26T13:45:00.000Z",
      },
      {
        name: "Data quality audit",
        status: "archived",
        description: "Archived checklist from the last data reconciliation cycle.",
        createdAt: "2026-06-20T06:10:00.000Z",
        updatedAt: "2026-06-24T16:00:00.000Z",
      },
      {
        name: "Legacy import batch",
        status: "archived",
        description: "Completed migration batch kept for reference and traceability.",
        createdAt: "2026-06-18T04:20:00.000Z",
        updatedAt: "2026-06-22T09:30:00.000Z",
      },
      {
        name: "Closed campaign review",
        status: "archived",
        description: "Past campaign QA notes retained for performance comparisons.",
        createdAt: "2026-06-14T03:50:00.000Z",
        updatedAt: "2026-06-21T05:10:00.000Z",
      },
      {
        name: "Deprecated webhook endpoint",
        status: "deleted",
        description: "Soft-deleted endpoint awaiting final cleanup after traffic drains.",
        createdAt: "2026-06-10T02:15:00.000Z",
        updatedAt: "2026-06-25T17:40:00.000Z",
      },
      {
        name: "Retired manual workflow",
        status: "deleted",
        description: "Replaced by an automated flow and hidden from normal operations.",
        createdAt: "2026-06-08T01:05:00.000Z",
        updatedAt: "2026-06-25T18:05:00.000Z",
      },
    ])
    .run()
  console.log("Seeded items.")
}

// ── Superadmin ─────────────────────────────────────────────────────────────────
const adminUsername = process.env.DASHBOARD_SUPERADMIN_USERNAME?.trim() ?? "admin"
const adminPassword = process.env.DASHBOARD_SUPERADMIN_PASSWORD ?? "admin123"

let superadminId: number | null = null
const existingSuper = db
  .select()
  .from(schema.admins)
  .where(eq(schema.admins.isSuper, true))
  .limit(1)
  .all()
if (existingSuper.length === 0) {
  const result = db
    .insert(schema.admins)
    .values({
      username: adminUsername,
      passwordHash: hashPassword(adminPassword),
      nickname: "Super Admin",
      isSuper: true,
      enabled: true,
    })
    .run()
  superadminId = Number(result.lastInsertRowid)
  console.log(`Seeded superadmin (username: ${adminUsername}, password: ${adminPassword}).`)
} else {
  superadminId = existingSuper[0]!.id
}

// ── Operator (read-only non-super account) ─────────────────────────────────────
const OPERATOR_USERNAME = "operator"
const OPERATOR_PASSWORD = "operator123"

const existingOperator = db
  .select()
  .from(schema.admins)
  .where(eq(schema.admins.username, OPERATOR_USERNAME))
  .limit(1)
  .all()

let operatorId: number | null = null
if (existingOperator.length === 0) {
  const result = db
    .insert(schema.admins)
    .values({
      username: OPERATOR_USERNAME,
      passwordHash: hashPassword(OPERATOR_PASSWORD),
      nickname: "Operator",
      isSuper: false,
      enabled: true,
    })
    .run()
  operatorId = Number(result.lastInsertRowid)
  console.log(`Seeded operator (username: ${OPERATOR_USERNAME}, password: ${OPERATOR_PASSWORD}).`)
} else {
  operatorId = existingOperator[0]!.id
}

// Grant operator read-only access to all non-system resources
if (operatorId !== null) {
  const existingPerms = db
    .select()
    .from(schema.adminPermissions)
    .where(eq(schema.adminPermissions.adminId, operatorId))
    .limit(1)
    .all()

  if (existingPerms.length === 0) {
    const now = new Date().toISOString()
    // Read access to the main resources (exclude admin management tables)
    const readonlyResources = ["example.items"]
    db.insert(schema.adminPermissions)
      .values(
        readonlyResources.map((resource) => ({
          adminId: operatorId!,
          resource,
          actions: ["read"] as AdminAction[],
          createdAt: now,
          updatedAt: now,
        }))
      )
      .run()
    console.log(`Granted operator read-only access to: ${readonlyResources.join(", ")}`)
  }
}

console.log("Seed complete.")
sqlite.close()
