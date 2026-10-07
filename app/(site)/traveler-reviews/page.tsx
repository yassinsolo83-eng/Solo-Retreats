import type { Metadata } from 'next'
import { EmptyState, PageHeader } from '@/components/site/page-header'
import { TextLink } from '@/components/site/text-link'
import { averageRating, reviewerName, Stars } from '@/components/site/stars'
import type { Testimonial } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { allTestimonialsQuery } from '@/sanity/lib/queries'

export const revalidate = 60
export const metadata: Metadata = { title: 'Traveler reviews', description: 'What people say after travelling with Solo Retreats.' }

export default async function TravelerReviewsPage() {
  const testimonials = await sanityFetch<Testimonial[]>(allTestimonialsQuery, {}, [])
  const rating = averageRating(testimonials)
  return (
    <>
      <PageHeader title="From past travelers">
        {rating && (
          <p className="mt-6 flex items-center gap-2 text-stone">
            <Stars rating={rating.average} /> <span className="text-ink">{rating.average.toFixed(1)}</span> · {rating.count} review{rating.count > 1 ? 's' : ''}
          </p>
        )}
      </PageHeader>
      <div className="mx-auto max-w-7xl px-5 pb-24 lg:px-10">
        {testimonials.length ? (
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t._id}>
                {t.rating ? <Stars rating={t.rating} /> : null}
                <blockquote className="mt-3 font-display text-2xl leading-snug">“{t.quote}”</blockquote>
                <figcaption className="mt-4 text-sm text-stone">{reviewerName(t.name)}{t.retreat ? `, ${t.retreat}` : ''}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <EmptyState title="No reviews yet" text="Reviews from our travelers will appear here after the first trips." />
        )}
        <p className="mt-14 text-stone">Travelled with us? <TextLink href="/review">Leave a review</TextLink></p>
      </div>
    </>
  )
}
