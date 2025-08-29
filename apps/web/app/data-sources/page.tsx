'use client'

import type { DataSourceProtocol } from '@/types/datasource'
import React, { useState } from 'react'

import { DataSourceForm } from '@/components/datasource/data-source-form'
import { DataSourcesTable } from '@/components/datasource/data-sources-table'

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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import UserDropdown from '@/components/user-dropdown'

import { RiAddLine, RiRefreshLine, RiScanLine } from '@remixicon/react'

export default function DataSourcesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDataSource, setEditingDataSource] = useState<DataSourceProtocol | undefined>(undefined)
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add')
  const [dataSources, setDataSources] = useState<DataSourceProtocol[]>([])
  const [loading, setLoading] = useState(true)

  const handleAddNew = () => {
    setFormMode('add')
    setEditingDataSource(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (dataSource: DataSourceProtocol) => {
    setFormMode('edit')
    setEditingDataSource(dataSource)
    setIsFormOpen(true)
  }

  const handleTest = async (dataSource: DataSourceProtocol) => {
    try {
      const result = await import('@/lib/datasource-service').then(({ dataSourceService }) =>
        dataSourceService.testConnection(dataSource.type, dataSource.config)
      )

      if (result.success) {
        alert('Connection successful!')
      } else {
        alert(`Connection failed: ${result.message}`)
      }
    } catch (error) {
      console.error('Test failed:', error)
      alert('Failed to test connection')
    }
  }

  const handleSave = (dataSource: DataSourceProtocol) => {
    console.log('Saved data source:', dataSource)
    setIsFormOpen(false)
    setEditingDataSource(undefined)
    // Trigger refresh of the table
    window.dispatchEvent(new CustomEvent('refreshDataSources'))
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingDataSource(undefined)
  }

  const loadDataSources = async () => {
    try {
      setLoading(true)
      const { dataSourceService } = await import('@/lib/datasource-service')
      const sources = await dataSourceService.getDataSources()
      setDataSources(sources)
    } catch (error) {
      console.error('Failed to load data sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (dataSource: DataSourceProtocol) => {
    if (window.confirm(`Are you sure you want to delete "${dataSource.name}"? This action cannot be undone.`)) {
      try {
        const { dataSourceService } = await import('@/lib/datasource-service')
        await dataSourceService.deleteDataSource(dataSource.id)
        await loadDataSources()
      } catch (error) {
        console.error('Failed to delete data source:', error)
        alert('Failed to delete data source')
      }
    }
  }

  React.useEffect(() => {
    loadDataSources()
    
    // Listen for custom events
    const handleRefresh = () => loadDataSources()
    const handleAddDataSource = () => handleAddNew()
    
    window.addEventListener('refreshDataSources', handleRefresh)
    window.addEventListener('addDataSource', handleAddDataSource)
    
    return () => {
      window.removeEventListener('refreshDataSources', handleRefresh)
      window.removeEventListener('addDataSource', handleAddDataSource)
    }
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
                  <BreadcrumbPage>Data Sources</BreadcrumbPage>
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
              <h1 className="text-2xl font-semibold">Data Sources</h1>
              <p className="text-sm text-muted-foreground">
                Manage and configure your database connections and external data sources
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={loadDataSources}
              >
                <RiRefreshLine className="h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={handleAddNew} className="flex items-center gap-2">
                <RiAddLine className="h-4 w-4" />
                Add Data Source
              </Button>
            </div>
          </div>

          <DataSourcesTable 
            data={dataSources} 
            loading={loading} 
            onEdit={handleEdit} 
            onTest={handleTest}
            onDelete={handleDelete}
          />
        </div>
      </SidebarInset>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[95vw] max-w-[1200px] min-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'add' ? 'Add New Data Source' : 'Edit Data Source'}
            </DialogTitle>
          </DialogHeader>
          <DataSourceForm
            dataSource={editingDataSource}
            mode={formMode}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
