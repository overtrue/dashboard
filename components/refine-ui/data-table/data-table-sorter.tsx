"use client"

import type { Column } from "@tanstack/react-table"
import { RiArrowDownSLine, RiArrowUpSLine, RiExpandUpDownLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type DataTableSorterProps<TData> = {
  column: Column<TData>
} & React.ComponentProps<typeof Button>

export function DataTableSorter<TData>({
  column,
  className,
  ...props
}: DataTableSorterProps<TData>) {
  const title =
    column.getIsSorted() === "desc"
      ? `Sort by ${column.id} as descending`
      : column.getIsSorted() === "asc"
        ? `Sort by ${column.id} as ascending`
        : `Sort by ${column.id}`

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => column.toggleSorting(undefined, true)}
      title={title}
      aria-label={title}
      {...props}
      className={cn("data-[state=open]:bg-accent", "h-5 w-5", className)}
    >
      {column.getIsSorted() === "desc" ? (
        <RiArrowDownSLine aria-hidden className={cn("text-primary", "!w-3", "!h-3")} />
      ) : column.getIsSorted() === "asc" ? (
        <RiArrowUpSLine aria-hidden className={cn("text-primary", "!w-3", "!h-3")} />
      ) : (
        <RiExpandUpDownLine aria-hidden className={cn("text-muted-foreground", "!w-3", "!h-3")} />
      )}
    </Button>
  )
}

DataTableSorter.displayName = "DataTableSorter"
