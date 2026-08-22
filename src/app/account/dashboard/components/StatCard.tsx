export default function StatCard({
    label,
    value,
    change,
    tone = "default",
    isLoading,
}: {
    label: string
    value: string | number
    change?: string
    tone?: "default" | "warm"
    isLoading?: boolean
}) {
    if (isLoading) {
        return (
            <div
                className={`rounded-2xl border p-5 ${tone === "warm"
                    ? "border-[#d7c5ac] bg-[#f2eadf]"
                    : "border-[#e5ded4] bg-[#fbfaf8]"
                    }`}
            >
                <p className="text-[10px] md:text-xs font-medium uppercase tracking-[0.14em] text-[#8c8378]">
                    {label}
                </p>

                <div className="mt-4 flex items-end justify-between gap-2">
                    <div className="h-10 w-20 animate-pulse rounded bg-[#e5ded4]" />

                    {change && (
                        <div className="h-6 w-16 animate-pulse rounded-full bg-[#e2eadf]" />
                    )}
                </div>
            </div>
        )
    }

    return (
        <div
            className={`rounded-2xl border px-5 py-4 md:p-5 ${tone === "warm"
                ? "border-[#d7c5ac] bg-[#f2eadf]"
                : "border-[#e5ded4] bg-[#fbfaf8]"
                }`}
        >
            <p className="text-[10px] md:text-xs font-medium uppercase tracking-[0.14em] text-[#8c8378]">
                {label}
            </p>

            <div className="mt-4 flex items-end justify-between gap-2">
                <p className="font-serif text-2xl md:text-3xl text-[#292621]">{value}</p>

                {change && (
                    <span className="mb-1 rounded-full bg-[#e2eadf] px-2 py-1 text-[11px] font-semibold text-[#58725a]">
                        {change}
                    </span>
                )}
            </div>
        </div>
    )
}