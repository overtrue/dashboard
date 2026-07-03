import "server-only"

import { cache } from "react"
import { eq } from "drizzle-orm"

import { exampleDb } from "@/db/example/client"
import { admins } from "@/db/example/schema"
import { DashboardError } from "@/lib/errors"
import { getSessionFromRequest, type SessionData } from "@/lib/session"

export type AdminProfile = {
  id: number
  username: string
  isSuper: boolean
  enabled: boolean
  deletedAt: string | null
}

export const loadAdminProfile = cache(async (adminId: number): Promise<AdminProfile | null> => {
  const db = exampleDb()
  const [row] = db
    .select({
      id: admins.id,
      username: admins.username,
      isSuper: admins.isSuper,
      enabled: admins.enabled,
      deletedAt: admins.deletedAt,
    })
    .from(admins)
    .where(eq(admins.id, adminId))
    .limit(1)
    .all()

  if (!row) return null
  return {
    id: row.id,
    username: row.username,
    isSuper: row.isSuper === true || (row.isSuper as unknown) === 1,
    enabled: row.enabled === true || (row.enabled as unknown) === 1,
    deletedAt: row.deletedAt ?? null,
  }
})

const perRequest = new WeakMap<Request, Promise<AdminProfile | null>>()

export function getAdminProfileForRequest(
  request: Request,
  adminId: number
): Promise<AdminProfile | null> {
  let p = perRequest.get(request)
  if (!p) {
    p = loadAdminProfile(adminId)
    perRequest.set(request, p)
  }
  return p
}

export async function requireActiveAdmin(
  request: Request
): Promise<{ session: SessionData; profile: AdminProfile }> {
  const session = await getSessionFromRequest(request)
  if (!session) throw new DashboardError("Unauthorized", 401)

  const profile = await getAdminProfileForRequest(request, session.adminId)
  if (!profile) throw new DashboardError("Unauthorized", 401)
  if (!profile.enabled) throw new DashboardError("Account is disabled", 403)
  if (profile.deletedAt) throw new DashboardError("Account has been deleted", 403)

  return { session, profile }
}
