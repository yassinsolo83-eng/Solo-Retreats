'use client'

import type { GalleryItem } from '@/lib/types'
import { PhotoLibrary } from './photos'

/** The Gallery page: filter by category, full photos in even rows, full-screen viewer. */
export function GalleryGrid({ items, categories }: { items: GalleryItem[]; categories: { title: string; value: string }[] }) {
  const photos = items.map((item) => ({
    key: item._id,
    image: item.image,
    caption: item.caption,
    meta: item.retreat,
    category: item.category,
  }))
  return <PhotoLibrary photos={photos} filters={categories} />
}
