import type { Metadata } from 'next'
import { PageHeader } from '@/components/site/page-header'
import { ReviewForm } from '@/components/site/review-form'
import type { ReviewableRetreat } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { reviewableRetreatsQuery } from '@/sanity/lib/queries'

// A private link you send to travelers after a trip, so it's kept out of Google.
export const metadata: Metadata = { title: 'Leave a review', robots: { index: false, follow: false } }

type Props = { searchParams: Promise<{ retreat?: string }> }

export default async function ReviewPage({ searchParams }: Props) {
  const { retreat: slug } = await searchParams
  const all = await sanityFetch<ReviewableRetreat[]>(reviewableRetreatsQuery, {}, [])
  // Only trips that have already happened can be reviewed (they're marked completed automatically).
  const past = all.filter((r) => r.status === 'completed')
  const preselected = slug ? all.find((r) => r.slug === slug) ?? null : null

  return (
    <>
      <PageHeader title="How was your trip?" intro="Thanks for travelling with us. A few honest lines help the next person decide to come along." />
      <div className="mx-auto max-w-2xl px-5 pb-24">
        <ReviewForm retreats={past} preselected={preselected} />
      </div>
    </>
  )
}
