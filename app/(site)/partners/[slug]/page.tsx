import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { isUrl } from '@/lib/site'
import { notFound } from 'next/navigation'
import { RichText } from '@/components/site/rich-text'
import { PhotoMosaic } from '@/components/site/photos'
import { reviewerName, Stars } from '@/components/site/stars'
import { LangBlock, LangText, LangToggle } from '@/components/site/lang-switch'
import { RetreatCard } from '@/components/site/retreat-card'
import type { PartnerDetail } from '@/lib/types'
import { ogImageUrl } from '@/sanity/lib/image'
import { sanityFetch } from '@/sanity/lib/client'
import { partnerBySlugQuery, partnerSlugsQuery } from '@/sanity/lib/queries'

export const revalidate = 60

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>(partnerSlugsQuery, {}, [])
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = decodeURIComponent((await params).slug)
  const partner = await sanityFetch<PartnerDetail | null>(partnerBySlugQuery, { slug }, null)
  if (!partner) return {}
  const image = ogImageUrl(partner.coverImage)
  return { title: partner.name, description: partner.summary ?? undefined, openGraph: { images: image ? [{ url: image, width: 1200, height: 630 }] : undefined } }
}

export default async function PartnerPage({ params }: Props) {
  const slug = decodeURIComponent((await params).slug)
  const partner = await sanityFetch<PartnerDetail | null>(partnerBySlugQuery, { slug }, null)
  if (!partner) notFound()
  const isCamp = partner._type === 'camp'
  const isWorkshop = partner._type === 'workshop'
  const isActivity = partner._type === 'activity'
  const hosted = isWorkshop || isActivity
  // A Maps link typed into Location still works as the map button, and never shows as text.
  const location = partner.location && !isUrl(partner.location) ? partner.location : null
  const maps = partner.googleMaps || (isUrl(partner.location) ? partner.location : null)
  const links = [
    { label: 'Facebook', href: partner.facebook },
    { label: 'Instagram', href: partner.instagram },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href))
  // Cover first, then the rest, without showing the same photo twice.
  const cover = partner.coverPhoto?.asset ? partner.coverPhoto : null
  const photos = [cover, ...(partner.images ?? []).filter((img) => img.asset?._ref !== cover?.asset?._ref)]
    .filter((img): img is NonNullable<typeof img> => Boolean(img?.asset))
    .map((img, i) => ({ key: img._key ?? `photo-${i}`, image: img, caption: img.alt }))
  const hasArabic = Boolean(partner.nameAr || partner.summaryAr || partner.descriptionAr?.length || partner.amenitiesAr?.length)
  const hasDetails = Boolean(partner.description?.length || partner.amenities?.length)
  const renderItems = (items: string[]) => (
    <ul className="mt-5">
      {items.map((a) => (
        <li key={a} className="flex gap-3 border-t border-ink/10 py-3 text-stone first:border-t-0">
          <span aria-hidden="true" className="text-clay">✓</span>{a}
        </li>
      ))}
    </ul>
  )

  return (
    <article className="mx-auto max-w-7xl px-5 pb-24 pt-6 lg:px-10 lg:pt-10">
      <Link href="/partners" className="text-sm text-stone hover:text-ink">← All partners</Link>
      {hasArabic && <div className="mt-4"><LangToggle /></div>}

      <header className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-clay">{isWorkshop ? 'Workshop' : isActivity ? 'Activity' : isCamp ? 'Camp' : 'Transport'}{hosted && partner.host ? ` with ${partner.host}` : ''}{location ? ` in ${location}` : ''}{partner.vehicleType ? `, ${partner.vehicleType}` : ''}</p>
          <LangText as="h1" className="mt-3 font-display text-5xl leading-none tracking-[-0.02em] sm:text-7xl" en={partner.name} ar={partner.nameAr} />
          <LangText as="p" className="mt-6 text-xl leading-relaxed text-stone" en={partner.summary} ar={partner.summaryAr} />
        </div>
        {(links.length > 0 || maps) && (
          <div className="flex shrink-0 flex-wrap gap-2">
            {maps && (
              <a href={maps} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-pine px-5 text-sm font-semibold text-sand hover:bg-pine-dark">
                <MapPin aria-hidden="true" className="size-4" /> Open in Google Maps
              </a>
            )}
            {links.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full border border-ink/15 px-5 text-sm hover:bg-dune">{l.label}</a>
            ))}
          </div>
        )}
      </header>

      {photos.length > 0 && <PhotoMosaic className="mt-10 lg:mt-12" title={partner.name} photos={photos} />}

      {hasDetails && (
        <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-[1fr_340px] lg:gap-20">
          <LangBlock
            en={<RichText value={partner.description} className="max-w-2xl text-lg leading-relaxed" />}
            ar={partner.descriptionAr?.length ? <RichText value={partner.descriptionAr} className="max-w-2xl text-lg leading-relaxed" /> : undefined}
          />
          {!!(partner.amenities?.length || partner.amenitiesAr?.length) && (
            <aside className="lg:border-l lg:border-ink/10 lg:pl-10">
              <h2 className="font-display text-2xl">{isWorkshop ? 'What you will do' : isActivity ? 'What is included' : isCamp ? 'What guests get' : 'On board'}</h2>
              <LangBlock
                en={partner.amenities?.length ? renderItems(partner.amenities) : undefined}
                ar={partner.amenitiesAr?.length ? renderItems(partner.amenitiesAr) : undefined}
              />
            </aside>
          )}
        </div>
      )}

      {!!partner.retreats?.length && (
        <section className="mt-16 lg:mt-24">
          <h2 className="mb-6 font-display text-4xl tracking-tight">Retreats with {partner.name}</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{partner.retreats.map((r) => <RetreatCard key={r._id} retreat={r} />)}</div>
        </section>
      )}

      {!!partner.testimonials?.length && (
        <section className="mt-16 lg:mt-24">
          <h2 className="mb-6 font-display text-4xl tracking-tight">What travelers say</h2>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {partner.testimonials.map((t) => (
              <figure key={t._id}>
                {t.rating ? <Stars rating={t.rating} /> : null}
                <blockquote className="mt-3 font-display text-2xl leading-snug">“{t.quote}”</blockquote>
                <figcaption className="mt-4 text-sm text-stone">{reviewerName(t.name)}{t.retreat ? `, ${t.retreat}` : ''}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <p className="mt-14 text-sm text-stone">{partner.name} is an independent partner and is not owned by Solo Retreats.</p>

    </article>
  )
}
