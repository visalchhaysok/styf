'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/product/product-card';
import { getProducts, type Product } from '@/lib/products';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-6">
        <p className="text-center text-muted-foreground">Loading collection...</p>
      </section>
    )
  }

  if (products.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-6">
        <p className="text-center text-muted-foreground">No products found.</p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-6">
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="font-serif text-2xl text-foreground">The Collection</h2>
        <span className="text-sm text-muted-foreground">{products.length} pieces</span>
      </div>

      <div className="flex flex-col gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))};
      </div>
    </section>
  )
}