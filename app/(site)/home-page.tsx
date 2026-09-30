import Link from 'next/link'
import { RetreatCard } from '@/components/site/retreat-card'
import { JsonLd } from '@/components/site/json-ld'
import { EmptyState } from '@/components/site/page-header'
import { BRAND, siteUrl } from '@/lib/site'
import { SanityImage } from '@/components/site/sanity-image'
import { reviewerName, Stars } from '@/components/site/stars'
import type { RetreatCard as RetreatCardType, SiteSettings, Testimonial } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { settingsQuery, testimonialsQuery, upcomingRetreatsQuery } from '@/sanity/lib/queries'

export const revalidate = 60

const steps = [
  ['Pick a retreat', 'Every trip page lists the dates, the camp, the transport and what is included.'],
  ['Send a request', 'The booking form opens WhatsApp with your details filled in.'],
  ['Get the details', 'We reply with the price, the meeting point and how to confirm your spot.'],
  ['Show up', 'We handle the planning and travel with the group the whole way.'],
]

export default async function HomePage() {
  const [settings, retreats, testimonials] = await Promise.all([
    sanityFetch<SiteSettings | null>(settingsQuery, {}, null),
    sanityFetch<RetreatCardType[]>(upcomingRetreatsQuery, {}, []),
    sanityFetch<Testimonial[]>(testimonialsQuery, {}, []),
  ])
  const heroImage = settings?.heroImage ?? retreats[0]?.coverImage
  const headlineWords = (settings?.heroTitle || 'Small-group retreats to the quiet corners of Egypt').split(/\s+/)
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: BRAND,
    url: siteUrl,
    logo: `${siteUrl}/icon-512.png`,
    image: `${siteUrl}/og-default.jpg`,
    description: settings?.seoDescription || 'Small-group retreats across Egypt.',
    areaServed: { '@type': 'Country', name: 'Egypt' },
    sameAs: [settings?.instagram, settings?.facebook, settings?.tiktok].filter(Boolean),
    ...(settings?.email ? { email: settings.email } : {}),
    ...(settings?.whatsappNumber ? { telephone: `+${settings.whatsappNumber}` } : {}),
  }

  return (
    <>
      <JsonLd data={organization} />
      <section className="relative -mt-20 flex min-h-[88svh] items-end overflow-hidden bg-pine text-sand">
        <SanityImage image={heroImage} width={2000} height={1300} priority sizes="100vw" className="hero-breathe absolute inset-0 size-full" alt="" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,38,32,.35)_0%,rgba(20,38,32,.15)_35%,rgba(20,38,32,.85)_100%)]" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-32 lg:px-10 lg:pb-20">
          <h1 className="max-w-5xl font-display text-[clamp(2.9rem,8.5vw,7.5rem)] font-light leading-[0.95] tracking-[-0.03em]">
            {headlineWords.map((word, i) => (
              <span key={i}>
                <span className="word-rise" style={{ '--i': i } as React.CSSProperties}>{word}</span>{i < headlineWords.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>
          <div className="fade-up mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between" style={{ '--d': `${headlineWords.length * 90 + 600}ms` } as React.CSSProperties}>
            <p className="max-w-md text-lg leading-relaxed text-sand/85">
              {settings?.heroText || 'We plan the trip, pick the camp and the bus, and travel with you. You bring yourself.'}
            </p>
            <Link href="/retreats" className="inline-flex min-h-13 items-center justify-center rounded-full bg-amber px-7 py-4 font-semibold text-ink transition hover:bg-[#e4b477]">
              See upcoming retreats
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
        <div className="mb-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <h2 className="font-display text-5xl leading-none tracking-tight sm:text-6xl">Coming up</h2>
          {retreats.length > 3 && <Link href="/retreats" className="text-clay underline underline-offset-4">All {retreats.length} retreats</Link>}
        </div>
        {retreats.length ? (
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {retreats.slice(0, 3).map((r) => <RetreatCard key={r._id} retreat={r} />)}
          </div>
        ) : (
          <EmptyState title="New trips are on the way" text="The next retreats are being planned right now. Follow us to hear about them first." action={settings?.instagram ? <a href={settings.instagram} className="text-clay underline underline-offset-4" target="_blank" rel="noreferrer">Follow on Instagram</a> : null} />
        )}
      </section>

      <section className="bg-pine px-5 py-20 text-sand lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <h2 className="font-display text-5xl leading-none tracking-tight sm:text-6xl">How booking works</h2>
          <ol className="grid gap-x-10 sm:grid-cols-2">
            {steps.map(([title, text], i) => (
              <li key={title} className="border-t border-sand/20 py-7">
                <span className="font-display text-2xl text-amber">{i + 1}</span>
                <h3 className="mt-3 font-display text-2xl">{title}</h3>
                <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-sand/75">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {!!settings?.highlights?.length && (
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
          <h2 className="mb-12 max-w-2xl font-display text-5xl leading-none tracking-tight sm:text-6xl">Why people travel with us</h2>
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {settings.highlights.map((h) => (
              <div key={h._key} className="border-l-2 border-amber pl-5">
                <h3 className="font-display text-2xl">{h.title}</h3>
                {h.text && <p className="mt-2 leading-relaxed text-stone">{h.text}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {(settings?.organizerPhoto || settings?.organizerName) && (
        <section className="bg-dune px-5 py-20 lg:px-10 lg:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[.8fr_1.2fr] lg:gap-20">
            <SanityImage image={settings.organizerPhoto} width={800} height={960} className="aspect-[5/6] w-full rounded-[2rem]" />
            <div>
              <h2 className="font-display text-5xl leading-none tracking-tight sm:text-6xl">{settings.aboutTitle || `Hi, I'm ${settings.organizerName}`}</h2>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone">I plan every retreat myself and I'm on every trip, so there's always someone who knows the plan and knows your name.</p>
              <Link href="/about" className="mt-8 inline-block text-clay underline underline-offset-4">More about me</Link>
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-20 lg:px-10 lg:py-28">
          <h2 className="mb-12 font-display text-5xl leading-none tracking-tight sm:text-6xl">From past travelers</h2>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t._id}>
                {t.rating ? <Stars rating={t.rating} /> : null}
                <blockquote className="mt-3 font-display text-2xl leading-snug">“{t.quote}”</blockquote>
                <figcaption className="mt-4 text-sm text-stone">{reviewerName(t.name)}{t.retreat ? `, ${t.retreat}` : ''}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
