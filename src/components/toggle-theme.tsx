"use client"

import { Moon, Sun, Check, Palette, Waves, Zap, Snowflake, Coffee, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

export function ModeToggle() {
  const [mounted, setMounted] = useState(false)
  const { setTheme, theme } = useTheme()

  const themes = [
    { name: "light", label: "Light", icon: Sun },
    { name: "dark", label: "Dark", icon: Moon },
    { name: "solarized-light", label: "Solarized Light", icon: Palette },
    { name: "oceanic-next", label: "Oceanic Next", icon: Waves },
    { name: "dracula", label: "Dracula", icon: Zap },
    { name: "nord", label: "Nord", icon: Snowflake },
    { name: "gruvbox-light", label: "Gruvbox Light", icon: Coffee },
    { name: "system", label: "System", icon: Monitor },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="h-9 w-9">
        <Sun className="h-[1.2rem] w-[1.2rem] opacity-0" />
      </Button>
    )
  }

  const currentTheme = themes.find(t => t.name === theme) || themes[0]
  const ThemeIcon = currentTheme.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <ThemeIcon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map(({ name, label }) => (
          <DropdownMenuItem
            key={name}
            onClick={() => setTheme(name)}
            className={`flex items-center justify-between ${theme === name ? "bg-accent" : ""}`}
          >
            <span>{label}</span>
            <Check className={`h-4 w-4 ${theme === name ? "opacity-100" : "opacity-0"}`} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}