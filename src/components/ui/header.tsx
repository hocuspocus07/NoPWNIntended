"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./logo";
import { Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="z-30 mt-2 w-full md:mt-5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-gray-900/90 px-3 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_right,var(--color-gray-800),var(--color-gray-700),var(--color-gray-800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] after:absolute after:inset-0 after:-z-10 after:backdrop-blur-xs">
          {/* Site branding */}
          <div className="flex flex-1 items-center">
            <Logo />
            <p className="text-2xl font-extrabold ml-2">NoPWNIntended</p>
          </div>

          {/* Desktop NavigationMenu */}
          <NavigationMenu className="hidden md:flex flex-1 items-center justify-end">
            <NavigationMenuList className="flex gap-3">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/signin"
                    className="btn-sm relative bg-linear-to-b from-gray-800 to-gray-800/60 bg-[length:100%_100%] bg-[bottom] py-[5px] text-gray-300 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_right,var(--color-gray-800),var(--color-gray-700),var(--color-gray-800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] hover:bg-[length:100%_150%]"
                  >
                    Sign In
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/signup"
                    className="btn-sm bg-linear-to-t from-indigo-600 to-indigo-500 bg-[length:100%_100%] bg-[bottom] py-[5px] text-white shadow-[inset_0px_1px_0px_0px_--theme(--color-white/.16)] hover:bg-[length:100%_150%]"
                  >
                    Register
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Mobile menu button */}
          <button
            className="flex items-center justify-center md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (
              <X className="h-7 w-7 text-gray-200" />
            ) : (
              <Menu className="h-7 w-7 text-gray-200" />
            )}
          </button>

          {/* Mobile NavigationMenu */}
          {mobileOpen && (
            <div className="absolute left-0 top-16 z-40 w-screen rounded-b-2xl bg-gray-900/95 px-6 pb-6 pt-4 shadow-lg md:hidden">
              <NavigationMenu>
                <NavigationMenuList className="flex flex-col gap-3 w-screen">
                  <NavigationMenuItem className="w-full">
                    <NavigationMenuLink asChild>
                      <Link
                        href="/signin"
                        className="block w-full rounded bg-linear-to-b from-gray-800 to-gray-800/60 py-2 text-center text-gray-300 hover:bg-gray-700"
                        onClick={() => setMobileOpen(false)}
                      >
                        Sign In
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/signup"
                        className="block w-full rounded bg-linear-to-t from-indigo-600 to-indigo-500 py-2 text-center text-white hover:bg-indigo-700"
                        onClick={() => setMobileOpen(false)}
                      >
                        Register
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}