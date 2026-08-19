import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Navbar } from '@/components/screens/navbar'
import { Footer } from '@/components/screens/footer'
import { ProductDetail } from '@/components/product/product-detail'
import { getProduct, getProducts, Product } from '@/lib/products'

export async function generateStaticParams() {

  const products = await getProducts()
  return products.map((p) => ({ id: p.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = await getProduct(id)
  if (!product) return { title: 'Product not found — STYF' }
  return {
    title: `${product.name} — STYF`,
    description: product.description,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  return (
    <main className="min-h-dvh bg-background">
      <Navbar />
      <ProductDetail product={product} />
      <Footer />
    </main>
  )
}
