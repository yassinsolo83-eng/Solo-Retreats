import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { isUrl } from '@/lib/site'
import { notFound } from 'next/navigation'
import { RetreatCard } from '@/components/site/retreat-card'
import { RichText } from '@/components/site/rich-text'
import { SanityImage } from '@/components/site/sanity-image'
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
  // A Maps link typed into Location still works as the map button, and never shows as text.
  const location = partner.location && !isUrl(partner.location) ? partner.location : null
  const maps = partner.googleMaps || (isUrl(partner.location) ? partner.location : null)
  const links = [
    { label: 'Facebook', href: partner.facebook },
    { label: 'Instagram', href: partner.instagram },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href))
  const hasCover = Boolean(partner.coverImage?.asset)

  return (
    <article className="mx-auto max-w-7xl px-5 pb-24 pt-6 lg:px-10 lg:pt-10">
      <Link href="/partners" className="text-sm text-stone hover:text-ink">← All partners</Link>
      <div className={`mt-8 grid gap-10 lg:gap-16 ${hasCover ? 'lg:grid-cols-[1.1fr_.9fr]' : 'max-w-3xl'}`}>
        {hasCover && <SanityImage image={partner.coverImage} width={1000} height={800} priority className="aspect-[5/4] w-full rounded-[2rem]" />}
        <div className={hasCover ? 'lg:pt-6' : ''}>
          <p className="text-clay">{isCamp ? 'Camp' : 'Transport'}{location ? ` in ${location}` : ''}{partner.vehicleType ? ` · ${partner.vehicleType}` : ''}</p>
          <h1 className="mt-3 font-display text-5xl leading-none tracking-[-0.02em] sm:text-6xl">{partner.name}</h1>
          {partner.summary && <p className="mt-6 text-xl leading-relaxed text-stone">{partner.summary}</p>}
          {!!partner.amenities?.length && (
            <ul className="mt-8 flex flex-wrap gap-2">
              {partner.amenities.map((a) => <li key={a} className="rounded-full bg-dune px-4 py-2 text-sm">{a}</li>)}
            </ul>
          )}
          {(links.length > 0 || maps) && (
            <div className="mt-8 flex flex-wrap gap-2">
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
          <p className="mt-10 text-sm text-stone">{partner.name} is an independent partner and is not owned by Solo Retreats.</p>
        </div>
      </div>

      <RichText value={partner.description} className="mt-16 max-w-2xl" />

      {!!partner.images?.length && (
        <div className="mt-16 columns-2 gap-3 md:columns-3">
          {partner.images.map((img, i) => <SanityImage key={i} image={img} width={600} className="mb-3 h-auto w-full rounded-2xl" sizes="(max-width: 768px) 50vw, 33vw" />)}
        </div>
      )}

      {!!partner.retreats?.length && (
        <section className="mt-20 border-t border-ink/10 pt-14">
          <h2 className="mb-10 font-display text-4xl tracking-tight">Upcoming retreats {isCamp ? 'staying here' : 'with this company'}</h2>
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {partner.retreats.map((r) => <RetreatCard key={r._id} retreat={r} />)}
          </div>
        </section>
      )}
    </article>
  )
}
