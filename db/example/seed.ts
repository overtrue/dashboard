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
      { name: "First item", status: "active", description: "A sample active item." },
      { name: "Second item", status: "active", description: "Another active item." },
      { name: "Archived item", status: "archived", description: "This item is archived." },
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
