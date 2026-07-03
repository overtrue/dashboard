"use client"

import { useTable } from "@refinedev/react-table"
import { createColumnHelper } from "@tanstack/react-table"

import { DataTable } from "@/components/refine-ui/data-table/data-table"
import { EntityStateBadge, EntityTableHeader } from "@/components/entity-ui"
import { ListView, ListViewHeader } from "@/components/refine-ui/views/list-view"
import { ListSearch, textSearchField } from "@/components/refine-ui/views/list-search"
import { ShowButton } from "@/components/refine-ui/buttons/show"
import {
  type AuditLogRecord,
  auditActionTone,
  formatDateTimeLabel,
  formatNullable,
} from "@/lib/admin-records"

const columnHelper = createColumnHelper<AuditLogRecord>()

const columns = [
  columnHelper.accessor("id", {
    header: ({ column }) => <EntityTableHeader title="ID" column={column} />,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground font-mono text-xs">{getValue()}</span>
    ),
    size: 80,
  }),
  columnHelper.accessor("action", {
    header: ({ column }) => <EntityTableHeader title="Action" column={column} />,
    cell: ({ getValue }) => {
      const action = getValue() as string
      const tone = auditActionTone[action as keyof typeof auditActionTone] ?? "outline"
      return <EntityStateBadge label={action} tone={tone} />
    },
    size: 100,
  }),
  columnHelper.accessor("resource", {
    header: ({ column }) => <EntityTableHeader title="Resource" column={column} />,
    cell: ({ getValue }) => <span className="font-mono text-xs">{getValue()}</span>,
    size: 200,
  }),
  columnHelper.accessor("resourceId", {
    header: ({ column }) => <EntityTableHeader title="Record ID" column={column} />,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground font-mono text-xs">{formatNullable(getValue())}</span>
    ),
    size: 120,
  }),
  columnHelper.accessor("adminName", {
    header: ({ column }) => <EntityTableHeader title="Operator" column={column} />,
    cell: ({ getValue }) => formatNullable(getValue()),
    size: 120,
  }),
  columnHelper.accessor("status", {
    header: ({ column }) => <EntityTableHeader title="Status" column={column} />,
    cell: ({ getValue }) => {
      const status = getValue()
      return (
        <EntityStateBadge
          label={status ?? "success"}
          tone={status === "error" ? "destructive" : "default"}
        />
      )
    },
    size: 90,
  }),
  columnHelper.accessor("ip", {
    header: ({ column }) => <EntityTableHeader title="IP" column={column} sortable={false} />,
    cell: ({ getValue }) => (
      <span className="text-muted-foreground font-mono text-xs">{formatNullable(getValue())}</span>
    ),
    size: 130,
  }),
  columnHelper.accessor("createdAt", {
    header: ({ column }) => <EntityTableHeader title="Time" column={column} />,
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
        <ShowButton recordItemId={row.original.id} resource="auditLogs" variant="ghost" size="sm" />
      </div>
    ),
    size: 80,
  }),
]

const SEARCH_FIELDS = [
  textSearchField("resource"),
  textSearchField("adminName"),
  textSearchField("resourceId"),
]

export default function AuditLogsListPage() {
  const table = useTable<AuditLogRecord>({
    columns,
    refineCoreProps: {
      resource: "auditLogs",
      pagination: { pageSize: 25 },
      sorters: { initial: [{ field: "createdAt", order: "desc" }] },
    },
  })

  return (
    <ListView>
      <ListViewHeader title="Audit Logs" />
      <ListSearch
        table={table}
        fields={SEARCH_FIELDS}
        filterKey="audit-search"
        placeholder="Search by resource, operator, or record ID…"
      />
      <DataTable table={table} />
    </ListView>
  )
}
