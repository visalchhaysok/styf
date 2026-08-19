
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
    let response = NextResponse.next(
        { request: { headers: request.headers } }
    );

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(
                            ({ name, value, options }) => {
                                request.cookies.set(name, value)
                                response.cookies.set(name, value, options)
                                // name, value contains info, options contain more metadata
                            },
                        )
                    },
                },
            },
        );

        const { data: { user }, error } = await supabase.auth.getUser();
        // get user from supabase cookies interface

        if (error && error.name !== 'AuthSessionMissingError') {
            console.error(`AuthError:`, error);
            return;
        }

        if (!user) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

    } catch (error: any) {
        console.error('Middleware Error:', error);
        return;
    }

    return response;

}

export const config = {
    matcher: ['/admin/:path*', '/orders/:path*'],
};