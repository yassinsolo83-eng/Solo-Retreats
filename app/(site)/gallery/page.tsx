import type { Metadata } from 'next'
import { GalleryGrid } from '@/components/site/gallery-grid'
import { EmptyState, PageHeader } from '@/components/site/page-header'
import type { GalleryItem } from '@/lib/types'
import { galleryCategories } from '@/sanity/schemaTypes/categories'
import { sanityFetch } from '@/sanity/lib/client'
import { galleryQuery } from '@/sanity/lib/queries'

export const revalidate = 60
export const metadata: Metadata = { title: 'Gallery', description: 'Photos from our retreats across Egypt.' }

export default async function GalleryPage() {
  const items = await sanityFetch<GalleryItem[]>(galleryQuery, {}, [])
  return (
    <>
      <PageHeader title="From the road" intro="Real photos from real trips." />
      <div className="mx-auto max-w-7xl px-5 pb-24 lg:px-10">
        {items.length ? <GalleryGrid items={items} categories={galleryCategories} /> : <EmptyState title="Photos coming soon" text="Pictures from the first retreats will be shared here." />}
      </div>
    </>
  )
}
