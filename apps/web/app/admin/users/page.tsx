'use client'

import React, { useState, useEffect } from 'react'
import { User, UserFormData, UserUpdateData } from '@/types/user'

import { UsersTable } from '@/components/users/users-table'
import { UserForm } from '@/components/users/user-form'
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
  RiUserLine
} from '@remixicon/react'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [formLoading, setFormLoading] = useState(false)

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')

      if (response.ok) {
        const usersData = await response.json()
        setUsers(usersData || [])
      } else {
        console.error('Failed to load users:', response.statusText)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setFormMode('edit')
    setEditingUser(user)
    setIsFormOpen(true)
  }

  const handleDelete = async (user: User) => {
    if (window.confirm(`确定要删除用户 "${user.email}" 吗？此操作无法撤销。`)) {
      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          await loadUsers()
          alert('用户删除成功')
        } else {
          const errorData = await response.json()
          alert(errorData.error || '删除失败')
        }
      } catch (error) {
        console.error('Failed to delete user:', error)
        alert('删除失败')
      }
    }
  }

  const handleAddNew = () => {
    setFormMode('add')
    setEditingUser(undefined)
    setIsFormOpen(true)
  }

  const handleFormSave = async (data: UserFormData) => {
    try {
      setFormLoading(true)
      
      if (formMode === 'edit' && editingUser) {
        // 更新用户
        const updateData: UserUpdateData = {}
        if (data.email) updateData.email = data.email
        if (data.password) updateData.password = data.password
        if (data.role) updateData.role = data.role

        const response = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        })
        
        if (response.ok) {
          await loadUsers()
          setIsFormOpen(false)
          setEditingUser(undefined)
          alert('用户更新成功')
        } else {
          const errorData = await response.json()
          alert(errorData.error || '更新失败')
        }
      } else {
        // 创建新用户
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        
        if (response.ok) {
          await loadUsers()
          setIsFormOpen(false)
          alert('用户创建成功')
        } else {
          const errorData = await response.json()
          alert(errorData.error || '创建失败')
        }
      }
    } catch (error) {
      console.error('Failed to save user:', error)
      alert('保存失败')
    } finally {
      setFormLoading(false)
    }
  }

  const handleFormCancel = () => {
    setIsFormOpen(false)
    setEditingUser(undefined)
  }

  useEffect(() => {
    loadUsers()
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
                  <BreadcrumbPage>用户管理</BreadcrumbPage>
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
              <h1 className="text-2xl font-semibold">用户管理</h1>
              <p className="text-sm text-muted-foreground">
                管理系统用户账户，设置用户角色权限
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadUsers}
                disabled={loading}
              >
                <RiRefreshLine className="h-4 w-4" />
                刷新
              </Button>
              <Button onClick={handleAddNew} className="flex items-center gap-2">
                <RiAddLine className="h-4 w-4" />
                新建用户
              </Button>
            </div>
          </div>

          {/* 用户表格 */}
          <UsersTable 
            data={users} 
            loading={loading} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            onRefresh={loadUsers}
          />
        </div>
      </SidebarInset>

      {/* 用户表单对话框 */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[95vw] max-w-lg sm:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'add' ? '新建用户' : '编辑用户'}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            user={editingUser}
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