'use client'

import { useAuth } from "@/components/auth/auth-provider"
import { SignUpSchema } from "@/lib/schemas/validation/auth"
import { createClient } from "@/lib/supabase/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

export default function LoginPage() {

    const { user, isLoading: authLoading } = useAuth()

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState<boolean>(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const router = useRouter()

    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        setIsLoading(true)

        if (authLoading) {
            console.warn(`Loading user content...`)
            return
        }

        if (user) {
            setIsLoading(false)
            router.push('/dashboard')
            return
        }

        setIsLoading(false)
        return

    }, [authLoading])

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const result = SignUpSchema.safeParse({
                username,
                email,
                password,
            })

            if (!result.success) {
                setError(result.error.message)
                return
            }

            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email: result.data.email,
                    password: result.data.password,
                    options: {
                        data: { username: result.data.username },
                    },
                })

                if (error) throw error
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: result.data.email,
                    password: result.data.password,
                })
                if (signInError) throw signInError

            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
            }
            router.push('/')
            router.refresh()
        }

        catch (error: any) {
            setError(error.message || 'Something went wrong')
        }

        finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-5">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <h1 className="font-serif text-2xl text-foreground">
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {isSignUp ? 'Join STYF' : 'Sign in to your account'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isSignUp && (
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-foreground">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required={isSignUp}
                                className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                                placeholder="username"
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-foreground">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-foreground">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="mt-1 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary"
                            placeholder="••••••"
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-full bg-primary py-3 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                    >
                        {isLoading ? (isSignUp ? 'Signing up...' : 'Logging in...') : isSignUp ? 'Create Account' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp)
                            setError('')
                        }}
                        className="text-foreground underline hover:text-primary"
                    >
                        {isSignUp ? 'Sign In' : 'Create Account'}
                    </button>
                </p>

                <Link
                    href="/"
                    className="block text-center text-sm text-muted-foreground hover:text-foreground"
                >
                    ← Back to shop
                </Link>
            </div>
        </div>
    )
}