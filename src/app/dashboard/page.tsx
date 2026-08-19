"use client"

import { useEffect, useMemo, useState } from "react"
import {
    CircleHelp,
    Menu,
    SlidersHorizontal,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/supabase"

import Sidebar from "./components/Sidebar"
import StatCard from "./components/StatCard"
import SpendingOverview, { ChartData } from "./components/SpendingOverview"
import RecentOrders from "./components/RecentOrders"

export default function DashboardPage() {
    const { user, isLoading: authLoading } = useAuth()
    const router = useRouter()

    const supabase = useMemo(() => createClient(), [])

    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [range, setRange] = useState("Last 30 days")
    const [query, setQuery] = useState("")
    const [sortField, setSortField] = useState<"date" | null>(null)
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

    const [stats, setStats] = useState({
        totalSpent: 0,
        ordersCount: 0,
        cartItems: 0,
    })

    const [recentOrders, setRecentOrders] = useState<any[]>([])
    const [chartData, setChartData] = useState<ChartData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [hasOrders, setHasOrders] = useState(false)

    const currentDate = new Date()

    const dateString = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    })

    const timeOfDay =
        currentDate.getHours() < 12
            ? "morning"
            : currentDate.getHours() < 17
                ? "afternoon"
                : "evening"

    useEffect(() => {
        if (authLoading) return

        if (!user) {
            router.push("/login")
            return
        }

        fetchDashboardData()
    }, [authLoading, user, range])

    async function fetchDashboardData() {
        setIsLoading(true)

        try {
            const [statsData, ordersData, chartData] = await Promise.all([
                fetchStats(),
                fetchOrders(),
                fetchChartData(),
            ])

            setStats(statsData)
            setRecentOrders(ordersData)
            setChartData(chartData)
            setHasOrders(ordersData.length > 0)
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    async function fetchStats() {
        if (!user) {
            return {
                totalSpent: 0,
                ordersCount: 0,
                cartItems: 0,
            }
        }

        const { data: ordersData } = await supabase
            .from("orders")
            .select("total_amount")
            .eq("user_id", user.id)
            .eq("status", "paid")

        const totalSpent =
            ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0

        const { count: ordersCount } = await supabase
            .from("orders")
            .select("*", {
                count: "exact",
                head: true,
            })
            .eq("user_id", user.id)

        const { data: cartData } = await supabase
            .from("carts")
            .select("id")
            .eq("user_id", user.id)
            .single()

        let cartItems = 0

        if (cartData) {
            const { data: cartItemsData } = await supabase
                .from("cart_items")
                .select("quantity")
                .eq("cart_id", cartData.id)

            cartItems =
                cartItemsData?.reduce((sum, item) => sum + item.quantity, 0) || 0
        }

        return {
            totalSpent,
            ordersCount: ordersCount || 0,
            cartItems,
        }
    }

    async function fetchOrders() {
        if (!user) return []

        const { data, error } = await supabase
            .from("orders")
            .select(`
            id,
            created_at,
            total_amount,
            status,
            order_items (
                product_name,
                size,
                quantity,
                price,
                product_id,
                products (
                    image_url
                )
            )
        `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10)

        if (error) {
            console.error("Error fetching orders:", error)
            return []
        }

        if (!data) return []

        return data.map((order) => ({
            id: order.id.slice(0, 8).toUpperCase(),
            fullId: order.id,

            date: new Date(order.created_at).toLocaleDateString(
                "en-US",
                {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }
            ),

            created_at: order.created_at,

            items: (order.order_items ?? []).map((item) => ({
                product_name: item.product_name,
                size: item.size,
                quantity: item.quantity,
                image_url:
                    (item.products as any)?.image_url ?? null,
            })),

            status:
                order.status.charAt(0).toUpperCase() +
                order.status.slice(1),

            total: `$${Number(order.total_amount).toFixed(2)}`,

            total_amount: Number(order.total_amount),
        }))
    }

    async function fetchChartData() {
        if (!user) return []

        let startDate = new Date()

        let groupBy: "day" | "week" | "month" = "month"

        switch (range) {
            case "Last 30 days":
                startDate.setDate(startDate.getDate() - 30)
                groupBy = "day"
                break

            case "Last 90 days":
                startDate.setDate(startDate.getDate() - 90)
                groupBy = "week"
                break

            case "This year":
                startDate = new Date(currentDate.getFullYear(), 0, 1)
                groupBy = "month"
                break

            default:
                startDate.setDate(startDate.getDate() - 30)
                groupBy = "day"
        }

        const { data } = await supabase
            .from("orders")
            .select("created_at, total_amount")
            .eq("user_id", user.id)
            .eq("status", "paid")
            .gte("created_at", startDate.toISOString())
            .order("created_at", {
                ascending: true,
            })

        if (!data || data.length === 0) {
            return Array.from({ length: 12 }, (_, i) => ({
                name: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                ][i],
                value: 0,
            }))
        }

        const groupedData: {
            [key: string]: number
        } = {}

        data.forEach((order) => {
            const date = new Date(order.created_at)

            let key: string

            if (groupBy === "day") {
                key = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                })
            } else if (groupBy === "week") {
                const weekNum = Math.ceil((date.getDate() - date.getDay() + 1) / 7)

                key = `Week ${weekNum}`
            } else {
                key = date.toLocaleDateString("en-US", {
                    month: "short",
                })
            }

            groupedData[key] = (groupedData[key] || 0) + order.total_amount
        })

        return Object.entries(groupedData).map(([name, value]) => ({
            name,
            value: Number(value.toFixed(2)),
        }))
    }

    const filteredOrders = useMemo(() => {
        if (!query) return recentOrders

        return recentOrders.filter(
            (order) =>
                order.item.toLowerCase().includes(query.toLowerCase()) ||
                order.id.toLowerCase().includes(query.toLowerCase()),
        )
    }, [query, recentOrders])

    const sortedOrders = useMemo(() => {
        if (!sortField) return filteredOrders

        const sorted = [...filteredOrders]

        if (sortField === "date") {
            sorted.sort((a, b) => {
                const dateA = new Date(a.created_at).getTime()

                const dateB = new Date(b.created_at).getTime()

                return sortDirection === "asc" ? dateA - dateB : dateB - dateA
            })
        }

        return sorted
    }, [filteredOrders, sortField, sortDirection])

    const handleSort = (field: "date") => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
        } else {
            setSortField(field)
            setSortDirection("desc")
        }
    }

    const getSortIcon = (field: "date") => {
        if (sortField !== field) {
            return <ArrowUpDown size={12} />
        }

        return sortDirection === "asc" ? (
            <ArrowUp size={12} />
        ) : (
            <ArrowDown size={12} />
        )
    }

    return (
        <div className="min-h-screen bg-[#f8f6f2] text-[#292621] lg:flex">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="min-w-0 flex-1">
                <header className="flex items-center justify-between border-b border-[#e5ded4] bg-[#f8f6f2]/90 px-5 py-5 backdrop-blur-sm md:px-10 lg:px-12">
                    <button
                        className="rounded-lg border border-[#e5ded4] p-2 lg:hidden"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open navigation"
                    >
                        <Menu size={18} />
                    </button>

                    <div className="hidden items-center gap-3 text-sm text-[#8c8378] md:flex">
                        <span>Account</span>

                        <span>/</span>

                        <span className="font-medium text-[#292621]">Dashboard</span>
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                        <button
                            className="text-[#8c8378] hover:text-[#292621]"
                            aria-label="Help"
                        >
                            <CircleHelp size={19} />
                        </button>

                        <div className="size-2 rounded-full bg-[#b8a990]" />
                    </div>
                </header>

                <div className="mx-auto max-w-7xl px-5 py-8 md:px-10 md:py-12 lg:px-12">
                    <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                        <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a8d7c]">
                                {dateString}
                            </p>

                            <h1 className="font-serif text-4xl tracking-tight md:text-5xl">
                                Good {timeOfDay},{" "}
                                {user?.user_metadata?.full_name ||
                                    user?.email?.split("@")[0] ||
                                    "there"}
                            </h1>

                            <p className="mt-3 text-sm text-[#8c8378]">
                                Here&apos;s the latest from your STYF account.
                            </p>
                        </div>

                        <button className="flex w-fit items-center gap-2 rounded-lg border border-[#ded5c9] bg-[#fbfaf8] px-4 py-2.5 text-xs font-medium text-[#5f574d] shadow-sm">
                            <SlidersHorizontal size={15} />
                            Customize view
                        </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <StatCard
                            label="Total spent"
                            value={`$${stats.totalSpent.toFixed(2)}`}
                            change="+12.4%"
                            tone="warm"
                            isLoading={isLoading}
                        />

                        <StatCard
                            label="Orders placed"
                            value={stats.ordersCount}
                            change="+2 this month"
                            isLoading={isLoading}
                        />

                        <StatCard
                            label="Items in cart"
                            value={stats.cartItems}
                            change={stats.cartItems > 0 ? "Ready to checkout" : undefined}
                            isLoading={isLoading}
                        />
                    </div>

                    <div className="mt-10 grid gap-5">
                        <SpendingOverview
                            range={range}
                            setRange={setRange}
                            chartData={chartData}
                            isLoading={isLoading}
                        />

                        <RecentOrders
                            hasOrders={hasOrders}
                            isLoading={isLoading}
                            query={query}
                            setQuery={setQuery}
                            handleSort={handleSort}
                            getSortIcon={getSortIcon}
                            sortedOrders={sortedOrders}
                            onShopNow={() => router.push("/shop")}
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}
