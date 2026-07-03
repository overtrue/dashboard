import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { PLACEHOLDER_TEXT } from "@/lib/placeholder"

type PlaceholderTextProps = {
  children?: ReactNode
  className?: string
}

export function PlaceholderText({ children = PLACEHOLDER_TEXT, className }: PlaceholderTextProps) {
  return <span className={cn("text-muted-foreground", className)}>{children}</span>
}
