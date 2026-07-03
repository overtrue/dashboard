"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useTheme } from "next-themes"
import { isValidElement, type ReactNode, useState } from "react"

import { RiFileCopyLine } from "@remixicon/react"
import type { Column } from "@tanstack/react-table"

import { DataTablePagination } from "@/components/refine-ui/data-table/data-table-pagination"
import { DataTableSorter } from "@/components/refine-ui/data-table/data-table-sorter"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/sonner"
import { PLACEHOLDER_TEXT } from "@/lib/placeholder"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { parseJsonValue } from "@/lib/json"
import { cn } from "@/lib/utils"

export type EntityBadgeTone = "default" | "secondary" | "destructive" | "outline"

type EntityStat = {
  label: string
  value: ReactNode
  copyValue?: unknown
}

type EntityRelationColumn<TRecord> = {
  header: string
  cell: (record: TRecord) => ReactNode
  className?: string
  headerClassName?: string
}

type EntityRelationTableProps<TRecord> = {
  title: string
  description?: string
  records: TRecord[]
  columns: EntityRelationColumn<TRecord>[]
  emptyMessage: string
  loading?: boolean
  error?: boolean
  getRowKey?: (record: TRecord, index: number) => string | number
  hideTitle?: boolean
  pagination?: {
    currentPage: number
    pageSize: number
    total?: number
    pageCount?: number
    setCurrentPage: (page: number) => void
    setPageSize: (size: number) => void
  }
}

type EntityRelationTab = {
  id: string
  title: string
  count?: number
  content: ReactNode
}

type EntityRelationTabsProps = {
  tabs: EntityRelationTab[]
  defaultTabId?: string
  className?: string
}

const DEFAULT_PAGE_SIZE = 10
const ENTITY_JSON_GROUP_ARRAYS_AFTER_LENGTH = Number.MAX_SAFE_INTEGER

const ReactJson = dynamic(() => import("@microlink/react-json-view").then((mod) => mod.default), {
  ssr: false,
  loading: () => <span className="text-muted-foreground text-sm">{PLACEHOLDER_TEXT}</span>,
})

export function EntityTableHeader<TData>({
  title,
  column,
  children,
  sortable = true,
}: {
  title: string
  column: Column<TData>
  children?: ReactNode
  sortable?: boolean
}) {
  return (
    <div className="flex items-center gap-1">
      <span>{title}</span>
      {sortable ? <DataTableSorter column={column} /> : null}
      {children}
    </div>
  )
}

export function EntitySection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-xs leading-5">{description}</p>
        ) : null}
      </div>
      <div>{children}</div>
    </section>
  )
}

export function EntityStatStrip({ items, className }: { items: EntityStat[]; className?: string }) {
  return (
    <dl
      className={cn(
        "border-border/60 bg-border/60 grid gap-px overflow-hidden rounded-lg border sm:grid-cols-2 xl:grid-cols-4",
        className
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="bg-background px-4 py-3">
          <dt className="text-muted-foreground text-[11px] leading-4">{item.label}</dt>
          <dd className="mt-1 min-w-0 text-sm leading-5 font-medium">
            <EntityCopyTarget
              ariaLabel={`Copy ${item.label}`}
              value={item.value}
              copyValue={item.copyValue}
            />
          </dd>
        </div>
      ))}
    </dl>
  )
}

export function EntityDetailGrid({ children }: { children: ReactNode }) {
  return <dl className="grid gap-x-6 gap-y-3 md:grid-cols-2 xl:grid-cols-3">{children}</dl>
}

export function EntityDetailItem({
  label,
  value,
  copyValue,
  fullWidth,
  valueClassName,
}: {
  label: string
  value: ReactNode
  copyValue?: unknown
  fullWidth?: boolean
  valueClassName?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1", fullWidth && "md:col-span-2 xl:col-span-3")}>
      <dt className="text-muted-foreground text-[11px] leading-4">{label}</dt>
      <dd className="min-h-5 min-w-0 text-sm leading-5 font-medium">
        <EntityCopyTarget
          ariaLabel={`Copy ${label}`}
          value={value}
          copyValue={copyValue}
          valueClassName={valueClassName}
        />
      </dd>
    </div>
  )
}

