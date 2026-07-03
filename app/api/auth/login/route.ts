import { NextRequest, NextResponse } from "next/server"
import { login } from "@/lib/auth"
import { toErrorResponse } from "@/lib/api-utils"

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      username?: unknown
      password?: unknown
    } | null

    if (!body || typeof body !== "object") {
      return NextResponse.json({ message: "Request body must be valid JSON" }, { status: 400 })
    }

    const { username, password } = body

    if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
    }

    const { admin } = await login(username, password)
    return NextResponse.json({ username: admin.username })
  } catch (error) {
    return toErrorResponse(error)
  }
}
