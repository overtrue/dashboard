'use client'

import Link from 'next/link'

import { AppSidebar } from '@/components/app-sidebar'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import UserDropdown from '@/components/user-dropdown'

import { RiDatabase2Line, RiFileTextLine, RiFolderLine, RiScanLine, RiUserLine } from '@remixicon/react'

const adminModules = [
  {
    title: 'Data Sources',
    description: 'Manage database connections and external data sources',
    href: '/admin/data-sources',
    icon: RiDatabase2Line,
    color: 'from-blue-500 to-blue-600'
  },
  {
    title: 'Projects',
    description: 'Manage project configurations and settings',
    href: '/admin/projects',
    icon: RiFolderLine,
    color: 'from-green-500 to-green-600'
  },
  {
    title: 'Users',
    description: 'Manage user accounts and permissions',
    href: '/admin/users',
    icon: RiUserLine,
    color: 'from-purple-500 to-purple-600'
  },
  {
    title: 'Pages',
    description: 'Manage dynamic pages and content',
    href: '/admin/pages',
    icon: RiFileTextLine,
    color: 'from-orange-500 to-orange-600'
  }
]

export default function AdminPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden px-4 md:px-6 lg:px-8">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex flex-1 items-center gap-2 px-3">
            <SidebarTrigger className="-ms-4" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    <RiScanLine size={22} aria-hidden="true" />
                    <span className="sr-only">Dashboard</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Admin</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex gap-3 ml-auto">
            <UserDropdown />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
              Manage system configuration, users, and resources
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            {adminModules.map((module) => (
              <Link key={module.href} href={module.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center`}>
                        <module.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
