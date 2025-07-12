"use client"
import { useState } from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { SidebarPopover } from "./sidebar-popover"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  url?: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url?: string
    toolId?: string
  }[]
}

interface NavMainProps {
  items: NavItem[]
  activeTool?: string | null
  onToolSelect?: (category: string, tool: string, toolId: string) => void
  sidebarCollapsed?: boolean
}

export function NavMain({ items, activeTool, onToolSelect, sidebarCollapsed }: NavMainProps) {
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const handleItemClick = (
    categoryTitle: string,
    subItem: { title: string; toolId?: string; url?: string }
  ) => {
    if (subItem.toolId) {
      onToolSelect?.(categoryTitle, subItem.toolId, subItem.title);
      setOpenPopover(null); // Close popover after selection
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Tools</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          sidebarCollapsed ? (
            <SidebarPopover
              key={item.title}
              title={item.title}
              icon={item.icon!}
              open={openPopover === item.title}
              onOpenChange={(open) => setOpenPopover(open ? item.title : null)}
            >
              <div className="flex flex-col">
                {item.items?.map((subItem) => (
                  <button
                    key={subItem.title}
                    className={`flex items-center px-2 py-1 rounded hover:bg-accent text-left ${activeTool === subItem.toolId ? "bg-accent font-bold" : ""}`}
                    onClick={() => handleItemClick(item.title, subItem)}
                  >
                    {subItem.title}
                  </button>
                ))}
              </div>
            </SidebarPopover>
          ) : (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.title}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    {item.items && (
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                {item.items && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={activeTool === subItem.toolId}
                          >
                            <a
                              href={subItem.url || '#'}
                              onClick={(e) => {
                                if (subItem.toolId) {
                                  e.preventDefault()
                                  handleItemClick(item.title, subItem)
                                }
                              }}
                            >
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}