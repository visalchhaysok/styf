import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
    return createBrowserClient(
        supabaseUrl,
        supabaseKey
    );
}

export function createSupabaseServerClient(request: NextRequest) {
    return createServerClient(
        supabaseUrl,
        supabaseKey,{
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll() {

                },
            },
        },
    )
}