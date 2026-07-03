"use client"

import { cn } from "@/lib/utils"
import { useBack, useResourceParams, useUserFriendlyName } from "@refinedev/core"
import type { PropsWithChildren, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { RiArrowLeftLine } from "@remixicon/react"

type EditViewProps = PropsWithChildren<{ className?: string }>

export function EditView({ children, className }: EditViewProps) {
  return <div className={cn("flex flex-col gap-4", className)}>{children}</div>
}

type EditViewHeaderProps = PropsWithChildren<{
  resource?: string
  title?: string
  wrapperClassName?: string
  headerClassName?: string
  actions?: ReactNode
}>

export const EditViewHeader = ({
  resource: resourceFromProps,
  title: titleFromProps,
  wrapperClassName,
  headerClassName,
  actions,
}: EditViewHeaderProps) => {
  const back = useBack()
  const getUserFriendlyName = useUserFriendlyName()
  const { resource, identifier } = useResourceParams({ resource: resourceFromProps })
  const title =
    titleFromProps ??
    getUserFriendlyName(resource?.meta?.label ?? identifier ?? resource?.name, "plural")

  return (
    <div className={cn("flex flex-col gap-4", wrapperClassName)}>
      <div
        className={cn(
          "flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
          headerClassName
        )}
      >
        <div className="flex w-full min-w-0 flex-1 items-center gap-2 sm:w-auto">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={back}
            aria-label="Go back"
            className="shrink-0"
          >
            <RiArrowLeftLine aria-hidden className="h-4 w-4" />
          </Button>
          <h2 className="min-w-0 flex-1 truncate text-xl font-semibold">{title}</h2>
        </div>
        {actions ? (
          <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  )
}

EditView.displayName = "EditView"
