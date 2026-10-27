import type { Metadata } from 'next'
import { EmptyState, PageHeader } from '@/components/site/page-header'
import { TextLink } from '@/components/site/text-link'
import { PartnerCard } from '@/components/site/partner-card'
import type { PartnerSummary } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { partnersQuery } from '@/sanity/lib/queries'

export const revalidate = 60
export const metadata: Metadata = { title: 'Partners', description: 'The camps we stay at, the bus companies we travel with and the workshops and activities we run together.' }

export default async function PartnersPage() {
  const { camps, buses, workshops, activities } = await sanityFetch<{ camps: PartnerSummary[]; buses: PartnerSummary[]; workshops: PartnerSummary[]; activities: PartnerSummary[] }>(partnersQuery, {}, { camps: [], buses: [], workshops: [], activities: [] })
  return (
    <>
      <PageHeader title="Where you stay, how you get there" intro="We plan the trips. The camps, buses, workshops and activities are run by independent local partners we know and trust." />
      <div className="mx-auto max-w-7xl px-5 pb-24 lg:px-10">
        {!camps.length && !buses.length && !workshops.length && !activities.length && <EmptyState title="Partners coming soon" text="Camp and transport details will be added here." />}
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
        {workshops.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 font-display text-4xl tracking-tight">Workshops</h2>
            <div className="grid gap-4 lg:grid-cols-2">{workshops.map((p) => <PartnerCard key={p._id} partner={p} />)}</div>
          </section>
        )}
        {activities.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 font-display text-4xl tracking-tight">Activities</h2>
            <div className="grid gap-4 lg:grid-cols-2">{activities.map((p) => <PartnerCard key={p._id} partner={p} />)}</div>
          </section>
        )}
        <p className="mt-16 text-stone">Run a workshop, activity, camp or transport service? <TextLink href="/partner-with-us">Partner with us</TextLink></p>
      </div>
    </>
  )
}
