import Link from "next/link"
import { RiArrowLeftLine } from "@remixicon/react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <p className="text-muted-foreground/30 text-7xl font-semibold tabular-nums">404</p>
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-muted-foreground text-sm">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Button variant="outline" asChild size="sm">
        <Link href="/dashboard">
          <RiArrowLeftLine aria-hidden className="mr-1.5 size-3.5" />
          Back to dashboard
        </Link>
      </Button>
    </div>
  )
}
