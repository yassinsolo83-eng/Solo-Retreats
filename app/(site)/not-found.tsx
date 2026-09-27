import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-32 lg:px-10">
      <h1 className="font-display text-6xl tracking-tight">This page doesn't exist</h1>
      <p className="mt-4 text-lg text-stone">The link may be old, or the retreat may have been removed.</p>
      <Link href="/retreats" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-pine px-7 font-semibold text-sand">See upcoming retreats</Link>
    </div>
  )
}
