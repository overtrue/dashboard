"use client"

import React from "react"
import { type BaseKey, useCreateButton } from "@refinedev/core"
import { RiAddLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"

type CreateButtonProps = {
  resource?: BaseKey
  accessControl?: { enabled?: boolean; hideIfUnauthorized?: boolean }
  meta?: Record<string, unknown>
} & React.ComponentProps<typeof Button>

export const CreateButton = React.forwardRef<React.ComponentRef<typeof Button>, CreateButtonProps>(
  ({ resource, accessControl, meta, children, onClick, ...rest }, ref) => {
    const { hidden, disabled, LinkComponent, to } = useCreateButton({
      resource,
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
              <RiAddLine aria-hidden className="h-4 w-4" />
              <span>Create</span>
            </div>
          )}
        </LinkComponent>
      </Button>
    )
  }
)

CreateButton.displayName = "CreateButton"
