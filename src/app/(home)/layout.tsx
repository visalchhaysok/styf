"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar/Sidebar"
import { Navbar } from "@/components/home/navbar"
import LoadingScreen from "@/components/ui/LoadingScreen"

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div>
            <LoadingScreen />
            <Navbar
                onMenuClick={() => setSidebarOpen(true)}
            />

            {children}

            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
        </div>
    )
}