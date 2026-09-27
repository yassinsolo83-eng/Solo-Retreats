import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookingForm } from '@/components/site/booking-form'
import { StatusPill } from '@/components/site/retreat-card'
import { RichText } from '@/components/site/rich-text'
import { SanityImage } from '@/components/site/sanity-image'
import { SharePanel } from '@/components/site/share-panel'
import { formatDeparture, formatRangeShort, isBookable, nights, upcomingDepartures } from '@/lib/dates'
import { siteUrl } from '@/lib/site'
import type { PartnerSummary, RetreatDetail, SiteSettings } from '@/lib/types'
import { imageUrl } from '@/sanity/lib/image'
import { sanityFetch } from '@/sanity/lib/client'
import { retreatBySlugQuery, retreatSlugsQuery, settingsQuery } from '@/sanity/lib/queries'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>(retreatSlugsQuery, {}, [])
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const retreat = await sanityFetch<RetreatDetail | null>(retreatBySlugQuery, { slug }, null)
  if (!retreat) return {}
  const next = upcomingDepartures(retreat.departures)[0]
  const description = [next ? formatRangeShort(next) : null, retreat.shortDescription].filter(Boolean).join(' · ')
  const image = imageUrl(retreat.coverImage, 1200, 630)
  return {
    title: `${retreat.title}, ${retreat.destination}`,
    description,
    alternates: { canonical: `/retreats/${slug}` },
    openGraph: { title: retreat.title, description, url: `/retreats/${slug}`, images: image ? [{ url: image, width: 1200, height: 630, alt: retreat.title }] : undefined },
  }
}

