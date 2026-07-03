"use client"

import React from "react"
import { type BaseKey, useShowButton } from "@refinedev/core"
import { RiEyeLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"

type ShowButtonProps = {
  resource?: string
  recordItemId?: BaseKey
  accessControl?: { enabled?: boolean; hideIfUnauthorized?: boolean }
  meta?: Record<string, unknown>
} & React.ComponentProps<typeof Button>

export const ShowButton = React.forwardRef<React.ComponentRef<typeof Button>, ShowButtonProps>(
  ({ resource, recordItemId, accessControl, meta, children, onClick, ...rest }, ref) => {
    const { hidden, disabled, LinkComponent, to } = useShowButton({
      resource,
      id: recordItemId,
      accessControl,
      meta,
    })

    if (hidden || rest.hidden) return null

    return (
      <Button {...rest} ref={ref} disabled={disabled || rest.disabled} asChild>
        <LinkComponent
          to={to}
          replace={false}
          onClick={(e: React.PointerEvent<HTMLButtonElement>) => {
            if (disabled || rest.disabled) {
              e.preventDefault()
              return
            }
            if (onClick) {
              e.preventDefault()
              onClick(e)
            }
          }}
        >
          {children ?? (
            <div className="flex items-center gap-2 font-semibold">
              <RiEyeLine aria-hidden className="h-4 w-4" />
              <span>Details</span>
            </div>
          )}
        </LinkComponent>
      </Button>
    )
  }
)

ShowButton.displayName = "ShowButton"
