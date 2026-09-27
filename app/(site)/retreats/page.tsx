import type { Metadata } from 'next'
import { EmptyState, PageHeader } from '@/components/site/page-header'
import { RetreatCard } from '@/components/site/retreat-card'
import type { RetreatCard as RetreatCardType } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { pastRetreatsQuery, upcomingRetreatsQuery } from '@/sanity/lib/queries'

export const revalidate = 60
export const metadata: Metadata = { title: 'Retreats', description: 'Upcoming small-group retreats across Egypt, with dates, camps and transport.' }

export default async function RetreatsPage() {
  const [upcoming, past] = await Promise.all([
    sanityFetch<RetreatCardType[]>(upcomingRetreatsQuery, {}, []),
    sanityFetch<RetreatCardType[]>(pastRetreatsQuery, {}, []),
  ])
  return (
    <>
      <PageHeader title="Upcoming retreats" intro="Each trip is planned end to end: where you stay, how you get there and what the days look like." />
      <section className="mx-auto max-w-7xl px-5 pb-24 lg:px-10">
        {upcoming.length ? (
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((r) => <RetreatCard key={r._id} retreat={r} />)}
          </div>
        ) : (
          <EmptyState title="New trips are on the way" text="There are no open retreats right now. The next ones will show up here first." />
        )}
      </section>
      {past.length > 0 && (
        <section className="border-t border-ink/10 bg-dune/60 px-5 py-20 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-10 font-display text-4xl tracking-tight sm:text-5xl">Past retreats</h2>
            <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-4">
              {past.map((r) => <RetreatCard key={r._id} retreat={r} past />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
