import "server-only"

import { eq, sql } from "drizzle-orm"

import { hashPassword } from "@/lib/auth"
import { exampleDb, ensureExampleDatabaseConnection } from "@/db/example/client"
import { admins } from "@/db/example/schema"

/**
 * Called at startup to ensure a superadmin account exists.
 * Configure via env vars:
 *   DASHBOARD_SUPERADMIN_USERNAME  (default: "admin")
 *   DASHBOARD_SUPERADMIN_PASSWORD  (min 6 chars, default: "admin123" — CHANGE IN PRODUCTION)
 */
export async function ensureSuperAdmin(): Promise<void> {
  const username = process.env.DASHBOARD_SUPERADMIN_USERNAME?.trim() ?? "admin"
  const password = process.env.DASHBOARD_SUPERADMIN_PASSWORD ?? "admin123"

  if (password.length < 6) {
    console.warn("[bootstrap] DASHBOARD_SUPERADMIN_PASSWORD is too short (< 6 chars). Skipping.")
    return
  }

  try {
    await ensureExampleDatabaseConnection()
    const db = exampleDb()

    // Already have an active super → nothing to do
    const [{ activeSupers }] = db
      .select({ activeSupers: sql<number>`count(*)` })
      .from(admins)
      .where(sql`${admins.isSuper} = 1 AND ${admins.enabled} = 1 AND ${admins.deletedAt} IS NULL`)
      .all()

    if (Number(activeSupers ?? 0) > 0) return

    // Promote existing account if same username exists
    const [existing] = db.select().from(admins).where(eq(admins.username, username)).limit(1).all()

    if (existing) {
      db.update(admins)
        .set({ isSuper: true, enabled: true, deletedAt: null, updatedAt: new Date().toISOString() })
        .where(eq(admins.id, existing.id))
        .run()
      console.log(`[bootstrap] promoted "${username}" (id=${existing.id}) to superadmin.`)
      return
    }

    // Create new superadmin
    const passwordHash = await hashPassword(password)
    const now = new Date().toISOString()
    db.insert(admins)
      .values({
        username,
        passwordHash,
        nickname: username,
        isSuper: true,
        enabled: true,
        createdAt: now,
        updatedAt: now,
      })
      .run()
    console.log(`[bootstrap] created superadmin "${username}".`)
  } catch (err) {
    console.warn("[bootstrap] ensureSuperAdmin failed:", err instanceof Error ? err.message : err)
  }
}
