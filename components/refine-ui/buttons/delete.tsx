"use client"

import React from "react"
import { type BaseKey, useDeleteButton } from "@refinedev/core"
import { RiLoaderLine, RiDeleteBinLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type DeleteButtonProps = {
  resource?: string
  recordItemId?: BaseKey
  accessControl?: { enabled?: boolean; hideIfUnauthorized?: boolean }
  meta?: Record<string, unknown>
  confirmTitle?: string
  confirmOkText?: string
  confirmCancelText?: string
} & React.ComponentProps<typeof Button>

export const DeleteButton = React.forwardRef<React.ComponentRef<typeof Button>, DeleteButtonProps>(
  (
    {
      resource,
      recordItemId,
      accessControl,
      meta,
      children,
      confirmTitle = "Are you sure?",
      confirmOkText = "Delete",
      confirmCancelText = "Cancel",
      ...rest
    },
    ref
  ) => {
    const { hidden, disabled, loading, onConfirm } = useDeleteButton({
      resource,
      id: recordItemId,
      accessControl,
      meta,
    })
    const [open, setOpen] = React.useState(false)

    if (hidden || rest.hidden) return null

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <span>
            <Button
              variant="destructive"
              {...rest}
              ref={ref}
              disabled={disabled || rest.disabled || loading}
            >
              {loading && <RiLoaderLine aria-hidden className="mr-2 h-4 w-4 animate-spin" />}
              {children ?? (
                <div className="flex items-center gap-2 font-semibold">
                  <RiDeleteBinLine aria-hidden className="h-4 w-4" />
                  <span>{confirmOkText}</span>
                </div>
              )}
            </Button>
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto" align="start">
          <div className="flex flex-col gap-2">
            <p className="text-sm">{confirmTitle}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
                {confirmCancelText}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={loading}
                onClick={() => {
                  if (typeof onConfirm === "function") onConfirm()
                  setOpen(false)
                }}
              >
                {confirmOkText}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    )
  }
)

DeleteButton.displayName = "DeleteButton"
