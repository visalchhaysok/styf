import { LogOut, Settings, X } from "lucide-react"
import Image from "next/image"

import {
    LayoutDashboard,
    UserRound,
    Package,
    Truck,
    CreditCard,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, active: true },
    { label: "Profile", icon: UserRound },
    { label: "Orders & History", icon: Package },
    { label: "Shipping Details", icon: Truck, demo: true },
    { label: "Saved Payments", icon: CreditCard, demo: true },
]

export default function Sidebar({
    open,
    onClose,
}: {
    open: boolean,
    onClose: () => void
}) {

    const { signOut } = useAuth()

    return (
        <>
            {open && (
                <button
                    aria-label="Close navigation"
                    onClick={onClose}
                    className="fixed inset-0 z-30 bg-foreground/20 lg:hidden"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-71.5 flex-col bg-[#26231f] px-5 py-6 text-[#eee8df] transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="mb-10 flex items-start justify-between px-2">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/hero.png"
                            alt="Profile Picture"
                            width={44}
                            height={44}
                            className="size-11 rounded-full object-cover object-top ring-2 ring-[#b8a990]"
                        />

                        <div>
                            <p className="text-sm font-medium">Alex Morgan</p>
                            <p className="mt-1 text-xs text-[#a8a094]">
                                alex@styf.co
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-md p-1 text-[#a8a094] hover:text-white lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={18} />
                    </button>
                </div>

                <nav
                    className="flex flex-1 flex-col gap-1"
                    aria-label="Dashboard navigation"
                >
                    <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#817a70]">
                        Account
                    </p>

                    {navItems.map(({ label, icon: Icon, active, demo }) => (
                        <button
                            key={label}
                            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${active
                                ? "bg-[#eee8df] font-semibold text-[#26231f]"
                                : "text-[#b9b1a6] hover:bg-[#37322d] hover:text-[#eee8df]"
                                }`}
                        >
                            <Icon
                                size={17}
                                strokeWidth={active ? 2.2 : 1.7}
                            />

                            <span>{label}</span>

                            {demo && (
                                <span className="ml-auto text-[9px] uppercase tracking-wider text-[#817a70]">
                                    Demo
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="border-t border-[#474139] pt-4">
                    <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#b9b1a6] hover:bg-[#37322d] hover:text-[#eee8df]">
                        <Settings size={17} strokeWidth={1.7} />
                        Settings
                    </button>

                    <button
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#c39a92] hover:bg-[#4a302c] hover:text-[#f1c6bf]"
                        onClick={signOut}
                    >
                        <LogOut size={17} strokeWidth={1.7} />
                        Logout
                    </button>
                </div>
            </aside>
        </>
    )
}