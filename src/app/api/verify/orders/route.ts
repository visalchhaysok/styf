import { createSupabaseServerClient } from "@/lib/supabase/supabase"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        const supabase = createSupabaseServerClient(request)

        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
            return NextResponse.json(
                {
                    message: 'Unauthorized User',
                    error: '401 | Unauthorized',
                },
                { status: 401 }
            )
        }

        const stripeSesssionId = request.nextUrl.searchParams.get('session_id')

        if (!stripeSesssionId) {
            return NextResponse.json(
                {
                    message: 'Unable to verify Order',
                    error: '400 | Bad Request',
                },
                { status: 400 }
            )
        }

        const { data: order, error } = await supabase
            .from('orders')
            .select('status')
            .eq('stripe_session_id', stripeSesssionId)
            .eq('user_id', user.id)
            .maybeSingle()

        if (error || !order) {
            return NextResponse.json(
                {
                    message: 'Missing or invalid Order',
                    error: '400',
                },
                { status: 404 }
            )
        }

        return NextResponse.json(
            { orderStatus: order.status },
            { status: 200 },
        )
    } catch (error) {
        return NextResponse.json(
            {
                error: '500 | Internal Server Error',
                message: 'Failed to verify your order, please return'
            },
            { status: 500 }
        )
    }
}
