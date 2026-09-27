import type { Metadata } from 'next'
import { EmptyState, PageHeader } from '@/components/site/page-header'
import { PartnerCard } from '@/components/site/partner-card'
import type { PartnerSummary } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { partnersQuery } from '@/sanity/lib/queries'

export const revalidate = 60
export const metadata: Metadata = { title: 'Camps & transport', description: 'The camps we stay at and the bus companies we travel with.' }

export default async function PartnersPage() {
  const { camps, buses } = await sanityFetch<{ camps: PartnerSummary[]; buses: PartnerSummary[] }>(partnersQuery, {}, { camps: [], buses: [] })
  return (
    <>
      <PageHeader title="Where you stay, how you get there" intro="We plan the trips. The camps and buses are run by independent local partners we know and trust." />
      <div className="mx-auto max-w-7xl px-5 pb-24 lg:px-10">
        {!camps.length && !buses.length && <EmptyState title="Partners coming soon" text="Camp and transport details will be added here." />}
        {camps.length > 0 && (
          <section>
            <h2 className="mb-6 font-display text-4xl tracking-tight">Camps</h2>
            <div className="grid gap-4 lg:grid-cols-2">{camps.map((p) => <PartnerCard key={p._id} partner={p} />)}</div>
          </section>
        )}
        {buses.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 font-display text-4xl tracking-tight">Transport</h2>
            <div className="grid gap-4 lg:grid-cols-2">{buses.map((p) => <PartnerCard key={p._id} partner={p} />)}</div>
          </section>
        )}
      </div>
    </>
  )
}
