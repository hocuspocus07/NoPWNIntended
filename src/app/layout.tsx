import "./globals.css"
import "./(css)/style.css"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import { ClientLayout } from "./client-layout"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const nacelle = localFont({
  src: [
    { path: "../fonts/nacelle-regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/nacelle-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/nacelle-semibold.woff2", weight: "600", style: "normal" },
    { path: "../fonts/nacelle-semibolditalic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-nacelle",
  display: "swap",
})

export const metadata = {
  title: 'NoPWNIntended'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${nacelle.variable}`}>
      <body className="bg-gray-950 font-inter min-h-screen text-base text-gray-200 antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}