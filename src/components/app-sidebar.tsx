import * as React from "react"
import {
  ScanSearch, ShieldAlert, Bug, Code2, Network,
  ScanEye,
} from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { redirect } from "next/navigation"
import { title } from "process"

const data = {
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
    {title:"Misc",
      icon: ScanEye,
      items:[
        {title:"Forensics Tool"},
        {title:"Reverse Engineering"}
      ]
    }
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

  const iconClicked = () => {
    redirect('/')
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-start h-16" onClick={iconClicked}>
        {collapsed ? (
          <Image src="/images/icon-no-bg.png" alt="Icon" width={48} height={40} />
        ) : (<div className="flex h-full w-full items-center justify-center ml-2">
          <Image src="/images/icon-no-bg.png" alt="Icon" width={48} height={40} className="h-10 w-10"/>
          <span className="text-2xl font-extrabold p-2 flex-1">NoPWNIntended</span>
          </div>
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
        <NavUser/>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

