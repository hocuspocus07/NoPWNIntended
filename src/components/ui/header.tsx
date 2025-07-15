"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useRef } from "react"
export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
        localStorage.removeItem('supabase.auth.token')
      }
      setLoading(false)
    }
    getUser()
    // Listen for profile updates
    const handleProfileUpdate = () => getUser()
    window.addEventListener('profile-updated', handleProfileUpdate)
    return () => window.removeEventListener('profile-updated', handleProfileUpdate)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/login'
  }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuButtonRef.current && 
        !menuButtonRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false)
      }
    }
    if (mobileMenuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [mobileMenuOpen])
  return (
    <header className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur border-b border-gray-800">
      <nav className="flex items-center justify-between h-16 px-4 md:px-8">
        {/* Left: Project Icon */}
        <Link href="/" className="flex items-center gap-2 select-none">
          <Image src="/images/icon-no-bg.png" alt="Icon" width={40} height={40} className="h-10 w-10" />
          <span className="hidden md:inline font-bold text-lg text-white tracking-wide">NoPwnIntended</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 focus:outline-none group bg-gray-700 px-2 py-1 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url || undefined} />
                    <AvatarFallback>{user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="text-white text-md font-bold group-hover:cursor-pointer">{user.user_metadata?.name || user.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="hover:cursor-pointer">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="hover:cursor-pointer">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild className="bg-gray-800 hover:bg-gray-700 text-white border-gray-600">
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-end flex-1">
          {loading ? null : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {user ? (
                  <button className="focus:outline-none">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user_metadata?.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                ) : (
                  <Button variant="outline" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5 text-white" />
                  </Button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="mt-2 p-0 w-screen shadow-lg rounded-xl overflow-hidden border bg-black text-foregound"
                style={{ minWidth: 250 }}
              >
                {/* Menu header */}
                <div className="p-4 border-b">
                  <span className="font-bold text-lg">Menu</span>
                </div>
                {/* Dropdown items */}
                <div className="flex flex-col py-2">
                  {user ? (
                    <>
                      <DropdownMenuItem asChild className="text-md px-4 py-3 font-medium flex justify-center items-center">
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="flex justify-center items-center text-md px-4 py-3 text-red-600 font-medium cursor-pointer"
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild className="text-md px-4 py-3 flex justify-center items-center font-medium rounded-lg">
                        <Link href="/login">Login</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="text-md px-4 flex justify-center items-center py-3 font-medium rounded-lg bg-blue-600 hover:bg-blue-700 focus:bg-blue-700  m-1 transition-all cursor-pointer">
                        <Link href="/register">Sign Up</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </nav>
    </header>
  )
}