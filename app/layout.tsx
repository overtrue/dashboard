import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { headers } from "next/headers"
import localFont from "next/font/local"
import "./globals.css"
import { Providers } from "@/components/providers"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { loadAdminProfile } from "@/lib/permissions/admin-profile"
import { loadAdminPermissions, serializePermissions } from "@/lib/permissions/load"
import { decodeSession, SESSION_COOKIE } from "@/lib/session"
import type { SerializedPermissions } from "@/components/permissions-provider"
import { cn } from "@/lib/utils"

const fontSans = localFont({
  src: "../public/fonts/inter-latin.woff2",
  variable: "--font-sans",
  display: "swap",
})

const fontMono = localFont({
  src: "../public/fonts/geist-mono-latin.woff2",
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s — Dashboard",
  },
  description: "Admin dashboard framework built with Next.js, Refine, and Drizzle ORM.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

async function loadInitialState(): Promise<{
  perms: SerializedPermissions
  isSuper: boolean
}> {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? ""
    const match = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
    if (!match) return { perms: {}, isSuper: false }

    const session = await decodeSession(match.slice(SESSION_COOKIE.length + 1))
    if (!session) return { perms: {}, isSuper: false }

    const profile = await loadAdminProfile(session.adminId)
    if (!profile || !profile.enabled || profile.deletedAt) {
      return { perms: {}, isSuper: false }
    }

    if (profile.isSuper) return { perms: {}, isSuper: true }

    const perms = await loadAdminPermissions(session.adminId)
    return { perms: serializePermissions(perms), isSuper: false }
  } catch {
    return { perms: {}, isSuper: false }
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { perms, isSuper } = await loadInitialState()

  return (
    <html lang="en" suppressHydrationWarning className={cn(fontSans.variable, fontMono.variable)}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <TooltipProvider>
            <Suspense fallback={<div className="bg-background min-h-svh" />}>
              <Providers perms={perms} isSuper={isSuper}>
                {children}
              </Providers>
              <Toaster />
            </Suspense>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
