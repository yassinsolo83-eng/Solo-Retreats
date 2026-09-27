'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { GalleryItem } from '@/lib/types'
import { SanityImage } from './sanity-image'

export function GalleryGrid({ items, categories }: { items: GalleryItem[]; categories: { title: string; value: string }[] }) {
  const [filter, setFilter] = useState<string | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const visible = filter ? items.filter((i) => i.category === filter) : items
  const used = categories.filter((c) => items.some((i) => i.category === c.value))

  useEffect(() => {
    if (open === null) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % visible.length))
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + visible.length) % visible.length))
    }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [open, visible.length])

  const current = open !== null ? visible[open] : null

  return (
    <>
      {used.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {[{ title: 'All', value: null as string | null }, ...used].map((c) => (
            <button
              key={c.title}
              type="button"
              onClick={() => setFilter(c.value)}
              aria-pressed={filter === c.value}
              className={`min-h-10 rounded-full px-4 text-sm transition ${filter === c.value ? 'bg-pine text-sand' : 'bg-dune hover:bg-dune-deep'}`}
            >
              {c.title}
            </button>
          ))}
        </div>
      )}
      <div className="columns-2 gap-3 md:columns-3 lg:gap-4">
        {visible.map((item, index) => (
          <button key={item._id} type="button" onClick={() => setOpen(index)} className="mb-3 block w-full overflow-hidden rounded-2xl lg:mb-4" aria-label={`Open photo${item.caption ? `: ${item.caption}` : ''}`}>
            <SanityImage image={item.image} width={600} className="h-auto w-full transition-transform duration-500 hover:scale-[1.03]" sizes="(max-width: 768px) 50vw, 33vw" />
          </button>
        ))}
      </div>

      {current && (
        <div role="dialog" aria-modal="true" aria-label={current.caption || 'Photo'} className="fixed inset-0 z-[60] flex flex-col bg-ink/95 p-4 text-sand" onClick={() => setOpen(null)}>
          <div className="flex justify-end">
            <button type="button" aria-label="Close" className="rounded-full p-2 hover:bg-sand/10" onClick={() => setOpen(null)}><X /></button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button type="button" aria-label="Previous photo" className="hidden rounded-full p-3 hover:bg-sand/10 sm:block" onClick={() => setOpen((open! - 1 + visible.length) % visible.length)}><ChevronLeft /></button>
            <SanityImage image={current.image} width={1600} className="max-h-full max-w-full rounded-xl !object-contain" sizes="100vw" />
            <button type="button" aria-label="Next photo" className="hidden rounded-full p-3 hover:bg-sand/10 sm:block" onClick={() => setOpen((open! + 1) % visible.length)}><ChevronRight /></button>
          </div>
          {(current.caption || current.retreat) && (
            <p className="py-4 text-center text-sm text-sand/80">{[current.caption, current.retreat].filter(Boolean).join(' · ')}</p>
          )}
        </div>
      )}
    </>
  )
}