function EntityCopyTarget({
  value,
  copyValue,
  ariaLabel,
  valueClassName,
}: {
  value: unknown
  copyValue?: unknown
  ariaLabel: string
  valueClassName?: string
}) {
  const copyText = getEntityCopyText(resolveEntityCopySource(value, copyValue))

  if (copyText === null) {
    return <div className={cn("min-w-0 break-words", valueClassName)}>{value as ReactNode}</div>
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Copy failed — please select and copy manually")
    }
  }

  const valueElement = (
    <span className={cn("max-w-full min-w-0 break-words", valueClassName)}>
      {value as ReactNode}
    </span>
  )
  const iconElement = (
    <RiFileCopyLine
      aria-hidden
      className="text-muted-foreground relative top-0.5 size-3.5 shrink-0 opacity-0 transition-opacity group-focus-within/copy:opacity-100 group-hover/copy:opacity-100 group-focus-visible/copy:opacity-100"
    />
  )

  if (!canWrapEntityValueInCopyButton(value)) {
    return (
      <span className="group/copy inline-flex max-w-full flex-wrap items-baseline gap-x-1 align-baseline">
        {valueElement}
        <button
          type="button"
          aria-label={ariaLabel}
          title={ariaLabel}
          onClick={handleCopy}
          className="hover:text-foreground focus-visible:ring-ring/50 inline-flex cursor-copy rounded-sm align-baseline transition-colors outline-none focus-visible:ring-2"
        >
          {iconElement}
        </button>
      </span>
    )
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      title={ariaLabel}
      onClick={handleCopy}
      className="group/copy hover:text-foreground focus-visible:ring-ring/50 inline-flex max-w-full cursor-copy flex-wrap items-baseline gap-x-1 rounded-sm text-left align-baseline transition-colors outline-none focus-visible:ring-2"
    >
      {valueElement}
      {iconElement}
    </button>
  )
}

function canWrapEntityValueInCopyButton(value: unknown) {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "bigint" ||
    value instanceof Date
  )
}

function resolveEntityCopySource(value: unknown, copyValue: unknown) {
  if (copyValue !== undefined) return copyValue
  if (canWrapEntityValueInCopyButton(value)) return value
  if (!isValidElement(value)) return undefined
  const props = value.props as Record<string, unknown>
  if ("idValue" in props) return props.idValue
  if (value.type === "time") return props.dateTime
  return undefined
}

export function getEntityCopyText(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.toISOString()
  if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") {
    const text = String(value)
    return text === PLACEHOLDER_TEXT ? null : text
  }
  return null
}

export function EntityErrorPanel({ children, error }: { children?: ReactNode; error?: unknown }) {
  const detail = (() => {
    if (!error || typeof error !== "object") return null
    const e = error as { message?: unknown; statusCode?: unknown }
    const msg = typeof e.message === "string" ? e.message : null
    const code = typeof e.statusCode === "number" ? e.statusCode : null
    if (!msg && code === null) return null
    if (msg && code !== null) return `${code}: ${msg}`
    return msg ?? String(code)
  })()

  return (
    <div className="border-destructive/30 bg-destructive/8 text-destructive rounded-lg border p-4 text-sm">
      {children ?? "Request failed"}
      {detail ? <div className="mt-1 text-xs opacity-80">{detail}</div> : null}
    </div>
  )
}

export function EntityStateBadge({
  label,
  tone = "outline",
}: {
  label: string
  tone?: EntityBadgeTone
}) {
  const toneClassName = {
    default:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400",
    secondary:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400",
    destructive: "border-destructive/30 bg-destructive/10 text-destructive",
    outline: "border-border bg-muted/30 text-muted-foreground",
  } satisfies Record<EntityBadgeTone, string>

  return (
    <Badge variant="outline" className={toneClassName[tone]}>
      {label}
    </Badge>
  )
}

export function EntityLink({
  href,
  children,
  className,
}: {
  href: string
  children: ReactNode
  className?: string
}) {
  return (
    <Link href={href} className={cn("text-primary underline-offset-4 hover:underline", className)}>
      {children}
    </Link>
  )
}

export function EntityJsonValue({ value }: { value: unknown }) {
  const { resolvedTheme } = useTheme()
  const jsonViewProps = getEntityJsonViewProps(value)
  const jsonCopyText = getEntityJsonCopyText(value)

  if (jsonViewProps === null) {
    return <span className="text-muted-foreground text-sm">{PLACEHOLDER_TEXT}</span>
  }

  const handleJsonCopy = async () => {
    if (jsonCopyText === null) return
    try {
      await navigator.clipboard.writeText(jsonCopyText)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Copy failed")
    }
  }

  return (
    <div className="border-border/60 bg-muted/15 relative min-w-0 rounded-lg border">
      {jsonCopyText !== null ? (
        <button
          type="button"
          aria-label="Copy JSON"
          title="Copy JSON"
          onClick={handleJsonCopy}
          className="border-border/60 bg-background/80 text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 absolute top-2 right-2 z-10 inline-flex size-6 items-center justify-center rounded-sm border opacity-70 shadow-sm transition-opacity hover:opacity-100 focus-visible:ring-2 focus-visible:outline-none"
        >
          <RiFileCopyLine aria-hidden className="size-3.5" />
        </button>
      ) : null}
      <div className="overflow-x-auto p-3 text-xs [&_*]:[word-break:normal_!important] [&_*]:[white-space:nowrap_!important]">
        <ReactJson
          {...jsonViewProps}
          displayObjectSize={false}
          displayDataTypes={false}
          collapsed={1}
          theme={resolvedTheme === "dark" ? "monokai" : "rjv-default"}
          style={{ backgroundColor: "transparent" }}
        />
      </div>
    </div>
  )
}

