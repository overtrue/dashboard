"use client"

import { type BaseRecord, type HttpError } from "@refinedev/core"
import type { UseTableReturnType } from "@refinedev/react-table"
import { RiLoaderLine } from "@remixicon/react"
import type { Column } from "@tanstack/react-table"
import { flexRender } from "@tanstack/react-table"
import { useEffect, useRef, useState } from "react"

import { DataTablePagination } from "@/components/refine-ui/data-table/data-table-pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type DataTableProps<TData extends BaseRecord> = {
  table: UseTableReturnType<TData, HttpError>
  getRowClassName?: (record: TData) => string
}

export function DataTable<TData extends BaseRecord>({
  table,
  getRowClassName,
}: DataTableProps<TData>) {
  const {
    reactTable: { getHeaderGroups, getRowModel, getAllColumns },
    refineCore: { tableQuery, currentPage, setCurrentPage, pageCount, pageSize, setPageSize },
  } = table

  const columns = getAllColumns()
  const leafColumns = table.reactTable.getAllLeafColumns()
  const isLoading = tableQuery.isLoading
  const tableWidth = table.reactTable.getTotalSize()

  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const [isOverflowing, setIsOverflowing] = useState({ horizontal: false, vertical: false })

  useEffect(() => {
    const checkOverflow = () => {
      if (tableRef.current && tableContainerRef.current) {
        const t = tableRef.current
        const c = tableContainerRef.current
        setIsOverflowing({
          horizontal: t.offsetWidth > c.clientWidth,
          vertical: t.offsetHeight > c.clientHeight,
        })
      }
    }

    checkOverflow()
    window.addEventListener("resize", checkOverflow)
    const timeoutId = setTimeout(checkOverflow, 100)
    return () => {
      window.removeEventListener("resize", checkOverflow)
      clearTimeout(timeoutId)
    }
  }, [tableQuery.data?.data, pageSize])

  return (
    <div className={cn("flex", "flex-col", "flex-1", "gap-4")}>
      <div ref={tableContainerRef} className={cn("rounded-md", "border")}>
        <Table ref={tableRef} style={{ tableLayout: "fixed", width: tableWidth, minWidth: "100%" }}>
          <TableHeader>
            {getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-xs"
                    style={{ ...getCommonStyles({ column: header.column, isOverflowing }) }}
                  >
                    {header.isPlaceholder ? null : (
                      <div className={cn("flex", "items-center", "gap-1")}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="relative">
            {isLoading ? (
              <>
                {Array.from({ length: pageSize < 1 ? 1 : pageSize }).map((_, rowIndex) => (
                  <TableRow key={`skeleton-row-${rowIndex}`} aria-hidden="true">
                    {leafColumns.map((column) => (
                      <TableCell
                        key={`skeleton-cell-${rowIndex}-${column.id}`}
                        style={{ ...getCommonStyles({ column, isOverflowing }) }}
                        className={cn("truncate")}
                      >
                        <div className="h-8" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className={cn("absolute", "inset-0", "pointer-events-none")}
                  >
                    <RiLoaderLine
                      aria-hidden
                      className={cn(
                        "absolute",
                        "top-1/2",
                        "left-1/2",
                        "animate-spin",
                        "text-primary",
                        "h-8",
                        "w-8",
                        "-translate-x-1/2",
                        "-translate-y-1/2"
                      )}
                    />
                  </TableCell>
                </TableRow>
              </>
            ) : getRowModel().rows?.length ? (
              getRowModel().rows.map((row) => (
                <TableRow
                  key={row.original?.id ?? row.id}
                  className={getRowClassName ? getRowClassName(row.original) : ""}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ ...getCommonStyles({ column: cell.column, isOverflowing }) }}
                    >
                      <div className="truncate">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className={cn("relative", "text-center")}
                  style={{ height: "490px" }}
                >
                  <div
                    className={cn(
                      "absolute",
                      "inset-0",
                      "flex",
                      "flex-col",
                      "items-center",
                      "justify-center",
                      "gap-2",
                      "bg-background"
                    )}
                  >
                    <div className={cn("text-lg", "font-semibold", "text-foreground")}>
                      No data to display
                    </div>
                    <div className={cn("text-sm", "text-muted-foreground")}>
                      This table is empty for the time being.
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!isLoading && getRowModel().rows?.length > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          pageCount={pageCount}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          total={tableQuery.data?.total}
        />
      )}
    </div>
  )
}

export function getCommonStyles<TData>({
  column,
  isOverflowing,
}: {
  column: Column<TData>
  isOverflowing: { horizontal: boolean; vertical: boolean }
}): React.CSSProperties {
  const isPinned = column.getIsPinned()
  const isLastLeftPinnedColumn = isPinned === "left" && column.getIsLastColumn("left")
  const isFirstRightPinnedColumn = isPinned === "right" && column.getIsFirstColumn("right")

  return {
    boxShadow:
      isOverflowing.horizontal && isLastLeftPinnedColumn
        ? "-4px 0 4px -4px var(--border) inset"
        : isOverflowing.horizontal && isFirstRightPinnedColumn
          ? "4px 0 4px -4px var(--border) inset"
          : undefined,
    left:
      isOverflowing.horizontal && isPinned === "left" ? `${column.getStart("left")}px` : undefined,
    right:
      isOverflowing.horizontal && isPinned === "right"
        ? `${column.getAfter("right")}px`
        : undefined,
    opacity: 1,
    position: isOverflowing.horizontal && isPinned ? "sticky" : "relative",
    background: isOverflowing.horizontal && isPinned ? "var(--background)" : "",
    width: column.getSize(),
    zIndex: isOverflowing.horizontal && isPinned ? 1 : 0,
  }
}

DataTable.displayName = "DataTable"
