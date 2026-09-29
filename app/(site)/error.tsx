'use client'

import Link from 'next/link'
import { useEffect } from 'react'

/** Shown when a page fails to load, inside the normal header and footer. */
export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto max-w-7xl px-5 py-28 lg:px-10 lg:py-36">
      <h1 className="font-display text-5xl tracking-tight sm:text-6xl">Something went wrong</h1>
      <p className="mt-4 max-w-md text-lg text-stone">This page didn't load properly. Try again, or head back to the retreats.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="inline-flex min-h-12 items-center rounded-full bg-pine px-7 font-semibold text-sand hover:bg-pine-dark">Try again</button>
        <Link href="/retreats" className="inline-flex min-h-12 items-center rounded-full border border-ink/15 px-7 hover:bg-dune">See retreats</Link>
      </div>
    </div>
  )
}
