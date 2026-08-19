'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/components/cart/cart-provider'
import type { Product } from '@/lib/products'
import { viewport } from '@/app/layout'

export function ProductCard({ product }: { product: Product }) {
  const { addItem, openCart } = useCart()

  const handleAdd = () => {
    addItem(product, product.sizes[0])
    openCart()
  }

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-4/5 w-full overflow-hidden bg-muted">
          <Image
            loading="lazy"
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 384px"
            className="object-cover transition-transform duration-500 hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-3 md:gap-4 md:p-6">
        <Link href={`/product/${product.id}`} className="flex flex-col gap-1">
          <h3 className="font-serif text-sm text-foreground md:text-xl">
            {product.name}
          </h3>

          <p className="text-sm text-muted-foreground md:text-base">
            ${product.price.toLocaleString()}
          </p>
        </Link>

        <button
          type="button"
          onClick={handleAdd}
          className="mt-auto w-full rounded-full border border-primary bg-transparent py-2.5 text-[10px] font-medium uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-primary-foreground md:py-3 md:text-sm"
        >
          Add to Cart
        </button>
      </div>
    </article>
  )
}
