'use client'

import { UnifiedTable } from '@/components/ui/unified-table'
import type { ColumnDef } from '@tanstack/react-table'
import React from 'react'

interface TestData {
  id: string
  name: string
  status: 'active' | 'inactive'
  createdAt: Date
}

const testData: TestData[] = [
  { id: '1', name: 'Test 1', status: 'active', createdAt: new Date() },
  { id: '2', name: 'Test 2', status: 'inactive', createdAt: new Date() },
  { id: '3', name: 'Test 3', status: 'active', createdAt: new Date() },
]

const columns: ColumnDef<TestData>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    meta: { label: 'Name', sortable: true }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { label: 'Status', sortable: true, filterVariant: 'select', filterOptions: ['active', 'inactive'] }
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => row.original.createdAt.toLocaleDateString(),
    meta: { label: 'Created At', sortable: true }
  }
]

export function TestTable() {
  console.log('TestTable rendering...')
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Table - Re-render Check</h1>
      <UnifiedTable
        data={testData}
        columns={columns}
        searchable={true}
        filterable={true}
        sortable={true}
        pagination={{ pageSize: 2, pageSizeOptions: [2, 5, 10] }}
      />
    </div>
  )
}