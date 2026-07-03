"use client"

import { RiMoonLine, RiSunLine } from "@remixicon/react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <RiSunLine
        aria-hidden
        className="size-4 scale-100 rotate-0 opacity-100 transition-[opacity,transform] motion-reduce:transition-none dark:scale-0 dark:-rotate-90 dark:opacity-0"
      />
      <RiMoonLine
        aria-hidden
        className="absolute size-4 scale-0 rotate-90 opacity-0 transition-[opacity,transform] motion-reduce:transition-none dark:scale-100 dark:rotate-0 dark:opacity-100"
      />
    </Button>
  )
}
