/**
 * Cookie-based signed session — Edge Runtime compatible.
 * Session data is JSON-encoded in the cookie, signed with HMAC-SHA256.
 */

export const SESSION_COOKIE = "dashboard_session"
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export type SessionData = {
  adminId: number
  createdAt: number
}

type SignedPayload = {
  data: SessionData
  exp: number
}

const MIN_SECRET_LEN = 32

function requireSigningSecret(): string {
  const secret = process.env.DASHBOARD_SESSION_SECRET
  if (!secret || secret.length < MIN_SECRET_LEN) {
    throw new Error(
      `DASHBOARD_SESSION_SECRET must be set and at least ${MIN_SECRET_LEN} characters`
    )
  }
  return secret
}

function getSigningKey(): Promise<CryptoKey> {
  const secret = requireSigningSecret()
  const encoder = new TextEncoder()
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  )
}

function toBase64Url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let binary = ""
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/")
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function encodeSession(data: SessionData): Promise<string> {
  const payload: SignedPayload = {
    data,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  }
  const json = JSON.stringify(payload)
  const encoder = new TextEncoder()
  const key = await getSigningKey()
  const jsonEncoded = encoder.encode(json)
  const signature = await crypto.subtle.sign("HMAC", key, jsonEncoded)
  const jsonB64 = toBase64Url(jsonEncoded)
  const sigB64 = toBase64Url(signature)
  return `${jsonB64}.${sigB64}`
}

export async function decodeSession(cookie: string): Promise<SessionData | null> {
  const dotIndex = cookie.indexOf(".")
  if (dotIndex === -1) return null

  try {
    const jsonB64 = cookie.slice(0, dotIndex)
    const sigB64 = cookie.slice(dotIndex + 1)

    const jsonBytes = fromBase64Url(jsonB64)
    const sigBytes = fromBase64Url(sigB64)

    const key = await getSigningKey()
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as unknown as BufferSource,
      jsonBytes as unknown as BufferSource
    )
    if (!valid) return null

    const decoder = new TextDecoder()
    const payload = JSON.parse(decoder.decode(jsonBytes)) as {
      data?: Record<string, unknown>
      exp?: unknown
    }

    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null

    const raw = payload.data
    if (!raw || typeof raw !== "object") return null
    const adminId = (raw as { adminId?: unknown }).adminId
    const createdAt = (raw as { createdAt?: unknown }).createdAt
    if (typeof adminId !== "number" || typeof createdAt !== "number") return null
    return { adminId, createdAt }
  } catch {
    return null
  }
}

export async function getSessionFromRequest(request: Request): Promise<SessionData | null> {
  const cookieHeader = request.headers.get("cookie") ?? ""
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`))

  if (!match) return null
  const value = match.slice(SESSION_COOKIE.length + 1)
  return decodeSession(value)
}