export default async function RetreatPage({ params }: Props) {
  const { slug } = await params
  const [retreat, settings] = await Promise.all([
    sanityFetch<RetreatDetail | null>(retreatBySlugQuery, { slug }, null),
    sanityFetch<SiteSettings | null>(settingsQuery, {}, null),
  ])
  if (!retreat) notFound()

  const pageUrl = `${siteUrl}/retreats/${retreat.slug}`
  const departures = upcomingDepartures(retreat.departures)
  const shown = departures.length ? departures : (retreat.departures ?? [])
  const first = shown[0]
  const completed = retreat.status === 'completed'
  const kind = isBookable(retreat) && departures.length ? 'booking' : 'waitlist'

  const facts: [string, React.ReactNode][] = [
    ['Where', retreat.destination],
    first ? ['Length', `${nights(first)} nights`] : null,
    retreat.camp ? ['Stay', <PartnerLink key="camp" partner={retreat.camp} />] : null,
    retreat.bus ? ['Transport', <PartnerLink key="bus" partner={retreat.bus} />] : null,
    retreat.meetingPoint ? ['Meeting point', [retreat.meetingPoint, retreat.meetingTime].filter(Boolean).join(', ')] : null,
    ['Price', retreat.showPrice && retreat.price ? retreat.price : 'Ask on WhatsApp'],
  ].filter(Boolean) as [string, React.ReactNode][]

  return (
    <article>
      <header className="mx-auto max-w-7xl px-5 pt-6 lg:px-10 lg:pt-10">
        <Link href="/retreats" className="text-sm text-stone hover:text-ink">← All retreats</Link>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <StatusPill retreat={retreat} />
          {first && <span className="text-sm text-clay">{shown.length > 1 ? `${shown.length} dates available` : formatDeparture(first)}</span>}
        </div>
        <h1 className="mt-4 max-w-5xl font-display text-5xl font-light leading-[0.98] tracking-[-0.03em] sm:text-7xl lg:text-8xl">{retreat.title}</h1>
        {retreat.shortDescription && <p className="mt-6 max-w-2xl text-xl leading-relaxed text-stone">{retreat.shortDescription}</p>}
      </header>

      <div className="mx-auto mt-10 max-w-7xl px-5 lg:px-10">
        <SanityImage image={retreat.coverImage} width={1600} height={800} priority sizes="(max-width: 1280px) 100vw, 1280px" className="aspect-[4/3] w-full rounded-[2rem] sm:aspect-[2/1]" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-14 px-5 py-16 lg:grid-cols-[1fr_420px] lg:gap-20 lg:px-10 lg:py-20">
        <div className="min-w-0">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-y border-ink/10 py-8 sm:grid-cols-3">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-stone">{label}</dt>
                <dd className="mt-1 text-lg leading-snug">{value}</dd>
              </div>
            ))}
          </dl>

          <RichText value={retreat.description} className="mt-12 max-w-2xl" />

          {!!retreat.itinerary?.length && (
            <section className="mt-16">
              <h2 className="font-display text-4xl tracking-tight">Day by day</h2>
              <ol className="mt-8">
                {retreat.itinerary.map((day) => (
                  <li key={day._key} className="grid gap-2 border-t border-ink/10 py-6 sm:grid-cols-[200px_1fr] sm:gap-8">
                    <h3 className="font-display text-xl">{day.title}</h3>
                    {day.text && <p className="leading-relaxed text-stone">{day.text}</p>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {(!!retreat.included?.length || !!retreat.notIncluded?.length) && (
            <section className="mt-16 grid gap-10 sm:grid-cols-2">
              <List title="Included" items={retreat.included} mark="✓" />
              <List title="Not included" items={retreat.notIncluded} mark="–" />
            </section>
          )}

          {!!retreat.whatToBring?.length && (
            <section className="mt-16 rounded-3xl bg-dune p-7 sm:p-9">
              <List title="What to bring" items={retreat.whatToBring} mark="·" columns />
            </section>
          )}

          {!!retreat.images?.length && (
            <section className="mt-16">
              <h2 className="font-display text-4xl tracking-tight">Photos</h2>
              <div className="mt-8 grid grid-cols-2 gap-3">
                {retreat.images.map((img, i) => (
                  <SanityImage key={i} image={img} width={700} height={i % 3 === 0 ? 520 : 700} className={`w-full rounded-2xl ${i % 3 === 0 ? 'col-span-2 aspect-[4/3]' : 'aspect-square'}`} sizes="(max-width: 1024px) 50vw, 400px" />
                ))}
              </div>
            </section>
          )}

          {!!retreat.testimonials?.length && (
            <section className="mt-16">
              <h2 className="font-display text-4xl tracking-tight">What travelers said</h2>
              <div className="mt-8 flex flex-col gap-8">
                {retreat.testimonials.map((t) => (
                  <figure key={t._id} className="border-l-2 border-amber pl-6">
                    <blockquote className="font-display text-2xl leading-snug">“{t.quote}”</blockquote>
                    <figcaption className="mt-3 text-sm text-stone">{t.name}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div id="book" className="scroll-mt-6 rounded-[2rem] bg-dune p-6 sm:p-8">
            {completed ? (
              <>
                <h2 className="font-display text-3xl">This retreat has ended</h2>
                <p className="mt-3 text-stone">Take a look at what's coming up next.</p>
                <Link href="/retreats" className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-pine font-semibold text-sand">See upcoming retreats</Link>
              </>
            ) : (
              <>
                <h2 className="font-display text-3xl">{kind === 'waitlist' ? 'Join the waitlist' : 'Book your spot'}</h2>
                <p className="mb-6 mt-2 text-stone">
                  {kind === 'waitlist' ? 'This trip is full right now. Leave your details and we will reach out first.' : 'No payment now. Send your request and we will confirm on WhatsApp.'}
                </p>
                <BookingForm
                  retreatId={retreat._id}
                  retreatTitle={retreat.title}
                  departures={kind === 'booking' ? departures : []}
                  kind={kind}
                  whatsappNumber={settings?.whatsappNumber}
                  pageUrl={pageUrl}
                />
              </>
            )}
          </div>
          <div className="mt-6">
            <SharePanel url={pageUrl} title={retreat.title} subtitle={first ? `${retreat.destination} · ${formatRangeShort(first)}` : retreat.destination} />
          </div>
        </aside>
      </div>
    </article>
  )
}

function PartnerLink({ partner }: { partner: PartnerSummary }) {
  return <Link href={`/partners/${partner.slug}`} className="underline decoration-amber decoration-2 underline-offset-4 hover:text-clay">{partner.name}</Link>
}

function List({ title, items, mark, columns }: { title: string; items?: string[] | null; mark: string; columns?: boolean }) {
  if (!items?.length) return null
  return (
    <div>
      <h2 className="font-display text-3xl tracking-tight">{title}</h2>
      <ul className={`mt-5 gap-x-8 ${columns ? 'sm:columns-2' : ''}`}>
        {items.map((item) => (
          <li key={item} className="flex gap-3 break-inside-avoid py-1.5 leading-relaxed text-stone">
            <span aria-hidden="true" className="w-3 shrink-0 text-clay">{mark}</span>{item}
          </li>
        ))}
      </ul>
    </div>
  )
}
