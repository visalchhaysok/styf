'use client'

import Link from 'next/link'
import { User } from 'lucide-react'
import { useCart } from '@/components/cart/cart-provider'
import { CartSidebar } from '@/components/cart/cart-sidebar'
import { useAuth } from '../auth/auth-provider';

export function Navbar() {
  const { count, openCart } = useCart();
  const { user, isLoading, signOut } = useAuth();
  // useAuth() returns AuthContextValue

  const displayName = user?.user_metadata?.username || user?.email || 'Guest';
  console.log('User:', user);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <nav className="mx-auto grid max-w-3xl grid-cols-3 items-center px-5 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="size-4" aria-hidden="true" />
            {
              isLoading ? (
                <span>...</span>
              ) : user ? (
                <div className="flex items-center gap-2">
                  <span className="max-w-25 truncate">{displayName}</span>
                  <button
                    type="button"
                    onClick={signOut}
                    className="text-xs underline hover:text-foreground"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login">Guest</Link>
              )
            }
          </div>

          <Link
            href="/"
            className="text-center font-serif text-2xl font-bold tracking-[0.2em] text-foreground"
          >
            STYF
          </Link>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={openCart}
              className="text-sm text-foreground transition-opacity hover:opacity-60"
              aria-label={`Open cart, ${count} items`}
            >
              Cart({count})
            </button>
          </div>
        </nav>
      </header>

      <CartSidebar />
    </>
  )
}
