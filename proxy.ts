import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/session"

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const session = await getSessionFromRequest(request)

  if (!session) {
    const loginUrl = new URL("/login", request.nextUrl.origin)
    loginUrl.searchParams.set("from", `${pathname}${search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
