import { Navbar } from '@/components/home/navbar'
import { Hero } from '@/components/home/hero'
import ProductList from '@/components/product/product-list'
import { Footer } from '@/components/home/footer'

export default function HomePage() {

  return (
    <main className="min-h-dvh bg-background">
      <Hero />
      <ProductList />
      <Footer />
    </main>
  )
}
