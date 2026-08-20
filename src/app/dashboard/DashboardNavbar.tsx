"use client"

import { CircleHelp, Menu, Store } from "lucide-react"
import { useRouter } from "next/navigation"

type DashboardNavbarProps = {
    onMenuClick: () => void
}

export default function DashboardNavbar({
    onMenuClick,
}: DashboardNavbarProps) {
    const router = useRouter()

    return (
        <header className="flex items-center justify-between border-b border-[#e5ded4] bg-[#f8f6f2]/90 px-5 py-5 backdrop-blur-sm md:px-10 lg:px-12">
            <button
                className="rounded-lg border border-[#e5ded4] p-2 lg:hidden"
                onClick={onMenuClick}
                aria-label="Open navigation"
            >
                <Menu size={18} />
            </button>

            <div className="hidden items-center gap-3 text-sm text-[#8c8378] md:flex">
                <span>Account</span>

                <span>/</span>

                <span className="font-medium text-[#292621]">
                    Dashboard
                </span>
            </div>

            <div className="ml-auto flex items-center gap-2 md:gap-4">
                <button
                    className="text-[#8c8378] hover:text-[#292621]"
                    aria-label="Help"
                >
                    <CircleHelp size={19} />
                </button>
                <button
                    className="flex items-center gap-2 rounded-lg border border-[#e5ded4] bg-white px-3 py-2 text-xs font-medium text-[#8c8378] shadow-sm hover:text-[#292621]"
                    onClick={() => router.push("/")}
                >

                    <Store size={17} strokeWidth={1.8} />
                    <span className="md:hidden">Shop</span>
                    <span className="hidden md:inline">Back to Shop</span>
                </button>

            </div>
        </header>
    )
}