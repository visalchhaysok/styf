'use client'

import Image from 'next/image'
import { useAuth } from '../auth/auth-provider'

export function Hero() {

  const { user } = useAuth()

  return (
    <section className="mx-auto max-w-3xl px-5 pb-6 pt-8 text-center md:pb-6 md:pt-12">
      <p className="mb-4 text-xs uppercase tracking-[0.35em] text-muted-foreground md:mb-6">
        {user ? `Welcome, ${user.user_metadata?.username}` : "Stylish Flow"}
      </p>

      <h1 className="text-balance font-serif text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-5xl">
        Effortless Style
      </h1>

      <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed md:mt-6 md:text-base text-gray-400">
        Designed to move quietly through every season.
      </p>

      <div className="relative mt-6 aspect-3/2 w-full overflow-hidden rounded-2xl bg-muted md:mt-10 shadow-2xl">
        <Image
          src="/hero.png"
          alt="Model wearing flowing neutral STYF clothing"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>
    </section>
  )
}