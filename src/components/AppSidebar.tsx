"use client"

import {
    ScanSearch, ShieldAlert, Bug, Code2, Network,
    Wifi, Key, Fingerprint, Settings, ChevronDown, Menu, ChevronUp, User2
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarTrigger, SidebarFooter,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem
} from "@/components/ui/dropdown-menu";

import { useState, useEffect } from "react";

const menuItems = [
    {
        title: "Recon",
        icon: ScanSearch,
        tools: [
            { name: "Port Scanner", icon: Wifi },
            { name: "Subdomain Finder", icon: Network },
            { name: "WHOIS Lookup", icon: Fingerprint },
            { name: "Header Analyzer", icon: ScanSearch }
        ]
    },
    {
        title: "Vuln Assessment",
        icon: ShieldAlert,
        tools: [
            { name: "Web Scanner", icon: ShieldAlert },
            { name: "SSL Analyzer", icon: Key },
            { name: "Clickjacking", icon: Code2 }
        ]
    },
    {
        title: "Web Exploitation",
        icon: Bug,
        tools: [
            { name: "DirBuster", icon: Code2 },
            { name: "Parameter Fuzzer", icon: Bug },
            { name: "SQLi/XSS Scanner", icon: ShieldAlert },
        ]
    },
    {
        title: "Payload Crafting",
        icon: Code2,
        tools: [
            { name: "Shell Generator", icon: Code2 },
            { name: "Encoders/Decoders", icon: Key },
            { name: "Hash Cracker", icon: Fingerprint }
        ]
    },
    {
        title: "Network Tools",
        icon: Network,
        tools: [
            { name: "Ping/Traceroute", icon: Wifi },
            { name: "IP Calculator", icon: Network },
            { name: "Packet Analyzer", icon: ScanSearch }
        ]
    },
    {
        title: "Settings",
        icon: Settings,
        tools: [
            { name: "Preferences", icon: Settings },
            { name: "About", icon: Fingerprint }
        ]
    }
];

export function AppSidebar() {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [collapsed, setCollapsed] = useState(false);

    const handleToggle = (title: string) => {
        setOpenDropdown(prev => (prev === title ? null : title));
    };

    return (
        <>
        {/* Sidebar Trigger for mobile screens */}
            <SidebarTrigger className="fixed left-4 top-4 z-50 p-2 rounded-md bg-accent md:hidden">
                <Menu className="w-5 h-5" />
            </SidebarTrigger>
            {/* main sidebar */}
            <Sidebar className={`transition-all duration-300 ${collapsed ? "w-20" : "w-64"} border-r fixed md:relative h-full z-50`}>
                <SidebarContent>
                    <SidebarGroup>
                        <div className="flex items-center justify-between px-4 py-2">
                            {!collapsed && (
                                <SidebarGroupLabel className="text-2xl">
                                    NoPWNIntended
                                </SidebarGroupLabel>
                            )}
                            <button
                                onClick={() => setCollapsed(!collapsed)}
                                className="p-1 rounded hover:bg-muted sm:block hidden"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                        </div>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {menuItems.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            className="w-full flex justify-between items-center px-4 py-2 hover:bg-accent"
                                            onClick={() => handleToggle(item.title)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <item.icon className="w-5 h-5" />
                                                {!collapsed && <span>{item.title}</span>}
                                            </div>
                                            {!collapsed && (
                                                <ChevronDown
                                                    className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.title ? "rotate-180" : ""
                                                        }`}
                                                />
                                            )}
                                        </SidebarMenuButton>

                                        {/* Expandable tools */}
                                        {!collapsed && openDropdown === item.title && (
                                            <div className="pl-10 py-1 space-y-1">
                                                {item.tools.map((tool) => (
                                                    <div
                                                        key={tool.name}
                                                        className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary cursor-pointer"
                                                    >
                                                        <tool.icon className="w-4 h-4" />
                                                        <span>{tool.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                {/* Profile menu  */}
                <SidebarFooter className="border-t-2 border-gray-300">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton className="flex items-center gap-3 px-4 py-2">
                                        <User2 className="w-5 h-5 font-bold" />
                        {!collapsed && (
                            <>
                                <span className="font-bold">Username</span>
                                <ChevronUp className="ml-auto w-4 h-4" />
                            </>
                        )}
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    side="top"
                                    className="w-[--radix-popper-anchor-width]"
                                >
                                    <DropdownMenuItem>
                                        <span>Account</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <span>Sign out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
        </>
    );
}
