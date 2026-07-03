"use client"

import type { PropsWithChildren } from "react"

import { CreateButton } from "@/components/refine-ui/buttons/create"
import { RefreshButton } from "@/components/refine-ui/buttons/refresh"
import { cn } from "@/lib/utils"
import { useResourceParams, useUserFriendlyName } from "@refinedev/core"

type ListViewProps = PropsWithChildren<{ className?: string }>

export function ListView({ children, className }: ListViewProps) {
  return <div className={cn("flex flex-col", "gap-4", className)}>{children}</div>
}

type ListHeaderProps = PropsWithChildren<{
  resource?: string
  title?: string
  canCreate?: boolean
  headerClassName?: string
  wrapperClassName?: string
}>

export const ListViewHeader = ({
  canCreate,
  resource: resourceFromProps,
  title: titleFromProps,
  wrapperClassName,
  headerClassName,
}: ListHeaderProps) => {
  const getUserFriendlyName = useUserFriendlyName()
  const { resource, identifier } = useResourceParams({ resource: resourceFromProps })
  const resourceName = identifier ?? resource?.name
  const isCreateButtonVisible = canCreate ?? !!resource?.create
  const title =
    titleFromProps ??
    getUserFriendlyName(resource?.meta?.label ?? identifier ?? resource?.name, "plural")

  return (
    <div className={cn("flex flex-col", "gap-4", wrapperClassName)}>
      <div
        className={cn(
          "flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
          headerClassName
        )}
      >
        <h2 className="min-w-0 truncate text-lg font-bold">{title}</h2>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <RefreshButton variant="outline" size="sm" resource={resourceName} />
          {isCreateButtonVisible && <CreateButton resource={resourceName} size="sm" />}
        </div>
      </div>
    </div>
  )
}

ListView.displayName = "ListView"
