"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavItem = {
  name: string
  label: string
  url: string
  icon?: React.ReactNode
}

export function NavSection({ label, items }: { label?: string; items: NavItem[] }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      {label ? <SidebarGroupLabel>{label}</SidebarGroupLabel> : null}
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              tooltip={item.label}
              isActive={
                item.url === "/dashboard"
                  ? pathname === item.url
                  : pathname === item.url || pathname.startsWith(`${item.url}/`)
              }
            >
              <Link href={item.url}>
                {item.icon ? (
                  <span aria-hidden className="text-muted-foreground/70">
                    {item.icon}
                  </span>
                ) : null}
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