export function getEntityJsonCopyText(value: unknown): string | null {
  const jsonValue = parseJsonValue(value)
  if (jsonValue === null) return null
  if (typeof value === "string") return value
  try {
    return JSON.stringify(jsonValue, null, 2)
  } catch {
    return null
  }
}

export function getEntityJsonViewProps(value: unknown) {
  const jsonValue = parseJsonValue(value)
  if (jsonValue === null) return null
  return {
    src: jsonValue as object,
    name: false,
    enableClipboard: true,
    groupArraysAfterLength: ENTITY_JSON_GROUP_ARRAYS_AFTER_LENGTH,
  } as const
}

export function EntityRelationTable<TRecord>({
  title,
  description,
  records,
  columns,
  emptyMessage,
  loading = false,
  error = false,
  getRowKey,
  hideTitle = false,
  pagination,
}: EntityRelationTableProps<TRecord>) {
  const pageCount =
    pagination?.pageCount ??
    Math.max(
      1,
      Math.ceil(
        pagination && pagination.total !== undefined
          ? pagination.total / Math.max(DEFAULT_PAGE_SIZE, pagination.pageSize)
          : 1
      )
    )

  if (!loading && !error && records.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        {!hideTitle ? (
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
            <Badge
              variant="outline"
              className="border-border/60 text-muted-foreground bg-transparent"
            >
              0
            </Badge>
          </div>
        ) : null}
        <div className="border-border/60 bg-background flex h-28 items-center justify-center rounded-lg border border-dashed text-center">
          <p className="text-muted-foreground px-4 text-sm">{emptyMessage}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-3">
      {!hideTitle ? (
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {!loading && !error ? (
            <Badge
              variant="outline"
              className="border-border/60 text-muted-foreground bg-transparent"
            >
              {pagination?.total ?? records.length}
            </Badge>
          ) : null}
          {description ? (
            <p className="text-muted-foreground mt-1 text-xs leading-5">{description}</p>
          ) : null}
        </div>
      ) : null}
      <div className="border-border/60 bg-background overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.header}
                  className={cn(
                    "text-muted-foreground h-9 px-3 text-xs font-medium",
                    column.headerClassName
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-16 px-3 text-sm"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-destructive h-16 px-3 text-sm">
                  Failed to load related records.
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-16 px-3 text-sm"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              records.map((record, index) => (
                <TableRow key={getRowKey?.(record, index) ?? `entity-row-${index}`}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.header}
                      className={cn("px-3 py-2.5 align-top", column.className)}
                    >
                      {column.cell(record)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {!loading && pagination ? (
        <DataTablePagination
          currentPage={pagination.currentPage}
          pageCount={pageCount}
          setCurrentPage={pagination.setCurrentPage}
          pageSize={pagination.pageSize}
          setPageSize={pagination.setPageSize}
          total={pagination.total}
        />
      ) : null}
    </section>
  )
}

export function EntityRelationTabs({ tabs, defaultTabId, className }: EntityRelationTabsProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTabId ?? tabs[0]?.id ?? "")

  if (tabs.length === 0) return null

  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div
        role="tablist"
        aria-label="Related resources"
        className="no-scrollbar border-border/60 -mx-1 flex items-center gap-2 overflow-x-auto border-b px-1 pb-2"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`entity-relation-tabpanel-${tab.id}`}
              id={`entity-relation-tab-${tab.id}`}
              onClick={() => setActiveTabId(tab.id)}
              className={cn(
                "inline-flex h-8 items-center rounded-md border border-transparent px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
                isActive
                  ? "border-border/60 bg-background text-foreground"
                  : "text-muted-foreground hover:border-border/40 hover:text-foreground"
              )}
            >
              <span>{tab.title}</span>
              {typeof tab.count === "number" ? (
                <span className="border-border/60 bg-background text-muted-foreground ml-1 inline-flex items-center justify-center rounded-full border px-1.5 py-0.5 text-[10px] leading-none">
                  {tab.count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId
        return (
          <div
            key={tab.id}
            role="tabpanel"
            id={`entity-relation-tabpanel-${tab.id}`}
            aria-labelledby={`entity-relation-tab-${tab.id}`}
            hidden={!isActive}
            className="min-h-0"
          >
            {isActive ? tab.content : null}
          </div>
        )
      })}
    </section>
  )
}
