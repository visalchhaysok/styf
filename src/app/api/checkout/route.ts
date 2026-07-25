import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { metadata } from '@/app/layout';

export async function POST(
    request: NextRequest,
) {
    try {
        const body = await request.json();
        const { items } = body;
        // we expect body.items to exists

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: 'Cart is empty' },
                { status: 400 },
            );
        }

        const lineItems = items.map((item: any) => ({ // array that holds multiple objects
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
                unit_amount: item.price * 100, // stripe uses cents
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            // -> hey stripe give me a success url like this: (stripe expects {CHECKOUT_SESSION_ID})
            cancel_url: `${request.nextUrl.origin}/`,
            // hey stripe here if fails sends cancel_url with this value
        });

        console.log(`PaymentURL:`, session.url);

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
