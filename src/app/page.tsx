import { Navbar } from '@/components/screens/navbar'
import { Hero } from '@/components/screens/hero'
import ProductList from '@/components/product/product-list'
import { Footer } from '@/components/screens/footer'
import { stripe } from '../lib/stripe';

export default function HomePage() {

  return (
    <main className="min-h-dvh bg-background">
      <Navbar />
      <Hero />
      <ProductList />
      <Footer />
    </main>
  )
}
