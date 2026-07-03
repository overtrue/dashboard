"use client"

import { RiSearchLine } from "@remixicon/react"

export function ListSearchEmptyState({
  message = "Enter a search term above to load results",
  hint,
}: {
  message?: string
  hint?: string
}) {
  return (
    <div className="border-border/60 bg-muted/10 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-16 text-center">
      <div className="bg-muted/50 flex size-10 items-center justify-center rounded-full">
        <RiSearchLine aria-hidden className="text-muted-foreground size-5" />
      </div>
      <p className="text-sm font-medium">{message}</p>
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  )
}
