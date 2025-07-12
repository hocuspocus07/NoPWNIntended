"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, History, BarChart2, ChevronLeft } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useRef } from "react"
import ProfileTab from "./profile-tab"
import HistoryTab from "./history-tab"
import UsageTab from "./usage-tab"

export function AccountTabs({
    onBack,
    asOverlay = false,
}: {
    onBack?: () => void
    asOverlay?: boolean
}) {
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!asOverlay) return
        // Prevent background scroll
        document.body.style.overflow = "hidden"
        return () => {
            document.body.style.overflow = ""
        }
    }, [asOverlay])

    // Close on escape
    useEffect(() => {
        if (!asOverlay) return
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && onBack) onBack()
        }
        window.addEventListener("keydown", handler)
        return () => window.removeEventListener("keydown", handler)
    }, [asOverlay, onBack])

    // Overlay click handler
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && e.target === e.currentTarget && onBack) {
            onBack()
        }
    }

    const modalClass =
  "bg-background/90 backdrop-blur-sm shadow-xl relative flex flex-col " +
  (typeof window !== "undefined" && window.innerWidth < 640
    ? "w-full h-full max-w-full max-h-full rounded-none"
    : "w-full max-w-2xl h-[40rem] max-h-[90vh] rounded-xl")

    // Tab configuration
    const tabs = [
        { value: "profile", icon: User, label: "Profile", component: <ProfileTab /> },
        { value: "history", icon: History, label: "History", component: <HistoryTab /> },
        { value: "usage", icon: BarChart2, label: "Usage", component: <UsageTab /> },
    ]

    return asOverlay ? (
        <div
            className="fixed inset-0 z-999 flex items-center justify-center bg-black/60"
            onClick={handleOverlayClick}
            ref={modalRef}
        >
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                transition={{ duration: 0.2 }}
                className={modalClass}
                onClick={e => e.stopPropagation()}
            >
                <Tabs defaultValue="profile" className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center gap-2 mb-4 p-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-1 rounded-full hover:bg-accent"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                        )}
                        <TabsList className="grid grid-cols-3 w-full mx-auto h-14">
                            {tabs.map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="flex flex-col items-center gap-1 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground h-full"
                                >
                                    <tab.icon className="h-5 w-5" />
                                    <span className="text-sm">{tab.label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                    <div className="flex-1 overflow-auto px-6 pb-6 custom-scroll account-tabs-content">
                        {tabs.map((tab) => (
                            <TabsContent key={tab.value} value={tab.value}>
                                {tab.component}
                            </TabsContent>
                        ))}
                    </div>
                </Tabs>
            </motion.div>
        </div>
    ) : (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="w-full h-screen"
        >
            <Tabs defaultValue="profile">
                <div className="flex items-center gap-2 mb-4">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="p-1 rounded-full hover:bg-accent"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                    )}
                    <TabsList className="grid grid-cols-3 w-full mx-auto h-14">
                        {tabs.map((tab) => (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="flex flex-col items-center gap-1 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground h-full"
                            >
                                <tab.icon className="h-5 w-5" />
                                <span className="text-sm">{tab.label}</span>
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                <div className="h-[calc(100vh-7rem)] overflow-auto custom-scroll">
                    {tabs.map((tab) => (
                        <TabsContent key={tab.value} value={tab.value}>
                            {tab.component}
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </motion.div>
    )
}