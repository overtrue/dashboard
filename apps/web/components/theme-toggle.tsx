"use client";

import { useTheme } from "@/components/theme-provider";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { RiMoonLine, RiSunLine, RiComputerLine } from "@remixicon/react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <>
      <DropdownMenuItem onClick={() => setTheme("light")}>
        <RiSunLine className="mr-2 h-4 w-4" />
        Light
        {theme === "light" && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("dark")}>
        <RiMoonLine className="mr-2 h-4 w-4" />
        Dark
        {theme === "dark" && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setTheme("system")}>
        <RiComputerLine className="mr-2 h-4 w-4" />
        System
        {theme === "system" && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
      </DropdownMenuItem>
    </>
  );
}