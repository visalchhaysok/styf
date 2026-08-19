'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function LoadingScreen() {
    const [visible, setVisible] = useState(false)
    const [progress, setProgress] = useState(0)
    const pathname = usePathname()

    useEffect(() => {
        setVisible(true)
        setProgress(0)

        const milestones = [
            { target: 24, delay: 300 },
            // { target: 50, delay: 500 },
            { target: 66, delay: 300 },
            { target: 100, delay: 800 },
        ]

        let current = 0
        let timeoutId: NodeJS.Timeout

        const runMilestone = (index: number) => {
            if (index >= milestones.length) {
                // All done, fade out
                timeoutId = setTimeout(() => setVisible(false), 200)
                return
            }

            const { target, delay } = milestones[index]
            const start = current
            const diff = target - start
            const steps = 20 // smooth steps between milestones
            const stepDuration = delay / steps
            let step = 0

            const interval = setInterval(() => {
                step++
                const eased = easeOutCubic(step / steps)
                current = Math.floor(start + diff * eased)
                setProgress(current)

                if (step >= steps) {
                    clearInterval(interval)
                    current = target
                    setProgress(target)
                    // Pause, then next milestone
                    timeoutId = setTimeout(() => runMilestone(index + 1), 150)
                }
            }, stepDuration)
        }

        // Small initial delay before starting
        timeoutId = setTimeout(() => runMilestone(0), 100)

        return () => {
            clearTimeout(timeoutId)
        }
    }, [pathname])

    if (!visible) return null

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#faf9f6] transition-opacity duration-500 ${progress >= 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
        >
            <span className="text-2xl font-bold tracking-[0.3em] text-[#1a1a1a]">
                STYF
            </span>

            <div className="mt-6 w-48">
                <div className="h-0.75 w-full bg-[#e5e5e5] rounded-full overflow-hidden">
                    {/* original h-0.5 */}
                    <div
                        className="h-full bg-[#909090] transition-all duration-75 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className="mt-3 text-center text-xs tracking-widest text-[#666666]">
                    {progress}%
                </p>
            </div>
        </div>
    )
}

// Smooth easing — starts fast, slows as it approaches target
function easeOutCubic(x: number): number {
    return 1 - Math.pow(1 - x, 3)
}