import type { Metadata } from 'next'
import { GalleryGrid } from '@/components/site/gallery-grid'
import { EmptyState } from '@/components/site/page-header'
import type { GalleryItem } from '@/lib/types'
import { galleryCategories } from '@/sanity/schemaTypes/categories'
import { sanityFetch } from '@/sanity/lib/client'
import { galleryQuery } from '@/sanity/lib/queries'

export const revalidate = 60
export const metadata: Metadata = { title: 'Gallery', description: 'Photos from our retreats across Egypt.' }

export default async function GalleryPage() {
  const items = await sanityFetch<GalleryItem[]>(galleryQuery, {}, [])
  const trips = new Set(items.map((i) => i.retreat).filter(Boolean)).size
  return (
    <div className="mx-auto max-w-[1600px] px-3 pb-24 sm:px-6 lg:px-10">
      <header className="flex flex-col justify-between gap-6 px-2 pb-10 pt-10 sm:px-0 md:flex-row md:items-end lg:pb-14 lg:pt-16">
        <div>
          <h1 className="font-display text-5xl leading-[1.02] tracking-[-0.02em] sm:text-7xl">From the road</h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-stone">Real photos from real trips.</p>
        </div>
        {items.length > 0 && (
          <p className="text-stone">
            <span className="font-display text-3xl text-ink">{items.length}</span> photos
            {trips > 0 && <> from <span className="font-display text-3xl text-ink">{trips}</span> {trips === 1 ? 'trip' : 'trips'}</>}
          </p>
        )}
      </header>
      {items.length ? (
        <GalleryGrid items={items} categories={galleryCategories} />
      ) : (
        <EmptyState title="Photos coming soon" text="Pictures from the first retreats will be shared here." />
      )}
    </div>
  )
}
