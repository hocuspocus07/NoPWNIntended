"use client"

import * as React from "react"
import { useState } from "react"
import {
  ScanSearch, ShieldAlert, Bug, Code2, Network,
  Wifi, Key, Fingerprint, Settings
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
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
  const navItems = data.navMain.map(category => ({
    ...category,
    items: category.items.map(item => ({
      ...item,
      toolId: item.title.toLowerCase().replace(/\s+/g, '-')
    }))
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navItems}
          activeTool={activeTool}
          onToolSelect={onToolSelect}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

