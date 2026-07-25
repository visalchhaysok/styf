'use client';

import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            return;
        }

        fetch(`/api/checkout/success`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({ sessionId, }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to save new order');
                return res.json();
            })
            .then(() => setStatus('success'))
            .catch(() => setStatus('error'));
    }, [sessionId]);

    if (status === 'error') {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-5">
                <p className="text-lg text-foreground">Something went wrong.</p>
                <Link href="/" className="text-primary hover:underline">
                    Back to shop
                </Link>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-5 text-center">
            <CheckCircle className="size-16 text-green-500" />
            <h1 className="font-serif text-3xl text-foreground">Thank You</h1>
            <p className="max-w-md text-muted-foreground">
                Your order has been placed. You will receive a confirmation email shortly.
            </p>
            {sessionId && (
                <p className="text-xs text-muted-foreground">Order reference: {sessionId.slice(-12)}</p>
            )}
            <Link
                href="/"
                className="mt-4 rounded-full bg-primary px-8 py-3 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
            >
                Continue Shopping
            </Link>
        </div>
    );
}
