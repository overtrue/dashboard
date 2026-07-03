"use client"

import * as React from "react"

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: React.ReactNode
    plan?: React.ReactNode
  }[]
}) {
  const activeTeam = teams[0]

  if (!activeTeam) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          size="lg"
          className="hover:text-sidebar-foreground active:text-sidebar-foreground cursor-default hover:bg-transparent active:bg-transparent"
        >
          <div>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              {activeTeam.logo}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{activeTeam.name}</span>
              {activeTeam.plan ? (
                <div className="mt-1 flex min-w-0 items-center">{activeTeam.plan}</div>
              ) : null}
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
