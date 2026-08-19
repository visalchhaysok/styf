import { createClient } from "@supabase/supabase-js"
import { NextRequest } from "next/server"

export const createSupabaseAdminClient = (request?: NextRequest) => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SECRET_SUPABASE_SERVICE_ROLE_KEY!,
    )
}