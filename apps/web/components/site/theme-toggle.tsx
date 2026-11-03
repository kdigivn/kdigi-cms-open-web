"use client"

import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Light/dark switch. The class is first applied by /boot.js; both icons are in the markup and CSS picks one (no hydration flicker). */
export function ThemeToggle() {
  const toggle = () => {
    const dark = !document.documentElement.classList.contains("dark")
    document.documentElement.classList.toggle("dark", dark)
    try {
      localStorage.setItem("kdigi-theme", dark ? "dark" : "light")
    } catch {
      /* storage blocked: the choice lasts until reload */
    }
  }
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Đổi giao diện sáng hoặc tối">
      <Sun className="hidden dark:block" aria-hidden="true" />
      <Moon className="dark:hidden" aria-hidden="true" />
    </Button>
  )
}
