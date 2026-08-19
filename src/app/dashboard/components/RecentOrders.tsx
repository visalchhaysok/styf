import { Search, Shirt } from "lucide-react"
import EmptyState from "./EmptyState"

type RecentOrder = {
    id: string
    fullId: string
    date: string
    created_at: string
    items: {
        product_name: string
        size: string
        quantity: number
        image_url: string | null
    }[]
    status: string
    total: string
    total_amount: number
}

type RecentOrdersProps = {
    hasOrders: boolean
    isLoading: boolean
    query: string
    setQuery: (value: string) => void
    handleSort: (field: "date") => void
    getSortIcon: (field: "date") => React.ReactNode
    sortedOrders: RecentOrder[]
    onShopNow: () => void
}

export default function RecentOrders({
    hasOrders,
    isLoading,
    query,
    setQuery,
    handleSort,
    getSortIcon,
    sortedOrders,
    onShopNow,
}: RecentOrdersProps) {

    return (
        <section className="mt-10">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="font-serif text-2xl">
                        Recent orders
                    </h2>

                    <p className="mt-1 text-xs text-[#9a9288]">
                        Track and manage your purchases
                    </p>
                </div>

                {hasOrders && (
                    <div className="flex gap-2">
                        <label className="flex items-center gap-2 rounded-lg border border-[#e5ded4] bg-[#fbfaf8] px-3 text-[#8c8378]">
                            <Search size={15} />

                            <span className="sr-only">
                                Search orders
                            </span>

                            <input
                                value={query}
                                onChange={(e) =>
                                    setQuery(e.target.value)
                                }
                                placeholder="Search"
                                className="w-20 bg-transparent py-2 text-xs text-[#292621] outline-none placeholder:text-[#aaa095] sm:w-28"
                            />
                        </label>
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="flex h-40 items-center justify-center rounded-2xl border border-[#e5ded4] bg-[#fbfaf8]">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9e8767] border-t-transparent" />
                </div>
            ) : hasOrders ? (
                <div className="overflow-hidden rounded-2xl border border-[#e5ded4] bg-[#fbfaf8]">
                    <div className="hidden grid-cols-[1.2fr_1.2fr_1.8fr_1fr_0.8fr] gap-4 border-b border-[#e5ded4] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9a9288] md:grid">
                        <span>Order</span>

                        <button
                            onClick={() =>
                                handleSort("date")
                            }
                            className="flex items-center gap-1 text-left hover:text-[#292621]"
                        >
                            Date {getSortIcon("date")}
                        </button>

                        <span>Item</span>
                        <span>Status</span>
                        <span className="text-right">
                            Total
                        </span>
                    </div>

                    {sortedOrders.map((order) => (
                        <div
                            key={order.fullId}
                            className="grid grid-cols-[1fr_auto] gap-3 border-b border-[#eee9e2] px-5 py-4 last:border-0 md:grid-cols-[1.2fr_1.2fr_1.8fr_1fr_0.8fr] md:items-center md:gap-4"
                        >
                            <div>
                                <p className="text-sm font-semibold">
                                    {order.id}
                                </p>

                                <p className="mt-1 text-xs text-[#9a9288] md:hidden">
                                    {order.date}
                                </p>
                            </div>

                            <p className="hidden text-xs text-[#8c8378] md:block">
                                {order.date}
                            </p>

                            <div className="flex items-center gap-3">
                                <div className="hidden h-12 w-10 items-center justify-center rounded-md bg-[#f2eee8] md:flex">
                                    <Shirt
                                        size={20}
                                        strokeWidth={1.5}
                                        className="text-[#9a9288]"
                                    />
                                </div>

                                <div className="text-sm text-[#5f574d]">
                                    {order.items?.length === 1 ? (
                                        <>
                                            {order.items[0].product_name}
                                            {" ("}
                                            {order.items[0].size}
                                            {") x "}
                                            {order.items[0].quantity}
                                        </>
                                    ) : (
                                        `${order.items?.length ?? 0} items`
                                    )}
                                </div>
                            </div>

                            <span
                                className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${order.status ===
                                    "In transit" ||
                                    order.status === "Paid"
                                    ? "bg-[#f2eadf] text-[#936f43]"
                                    : order.status ===
                                        "Cancelled" ||
                                        order.status ===
                                        "Failed"
                                        ? "bg-[#f2e5e5] text-[#8f5a5a]"
                                        : "bg-[#e5eee5] text-[#58725a]"
                                    }`}
                            >
                                {order.status}
                            </span>

                            <p className="text-right text-sm font-medium ">
                                {order.total}
                            </p>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState
                    onShopNow={onShopNow}
                />
            )}
        </section>
    )
}