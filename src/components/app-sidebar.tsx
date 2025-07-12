"use client"

import * as React from "react"
import { useState } from "react"
import {
  ScanSearch, ShieldAlert, Bug, Code2, Network,
  Wifi, Key, Fingerprint, Settings, Shield
} from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "SecurityUser",
    email: "user@nopwnintended.com",
    avatar: "/avatars/security.jpg",
  },
  teams: [
    {
      name: "Red Team",
      logo: ScanSearch,
      plan: "Professional",
    },
    {
      name: "Blue Team",
      logo: ShieldAlert,
      plan: "Enterprise",
    },
    {
      name: "Purple Team",
      logo: Network,
      plan: "Advanced",
    },
  ],
  navMain: [
    {
      title: "Recon",
      icon: ScanSearch,
      isActive: true,
      items: [
        {
          title: "Port Scanner",
        },
        {
          title: "Subdomain Finder",
        },
        {
          title: "WHOIS Lookup",
        },
      ],
    },
    {
      title: "Vuln Assessment",
      icon: ShieldAlert,
      items: [
        {
          title: "Web Scanner",
        },
        {
          title: "SSL Analyzer",
        },
      ],
    },
    {
      title: "Exploitation",
      icon: Bug,
      items: [
        {
          title: "Directory Brute Forcer",
        },
        {
          title: "SQLi Scanner",
        },
        {
          title: "XSS Tester",
        },
      ],
    },
    {
      title: "Payload Crafting",
      icon: Code2,
      items: [
        {
          title: "Encoder/Decoder",
        },
        {
          title: "Hash Cracker",
        },
        {
          title: "JWT Encoder/Decoder",
        }
      ],
    },
  ],
}

export function AppSidebar({
  activeTool,
  onToolSelect,
  ...props
}: {
  activeTool: string | null;
  onToolSelect: (category: string, toolId: string, toolTitle: string) => void;
} & React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const navItems = data.navMain.map(category => ({
    ...category,
    items: category.items.map(item => ({
      ...item,
      toolId: item.title.toLowerCase().replace(/\s+/g, '-')
    }))
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-start h-16">
        {collapsed ? (
          <Shield className="h-8 w-8 text-indigo-500 ml-2" aria-label="NoPWNIntended" />
        ) : (
          <span className="text-2xl font-extrabold p-2 flex-1">NoPWNIntended</span>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navItems}
          activeTool={activeTool}
          onToolSelect={onToolSelect}
          sidebarCollapsed={collapsed}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

