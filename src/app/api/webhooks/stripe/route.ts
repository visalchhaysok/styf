import { stripe } from "@/lib/stripe"
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin"
import { NextRequest, NextResponse } from "next/server"
import { Stripe } from "stripe"

export async function POST(request: NextRequest) {

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.json(
            {
                message: 'Missing stripe signature',
                error: '400 | Bad Request'
            },
            { status: 400 }
        )
    }

    try {
        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )

        if (!event.type.startsWith('checkout.session.')) {
            return NextResponse.json(
                {
                    error: '400 | Bad Request',
                    message: 'Unable to process checkout'
                },
                { status: 400 }
            )
        }

        const session = event.data.object as Stripe.Checkout.Session

        const supabaseAdmin = createSupabaseAdminClient()

        let newStatus: string

        switch (event.type) {
            case 'payment_intent.canceled':
                newStatus = 'cancelled'
                break
            case 'checkout.session.completed':
                newStatus = 'paid'
                break
            case 'checkout.session.async_payment_succeeded':
                newStatus = 'paid'
                break
            case 'checkout.session.async_payment_failed':
                newStatus = 'failed'
                break
            case 'checkout.session.expired':
                newStatus = 'cancelled'
                break
            default:
                // safely handles nonexistent event
                return NextResponse.json({ received: true })
        }

        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update({
                status: newStatus,
                updated_at: new Date().toISOString()
            })
            .eq('stripe_session_id', session.id)

        if (updateError) {
            return NextResponse.json(
                {
                    error: '500 | Internal Server Error',
                    message: 'Unable to update Order, please contact support immediately'
                },
                { status: 500 }
            )
        }

        await supabaseAdmin
            .from('cart_items')
            .delete()
            .eq('cart_id', session.metadata?.cart_id)

        return NextResponse.json(
            { received: true },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            { error: " 400 | Bad Request" },
            { status: 400 }
        )
    }

}