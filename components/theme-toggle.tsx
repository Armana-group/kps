"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  const dark = mounted && resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink"
    >
      {dark ? <Moon className="size-4" strokeWidth={1.8} /> : <Sun className="size-4" strokeWidth={1.8} />}
    </button>
  )
}
