"use client"

import {
  User as UserIcon,
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"
import {
  Avatar as AvatarShad,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { AccountTabs } from "./account-tabs"
import { AnimatePresence, motion } from "framer-motion"
import { toast } from "sonner"
import { useCallback, useEffect, useState } from 'react'
import { supabase } from "@/utils/supabase/client"
import { type User } from '@supabase/supabase-js'
import Avatar from "@/app/dashboard/avatar"
interface UserData {
  id?: string;
  email?: string | null;
  user_metadata?: {
    name?: string;
    avatar_url?: string;
  };
}

export function NavUser() {
  const [loading, setLoading] = useState(true)
  const [fullname, setFullname] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)
  const { isMobile } = useSidebar()
  const [showTabs, setShowTabs] = useState(false)

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError || !session) {
          console.error("Session fetch error:", sessionError)
          window.location.href = '/login'
          return
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error("User fetch error:", userError)
          return
        }

        setUser(user)
        setFullname(user?.user_metadata?.name || user?.email || "User")
        setEmail(user?.email || "")
        setAvatarUrl(user?.user_metadata?.avatar_url || "")
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
    const handleProfileUpdate = () => {
      getUser()
    }
    window.addEventListener('profile-updated', handleProfileUpdate)
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate)
    }
  }, [])


  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Logout failed')
    }
  }

  const proClicked = () => {
    toast("Pro feature coming soon!")
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <AvatarShad className="h-8 w-8 rounded-lg">
                  <Avatar
                    uid={user?.id ?? null}
                    url={avatar_url}
                    size={150}
                    onUpload={(url) => {
                      setAvatarUrl(url)
                      window.dispatchEvent(new Event('profile-updated'))
                    }}
                  />
                  <AvatarFallback className="rounded-lg">
                    {fullname?.charAt(0) || 'U'}
                  </AvatarFallback>
                </AvatarShad>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{loading ? "Loading..." : fullname || "User"}</span>
                  <span className="truncate text-xs">{loading ? "..." : email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <AvatarShad className="h-8 w-8 rounded-lg">
                    <AvatarImage src={avatar_url || ""} alt={fullname || ""} />
                    <AvatarFallback className="rounded-lg">
                      {fullname?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </AvatarShad>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{fullname || "User"}</span>
                    <span className="truncate text-xs">{email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={proClicked}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => setShowTabs(true)}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <AnimatePresence>
        {showTabs && (
          <AccountTabs
            onBack={() => setShowTabs(false)}
            asOverlay={true}
          />
        )}
      </AnimatePresence>
    </>
  )
}