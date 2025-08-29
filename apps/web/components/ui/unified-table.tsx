'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table'

import { cn } from '@/lib/utils'

// Extend the ColumnMeta interface
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends unknown, TValue> {
    label?: string
    filterVariant?: 'text' | 'select' | 'checkbox' | 'range'
    filterOptions?: string[]
    sortable?: boolean
    align?: 'left' | 'center' | 'right'
    width?: string | number
    hidden?: boolean
  }
}
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RiSearchLine, RiArrowUpDownLine, RiArrowUpLine, RiArrowDownLine, RiMore2Line, RiFilterLine, RiEyeLine } from '@remixicon/react'

// Data table types
export interface DataTableColumnMeta {
  label?: string
  filterVariant?: 'text' | 'select' | 'checkbox' | 'range'
  filterOptions?: string[]
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
  width?: string | number
  hidden?: boolean
}

export interface DataTableFilterMeta {
  id: string
  title: string
  options: {
    label: string
    value: string
    icon?: React.ComponentType<{ className?: string }>
  }[]
}

export interface DataTableProps<TData> {
  data: TData[]
  columns: ColumnDef<TData, any>[]
  loading?: boolean
  searchable?: boolean
  filterable?: boolean
  sortable?: boolean
  selectable?: boolean
  pagination?: boolean | { pageSize?: number; pageSizeOptions?: number[] }
  columnVisibility?: boolean
  emptyState?: {
    icon?: React.ComponentType<{ className?: string }>
    title?: string
    description?: string
    action?: {
      label: string
      onClick: () => void
    }
  }
  onRowSelectionChange?: (selectedRows: TData[]) => void
  className?: string
  meta?: {
    filters?: DataTableFilterMeta[]
  }
}

// Reusable loading skeleton
const DataTableSkeleton = ({ columns = 6 }: { columns?: number }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-10 w-[300px]" />
      <Skeleton className="h-10 w-[100px]" />
    </div>
    <div className="rounded-md border">
      <div className="p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-3">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Empty state component
const DataTableEmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: NonNullable<DataTableProps<any>['emptyState']>) => (
  <div className="flex flex-col items-center justify-center py-12">
    {Icon && (
      <div className="rounded-full bg-gradient-to-br from-sidebar/60 to-sidebar p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
    )}
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
      {description}
    </p>
    {action && (
      <Button onClick={action.onClick} className="flex items-center gap-2">
        {action.label}
      </Button>
    )}
  </div>
)

// Pagination component
const DataTablePagination = <TData,>({ table }: { table: any }) => {
  const pageCount = table.getPageCount()
  
  if (pageCount <= 0) {
    return null
  }

  const pageIndex = table.getState().pagination.pageIndex
  const currentPage = pageIndex + 1
  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const filteredCount = table.getFilteredRowModel().rows.length

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {selectedCount > 0 && (
          <>
            {selectedCount} of{" "}
            {filteredCount} row(s) selected.
          </>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        
        <div className="flex items-center space-x-1">
          <div className="flex items-center">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {pageCount}
            </span>
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

// Main table component
export function UnifiedTable<TData>({
  data,
  columns,
  loading = false,
  searchable = true,
  filterable = true,
  sortable = true,
  selectable = false,
  pagination = true,
  columnVisibility = true,
  emptyState,
  onRowSelectionChange,
  className,
  meta,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibilityState, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')

  const defaultEmptyState: DataTableProps<TData>['emptyState'] = {
    title: 'No data found',
    description: 'No items match your current filters.',
    action: {
      label: 'Clear filters',
      onClick: () => {
        setColumnFilters([])
        setGlobalFilter('')
      },
    },
  }

  const effectiveEmptyState = emptyState || defaultEmptyState

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility: columnVisibilityState,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: selectable,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })


  if (loading) {
    return <DataTableSkeleton columns={columns.length} />
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      {(searchable || filterable || columnVisibility) && (
        <div className="flex items-center justify-between gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-sm">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="pl-10 h-10"
              />
            </div>
          )}
          
          <div className="flex items-center gap-2">
            {columnVisibility && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10">
                    <RiEyeLine className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[150px]">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                          {column.columnDef.meta?.label || column.id}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className={cn(
                      "font-medium text-foreground/80",
                      header.column.columnDef.meta?.align === 'center' && "text-center",
                      header.column.columnDef.meta?.align === 'right' && "text-right"
                    )}>
                      {header.isPlaceholder ? null : (
                        <div className={cn(
                          "flex items-center",
                          sortable && header.column.getCanSort() && "cursor-pointer select-none",
                          header.column.columnDef.meta?.align === 'center' && "justify-center",
                          header.column.columnDef.meta?.align === 'right' && "justify-end"
                        )}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sortable && header.column.getCanSort() && (
                            <span className="ml-2">
                              {header.column.getIsSorted() === 'asc' ? (
                                <RiArrowUpLine className="h-3 w-3" />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <RiArrowDownLine className="h-3 w-3" />
                              ) : (
                                <RiArrowUpDownLine className="h-3 w-3 text-muted-foreground" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-border/50 hover:bg-muted/5"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn(
                      "p-3 align-middle",
                      cell.column.columnDef.meta?.align === 'center' && "text-center",
                      cell.column.columnDef.meta?.align === 'right' && "text-right"
                    )}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <DataTableEmptyState {...effectiveEmptyState!} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="border-t px-2 py-4">
          <DataTablePagination table={table} />
        </div>
      )}
    </div>
  )
}

// Helper components for common cell types
export const DataTableCheckbox = ({ checked, onCheckedChange, ariaLabel }: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  ariaLabel?: string
}) => (
  <Checkbox
    checked={checked}
    onCheckedChange={onCheckedChange}
    aria-label={ariaLabel || 'Select row'}
    className="translate-y-[2px]"
  />
)

export const DataTableStatusBadge = ({ status, variant = 'default' }: {
  status: string
  variant?: 'default' | 'success' | 'warning' | 'error'
}) => {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    success: 'bg-green-500/10 text-green-600 dark:text-green-400',
    warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    error: 'bg-red-500/10 text-red-600 dark:text-red-400',
  }

  return (
    <Badge variant="outline" className={variants[variant]}>
      {status}
    </Badge>
  )
}

export const DataTableActions = ({ children }: { children: React.ReactNode }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <RiMore2Line className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {children}
    </DropdownMenuContent>
  </DropdownMenu>
)