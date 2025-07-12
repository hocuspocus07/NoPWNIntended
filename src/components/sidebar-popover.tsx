"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronRight } from "lucide-react"

export function SidebarPopover({
  title,
  icon: Icon,
  children,
  open,
  onOpenChange,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger className="flex items-center justify-center p-2 rounded-md hover:bg-accent">
        <Icon className="h-5 w-5" />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="w-48 p-2 ml-2"
      >
        <div className="flex items-center px-2 py-1 font-medium">
          <ChevronRight className="h-4 w-4 mr-2" />
          <span>{title}</span>
        </div>
        <div className="mt-1">
          {children}
        </div>
      </PopoverContent>
    </Popover>
  )
}