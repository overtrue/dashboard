"use client"

import { useTable } from "@refinedev/react-table"
import { createColumnHelper } from "@tanstack/react-table"

import { DataTable } from "@/components/refine-ui/data-table/data-table"
import { EntityStateBadge, EntityTableHeader } from "@/components/entity-ui"
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view"
import { ListSearch, textSearchField } from "@/components/refine-ui/views/list-search"
import { ShowButton } from "@/components/refine-ui/buttons/show"
import {
  type AdminRecord,
  getAdminState,
  adminStateTone,
  formatDateTimeLabel,
  formatNullable,
} from "@/lib/admin-records"

const columnHelper = createColumnHelper<AdminRecord>()

const columns = [
  columnHelper.accessor("id", {
    header: ({ column }) => <EntityTableHeader title="ID" column={column} />,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground font-mono text-xs">{getValue()}</span>
    ),
    size: 80,
  }),
  columnHelper.accessor("username", {
    header: ({ column }) => <EntityTableHeader title="Username" column={column} />,
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-2">
        <span className="font-medium">{row.original.username}</span>
        {row.original.isSuper ? <EntityStateBadge label="super" tone="default" /> : null}
      </span>
    ),
    size: 200,
  }),
  columnHelper.accessor("nickname", {
    header: ({ column }) => <EntityTableHeader title="Nickname" column={column} sortable={false} />,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{formatNullable(getValue())}</span>
    ),
    size: 160,
  }),
  columnHelper.accessor("enabled", {
    header: ({ column }) => <EntityTableHeader title="Status" column={column} sortable={false} />,
    cell: ({ row }) => {
      const state = getAdminState(row.original)
      return <EntityStateBadge label={state} tone={adminStateTone[state]} />
    },
    size: 100,
  }),
  columnHelper.accessor("lastLoginAt", {
    header: ({ column }) => <EntityTableHeader title="Last Login" column={column} />,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground text-xs whitespace-nowrap">
        {formatDateTimeLabel(getValue())}
      </span>
    ),
    size: 160,
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
        <ShowButton recordItemId={row.original.id} resource="admins" variant="ghost" size="sm" />
      </div>
    ),
    size: 80,
  }),
]

const SEARCH_FIELDS = [textSearchField("username"), textSearchField("nickname")]

export default function AdminsListPage() {
  const table = useTable<AdminRecord>({
    columns,
    refineCoreProps: {
      resource: "admins",
      pagination: { pageSize: 25 },
      sorters: { initial: [{ field: "createdAt", order: "desc" }] },
    },
  })

  return (
    <ListView>
      <ListViewHeader title="Admins" canCreate />
      <ListSearch
        table={table}
        fields={SEARCH_FIELDS}
        filterKey="admins-search"
        placeholder="Search by username or nickname…"
      />
      <DataTable
        table={table}
        getRowClassName={(r) => (!r.enabled || r.deletedAt ? "bg-destructive/10" : "")}
      />
    </ListView>
  )
}
