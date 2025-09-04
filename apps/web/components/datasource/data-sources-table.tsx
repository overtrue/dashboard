'use client'

import type { DataSourceProtocol, DataSourceType } from '@/types/datasource'
import { dataSourceTypeLabels } from '@/types/datasource'
import { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { UnifiedTable } from '@/components/ui/unified-table'

import {
    RiCheckLine,
    RiCloseLine,
    RiDatabase2Line,
    RiDeleteBinLine,
    RiEditLine,
    RiFlagLine,
    RiMore2Line,
    RiRefreshLine,
    RiTimeLine
} from '@remixicon/react'

interface DataSourcesTableProps {
  data: DataSourceProtocol[]
  loading?: boolean
  onEdit?: (dataSource: DataSourceProtocol) => void
  onTest?: (dataSource: DataSourceProtocol) => void
  onDelete?: (dataSource: DataSourceProtocol) => void
  onRefresh?: () => void
}

const formatLastTested = (date: Date | undefined): string => {
  if (!date) return 'Never'
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

const getStatusBadge = (isValid: boolean, isActive: boolean) => {
  if (!isActive) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Inactive
      </Badge>
    )
  }
  return isValid ? (
    <Badge variant="default" className="bg-green-500 text-white">
      <RiCheckLine className="mr-1 h-3 w-3" />
      Valid
    </Badge>
  ) : (
    <Badge variant="destructive">
      <RiCloseLine className="mr-1 h-3 w-3" />
      Invalid
    </Badge>
  )
}

const createColumns = (onEdit?: (dataSource: DataSourceProtocol) => void, onTest?: (dataSource: DataSourceProtocol) => void, onDelete?: (dataSource: DataSourceProtocol) => void): ColumnDef<DataSourceProtocol>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          aria-label="Select all"
          className="h-4 w-4 rounded border-gray-300"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(e.target.checked)}
          aria-label="Select row"
          className="h-4 w-4 rounded border-gray-300"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
    meta: {
      label: 'Select',
      align: 'center',
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const dataSource = row.original
      return (
        <div>
          <div className="font-medium">{dataSource.name}</div>
          <div className="text-sm text-muted-foreground">
            {dataSource.description || 'No description'}
          </div>
        </div>
      )
    },
    meta: {
      label: 'Name',
      sortable: true,
      filterVariant: 'text',
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.getValue('type') as DataSourceType
      return (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {dataSourceTypeLabels[type] || type}
          </span>
        </div>
      )
    },
    meta: {
      label: 'Type',
      sortable: true,
      filterVariant: 'select',
      filterOptions: Object.keys(dataSourceTypeLabels),
    },
  },
  {
    accessorKey: 'isValid',
    header: 'Status',
    cell: ({ row }) => {
      const dataSource = row.original
      return getStatusBadge(dataSource.isValid, dataSource.isActive)
    },
    meta: {
      label: 'Status',
      sortable: true,
      filterVariant: 'select',
      filterOptions: ['Valid', 'Invalid', 'Inactive'],
    },
  },
  {
    accessorKey: 'lastTested',
    header: 'Last Tested',
    cell: ({ row }) => {
      const lastTested = row.getValue('lastTested') as Date | undefined
      return (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <RiTimeLine className="h-3 w-3" />
          {formatLastTested(lastTested)}
        </div>
      )
    },
    meta: {
      label: 'Last Tested',
      sortable: true,
    },
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      const tags = row.original.tags || []
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <RiFlagLine className="h-2.5 w-2.5 mr-1" />
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    meta: {
      label: 'Tags',
      filterVariant: 'text',
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const dataSource = row.original

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <RiMore2Line className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onTest?.(dataSource)}>
                <RiRefreshLine className="mr-2 h-4 w-4" />
                Test Connection
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(dataSource)}>
                <RiEditLine className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete?.(dataSource)}
                className="text-destructive focus:text-destructive"
              >
                <RiDeleteBinLine className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
    meta: {
      label: 'Actions',
      align: 'right',
    },
  },
]

export function DataSourcesTable({
  data,
  loading,
  onEdit,
  onTest,
  onDelete,
  onRefresh,
}: DataSourcesTableProps) {
  const columns = createColumns(onEdit, onTest, onDelete)
  const emptyState = {
    icon: RiDatabase2Line,
    title: 'No Data Sources Found',
    description: 'Get started by adding your first data source. You can connect to databases, APIs, or files.',
    action: {
      label: 'Add Data Source',
      onClick: () => {
        // This will be handled by the parent component
        window.dispatchEvent(new CustomEvent('addDataSource'))
      },
    },
  }

  return (
    <div className="space-y-4">
      <UnifiedTable
        data={data}
        columns={columns}
        loading={loading}
        searchable={true}
        filterable={true}
        sortable={true}
        selectable={true}
        pagination={{ pageSize: 10, pageSizeOptions: [5, 10, 25, 50] }}
        columnVisibility={true}
        emptyState={emptyState}
        className="w-full"
      />
    </div>
  )
}

export default DataSourcesTable
