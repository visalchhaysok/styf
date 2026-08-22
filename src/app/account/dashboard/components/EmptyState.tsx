import { ShoppingBag } from "lucide-react"

export default function EmptyState({ onShopNow }: { onShopNow: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e5ded4] bg-[#fbfaf8] p-12 text-center">
            <div className="mb-4 rounded-full bg-[#f2eadf] p-4">
                <ShoppingBag size={40} className="text-[#9e8767]" />
            </div>

            <h3 className="font-serif text-2xl text-[#292621]">
                No orders yet
            </h3>

            <p className="mt-2 max-w-sm text-sm text-[#8c8378]">
                Start shopping to view your order history and track your
                purchases.
            </p>

            <button
                onClick={onShopNow}
                className="mt-6 rounded-lg bg-[#292621] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[#3d3731]"
            >
                Shop Now
            </button>
        </div>
    )
}