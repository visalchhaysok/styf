"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    ChevronLeft,
    CreditCard,
    Home,
    LayoutDashboard,
    LogOut,
    Package,
    Settings,
    Truck,
    UserRound,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

const navItems = [
    {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/account/dashboard",
    },
    {
        label: "Profile",
        icon: UserRound,
        href: "/account/profile",
    },
    {
        label: "Orders & History",
        icon: Package,
        href: "/account/orders-history",
    },
    {
        label: "Shipping Details",
        icon: Truck,
        href: "#",
        demo: true,
    },
    {
        label: "Saved Payments",
        icon: CreditCard,
        href: "#",
        demo: true,
    },
]

type SidebarProps = {
    open: boolean
    onClose: () => void
}

export default function Sidebar({
    open,
    onClose,
}: SidebarProps) {
    const { user, signOut } = useAuth()
    const pathname = usePathname()

    return (
        <>
            {open && (
                <button
                    aria-label="Close navigation"
                    onClick={onClose}
                    className="fixed inset-0 z-30 bg-foreground/20"

                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#26231f] px-5 py-6 text-[#eee8df] transition-transform duration-300 ${open
                    ? "translate-x-0"
                    : "-translate-x-full"
                    }`
                }
            >
                <div className="mb-10 px-2">
                    <div className="flex min-w-0 items-center gap-3">
                        <Image
                            src="/user-icon.png"
                            alt="Profile Picture"
                            width={44}
                            height={44}
                            className="size-11 rounded-full object-cover object-top ring-2 ring-[#b8a990]"
                        />

                        <div className="min-w-0 max-w-37.5">
                            <p className="truncate text-base font-medium">
                                {user?.user_metadata.username ||
                                    user?.email?.split("@")[0] ||
                                    "Guest"}
                            </p>

                            <p className="mt-1 truncate text-xs text-[#a8a094]">
                                {user?.email ||
                                    "guest@email.com"}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute right-3 top-4 rounded-md p-1.5 text-[#a8a094] hover:bg-[#37322d] hover:text-[#eee8df] border border-[#d6d6d6]"
                    aria-label="Close navigation"
                >
                    <ChevronLeft size={18} strokeWidth={3} />
                </button>

                <nav
                    className="flex flex-1 flex-col gap-1"
                    aria-label="Main navigation"
                >
                    <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#817a70]">
                        Home
                    </p>

                    <Link
                        href="/"
                        onClick={onClose}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${pathname === "/"
                            ? "bg-[#eee8df] font-semibold text-[#26231f]"
                            : "text-[#b9b1a6] hover:bg-[#37322d] hover:text-[#eee8df]"
                            }`}
                    >
                        <Home
                            size={17}
                            strokeWidth={
                                pathname === "/" ? 2.2 : 1.7
                            }
                        />

                        <span>Home</span>
                    </Link>

                    <p className="mb-3 mt-6 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#817a70]">
                        Account
                    </p>

                    {navItems.map(
                        ({
                            label,
                            icon: Icon,
                            href,
                            demo,
                        }) => {
                            const active =
                                pathname === href

                            return (
                                <Link
                                    key={label}
                                    href={href}
                                    onClick={onClose}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${active
                                        ? "bg-[#eee8df] font-semibold text-[#26231f]"
                                        : "text-[#b9b1a6] hover:bg-[#37322d] hover:text-[#eee8df]"
                                        }`}
                                >
                                    <Icon
                                        size={17}
                                        strokeWidth={
                                            active ? 2.2 : 1.7
                                        }
                                    />

                                    <span>{label}</span>

                                    {demo && (
                                        <span className="ml-auto text-[9px] uppercase tracking-wider text-[#817a70]">
                                            Demo
                                        </span>
                                    )}
                                </Link>
                            )
                        }
                    )}
                </nav>

                <div className="border-t border-[#474139] pt-4">
                    <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#b9b1a6] hover:bg-[#37322d] hover:text-[#eee8df]">
                        <Settings
                            size={17}
                            strokeWidth={1.7}
                        />
                        Settings
                    </button>

                    <button
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#c39a92] hover:bg-[#4a302c] hover:text-[#f1c6bf]"
                        onClick={signOut}
                    >
                        <LogOut
                            size={17}
                            strokeWidth={1.7}
                        />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    )
}