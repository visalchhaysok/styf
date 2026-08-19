'use client'

import { useEffect, useState } from 'react'
import { ProductCard } from '@/components/product/product-card'
import { getProducts, type Product } from '@/lib/products'

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await getProducts()
      setProducts(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (

      <section className="mx-auto max-w-3xl px-5 py-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {[1, 2].map((card) => (
            <article
              key={card}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              {/* Image */}
              <div className="relative aspect-4/5 w-full overflow-hidden bg-[#d6d3ce]">
                <div className="absolute inset-0 animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#f5f3ef]/70 to-transparent" />
              </div>

              {/* Content */}
              <div className="flex flex-col gap-4 p-6">
                <div className="relative h-6 w-2/3 overflow-hidden rounded bg-[#d6d3ce]">
                  <div className="absolute inset-0 animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#f5f3ef]/70 to-transparent" />
                </div>

                <div className="relative h-5 w-1/3 overflow-hidden rounded bg-[#d6d3ce]">
                  <div className="absolute inset-0 animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#f5f3ef]/70 to-transparent" />
                </div>

                <div className="relative mt-2 h-12 w-full overflow-hidden rounded-full bg-[#d6d3ce]">
                  <div className="absolute inset-0 animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#f5f3ef]/70 to-transparent" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-6">
        <p className="text-center text-muted-foreground">No products found.</p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-6">
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="font-serif text-2xl text-foreground">The Collection</h2>
        <span className="text-sm text-muted-foreground">{products.length} pieces</span>
      </div>

      <div className="grid grid-cols-2 gap-4 md:gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>
    </section >
  )
}