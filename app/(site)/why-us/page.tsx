import type { Metadata } from 'next'
import Link from 'next/link'
import { EmptyState, PageHeader } from '@/components/site/page-header'
import type { SiteSettings } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { settingsQuery } from '@/sanity/lib/queries'

export const revalidate = 60
export const metadata: Metadata = { title: 'Why travel with us', description: 'What makes a Solo Retreats trip different.' }

export default async function WhyUsPage() {
  const settings = await sanityFetch<SiteSettings | null>(settingsQuery, {}, null)
  const items = settings?.highlights ?? []
  return (
    <>
      <PageHeader title="Why people travel with us" />
      <div className="mx-auto max-w-7xl px-5 pb-24 lg:px-10">
        {items.length ? (
          <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((h) => (
              <div key={h._key} className="border-l-2 border-amber pl-5">
                <h2 className="font-display text-2xl">{h.title}</h2>
                {h.text && <p className="mt-2 leading-relaxed text-stone">{h.text}</p>}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="Coming soon" text="We are putting this page together." />
        )}
        <Link href="/retreats" className="mt-14 inline-flex min-h-12 items-center rounded-full bg-pine px-7 font-semibold text-sand hover:bg-pine-dark">See upcoming retreats</Link>
      </div>
    </>
  )
}
