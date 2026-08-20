import { DBCartItem } from "@/lib/schemas/db/db-types"
import { DBOrderItem } from "@/lib/schemas/db/db-types"
import { CheckOutSchema } from "@/lib/schemas/validation/checkout"
import { stripe } from "@/lib/stripe"
import { createSupabaseServerClient } from "@/lib/supabase/supabase"
import { createSupabaseAdminClient } from "@/lib/supabase/supabaseAdmin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {

    try {
        const supabase = createSupabaseServerClient(request)

        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json(
                {
                    error: '401 | Unauthorized ',
                    message: 'Unauthorized User',
                },
                { status: 401 }
            )
        }
        const validCartId = CheckOutSchema.safeParse(await request.json())

        if (!validCartId.success) {
            return NextResponse.json(
                {
                    error: '400 | Bad Request',
                    message: `Invalid Or Empty Cart`,
                },
                { status: 400 }
            )
        }

        const { cartId } = validCartId.data

        const { data: cart, error: cartError } = await supabase
            .from('carts')
            .select('id, cart_items(*, products(id, name, price, image_url, description))')
            .eq('user_id', user.id)
            .eq('id', cartId)
            .maybeSingle()

        if (cartError || !cart) {
            return NextResponse.json(
                {
                    error: '400 | Bad Request',
                    message: 'Invalid or Empty cart',
                },
                { status: 400 }
            )
        }

        const stripeSession = await stripe.checkout.sessions.create({
            expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
            mode: 'payment',
            payment_method_types: ['card'],
            client_reference_id: user.id,
            customer_email: user.email,
            metadata: {
                user_id: user.id,
                cart_id: cart.id,
            },
            line_items: cart.cart_items.map((item: DBCartItem) => ({
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: item.products.name,
                        description: item.products.description,
                        images: [item.products.image_url || '/placeholder.png'],
                        metadata: {
                            id: item.products.id,
                            size: item.size,
                        },
                    },
                    unit_amount: item.products.price * 100,
                },
                quantity: item.quantity,
            })),
            success_url: `${request.nextUrl.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.nextUrl.origin}`
        })

        const supabaseAdmin = createSupabaseAdminClient()
        const { data: orderId, error: insertOrderError } = await supabaseAdmin
            .rpc('create_pending_order_with_items', {
                p_user_id: user.id,
                p_stripe_session_id: stripeSession.id,
                p_total_amount: stripeSession.amount_subtotal,
                p_items: cart.cart_items.map((item: DBCartItem): DBOrderItem => ({
                    product_id: item.products.id,
                    product_name: item.products.name,
                    size: item.size,
                    quantity: item.quantity,
                    price: item.products.price,
                    sub_total: item.products.price * item.quantity
                }))
            })

        if (insertOrderError || !orderId) {
            return NextResponse.json(
                { error: insertOrderError?.message },
                { status: 500 }
            )
        }

        return NextResponse.json(
            {
                url: stripeSession.url,
                orderId,
            },
            { status: 200 }
        )

    } catch (error) {
        return NextResponse.json(
            {
                error: '500 | Internal Server Error',
                message: `Error failed to create order, retry or contact support`
            },
            { status: 500 }
        )
    }
}