import "server-only"

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { eq } from "drizzle-orm"

import { exampleDb } from "@/db/example/client"
import { admins } from "@/db/example/schema"
import { DashboardError } from "@/lib/errors"
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  encodeSession,
  decodeSession,
  type SessionData,
} from "@/lib/session"

export type { SessionData }
export { getSessionFromRequest } from "@/lib/session"

function scryptAsync(password: string, salt: Buffer, keyLen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLen, (err, key) => {
      if (err) reject(err)
      else resolve(key)
    })
  })
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const key = await scryptAsync(password, salt, 64)
  return `${salt.toString("hex")}:${key.toString("hex")}`
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [saltHex, keyHex] = hash.split(":")
  if (!saltHex || !keyHex) return false
  const salt = Buffer.from(saltHex, "hex")
  const storedKey = Buffer.from(keyHex, "hex")
  if (salt.length === 0 || storedKey.length !== 64) return false
  const derivedKey = await scryptAsync(password, salt, 64)
  if (storedKey.length !== derivedKey.length) return false
  return timingSafeEqual(storedKey, derivedKey)
}

export async function createSession(data: SessionData): Promise<void> {
  const token = await encodeSession(data)
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  })
}

export async function getSession(): Promise<SessionData | null> {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  return decodeSession(token)
}

export async function destroySession(): Promise<void> {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
}

export async function login(
  username: string,
  password: string
): Promise<{ session: SessionData; admin: { id: number; username: string } }> {
  const db = exampleDb()
  const [admin] = db
    .select()
    .from(admins)
    .where(eq(admins.username, username.trim()))
    .limit(1)
    .all()

  if (!admin) throw new DashboardError("Username or password is incorrect", 401)
  if (!admin.enabled) throw new DashboardError("Account is disabled", 403)
  if (admin.deletedAt) throw new DashboardError("Account has been deleted", 403)

  const valid = await verifyPassword(password, admin.passwordHash)
  if (!valid) throw new DashboardError("Username or password is incorrect", 401)

  const session: SessionData = {
    adminId: admin.id,
    createdAt: Date.now(),
  }

  await createSession(session)
  return { session, admin: { id: admin.id, username: admin.username } }
}
