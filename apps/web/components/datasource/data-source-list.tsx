'use client'

import * as React from 'react'
import { useState, useMemo } from 'react'
import type { DataSourceProtocol, DataSourceType, DataSourceFilters } from '@/types/datasource'
import { dataSourceService } from '@/lib/datasource-service'
import { dataSourceTypeLabels } from '@/types/datasource'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog'

import {
  RiDatabase2Line,
  RiMore2Line,
  RiEditLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiCheckLine,
  RiCloseLine,
  RiSearchLine,
  RiTimeLine,
  RiFlagLine
} from '@remixicon/react'

interface DataSourceListProps {
  onEdit?: (dataSource: DataSourceProtocol) => void
  onTest?: (dataSource: DataSourceProtocol) => void
}

export function DataSourceList({ onEdit, onTest }: DataSourceListProps) {
  const [dataSources, setDataSources] = useState<DataSourceProtocol[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<DataSourceFilters>({})
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedDataSource, setSelectedDataSource] = useState<DataSourceProtocol | null>(null)

  React.useEffect(() => {
    loadDataSources()
  }, [])

  const loadDataSources = async () => {
    try {
      setLoading(true)
      const sources = await dataSourceService.getDataSources()
      setDataSources(sources)
    } catch (error) {
      console.error('Failed to load data sources:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDataSources = useMemo(() => {
    return dataSources.filter(source => {
      if (filters.type && source.type !== filters.type) return false
      if (filters.name && !source.name.toLowerCase().includes(filters.name.toLowerCase())) return false
      if (filters.isActive !== undefined && source.isActive !== filters.isActive) return false
      if (filters.isValid !== undefined && source.isValid !== filters.isValid) return false
      if (filters.tags && filters.tags.length > 0) {
        return filters.tags.some(tag => source.tags?.includes(tag))
      }
      return true
    })
  }, [dataSources, filters])

  const handleDelete = async () => {
    if (!selectedDataSource) return

    try {
      await dataSourceService.deleteDataSource(selectedDataSource.id)
      await loadDataSources()
      setDeleteDialogOpen(false)
      setSelectedDataSource(null)
    } catch (error) {
      console.error('Failed to delete data source:', error)
    }
  }

  const formatLastTested = (date: Date | undefined) => {
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
      return <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
    }
    return isValid ? (
      <Badge variant="default" className="bg-green-500">
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


  return (
    <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search data sources..."
                  value={filters.name || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                  className="pl-10 h-10"
                />
              </div>
              <Select
                value={filters.type || 'all'}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  type: value === 'all' ? undefined : value as DataSourceType 
                }))}
              >
                <SelectTrigger className="w-[180px] h-10">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {Object.entries(dataSourceTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  isActive: value === 'all' ? undefined : value === 'true' 
                }))}
              >
                <SelectTrigger className="w-[140px] h-10">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Sources Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50 hover:bg-transparent">
                    <TableHead className="w-[40%] font-medium text-foreground/80">Name</TableHead>
                    <TableHead className="font-medium text-foreground/80">Type</TableHead>
                    <TableHead className="font-medium text-foreground/80">Status</TableHead>
                    <TableHead className="font-medium text-foreground/80">Last Tested</TableHead>
                    <TableHead className="font-medium text-foreground/80">Tags</TableHead>
                    <TableHead className="text-right font-medium text-foreground/80">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow className="border-b border-border/50">
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        Loading data sources...
                      </TableCell>
                    </TableRow>
                  ) : filteredDataSources.length === 0 ? (
                    <TableRow className="border-b border-border/50">
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <RiDatabase2Line className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No data sources found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDataSources.map((source) => (
                      <TableRow key={source.id} className="border-b border-border/50 hover:bg-muted/5">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-sidebar/60 to-sidebar flex items-center justify-center">
                              <RiDatabase2Line className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{source.name}</p>
                              <p className="text-sm text-muted-foreground">{source.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{dataSourceTypeLabels[source.type]}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(source.isValid, source.isActive)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <RiTimeLine className="h-3 w-3" />
                            {formatLastTested(source.lastTested)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {source.tags?.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                <RiFlagLine className="h-2.5 w-2.5 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                            {source.tags && source.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{source.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <RiMore2Line className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onTest?.(source)}>
                                <RiRefreshLine className="mr-2 h-4 w-4" />
                                Test Connection
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => onEdit?.(source)}>
                                <RiEditLine className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedDataSource(source)
                                  setDeleteDialogOpen(true)
                                }}
                                className="text-destructive"
                              >
                                <RiDeleteBinLine className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Data Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedDataSource?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default DataSourceList