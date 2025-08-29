'use client'

import React, { useState, useEffect } from 'react'
import { ProjectProtocol, ProjectFormData } from '@/types/project'

import { ProjectsTable } from '@/components/projects/projects-table'
import { ProjectForm } from '@/components/projects/project-form'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import UserDropdown from '@/components/user-dropdown'

import {
  RiAddLine, 
  RiRefreshLine, 
  RiScanLine,
  RiFolderLine
} from '@remixicon/react'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectProtocol[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectProtocol | undefined>(undefined)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [formLoading, setFormLoading] = useState(false)

  const loadProjects = async () => {
    try {
      setLoading(true)
      const projectsResponse = await fetch('/api/projects')

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json()
        setProjects(projectsData.data || [])
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (project: ProjectProtocol) => {
    // TODO: 实现查看详情功能
    console.log('View project:', project)
    alert(`查看项目: ${project.name}`)
  }

  const handleEdit = (project: ProjectProtocol) => {
    setFormMode('edit')
    setEditingProject(project)
    setIsFormOpen(true)
  }

  const handleDelete = async (project: ProjectProtocol) => {
    if (window.confirm(`确定要删除项目 "${project.name}" 吗？此操作无法撤销。`)) {
      try {
        const response = await fetch(`/api/projects?id=${project.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await loadProjects()
          alert('项目删除成功')
        } else {
          alert('删除失败')
        }
      } catch (error) {
        console.error('Failed to delete project:', error)
        alert('删除失败')
      }
    }
  }

  const handleAddNew = () => {
    setFormMode('add')
    setEditingProject(undefined)
    setIsFormOpen(true)
  }

  const handleFormSave = async (data: ProjectFormData) => {
    try {
      setFormLoading(true)
      
      if (formMode === 'edit' && editingProject) {
        // 更新项目
        const response = await fetch('/api/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProject.id, ...data }),
        })
        
        if (response.ok) {
          await loadProjects()
          setIsFormOpen(false)
          setEditingProject(undefined)
          alert('项目更新成功')
        } else {
          alert('更新失败')
        }
      } else {
        // 创建新项目
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        
        if (response.ok) {
          await loadProjects()
          setIsFormOpen(false)
          alert('项目创建成功')
        } else {
          alert('创建失败')
        }
      }
    } catch (error) {
      console.error('Failed to save project:', error)
      alert('保存失败')
    } finally {
      setFormLoading(false)
    }
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setEditingProject(undefined)
  }

  useEffect(() => {
    loadProjects()
  }, [])

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
                  <BreadcrumbPage>项目管理</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="flex gap-3 ml-auto">
            <UserDropdown />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 lg:gap-6 py-4 lg:py-6">
          {/* 页面标题和操作 */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">项目管理</h1>
              <p className="text-sm text-muted-foreground">
                管理您的项目，跟踪进度和团队协作
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadProjects}
                disabled={loading}
              >
                <RiRefreshLine className="h-4 w-4" />
                刷新
              </Button>
              <Button onClick={handleAddNew} className="flex items-center gap-2">
                <RiAddLine className="h-4 w-4" />
                新建项目
              </Button>
            </div>
          </div>


          {/* 项目表格 */}
          <ProjectsTable 
            data={projects} 
            loading={loading} 
            onView={handleView}
            onEdit={handleEdit} 
            onDelete={handleDelete}
            onRefresh={loadProjects}
          />
        </div>
      </SidebarInset>

      {/* 项目表单对话框 */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[95vw] max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'add' ? '新建项目' : '编辑项目'}
            </DialogTitle>
          </DialogHeader>
          <ProjectForm
            project={editingProject}
            mode={formMode}
            onSave={handleFormSave}
            onCancel={handleFormCancel}
            loading={formLoading}
          />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}