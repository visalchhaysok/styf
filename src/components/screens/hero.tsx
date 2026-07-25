import Image from 'next/image'

export function Hero() {
  return (
    <section className="mx-auto max-w-3xl px-5 pb-6 pt-12 text-center">
      <p className="mb-6 text-xs uppercase tracking-[0.35em] text-muted-foreground">
        Stylish Flow
      </p>
      <h1 className="text-balance font-serif text-5xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-6xl">
        Effortless Style
      </h1>
      <p className="mx-auto mt-6 max-w-md text-pretty leading-relaxed text-muted-foreground">
        Considered essentials in soft, natural tones — pieces designed to move
        quietly through every season.
      </p>

      <div className="relative mt-10 aspect-4/5 w-full overflow-hidden rounded-2xl bg-muted">
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
