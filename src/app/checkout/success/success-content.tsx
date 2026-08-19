'use client'

import { useAuth } from "@/components/auth/auth-provider"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function SuccessContent() {
    const searchParams = useSearchParams()
    const { user, isLoading: authLoading } = useAuth()
    const [sessionId, setSessionId] = useState<string | null>(null)

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [orderStatus, setOrderStatus] = useState<'pending' | 'cancelled' | 'paid' | 'failed'>('pending')

    useEffect(() => {

        const verifyOrderId = async () => {

            try {
                const sessionId = searchParams.get('session_id')

                const response = await fetch(`/api/verify/orders?session_id=${sessionId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json'
                    }
                })

                if (!response.ok) {
                    setSessionId(null)
                    setStatus('error')
                    return
                }

                const { orderStatus } = await response.json()
                setSessionId(sessionId)
                setStatus('success')
                setOrderStatus(orderStatus)
                console.log(orderStatus)
                return

            } catch (error) {
                setSessionId(null)
                setStatus('error')
                console.error(`Error:`, error)
            }
        }

        verifyOrderId()

    }, [sessionId, orderStatus])

    if (status === 'error') {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5">
                <p className="text-lg text-foreground">Missing or invalid order, please return.</p>
                <Link href="/" className="text-primary hover:underline">
                    Back to shop
                </Link>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-5 text-center">
            <CheckCircle className="size-16 text-green-500" />
            <h1 className="font-serif text-3xl text-foreground">Thank You</h1>
            <p className="max-w-md text-muted-foreground">
                Your order has been placed. You will receive a confirmation email shortly.
            </p>
            {(user && sessionId) && (
                <p className="text-xs text-muted-foreground">Order reference: {orderStatus}</p>
            )}
            <Link
                href="/"
                className="mt-4 rounded-full bg-primary px-8 py-3 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
            >
                Continue Shopping
            </Link>
        </div>
    )
}
