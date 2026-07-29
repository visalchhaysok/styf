import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(
    request: NextRequest,
) {
    try {
        const body = await request.json();
        const { items } = body;

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: 'Cart is empty' },
                { status: 400 },
            );
        }

        const lineItems = items.map((item: any) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: `Size: ${item.size}`,
                    metadata: {
                        product_id: item.id,
                        size: item.size,
                    }
                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.nextUrl.origin}/`,
        });

        return NextResponse.json(
            {
                url: session.url,
            },
        );

    } catch (error: any) {
        console.error(`Stripe checkout error:`, error);

        return NextResponse.json(
            { error: error.message || 'Something went wrong' },
            { status: 500 },
        );
    }

}
