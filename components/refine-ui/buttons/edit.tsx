"use client"

import React from "react"
import { type BaseKey, useEditButton } from "@refinedev/core"
import { Button } from "@/components/ui/button"
import { RiPencilLine } from "@remixicon/react"

type EditButtonProps = {
  resource?: string
  recordItemId?: BaseKey
  accessControl?: { enabled?: boolean; hideIfUnauthorized?: boolean }
  meta?: Record<string, unknown>
} & React.ComponentProps<typeof Button>

export const EditButton = React.forwardRef<React.ComponentRef<typeof Button>, EditButtonProps>(
  ({ resource, recordItemId, accessControl, meta, children, onClick, ...rest }, ref) => {
    const { hidden, disabled, LinkComponent, to } = useEditButton({
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
              <RiPencilLine aria-hidden className="h-4 w-4" />
              <span>Edit</span>
            </div>
          )}
        </LinkComponent>
      </Button>
    )
  }
)

EditButton.displayName = "EditButton"
