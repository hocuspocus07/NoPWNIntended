"use client"

import Link from "next/link"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
// import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import Image from "next/image"
export default function Navbar() {
  // const { data: session } = useSession()
  // const isLoggedIn = !!session?.user
  return (
    <header className="sticky top-5 z-50 w-screen bg-black backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4">

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 w-2/3 mx-auto mt-2 py-2 px-4 rounded-xl bg-black/90">     
             <Image src="/images/icon-no-bg.png" alt="Icon" width={48} height={40} className="h-10 w-10" />
          <Link href="/" className="font-bold text-lg flex items-center gap-2">
            <span>NoPwnIntended</span>
          </Link>
          <div className="flex-1" />

          {/* Auth Buttons/Profile */}
          <div className="flex items-center gap-4 mr-4">
            {/* {isLoggedIn ? ( */}
            <Avatar className="h-8 w-8">
              {/* <AvatarImage src={session.user?.image || undefined} /> */}
              <AvatarFallback>
                {
                  // session.user?.name?.charAt(0) 
                  // ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            {/* ) : ( */}
            <>
              <Button variant="outline" size="sm" asChild className="bg-transparent hover:bg-gray-800 text-white border-gray-600 hover:text-white">
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild className="bg-white text-black hover:bg-gray-200 border-0">
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
            {/* )} */}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          {/* {isLoggedIn && ( */}
          <Avatar className="h-8 w-8">
            {/* <AvatarImage src={session.user?.image || undefined} /> */}
            <AvatarFallback>
              {
                // session.user?.name?.charAt(0) ||
                "U"}
            </AvatarFallback>
          </Avatar>
          {/* )} */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-6 pt-8">
                {/* {isLoggedIn ? ( */}
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <Avatar className="h-10 w-10">
                      {/* <AvatarImage src={session.user?.image || undefined} /> */}
                      <AvatarFallback>
                        {
                          // session.user?.name?.charAt(0) || 
                          "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      {/* <p className="font-medium">{session.user?.name}</p> */}
                      <p className="text-sm text-muted-foreground">
                        {/* {session.user?.email} */}
                      </p>
                    </div>
                  </div>
                  <Link href="/dashboard" className="text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link href="/profile" className="text-sm font-medium">
                    Profile
                  </Link>
                  <Link href="/logout" className="text-sm font-medium">
                    Sign Out
                  </Link>
                </>
                {/* ) : ( */}
                <>
                  <Button variant="outline" className="w-full bg-transparent hover:bg-gray-800 text-white border-gray-600 hover:text-white" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button className="w-full bg-white text-black hover:bg-gray-200 border-0" asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </>
                {/* )} */}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}