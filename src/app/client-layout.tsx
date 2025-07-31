"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/ui/header"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showHeader = !pathname.startsWith("/dashboard") && !pathname.startsWith("/account")

  return (
    <ThemeProvider
      attribute="class"
      themes={["light", "dark", "solarized-light", "oceanic-next", "dracula", "nord", "gruvbox-light", "system"]}
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
        {showHeader && <Header />}
        {children}
      </div>
      <Toaster />
    </ThemeProvider>
  )
}