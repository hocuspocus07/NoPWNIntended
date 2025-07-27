import * as React from "react"
import {
  ScanSearch, ShieldAlert, Bug, Code2, Network,
  ScanEye,
  SearchCheck,
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
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "./ui/button"
import { PanelLeftIcon } from "lucide-react"
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
    {
      title:"OSINT",
      icon:SearchCheck,
      items:[
        {title:"Holehe"},
        {title:"Sherlock"},
        {title:"Exiftool"},
      ]
    },
    {title:"Misc",
      icon: ScanEye,
      items:[
        {title:"Forensics Tool"},
        {title:"Reverse Engineering"}
      ]
    },
  ],
}

export function AppSidebar({
  activeTool,
  onToolSelect,
  onToolClick,
  ...props
}: {
  activeTool: string | null;
  onToolSelect: (category: string, toolId: string, toolTitle: string) => void;
  onToolClick?: () => void;
} & React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const collapsed = state === "collapsed";

  const navItems = data.navMain.map(category => ({
    ...category,
    items: category.items.map(item => ({
      ...item,
      toolId: item.title.toLowerCase().replace(/\s+/g, '-')
    }))
  }))

  const handleToolSelect = (category: string, toolId: string, toolTitle: string) => {
    onToolSelect(category, toolId, toolTitle);
    if (isMobile) {
      toggleSidebar(); // This will toggle the sidebar state
    }
    if (onToolClick) {
      onToolClick();
    }
  };

  const iconClicked = () => {
    redirect('/');
  }

  return (
    <>
      {/* Sidebar Trigger - Add this button outside the Sidebar */}
      {isMobile && !collapsed && (
        <Button 
          variant="ghost" 
          size="icon"
          className="fixed z-50 top-2 left-2"
          onClick={() => toggleSidebar()}
        >
        </Button>
      )}
      
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="flex items-center justify-start h-16" onClick={iconClicked}>
          {collapsed ? (
            <Image src="/images/icon-no-bg.png" alt="Icon" width={48} height={40} />
          ) : (
            <div className="flex h-full w-full items-center justify-center ml-2">
              <Image src="/images/icon-no-bg.png" alt="Icon" width={48} height={40} className="h-10 w-10"/>
              <span className="text-2xl font-extrabold p-2 flex-1">NoPWNIntended</span>
            </div>
          )}
        </SidebarHeader>
        <SidebarContent>
          <NavMain
            items={navItems}
            activeTool={activeTool}
            onToolSelect={handleToolSelect}
            sidebarCollapsed={collapsed}
          />
        </SidebarContent>
        <SidebarFooter>
          <NavUser/>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </>
  );
}

