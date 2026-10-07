import Link from 'next/link'
import { RetreatCard } from '@/components/site/retreat-card'
import { JsonLd } from '@/components/site/json-ld'
import { EmptyState } from '@/components/site/page-header'
import { BRAND, siteUrl } from '@/lib/site'
import { ArrowRight } from 'lucide-react'
import { HeroSlideshow } from '@/components/site/hero-slideshow'
import { HomeIntro } from '@/components/site/home-intro'
import { TextLink } from '@/components/site/text-link'
import { toHeroSlides } from '@/lib/hero'
import { SinaiNowChip, SinaiWeather, weatherForCards } from '@/components/site/weather'
import type { RetreatCard as RetreatCardType, SiteSettings, Testimonial } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { settingsQuery, testimonialsQuery, upcomingRetreatsQuery } from '@/sanity/lib/queries'

export const revalidate = 60

export default async function HomePage() {
  const [settings, retreats, testimonials] = await Promise.all([
    sanityFetch<SiteSettings | null>(settingsQuery, {}, null),
    sanityFetch<RetreatCardType[]>(upcomingRetreatsQuery, {}, []),
    sanityFetch<Testimonial[]>(testimonialsQuery, {}, []),
  ])
  const weather = await weatherForCards(retreats.slice(0, 3))
  const slides = toHeroSlides(settings?.heroSlides)
  const fallback = settings?.heroImage?.asset ? settings.heroImage : retreats[0]?.coverImage
  if (!slides.length && fallback?.asset) slides.push({ key: 'fallback', kind: 'image', image: fallback })
  const headlineWords = (settings?.heroTitle || 'Small-group retreats to the quiet corners of Egypt').split(/\s+/)
  const explore = [
    { href: '/how-it-works', title: 'How booking works', text: 'Four simple steps, from picking a trip to travelling with the group.' },
    { href: '/why-us', title: 'Why people travel with us', text: 'What makes a Solo Retreats trip different.' },
    { href: '/about', title: settings?.aboutTitle || 'I plan it, and I come along', text: 'Meet the person who plans every trip and travels with you.' },
    ...(testimonials.length ? [{ href: '/traveler-reviews', title: 'From past travelers', text: 'What people say after a trip with us.' }] : []),
  ]
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
      <HomeIntro />
      <JsonLd data={organization} />
      <section className="relative -mt-20 flex min-h-[88svh] items-end overflow-hidden bg-pine text-sand">
        <HeroSlideshow slides={slides} seconds={settings?.heroSeconds ?? 7} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,38,32,.35)_0%,rgba(20,38,32,.15)_35%,rgba(20,38,32,.85)_100%)]" />
        <SinaiNowChip />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-32 lg:px-10 lg:pb-20">
          <h1 className="max-w-5xl font-display text-[clamp(2.25rem,5vw,4.5rem)] font-light leading-[0.95] tracking-[-0.03em]">
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
          {retreats.length > 3 && <TextLink href="/retreats">All {retreats.length} retreats</TextLink>}
        </div>
        {retreats.length ? (
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {retreats.slice(0, 3).map((r) => <RetreatCard key={r._id} retreat={r} weather={weather.get(r._id)} />)}
          </div>
        ) : (
          <EmptyState title="New trips are on the way" text="The next retreats are being planned right now. Follow us to hear about them first." action={settings?.instagram ? <TextLink href={settings.instagram}>Follow on Instagram</TextLink> : null} />
        )}
      </section>

      {settings?.showSinaiWeather !== false && <SinaiWeather placeIds={settings?.weatherPlaces} />}

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-10 lg:pb-28">
        <h2 className="mb-10 font-display text-4xl leading-none tracking-tight sm:text-5xl">Good to know</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {explore.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="group flex h-full flex-col justify-between gap-8 rounded-[1.75rem] bg-dune p-7 transition hover:bg-dune-deep">
                <div>
                  <h3 className="font-display text-2xl leading-snug">{item.title}</h3>
                  <p className="mt-2 leading-relaxed text-stone">{item.text}</p>
                </div>
                <ArrowRight aria-hidden="true" className="size-5 text-clay transition group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
