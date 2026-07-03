"use client"

import type {
  BaseRecord,
  ConditionalFilter,
  CrudFilter,
  CrudOperators,
  HttpError,
  LogicalFilter,
} from "@refinedev/core"
import { useResourceParams } from "@refinedev/core"
import type { UseTableReturnType } from "@refinedev/react-table"
import { RiDownloadLine, RiLoaderLine, RiSearchLine, RiCloseLine } from "@remixicon/react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { toCsvText } from "@/lib/export/csv"
import { PLACEHOLDER_TEXT } from "@/lib/placeholder"

type SearchFieldOperator = Exclude<CrudOperators, "or" | "and">

export type ListSearchField = {
  field: string
  operator?: SearchFieldOperator
  type?: "number" | "text"
}

type ListSearchProps<TData extends BaseRecord> = {
  fields: ListSearchField[]
  filterKey: string
  placeholder?: string
  table: UseTableReturnType<TData, HttpError>
  /**
   * 启用"必须搜索才查询"模式 — 让外层 page 把 useTable 的 queryOptions.enabled
   * 接到 onSearchStateChange 上,合规要求列表不允许默认拉数据。
   */
  requireFilters?: boolean
  /** 用户首次点搜索时回调 true,清空所有 filter 时回调 false */
  onSearchStateChange?: (hasSearched: boolean) => void
}
const MAX_EXPORT_COUNT = 5000

function createSearchParams(params: Record<string, string | undefined>) {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value)
    }
  }

  return query.toString()
}

type ExportResponse = {
  message?: string
  data?: Array<Record<string, unknown>>
}

export function textSearchField(
  field: string,
  operator: SearchFieldOperator = "contains"
): ListSearchField {
  return {
    field,
    operator,
    type: "text",
  }
}

export function numberSearchField(
  field: string,
  operator: SearchFieldOperator = "eq"
): ListSearchField {
  return {
    field,
    operator,
    type: "number",
  }
}

function isConditionalFilter(filter: CrudFilter): filter is ConditionalFilter {
  return filter.operator === "or" || filter.operator === "and"
}

function isLogicalFilter(filter: CrudFilter): filter is LogicalFilter {
  return !isConditionalFilter(filter)
}

function isSearchFilter(filter: CrudFilter, filterKey: string) {
  return isConditionalFilter(filter) && filter.operator === "or" && filter.key === filterKey
}

function getSearchValue(filters: CrudFilter[], filterKey: string) {
  const filter = filters.find((item) => isSearchFilter(item, filterKey))

  if (!filter || filter.value.length === 0) {
    return ""
  }

  const [firstFilter] = filter.value

  if (!firstFilter || isConditionalFilter(firstFilter)) {
    return ""
  }

  if (Array.isArray(firstFilter.value)) {
    return firstFilter.value[0] ? String(firstFilter.value[0]) : ""
  }

  return firstFilter.value === null || firstFilter.value === undefined
    ? ""
    : String(firstFilter.value)
}

function formatFieldLabel(field: string) {
  return field
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\bIdp\b/g, "IDP")
    .replace(/\bId\b/g, "ID")
    .replace(/^./, (character) => character.toUpperCase())
}

function formatFilterValue(value: LogicalFilter["value"]) {
  if (Array.isArray(value)) {
    return value.join(", ")
  }

  if (value === null || value === undefined || value === "") {
    return PLACEHOLDER_TEXT
  }

  return String(value)
}

function formatFilterText(filter: LogicalFilter) {
  const label = formatFieldLabel(filter.field)
  const value = formatFilterValue(filter.value)

  switch (filter.operator) {
    case "contains":
    case "eq":
      return `${label}: ${value}`
    default:
      return `${label} ${filter.operator} ${value}`
  }
}

function buildSearchFilters(query: string, fields: ListSearchField[]): LogicalFilter[] {
  const normalizedQuery = query.trim()

  if (!normalizedQuery) {
    return []
  }

  const numericValue = /^-?\d+$/.test(normalizedQuery) ? Number(normalizedQuery) : null

  return fields.reduce<LogicalFilter[]>((result, fieldConfig) => {
    const { field, operator = "contains", type = "text" } = fieldConfig

    if (type === "number") {
      if (numericValue === null) {
        return result
      }

      result.push({
        field,
        operator,
        value: numericValue,
      })

      return result
    }

    result.push({
      field,
      operator,
      value: normalizedQuery,
    })

    return result
  }, [])
}

