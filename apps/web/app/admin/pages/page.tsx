'use client'

import { useEffect, useState } from 'react'

import { AppSidebar } from '@/components/app-sidebar'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar'
import UserDropdown from '@/components/user-dropdown'

import { RiAddLine, RiDeleteBinLine, RiEditLine, RiFileTextLine, RiScanLine } from '@remixicon/react'

interface DynamicPage {
  id: string
  title: string
  slug: string
  description: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

export default function AdminPagesPage() {
  const [pages, setPages] = useState<DynamicPage[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const mockPages: DynamicPage[] = [
      {
        id: '1',
        title: 'Home Page',
        slug: 'home',
        description: 'Main landing page for the application',
        isPublished: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        title: 'About Us',
        slug: 'about',
        description: 'Company information and team details',
        isPublished: true,
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-10')
      },
      {
        id: '3',
        title: 'Contact',
        slug: 'contact',
        description: 'Contact form and information',
        isPublished: false,
        createdAt: new Date('2024-01-08'),
        updatedAt: new Date('2024-01-08')
      }
    ]

    setTimeout(() => {
      setPages(mockPages)
      setLoading(false)
    }, 500)
  }, [])

  const handleAddPage = () => {
    // TODO: Implement add page functionality
    console.log('Add new page')
  }

  const handleEditPage = (page: DynamicPage) => {
    // TODO: Implement edit page functionality
    console.log('Edit page:', page)
  }

  const handleDeletePage = (page: DynamicPage) => {
    if (window.confirm(`Are you sure you want to delete "${page.title}"?`)) {
      setPages(pages.filter(p => p.id !== page.id))
    }
  }

  const handleTogglePublish = (page: DynamicPage) => {
    setPages(pages.map(p =>
      p.id === page.id ? { ...p, isPublished: !p.isPublished } : p
    ))
  }

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
                  <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Pages</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex gap-3 ml-auto">
            <UserDropdown />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">Pages</h1>
              <p className="text-sm text-muted-foreground">
                Manage dynamic pages and content
              </p>
            </div>
            <Button onClick={handleAddPage} className="flex items-center gap-2">
              <RiAddLine className="h-4 w-4" />
              Add Page
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-3 bg-muted rounded w-full mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pages.map((page) => (
                <Card key={page.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <RiFileTextLine className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <CardTitle className="text-lg">{page.title}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            /{page.slug}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(page)}
                          className={page.isPublished ? 'text-green-600' : 'text-muted-foreground'}
                        >
                          {page.isPublished ? 'Published' : 'Draft'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4">
                      {page.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Updated: {page.updatedAt.toLocaleDateString()}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditPage(page)}
                        >
                          <RiEditLine className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePage(page)}
                          className="text-destructive hover:text-destructive"
                        >
                          <RiDeleteBinLine className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
