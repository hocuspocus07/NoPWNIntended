import { SidebarProvider} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import "./globals.css"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex">
        <SidebarProvider>
          <AppSidebar />
            <main className="flex-1 p-4">
              {children}
            </main>
        </SidebarProvider>
      </body>
    </html>
  )
}