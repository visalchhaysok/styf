import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// after /api/checkout POST req loads checkout/success/page.tsx, page load = POST request sent to this api immediately
export async function POST(request: Request) {
    try {
        const { sessionId } = await request.json();

        if (!sessionId) {
            return NextResponse.json(
                { error: 'No session ID' },
                { status: 400 },
            );
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items.data.price.product'],
        });
        console.log(`Stripe-session result:`, session);

        if (session.payment_status !== 'paid') {
            return NextResponse.json(
                { error: 'Payment not completed' },
                { status: 400 },
            );
        }

        const { data: existing } = await supabase
            .from('orders')
            .select('id')
            .eq('stripe_session_id', sessionId) // matching sessionId check
            .single();

        if (existing) {
            return NextResponse.json(
                { error: "Order already saved" },
                { status: 400 },
            );
        }

        // we expect .data and .error
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                stripe_session_id: sessionId,
                customer_email: session.customer_details?.email || null,
                total_amount: session.amount_total || 0,
                status: 'paid',
            })
            .select()
            .single();
        console.log(`order:`, order, `error:`, orderError);

        if (orderError || !order) {
            throw new Error(`Failed to create order: ${orderError?.message}`);
        }

        const lineItems = session.line_items?.data || [];
        const orderItems = lineItems.map((item: any) => {
            const product = item.price?.product as any;
            // product data expands from its price?
            const metadata = product?.metadata || {};

            return {
                order_id: order.id,
                product_id: metadata.product_id || '00000000-0000-0000-0000-000000000000',
                // stripe stores id in metadata
                product_name: item.description || product?.name || 'Unknown Product',
                size: metadata.size || 'N/A',
                price: item.amount_total || 0,
                quantity: item.quantity || 1,
            }
        });

        // we do not need order_items data only order, we just insert
        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) {
            throw new Error(`Failed to create order items: ${itemsError.message}`);
        }

        return NextResponse.json(
            {
                success: true,
                orderId: order.id,
            },
            { status: 200 },
        );
    }
    catch (error) {
        console.error('Checkout Error:', error);
        return NextResponse.json(
            {
                error: error instanceof Error,
                errorMessage: 'Something went wrong',
            },
            { status: 500 },
        );
    }
}