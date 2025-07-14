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
                <button className="flex items-center gap-2 focus:outline-none group">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url || undefined} />
                    <AvatarFallback>{user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <span className="text-white text-sm group-hover:underline">{user.user_metadata?.name || user.email}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
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
          {loading ? null : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url || undefined} />
                    <AvatarFallback>{user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-screen max-w-full left-0 !right-0 rounded-none shadow-none bg-white text-black p-0 border-t border-gray-200">
                <DropdownMenuItem asChild className="w-full justify-center py-4 text-lg">
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="w-full justify-center py-4 text-lg">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5 text-white" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="top"
                className="w-full max-w-full rounded-none shadow-none bg-white text-black p-0 border-t border-gray-200"
                style={{ backdropFilter: 'none', background: 'white' }}
              >
                <SheetHeader>
                  <SheetTitle className="text-lg font-bold text-gray-900">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-4 pt-6 px-4">
                  <Button variant="outline" className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-600" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0" asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </nav>
    </header>
  )
}