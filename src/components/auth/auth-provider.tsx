'use client';

import { createClient } from "@/lib/auth";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type AuthContextValue = {
    user: User | null; // supabase's {User} object
    isLoading: boolean;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
// global data - i am guessing we are throwing auth context in every single component
// we wrap this context around other components

export default function AuthProvider(
    { children }: { children: ReactNode }
) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        supabase.auth
            .getSession()
            .then(({ data: { session } }) => {
                setUser(session?.user ?? null)
                setIsLoading(false);
            });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{ user, isLoading, signOut }}
        >
            {children}
        </AuthContext.Provider>
    );

}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be within AuthProvider');
    return ctx;
}
