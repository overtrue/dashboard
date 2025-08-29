"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DataSourceProtocol, DataSourceType, DataSourceFilters } from "@/types/datasource";
import { dataSourceService } from "@/lib/datasource-service";
import { dataSourceTypeLabels } from "@/types/datasource";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UnifiedTable } from "@/components/ui/unified-table";
import type { ColumnDef } from "@tanstack/react-table";

import {
  RiDatabase2Line,
  RiMore2Line,
  RiEditLine,
  RiDeleteBinLine,
  RiRefreshLine,
  RiCheckLine,
  RiCloseLine,
  RiTimeLine,
  RiFlagLine,
} from "@remixicon/react";

interface DataSourceListProps {
  onEdit?: (dataSource: DataSourceProtocol) => void;
  onTest?: (dataSource: DataSourceProtocol) => void;
}

export function DataSourceListUpdated({ onEdit, onTest }: DataSourceListProps) {
  const [dataSources, setDataSources] = useState<DataSourceProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDataSource, setSelectedDataSource] = useState<DataSourceProtocol | null>(null);

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    try {
      setLoading(true);
      const sources = await dataSourceService.getDataSources();
      setDataSources(sources);
    } catch (error) {
      console.error("Failed to load data sources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDataSource) return;

    try {
      await dataSourceService.deleteDataSource(selectedDataSource.id);
      const updatedData = dataSources.filter(ds => ds.id !== selectedDataSource.id);
      setDataSources(updatedData);
      setDeleteDialogOpen(false);
      setSelectedDataSource(null);
    } catch (error) {
      console.error("Failed to delete data source:", error);
    }
  };

  const formatLastTested = (date: Date | undefined) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  const getStatusBadge = (isValid: boolean, isActive: boolean) => {
    if (!isActive) {
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Inactive
        </Badge>
      );
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
    );
  };

  const columns = useMemo<ColumnDef<DataSourceProtocol>[]>(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      size: 28,
      enableSorting: false,
      enableHiding: false,
    },
    {
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-sidebar/60 to-sidebar flex items-center justify-center">
            <RiDatabase2Line className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground">{row.original.description}</div>
          </div>
        </div>
      ),
      size: 300,
      enableHiding: false,
    },
    {
      header: "Type",
      accessorKey: "type",
      cell: ({ row }) => (
        <div className="text-sm">
          {dataSourceTypeLabels[row.original.type as DataSourceType]}
        </div>
      ),
      size: 120,
    },
    {
      header: "Status",
      accessorKey: "isValid",
      cell: ({ row }) => getStatusBadge(row.original.isValid, row.original.isActive),
      size: 100,
    },
    {
      header: "Last Tested",
      accessorKey: "lastTested",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <RiTimeLine className="h-3 w-3" />
          {formatLastTested(row.original.lastTested)}
        </div>
      ),
      size: 120,
    },
    {
      header: "Tags",
      accessorKey: "tags",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <RiFlagLine className="h-2.5 w-2.5 mr-1" />
              {tag}
            </Badge>
          ))}
          {row.original.tags && row.original.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{row.original.tags.length - 2}
            </Badge>
          )}
        </div>
      ),
      size: 150,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <RiMore2Line className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onTest?.(row.original)}>
              <RiRefreshLine className="mr-2 h-4 w-4" />
              Test Connection
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
              <RiEditLine className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedDataSource(row.original);
                setDeleteDialogOpen(true);
              }}
              className="text-destructive"
            >
              <RiDeleteBinLine className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 60,
      enableHiding: false,
    },
  ], [onEdit, onTest]);

  const filters = useMemo(() => [
    {
      key: "type",
      label: "Type",
      type: "multi-select" as const,
      options: Object.entries(dataSourceTypeLabels).map(([value, label]) => ({
        value,
        label,
      })),
    },
    {
      key: "isActive",
      label: "Status",
      type: "multi-select" as const,
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ], []);

  const handleDataChange = useCallback((newData: DataSourceProtocol[]) => {
    setDataSources(newData);
  }, []);

  return (
    <div className="space-y-4">
      <UnifiedTable
        data={dataSources}
        columns={columns}
        loading={loading}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Data Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedDataSource?.name}"? This action cannot be undone.
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
  );
}

export default DataSourceListUpdated;