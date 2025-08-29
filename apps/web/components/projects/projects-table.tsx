'use client'

import * as React from 'react'
import { ProjectProtocol } from '@/types/project'
import { ColumnDef } from '@tanstack/react-table'

import { UnifiedTable } from '@/components/ui/unified-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import {
  RiMore2Line,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
  RiFolderLine,
  RiUserLine,
  RiDatabase2Line,
  RiCheckLine
} from '@remixicon/react'

interface ProjectsTableProps {
  data: ProjectProtocol[]
  loading?: boolean
  onView?: (project: ProjectProtocol) => void
  onEdit?: (project: ProjectProtocol) => void
  onDelete?: (project: ProjectProtocol) => void
  onRefresh?: () => void
}

export function ProjectsTable({ 
  data, 
  loading = false, 
  onView,
  onEdit,
  onDelete,
  onRefresh 
}: ProjectsTableProps) {
  
  const columns: ColumnDef<ProjectProtocol>[] = [
    {
      id: 'name',
      accessorKey: 'name',
      header: '项目名称',
      cell: ({ row }) => {
        const project = row.original
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              <RiFolderLine className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-sm truncate" title={project.name}>
                {project.name}
              </div>
              {project.description && (
                <div className="text-xs text-muted-foreground truncate" title={project.description}>
                  {project.description}
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      id: 'environment',
      accessorKey: 'environment',
      header: '部署环境',
      cell: ({ row }) => {
        const environment = row.getValue('environment') as 'development' | 'staging' | 'production'
        if (!environment) return <span className="text-muted-foreground">-</span>
        
        const environmentConfig = {
          development: {
            label: '开发',
            className: 'gap-1 py-0.5 px-2 text-sm text-blue-700 border-blue-300 bg-blue-50 dark:text-blue-300 dark:border-blue-700 dark:bg-blue-950/30'
          },
          staging: {
            label: '测试',
            className: 'gap-1 py-0.5 px-2 text-sm text-orange-700 border-orange-300 bg-orange-50 dark:text-orange-300 dark:border-orange-700 dark:bg-orange-950/30'
          },
          production: {
            label: '生产',
            className: 'gap-1 py-0.5 px-2 text-sm text-emerald-700 border-emerald-300 bg-emerald-50 dark:text-emerald-300 dark:border-emerald-700 dark:bg-emerald-950/30'
          }
        }
        
        const config = environmentConfig[environment]
        
        return (
          <Badge variant="outline" className={cn(config.className)}>
            <RiCheckLine className="text-current" size={14} aria-hidden="true" />
            {config.label}
          </Badge>
        )
      },
    },
    {
      id: 'dataSources',
      accessorKey: 'dataSourceIds',
      header: '数据源',
      cell: ({ row }) => {
        const dataSourceIds = row.getValue('dataSourceIds') as string[] || []
        return (
          <div className="flex items-center gap-2">
            <RiDatabase2Line className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{dataSourceIds.length} 个</span>
          </div>
        )
      },
    },
    {
      id: 'owner',
      accessorKey: 'owner',
      header: '负责人',
      cell: ({ row }) => {
        const owner = row.getValue('owner') as string
        if (!owner) return <span className="text-muted-foreground">-</span>
        
        return (
          <div className="flex items-center gap-2">
            <RiUserLine className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{owner}</span>
          </div>
        )
      },
    },
    {
      id: 'team',
      accessorKey: 'team',
      header: '团队',
      cell: ({ row }) => {
        const team = row.getValue('team') as string[] || []
        if (team.length === 0) return <span className="text-muted-foreground">-</span>
        
        return (
          <div className="text-xs">
            <span className="text-muted-foreground">{team.length} 人</span>
            {team.length > 0 && (
              <div className="text-muted-foreground mt-1" title={team.join(', ')}>
                {team.slice(0, 2).join(', ')}
                {team.length > 2 && '...'}
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: 'actions',
      header: '操作',
      cell: ({ row }) => {
        const project = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">打开菜单</span>
                <RiMore2Line className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={() => onView?.(project)}>
                <RiEyeLine className="mr-2 h-4 w-4" />
                查看详情
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(project)}>
                <RiEditLine className="mr-2 h-4 w-4" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => onDelete?.(project)}
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
      searchPlaceholder="搜索项目..."
      emptyMessage="暂无项目数据"
      onRefresh={onRefresh}
    />
  )
}