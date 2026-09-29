import Link from 'next/link'

export function NotFoundContent() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-28 lg:px-10 lg:py-36">
      <p className="font-display text-8xl text-amber">404</p>
      <h1 className="mt-4 font-display text-5xl tracking-tight sm:text-6xl">This page doesn't exist</h1>
      <p className="mt-4 max-w-md text-lg text-stone">The link may be old or mistyped, or the retreat may have been removed.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/retreats" className="inline-flex min-h-12 items-center rounded-full bg-pine px-7 font-semibold text-sand hover:bg-pine-dark">See upcoming retreats</Link>
        <Link href="/" className="inline-flex min-h-12 items-center rounded-full border border-ink/15 px-7 hover:bg-dune">Go home</Link>
      </div>
    </div>
  )
}
