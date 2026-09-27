import type { Metadata } from 'next'
import Link from 'next/link'
import { RichText } from '@/components/site/rich-text'
import { SanityImage } from '@/components/site/sanity-image'
import type { SiteSettings } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { settingsQuery } from '@/sanity/lib/queries'

export const revalidate = 60
export const metadata: Metadata = { title: 'About', description: 'Who plans the retreats and how they are run.' }

export default async function AboutPage() {
  const settings = await sanityFetch<SiteSettings | null>(settingsQuery, {}, null)
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-24 pt-10 lg:grid-cols-[.85fr_1.15fr] lg:gap-20 lg:px-10 lg:pt-16">
      <SanityImage image={settings?.organizerPhoto} width={900} height={1100} priority className="aspect-[9/11] w-full rounded-[2rem] lg:sticky lg:top-28 lg:self-start" />
      <div>
        <h1 className="font-display text-5xl leading-[1.02] tracking-[-0.02em] sm:text-7xl">
          {settings?.aboutTitle || (settings?.organizerName ? `Hi, I'm ${settings.organizerName}` : 'About Solo Retreats')}
        </h1>
        {settings?.aboutText?.length ? (
          <RichText value={settings.aboutText} className="mt-10 max-w-xl" />
        ) : (
          <div className="mt-10 max-w-xl space-y-5 text-lg leading-[1.7] text-stone">
            <p>Solo Retreats started from a simple idea: getting away shouldn't be complicated, expensive or crowded.</p>
            <p>Every trip is kept small, planned in detail and run in person. The camps and buses are independent local partners; the plan, the group and the care are ours.</p>
          </div>
        )}
        <Link href="/retreats" className="mt-10 inline-flex min-h-12 items-center rounded-full bg-pine px-7 font-semibold text-sand hover:bg-pine-dark">See upcoming retreats</Link>
      </div>
    </div>
  )
}
