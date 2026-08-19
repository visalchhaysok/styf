// app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { stripe } from '@/lib/stripe'
import { Stripe } from "stripe"
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin"

export const runtime = "nodejs" // important for raw body access

export async function POST(req: Request) {
    // 1) Read raw body as text (required for Stripe signature verification)
    const body = await req.text()

    // 2) Stripe signature header
    const signature = req.headers.get("stripe-signature")
    if (!signature) {
        return new NextResponse("Missing stripe-signature", { status: 400 })
    }
    // 3) Verify event
    let event: Stripe.Event
    try {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
        return new NextResponse(`Webhook signature verification failed: ${err.message}`, { status: 400 })
    }

    // 4) Handle only the event types you need
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session

        const stripeSessionId = session.id
        if (!stripeSessionId) {
            return new NextResponse("Missing session.id", { status: 400 })
        }

        // 5) Update exactly one order: pending -> paid
        // public.orders has: stripe_session_id (unique), status (pending/paid/cancelled)
        const supabaseAdmin = createSupabaseAdminClient()
        const { error } = await supabaseAdmin
            .from("orders")
            .update({ status: "paid" })
            .eq("stripe_session_id", stripeSessionId)
            .eq("status", "pending")

        if (error) {
            return new NextResponse(`DB update failed: ${error.message}`, { status: 500 })
        }
    }

    // 6) Return quickly to Stripe
    return new NextResponse("ok", { status: 200 })
}