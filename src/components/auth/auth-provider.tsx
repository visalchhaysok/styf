'use client'

import { createClient } from "@/lib/supabase/supabase"
import { User } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

type AuthContextValue = {
    user: User | null // supabase's {User} object
    isLoading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export default function AuthProvider(
    { children }: { children: ReactNode }
) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const supabase = useMemo(() => createClient(), [])
    //  meaning it never run any code because [] is empty

    useEffect(() => {

        let isMounted = true

        supabase.auth
            .getUser()
            .then(({ data: { user }, error }) => {
                if (!isMounted) return
                if (error && error.name !== 'AuthSessionMissingError') {
                    console.error('Error fetching user:', error) //! for debug!
                    setUser(null)
                } else {
                    setUser(user)
                }
                setIsLoading(false)
            })
            .catch((error) => {
                console.error(`Caught error in Effect:`, error) //! debug
                setIsLoading(false)
            })

        // ? listener fires once?
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!isMounted) return
                setUser(session?.user ?? null)
                setIsLoading(false)
            }
        )

        return (() => { // only runs when unmount/leave page
            isMounted = false
            subscription.unsubscribe()
        })
    }, [supabase])

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            setUser(null)

        } catch (error) {
            console.error('Sign Out Error:', error) //! debug
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const value = useMemo<AuthContextValue>(() => (
        {
            user,
            isLoading,
            signOut
        }
    ), [user, isLoading])

    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    )
}
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be within AuthProvider')
    return ctx
}
