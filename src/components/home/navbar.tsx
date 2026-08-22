"use client"

import Link from "next/link"
import { ShoppingCart, User2, Menu } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"
import { CartSidebar } from "@/components/cart/cart-sidebar"
import { useAuth } from "../auth/auth-provider"
import { useRouter } from "next/navigation"

type NavbarProps = {
  onMenuClick: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { count, openCart } = useCart()

  const { user } = useAuth()
  const router = useRouter()

  const redirectToLogin = () => {
    router.push('/login')
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <nav className="mx-auto grid max-w-3xl grid-cols-3 items-center px-5 py-4">
          {/* Account */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={user ? onMenuClick : redirectToLogin}
              className="flex items-center gap-1 rounded-lg border border-[#c9c4bd] p-2 shadow-sm"
              aria-label="Open navigation"
            >
              {user ? (
                <>
                  <Menu strokeWidth={1} />{" "}
                  <User2 size={22} width={28} color="black" strokeWidth={1} />
                </>
              ) : (
                <span className="px-1 font-light">Sign up</span>
              )}
            </button>
          </div>

          {/* Logo */}
          <Link
            href="/"
            className="text-center font-serif text-2xl font-bold tracking-[0.2em] text-foreground"
          >
            STYF
          </Link>

          {/* Cart */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={openCart}
              className="relative flex items-center gap-2 rounded-lg border border-[#c9c4bd] px-3 py-2 text-xs font-medium text-[#8c8378] shadow-sm hover:text-[#292621]"
              aria-label={`Open cart, ${count} items`}
            >
              <ShoppingCart color="black" size={20} strokeWidth={1} />

              {count > 0 && (
                <span className="absolute right-2 top-1 size-1 rounded-full bg-orange-400" />
              )}
            </button>
          </div>
        </nav>
      </header>

      <CartSidebar />
    </>
  )
}
