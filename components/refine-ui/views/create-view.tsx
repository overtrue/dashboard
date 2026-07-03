"use client"

import { cn } from "@/lib/utils"
import { useBack, useResourceParams, useUserFriendlyName } from "@refinedev/core"
import type { PropsWithChildren } from "react"
import { Button } from "@/components/ui/button"
import { RiArrowLeftLine } from "@remixicon/react"

type CreateViewProps = PropsWithChildren<{ className?: string }>

export function CreateView({ children, className }: CreateViewProps) {
  return <div className={cn("flex flex-col gap-4", className)}>{children}</div>
}

type CreateViewHeaderProps = PropsWithChildren<{
  resource?: string
  title?: string
  wrapperClassName?: string
  headerClassName?: string
}>

export const CreateViewHeader = ({
  resource: resourceFromProps,
  title: titleFromProps,
  wrapperClassName,
  headerClassName,
}: CreateViewHeaderProps) => {
  const back = useBack()
  const getUserFriendlyName = useUserFriendlyName()
  const { resource, identifier } = useResourceParams({ resource: resourceFromProps })
  const title =
    titleFromProps ??
    getUserFriendlyName(resource?.meta?.label ?? identifier ?? resource?.name, "plural")

  return (
    <div className={cn("flex flex-col gap-4", wrapperClassName)}>
      <div className={cn("flex min-w-0 items-center gap-2", headerClassName)}>
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
    </div>
  )
}

CreateView.displayName = "CreateView"
