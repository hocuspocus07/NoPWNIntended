"use client"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./(css)/style.css";
import { usePathname } from "next/navigation";
import { Inter } from "next/font/google";
import localFont from "next/font/local";

import Header from "@/components/ui/header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const nacelle = localFont({
  src: [
    {
      path: "../fonts/nacelle-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/nacelle-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/nacelle-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/nacelle-semibolditalic.woff2",
      weight: "600",
      style: "italic",
    },
  ],
  variable: "--font-nacelle",
  display: "swap",
});
export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showHeader = !pathname.startsWith("/dashboard") && !pathname.startsWith("/account");
  return (
      <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${nacelle.variable} bg-gray-950 font-inter min-h-screen text-base text-gray-200 antialiased`}
      >
                <div className="flex min-h-screen flex-col overflow-hidden supports-[overflow:clip]:overflow-clip">
          {showHeader && <Header />}
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster/>
          </ThemeProvider>
          </div>
      </body>
    </html>
  )
}