export function ListSearch<TData extends BaseRecord>({
  fields,
  filterKey,
  placeholder = "Search…",
  table,
  requireFilters = false,
  onSearchStateChange,
}: ListSearchProps<TData>) {
  const { filters, sorters, setCurrentPage, setFilters, tableQuery } = table.refineCore
  const { identifier } = useResourceParams()
  const [isExporting, setIsExporting] = useState(false)
  const isExportLimited = (tableQuery.data?.total ?? 0) > MAX_EXPORT_COUNT

  const appliedValue = useMemo(() => getSearchValue(filters, filterKey), [filterKey, filters])

  const [draft, setDraft] = useState({
    appliedValue,
    value: appliedValue,
  })
  const value = draft.appliedValue === appliedValue ? draft.value : appliedValue
  const setDraftValue = (nextValue: string) => {
    setDraft({
      appliedValue,
      value: nextValue,
    })
  }

  const activeFilters = useMemo(() => {
    return filters.flatMap((filter) => {
      if (isSearchFilter(filter, filterKey)) {
        const searchValue = getSearchValue([filter], filterKey)

        return searchValue
          ? [
              {
                id: `search:${filterKey}`,
                label: `Search: ${searchValue}`,
                filter,
              },
            ]
          : []
      }

      if (isLogicalFilter(filter)) {
        return [
          {
            id: `${filter.field}:${filter.operator}:${JSON.stringify(filter.value)}`,
            label: formatFilterText(filter),
            filter,
          },
        ]
      }

      return [
        {
          id: `${filter.operator}:${filter.key ?? "group"}`,
          label: `${filter.operator.toUpperCase()} (${filter.value.length})`,
          filter,
        },
      ]
    })
  }, [filterKey, filters])

  const isApplyDisabled = value.trim() === appliedValue.trim() || fields.length === 0
  const isClearDisabled = !value && !appliedValue

  const applySearch = () => {
    const nextSearchFilters = buildSearchFilters(value, fields)

    setFilters((previousFilters) => {
      const nextFilters = previousFilters.filter((filter) => !isSearchFilter(filter, filterKey))

      if (nextSearchFilters.length === 0) {
        return nextFilters
      }

      return [
        ...nextFilters,
        {
          key: filterKey,
          operator: "or",
          value: nextSearchFilters,
        },
      ]
    })
    setCurrentPage(1)

    // requireFilters 模式: 任何一次有效搜索都把 hasSearched 置 true,
    // 让外层 page 的 useTable.queryOptions.enabled 解锁
    if (requireFilters && nextSearchFilters.length > 0) {
      onSearchStateChange?.(true)
    }
  }

  const clearSearch = () => {
    setDraftValue("")

    if (!appliedValue) {
      // 已经是空状态; requireFilters 下也保持 enabled=false
      if (requireFilters) onSearchStateChange?.(false)
      return
    }

    setFilters((previousFilters) =>
      previousFilters.filter((filter) => !isSearchFilter(filter, filterKey))
    )
    setCurrentPage(1)

    // requireFilters 模式: 清空后回到"未搜索"状态,不再请求
    if (requireFilters) onSearchStateChange?.(false)
  }

  const removeFilter = (targetFilter: CrudFilter) => {
    if (isSearchFilter(targetFilter, filterKey)) {
      clearSearch()
      return
    }

    setFilters((previousFilters) => {
      const next = previousFilters.filter((filter) => {
        if (isConditionalFilter(filter) || isConditionalFilter(targetFilter)) {
          return filter !== targetFilter
        }

        return !(
          filter.field === targetFilter.field &&
          filter.operator === targetFilter.operator &&
          JSON.stringify(filter.value) === JSON.stringify(targetFilter.value)
        )
      })

      // requireFilters 模式: 删完最后一个 filter 也要回到未搜索
      if (requireFilters && next.length === 0) {
        onSearchStateChange?.(false)
      }
      return next
    })
    setCurrentPage(1)
  }

  const handleExport = async () => {
    if (exportDisabledReason) {
      return
    }

    setIsExporting(true)

    try {
      const pagination = JSON.stringify({
        currentPage: 1,
        pageSize: MAX_EXPORT_COUNT,
      })
      const sortersValue = JSON.stringify(sorters)
      const filtersValue = JSON.stringify(filters)
      const query = createSearchParams({
        pagination,
        sorters: sortersValue,
        filters: filtersValue,
      })
      const response = await fetch(`/api/admin/${identifier}?${query}`)
      const payload = (await response.json()) as ExportResponse | null

      if (!response.ok) {
        const errorMessage =
          payload && typeof payload.message === "string"
            ? payload.message
            : "Export failed, please try again"

        throw new Error(errorMessage)
      }

      if (!payload || !Array.isArray(payload.data)) {
        throw new Error("Unexpected export response format")
      }

      const csvText = toCsvText(payload.data as Array<Record<string, unknown>>)
      const blob = new Blob([`\uFEFF${csvText}`], {
        type: "text/csv;charset=utf-8;",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = url
      link.download = `${identifier}-export-${new Date().toISOString().replace(/[:.]/g, "-")}.csv`
      link.style.display = "none"

      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Export failed, please try again"
      toast.error(message)
    } finally {
      setIsExporting(false)
    }
  }

  const exportDisabledReason = isExporting
    ? "Export in progress"
    : tableQuery.isFetching
      ? "List is loading"
      : isExportLimited
        ? `Results exceed export limit (${tableQuery.data?.total} rows, max ${MAX_EXPORT_COUNT})`
        : tableQuery.isError
          ? "Cannot export — list query failed"
          : !identifier
            ? "Cannot determine current resource"
            : null

  const exportButton = (
    <Button
      type="button"
      variant="outline"
      className="h-9 shrink-0 gap-2"
      onClick={handleExport}
      disabled={Boolean(exportDisabledReason)}
      title={exportDisabledReason ?? "Export results with current filters"}
    >
      {isExporting ? (
        <RiLoaderLine aria-hidden className="size-4 animate-spin" />
      ) : (
        <RiDownloadLine aria-hidden className="size-4" />
      )}
      {isExporting ? "Exporting…" : "Export"}
    </Button>
  )

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault()
        applySearch()
      }}
    >
      <InputGroup className="h-9 max-w-2xl min-w-72 flex-1">
        <InputGroupAddon className="pl-3">
          <RiSearchLine aria-hidden className="text-muted-foreground size-4" />
        </InputGroupAddon>
        <InputGroupInput
          name={`${filterKey}-search`}
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            setDraftValue(event.target.value)
          }}
        />
        {!isClearDisabled ? (
          <InputGroupAddon align="inline-end" className="pr-1">
            <InputGroupButton
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Clear search"
              className="text-muted-foreground"
              onClick={clearSearch}
            >
              <RiCloseLine aria-hidden className="size-3.5" />
            </InputGroupButton>
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      <Button
        type="submit"
        variant="outline"
        className="h-9 shrink-0 gap-2"
        disabled={isApplyDisabled || tableQuery.isFetching}
      >
        <RiSearchLine aria-hidden className="size-4" />
        Search
      </Button>
      {exportDisabledReason ? (
        <Tooltip>
          <TooltipTrigger asChild>{exportButton}</TooltipTrigger>
          <TooltipContent>{exportDisabledReason}</TooltipContent>
        </Tooltip>
      ) : (
        exportButton
      )}
      {activeFilters.map((activeFilter) => (
        <Button
          key={activeFilter.id}
          type="button"
          variant="outline"
          size="sm"
          className="h-9 max-w-full shrink-0 justify-start gap-1.5"
          onClick={() => {
            removeFilter(activeFilter.filter)
          }}
        >
          <span className="truncate">{activeFilter.label}</span>
          <RiCloseLine aria-hidden className="size-3.5" />
        </Button>
      ))}
    </form>
  )
}
