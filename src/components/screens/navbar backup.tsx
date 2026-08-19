'use client'

import Link from 'next/link';
import { User, ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/cart/cart-provider';
import { CartSidebar } from '@/components/cart/cart-sidebar';
import { useAuth } from '../auth/auth-provider';

export function Navbar() {
  const { count, openCart } = useCart();
  const { user, isLoading, signOut } = useAuth();

  const displayName = user?.user_metadata?.username || user?.email || 'Guest';
  console.log('User:', user); // !debug
  console.log(`Metadata: `, JSON.stringify(user?.user_metadata, null, 2));

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
                <Link href="/login" className='underline'>Sign Up</Link>
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
              className="flex text-sm text-foreground transition-opacity hover:opacity-60"
              aria-label={`Open cart, ${count} items`}
            >
              <ShoppingCart className='size-5 text-gray-500' aria-hidden='true' />
              ( {count} )
            </button>
          </div>
        </nav>
      </header>

      <CartSidebar />
    </>
  )
}
