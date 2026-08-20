'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useCart } from '@/components/cart/cart-provider'
import type { Product } from '@/lib/products'

export function ProductDetail({ product }: { product: Product }) {
  const { addItem, openCart } = useCart()
  const [size, setSize] = useState(product.sizes[0])

  const handleAdd = () => {
    addItem(product, size)
    openCart()
  }

  return (
    <section className="mx-auto max-w-2xl px-5 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to collection
      </Link>

      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted">
        <Image
          src={product.image_url || '/placeholder.svg'}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col gap-2">

          <h1 className="font-serif text-2xl text-foreground">{product.name}</h1>
          <p className="text-base text-muted-foreground">${product.price.toLocaleString()}</p>
        </div>

        <p className="text-pretty leading-relaxed text-muted-foreground">
          {product.description}
        </p>

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-foreground">Select Size:</span>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                aria-pressed={size === s}
                className={`min-w-12 rounded-full border px-4 py-2 text-sm transition-colors ${size === s
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-transparent text-foreground hover:border-primary'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="w-full rounded-full bg-primary py-4 text-sm font-medium uppercase tracking-widest text-primary-foreground transition-opacity hover:opacity-90"
        >
          Add to Cart
        </button>
      </div>
    </section>
  )
}
