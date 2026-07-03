"use client"

import { RiAlertLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="border-destructive/30 bg-destructive/10 flex size-12 items-center justify-center rounded-full border">
            <RiAlertLine aria-hidden className="text-destructive size-5" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold">Something went wrong</h1>
            {error.digest ? (
              <p className="text-muted-foreground font-mono text-xs">#{error.digest}</p>
            ) : null}
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            Try again
          </Button>
        </div>
      </body>
    </html>
  )
}
