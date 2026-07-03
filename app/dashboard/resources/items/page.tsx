"use client"

import { useTable } from "@refinedev/react-table"
import { createColumnHelper } from "@tanstack/react-table"

import { DataTable } from "@/components/refine-ui/data-table/data-table"
import { EntityTableHeader, EntityStateBadge } from "@/components/entity-ui"
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view"
import { ListSearch, textSearchField } from "@/components/refine-ui/views/list-search"
import { ShowButton } from "@/components/refine-ui/buttons/show"
import {
  type ItemRecord,
  getItemState,
  itemStateTone,
  formatDateTimeLabel,
  formatNullable,
} from "@/lib/items-records"

const columnHelper = createColumnHelper<ItemRecord>()

const columns = [
  columnHelper.accessor("id", {
    header: ({ column }) => <EntityTableHeader title="ID" column={column} />,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground font-mono text-xs">{getValue()}</span>
    ),
    size: 80,
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => <EntityTableHeader title="Name" column={column} />,
    cell: ({ getValue }) => <span className="font-medium">{formatNullable(getValue())}</span>,
    size: 200,
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => <EntityTableHeader title="Status" column={column} />,
    cell: ({ row }) => {
      const state = getItemState(row.original)
      return <EntityStateBadge label={state} tone={itemStateTone[state]} />
    },
    size: 120,
  }),
  columnHelper.accessor("description", {
    header: ({ column }) => (
      <EntityTableHeader title="Description" column={column} sortable={false} />
    ),
    cell: ({ getValue }) => (
      <span className="text-muted-foreground truncate text-sm">{formatNullable(getValue())}</span>
    ),
    size: 300,
  }),
  columnHelper.accessor("createdAt", {
    header: ({ column }) => <EntityTableHeader title="Created At" column={column} />,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground text-xs whitespace-nowrap">
        {formatDateTimeLabel(getValue())}
      </span>
    ),
    size: 160,
  }),
  columnHelper.display({
    id: "actions",
    header: () => null,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <ShowButton recordItemId={row.original.id} variant="ghost" size="sm" />
      </div>
    ),
    size: 80,
  }),
]

const SEARCH_FIELDS = [textSearchField("name"), textSearchField("description")]

export default function ItemsListPage() {
  const table = useTable<ItemRecord>({
    columns,
    refineCoreProps: {
      resource: "items",
      pagination: { pageSize: 25 },
    },
  })

  return (
    <ListView>
      <ListViewHeader />
      <ListSearch
        table={table}
        fields={SEARCH_FIELDS}
        filterKey="items-search"
        placeholder="Search by name or description…"
      />
      <DataTable
        table={table}
        getRowClassName={(r) => (r.status === "deleted" ? "bg-destructive/10" : "")}
      />
    </ListView>
  )
}
