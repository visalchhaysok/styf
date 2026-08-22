"use client"

import { useState } from "react"
import Sidebar from "@/components/sidebar/Sidebar"
import { Navbar } from "@/components/home/navbar"

export default function HomeLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div>
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