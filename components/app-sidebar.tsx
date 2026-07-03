"use client"

import * as React from "react"

import { usePermissions } from "@/components/permissions-provider"
import { NavSection } from "@/components/nav-section"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { canAccessDashboardResource } from "@/lib/permissions/access"
import {
  RiBox1Line,
  RiDashboardLine,
  RiFileTextLine,
  RiLayoutGridLine,
  RiShieldUserLine,
} from "@remixicon/react"

const resourceIcons: Record<string, React.ReactNode> = {
  "dashboard-home": <RiDashboardLine aria-hidden />,
  items: <RiBox1Line aria-hidden />,
  admins: <RiShieldUserLine aria-hidden />,
  auditLogs: <RiFileTextLine aria-hidden />,
}

export type SidebarItem = {
  name: string
  label: string
  url: string
  requiredAction?: string
}

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  appName?: string
  overview: SidebarItem[]
  resources: SidebarItem[]
  operations: SidebarItem[]
  system: SidebarItem[]
}

function withIcons(items: SidebarItem[]) {
  return items.map((item) => ({
    ...item,
    icon: resourceIcons[item.name],
  }))
}

export function AppSidebar({
  appName = "Dashboard",
  overview,
  resources,
  operations,
  system,
  ...props
}: AppSidebarProps) {
  const teams = [
    {
      name: appName,
      logo: <RiLayoutGridLine aria-hidden className="size-4" />,
    },
  ]
  const { perms, isSuper } = usePermissions()
  const canAccess = (item: SidebarItem) =>
    canAccessDashboardResource({
      perms,
      isSuper,
      resourceName: item.name,
      action: item.requiredAction,
    })
  const visibleOverview = overview.filter(canAccess)
  const visibleResources = resources.filter(canAccess)
  const visibleOperations = operations.filter(canAccess)
  const visibleSystem = system.filter(canAccess)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavSection items={withIcons(visibleOverview)} />
        <NavSection label="Resources" items={withIcons(visibleResources)} />
        <NavSection label="Operations" items={withIcons(visibleOperations)} />
        <NavSection label="System" items={withIcons(visibleSystem)} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
