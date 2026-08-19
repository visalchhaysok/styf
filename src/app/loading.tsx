export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#faf9f6]">
            <span className="text-2xl font-bold tracking-[0.3em] text-[#1a1a1a]">
                STYF
            </span>

            <div className="mt-6 w-48 overflow-hidden">
                <div className="h-1 w-full rounded-full bg-[#e5e5e5]">
                    <div className="h-full w-1/3 animate-[loading_1.2s_ease-in-out_infinite] rounded-full bg-[#909090]" />
                </div>
            </div>
        </div>
    )
}