'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/components/cart/cart-provider'
import type { Product } from '@/lib/products'
import { viewport } from '@/app/layout';

export function ProductCard({ product }: { product: Product }) {
  const { addItem, openCart } = useCart()

  const handleAdd = () => {
    addItem(product, product.sizes[0])
    openCart()
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <Link href={`/product/${product.id}`} className="block">
        <div className='relative aspect-4/5 overflow-hidden bg-muted w-full'>
          <Image
            loading='lazy'
            src={product.image_url || '/placeholder.svg'}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover transition-transform duration-500 hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="flex flex-col gap-4 p-6">
        <Link href={`/product/${product.id}`} className="flex flex-col gap-1">
          <h3 className="font-serif text-xl text-foreground">{product.name}</h3>
          <p className="text-base text-muted-foreground">${product.price.toLocaleString()}</p>
        </Link>

        <button
          type="button"
          onClick={handleAdd}
          className="w-full rounded-full border border-primary bg-transparent py-3 text-sm font-medium uppercase tracking-widest text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Add to Cart
        </button>
      </div>
    </article>
  )
}
