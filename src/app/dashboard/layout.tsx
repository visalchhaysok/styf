"use client"

import { useState } from "react"
import Sidebar from "./Sidebar"
import DashboardNavbar from "./DashboardNavbar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-[#f8f6f2] text-[#292621] lg:flex">
            <Sidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            <main className="min-w-0 flex-1">
                <DashboardNavbar
                    onMenuClick={() => setSidebarOpen(true)}
                />

                {children}
            </main>
        </div>
    )
}