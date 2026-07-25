'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Minus, Plus, X } from 'lucide-react'
import { useCart } from '@/components/cart/cart-provider'

export function CartSidebar() {
  const { items, subtotal, isOpen, closeCart, updateQuantity, removeItem } = useCart()
  const [dragX, setDragX] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const startX = useRef<number | null>(null)

  // Lock body scroll while the sidebar is open
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = original
      }
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, closeCart])

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startX.current === null) return
    const delta = e.touches[0].clientX - startX.current
    setDragX(Math.max(0, delta))
  }

  const handleTouchEnd = () => {
    if (dragX > 80) {
      closeCart()
    }
    setDragX(0)
    startX.current = null
  }

  const handleCheckout = async () => {
    if (items.length === 0) return
    setIsLoading(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      if (data.url) {
        window.location.href = data.url
        // this is how the button opens stripe's page
        // post response.url sends the stripe URL
      }
    } catch (err: any) {
      alert(err.message || 'Something went wrong. Try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close cart"
        onClick={closeCart}
        className={`absolute inset-0 h-full w-full bg-foreground/30 backdrop-blur-[2px] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'
          }`}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isOpen
            ? `translateX(${dragX}px)`
            : 'translateX(100%)',
          transition: dragX === 0 ? 'transform 300ms ease' : 'none',
        }}
        className="absolute right-0 top-0 flex h-full w-4/5 max-w-sm flex-col bg-sidebar shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-serif text-xl font-semibold text-foreground">Your Cart</h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Items (scrollable) */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-16 text-center">
              <p className="font-serif text-lg text-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Add a piece to begin your edit.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item) => (
                <li key={`${item.id}-${item.size}`} className="flex gap-4 py-5">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={item.image || '/placeholder.svg'}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground">Size {item.size}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id, item.size)}
                        aria-label={`Remove ${item.name}`}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <svg color="#dc4563" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center gap-3 rounded-full border border-border px-2 py-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.size, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-4 text-center text-sm tabular-nums text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, item.size, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <p className="text-sm text-foreground">
                        ${(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Sticky footer */}
        <div className="border-t border-border bg-sidebar px-5 pb-6 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Subtotal:</span>
            <span className="font-serif text-lg text-foreground">
              ${subtotal.toLocaleString()}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={items.length === 0 || isLoading}
            className="w-full rounded-full bg-primary py-4 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </aside>
    </div>
  )
}