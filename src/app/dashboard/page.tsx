"use client"
import { AppSidebar } from "@/components/app-sidebar"
import { MainSection } from "@/components/main-section"
import { ModeToggle } from "@/components/toggle-theme"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useState } from "react"

export default function Page() {
  const [activeTool, setActiveTool] = useState<string | null>(null)
    const [activeToolTitle, setActiveToolTitle] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const handleToolSelect = (category: string, toolId: string, toolTitle: string) => {
    setActiveCategory(category)
    setActiveTool(toolId)
    setActiveToolTitle(toolTitle)
  }

  return (
    <SidebarProvider>
      <AppSidebar
  activeTool={activeTool}
  onToolSelect={handleToolSelect}
/>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <ModeToggle />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {activeCategory && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{activeCategory}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
                {activeTool && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>{activeToolTitle}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>

          </div>
        </header>
      <MainSection activeTool={activeTool} activeToolTitle={activeToolTitle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
