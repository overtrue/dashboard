import type { PropsWithChildren } from "react"
import { headers } from "next/headers"

import { AppSidebar, type SidebarItem } from "@/components/app-sidebar"
import { NavUser } from "@/components/nav-user"
import { ThemeToggle } from "@/components/theme-toggle"
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {
  getDashboardResourceDisplayName,
  getDashboardResourcesByGroup,
} from "@/lib/dashboard-resources"
import { decodeSession, SESSION_COOKIE } from "@/lib/session"
import { exampleDb } from "@/db/example/client"
import { admins } from "@/db/example/schema"
import { eq } from "drizzle-orm"

const fallbackUser = { name: "admin", email: "admin@dashboard" }

async function loadUser(): Promise<{ name: string; email: string }> {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? ""
    const match = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
    if (!match) return fallbackUser
    const session = await decodeSession(match.slice(SESSION_COOKIE.length + 1))
    if (!session) return fallbackUser
    const db = exampleDb()
    const [admin] = db.select().from(admins).where(eq(admins.id, session.adminId)).limit(1).all()
    if (!admin) return fallbackUser
    return { name: admin.username, email: `${admin.username}@dashboard` }
  } catch {
    return fallbackUser
  }
}

function toItem(r: ReturnType<typeof getDashboardResourcesByGroup>[number]): SidebarItem {
  return {
    name: r.name,
    label: getDashboardResourceDisplayName(r),
    url: r.list!,
    requiredAction: r.requiredAction,
  }
}

export default async function DashboardLayout({ children }: PropsWithChildren) {
  const user = await loadUser()

  return (
    <>
      <a
        href="#dashboard-content"
        className="bg-background text-foreground focus-visible:ring-ring sr-only fixed top-3 left-3 z-50 rounded-md border px-3 py-2 text-sm shadow-sm focus:not-sr-only focus-visible:ring-2 focus-visible:outline-none"
      >
        Skip to Content
      </a>
      <SidebarProvider>
        <AppSidebar
          overview={getDashboardResourcesByGroup("overview").map(toItem)}
          resources={getDashboardResourcesByGroup("resources").map(toItem)}
          operations={getDashboardResourcesByGroup("operations").map(toItem)}
          system={getDashboardResourcesByGroup("system").map(toItem)}
        />
        <SidebarInset id="dashboard-content" tabIndex={-1}>
          <header className="border-border/60 bg-background/95 flex h-16 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <div className="min-w-0 flex-1">
              <Breadcrumb />
            </div>
            <ThemeToggle />
            <NavUser user={user} />
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </>
  )
}
