import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { sessionId } = await request.json();
        const supabase = createClient()

        if (!sessionId) {
            return NextResponse.json(
                { error: 'No session ID' },
                { status: 400 },
            );
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items.data.price.product'],
        });

        if (session.payment_status !== 'paid') {
            return NextResponse.json(
                { error: 'Payment not completed' },
                { status: 400 },
            );
        }

        const { data: existing } = await supabase
            .from('orders')
            .select('id')
            .eq('stripe_session_id', sessionId)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: "Order already saved" },
                { status: 400 },
            );
        }

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

        if (orderError || !order) {
            throw new Error(`Failed to create order: ${orderError?.message}`);
        }

        const lineItems = session.line_items?.data || [];
        const orderItems = lineItems.map((item: any) => {
            const product = item.price?.product as any;
            const metadata = product?.metadata || {};

            return {
                order_id: order.id,
                product_id: metadata.product_id || '00000000-0000-0000-0000-000000000000',
                product_name: item.description || product?.name || 'Unknown Product',
                size: metadata.size || 'N/A',
                price: item.amount_total || 0,
                quantity: item.quantity || 1,
            }
        });

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