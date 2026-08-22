import { Package } from "lucide-react"
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export type ChartData = {
    name: string
    value: number
}

type SpendingOverviewProps = {
    range: string
    setRange: (value: string) => void
    chartData: ChartData[]
    isLoading: boolean
}

export default function SpendingOverview({
    range,
    setRange,
    chartData,
    isLoading,
}: SpendingOverviewProps) {
    return (
        <section className="rounded-2xl border border-[#e5ded4] bg-[#fbfaf8] p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="font-serif text-2xl">
                        Spending overview
                    </h2>

                    <p className="mt-1 text-xs text-[#9a9288]">
                        Your purchase activity
                    </p>
                </div>

                <select
                    value={range}
                    onChange={(e) =>
                        setRange(e.target.value)
                    }
                    className="rounded-lg border border-[#e5ded4] bg-transparent px-3 py-2 text-xs text-[#655d53] outline-none"
                >
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>This year</option>
                </select>
            </div>

            <div className="mt-6 h-48">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9e8767] border-t-transparent" />
                    </div>
                ) : chartData.length > 0 &&
                    chartData.some(
                        (d) => d.value > 0
                    ) ? (
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient
                                    id="chartGradient"
                                    x1="0"
                                    y1="0"
                                    x2="0"
                                    y2="1"
                                >
                                    <stop
                                        offset="5%"
                                        stopColor="#9e8767"
                                        stopOpacity={0.3}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="#9e8767"
                                        stopOpacity={0}
                                    />
                                </linearGradient>
                            </defs>

                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#e5ded4"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="name"
                                tick={{
                                    fontSize: 10,
                                    fill: "#9a9288",
                                }}
                                axisLine={{
                                    stroke: "#e5ded4",
                                }}
                                tickLine={false}
                            />

                            <YAxis
                                tick={{
                                    fontSize: 10,
                                    fill: "#9a9288",
                                }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) =>
                                    `$${value}`
                                }
                            />

                            <Tooltip
                                formatter={(value: any) => [
                                    `$${value}`,
                                    "Spent",
                                ]}
                                contentStyle={{
                                    backgroundColor:
                                        "#fbfaf8",
                                    border: "1px solid #e5ded4",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                }}
                            />

                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#9e8767"
                                strokeWidth={2}
                                fill="url(#chartGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center">
                        <Package
                            size={32}
                            className="text-[#d5c5ae]"
                        />

                        <p className="mt-2 text-sm text-[#9a9288]">
                            No spending data available
                        </p>
                    </div>
                )}
            </div>
        </section>
    )
}