'use client'

import { User } from '@/types/user'
import { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { UnifiedTable } from '@/components/ui/unified-table'
import { cn } from '@/lib/utils'

import {
    RiAtLine,
    RiDeleteBinLine,
    RiEditLine,
    RiMore2Line,
    RiShieldUserLine,
    RiUserFollowLine,
    RiUserLine
} from '@remixicon/react'

interface UsersTableProps {
  data: User[]
  loading?: boolean
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  onRefresh?: () => void
}

export function UsersTable({
  data,
  loading = false,
  onEdit,
  onDelete,
  onRefresh
}: UsersTableProps) {

  const columns: ColumnDef<User>[] = [
    {
      id: 'user',
      accessorKey: 'email',
      header: '用户信息',
      cell: ({ row }) => {
        const user = row.original
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              {user.role === 'admin' ? (
                <RiShieldUserLine className="h-5 w-5 text-orange-600" />
              ) : (
                <RiUserLine className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <RiAtLine className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-sm truncate" title={user.email}>
                  {user.email}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                ID: {user.id}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      id: 'role',
      accessorKey: 'role',
      header: '角色',
      cell: ({ row }) => {
        const role = row.getValue('role') as 'admin' | 'user'

        const roleConfig = {
          admin: {
            label: '管理员',
            className: 'gap-1 py-0.5 px-2 text-sm text-orange-700 border-orange-300 bg-orange-50 dark:text-orange-300 dark:border-orange-700 dark:bg-orange-950/30'
          },
          user: {
            label: '用户',
            className: 'gap-1 py-0.5 px-2 text-sm text-blue-700 border-blue-300 bg-blue-50 dark:text-blue-300 dark:border-blue-700 dark:bg-blue-950/30'
          }
        }

        const config = roleConfig[role]

        return (
          <Badge variant="outline" className={cn(config.className)}>
            {role === 'admin' ? (
              <RiShieldUserLine className="text-current" size={14} aria-hidden="true" />
            ) : (
              <RiUserFollowLine className="text-current" size={14} aria-hidden="true" />
            )}
            {config.label}
          </Badge>
        )
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: '创建时间',
      cell: ({ row }) => {
        const createdAt = row.getValue('createdAt') as string
        const date = new Date(createdAt)
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString('zh-CN')}</div>
            <div className="text-xs text-muted-foreground">
              {date.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        )
      },
    },
    {
      id: 'updatedAt',
      accessorKey: 'updatedAt',
      header: '更新时间',
      cell: ({ row }) => {
        const updatedAt = row.getValue('updatedAt') as string
        const date = new Date(updatedAt)
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString('zh-CN')}</div>
            <div className="text-xs text-muted-foreground">
              {date.toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const user = row.original
        const isDefaultAdmin = user.id === 'admin-1' && user.role === 'admin'

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">打开菜单</span>
                <RiMore2Line className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={() => onEdit?.(user)}>
                <RiEditLine className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className={cn(
                  isDefaultAdmin
                    ? "text-muted-foreground cursor-not-allowed opacity-50"
                    : "text-red-600"
                )}
                onClick={() => !isDefaultAdmin && onDelete?.(user)}
                disabled={isDefaultAdmin}
              >
                <RiDeleteBinLine className="mr-2 h-4 w-4" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <UnifiedTable
      data={data}
      columns={columns}
      loading={loading}
      searchable={true}
      filterable={true}
      sortable={true}
      pagination={true}
      emptyState={{
        title: "暂无用户数据",
        description: "创建您的第一个用户开始使用"
      }}
    />
  )
}
