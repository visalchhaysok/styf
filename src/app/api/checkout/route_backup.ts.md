import { NextRequest, NextResponse } from "next/server"
import { DBCartItem } from '@/components/cart/cart-provider'
import { createSupabaseServerClient } from "@/lib/supabase"
import { stripe } from "@/lib/stripe"
import { z } from "zod"
import { CheckOutSchema } from "@/lib/schemas/validation/checkout"

export async function POST(
    request: NextRequest
) {
    try {
        const supabase = createSupabaseServerClient(request)

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
            return NextResponse.json(
                { error: '401 | Unauthorized' },
                { status: 401 },
            )
        }

        if (!user) {
            return NextResponse.json(
                { error: '401 | Unauthorized' },
                { status: 401 },
            )
        }

        const result = CheckOutSchema.safeParse(await request.json())

        if (!result.success) {
            return NextResponse.json(
                { error: '400 | Bad Request' },
                { status: 400 }
            )
        }

        const { cartId } = result.data

        const { data: cart, error } = await supabase
            .from('carts')
            .select('id, cart_items(*, products(id, name, price, image_url, description))')
            .eq('user_id', user!.id)
            .eq('id', cartId)
            .maybeSingle()

        if (error) {
            return NextResponse.json(
                {
                    error: 'Unable to create checkout',
                    message: error.message,
                },
                { status: 500 },
            )
        }

        if (cart) {
            const lineItems = cart.cart_items.map((item: DBCartItem) => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.products.name,
                        description: item.products.description,
                        images: [item.products.image_url ?? 'unknown.png'],
                        metadata: {
                            product_id: item.products.id,
                            size: item.size,
                        },
                    },
                    unit_amount: item.products.price * 100,
                },
                quantity: item.quantity,
            }))
            console.log(`Normal Lineitems(non success): `, lineItems[0].price_data)

            const checkoutSession = await stripe.checkout.sessions.create({
                client_reference_id: user.id,
                metadata: {
                    user_id: user.id,
                },
                customer_email: user.email,
                mode: 'payment',
                cancel_url: `${request.nextUrl.origin}/`,
                success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
                currency: 'usd',
                payment_method_types: ['card', 'crypto'],
                line_items: lineItems,
            })

            console.log(`Stripe line_items received: `, JSON.stringify(checkoutSession.line_items, null, 2))

            // const test = checkoutSession.

            return NextResponse.json(
                { url: checkoutSession.url },
                { status: 200 },
            )
        }

        return NextResponse.json(
            { error: '400 | Bad Request' },
            { status: 400 },
        )

    } catch (err) {

        console.error('Checkout Stripe Error:', err)

        return NextResponse.json(
            {
                error: '93 Unable to create checkout session',
                message: err
            },
            { status: 500 },
        )
    }
}