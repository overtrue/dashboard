"use client"

import React from "react"
import { type BaseKey, useRefreshButton } from "@refinedev/core"
import { RiRefreshLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type RefreshButtonProps = {
  resource?: string
  recordItemId?: BaseKey
  dataProviderName?: string
  meta?: Record<string, unknown>
} & React.ComponentProps<typeof Button>

export const RefreshButton = React.forwardRef<
  React.ComponentRef<typeof Button>,
  RefreshButtonProps
>(({ resource, recordItemId, dataProviderName, meta, children, ...rest }, ref) => {
  const { onClick: refresh, loading } = useRefreshButton({
    resource,
    id: recordItemId,
    dataProviderName,
    meta,
  })

  const isDisabled = rest.disabled || loading

  return (
    <Button
      onClick={(e: React.PointerEvent<HTMLButtonElement>) => {
        if (isDisabled) {
          e.preventDefault()
          return
        }
        refresh()
      }}
      {...rest}
      ref={ref}
      disabled={isDisabled}
    >
      {children ?? (
        <div className="flex items-center gap-2">
          <RiRefreshLine aria-hidden className={cn("h-4 w-4", { "animate-spin": loading })} />
          <span>Refresh</span>
        </div>
      )}
    </Button>
  )
})

RefreshButton.displayName = "RefreshButton"
