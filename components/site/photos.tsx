'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, Grid2x2, X } from 'lucide-react'
import type { SanityImage } from '@/lib/types'
import { imageUrl } from '@/sanity/lib/image'

export type Photo = {
  key: string
  image: SanityImage
  caption?: string | null
  /** Small secondary line, e.g. the retreat the photo is from. */
  meta?: string | null
}

/* ---------- Helpers ---------- */

type Crop = { top?: number; bottom?: number; left?: number; right?: number }

/** Width ÷ height of the photo as it will be shown (after any crop set in Sanity). */
export function ratioOf(image: SanityImage) {
  if (!image.width || !image.height) return 1.5
  const c = (image.crop ?? {}) as Crop
  const w = image.width * (1 - (c.left ?? 0) - (c.right ?? 0))
  const h = image.height * (1 - (c.top ?? 0) - (c.bottom ?? 0))
  return w > 0 && h > 0 ? w / h : 1.5
}

function srcSet(image: SanityImage, widths: number[], height?: (w: number) => number) {
  return widths.map((w) => `${imageUrl(image, w, height?.(w))} ${w}w`).join(', ')
}

/** Plain <img> with Sanity sizes and a blurred preview behind it while it loads. */
function Img({
  image,
  widths,
  sizes,
  alt,
  className = '',
  ratio,
  eager,
  dims,
}: {
  image: SanityImage
  widths: number[]
  sizes: string
  alt?: string
  className?: string
  /** When set, Sanity crops to this ratio (uses the hotspot). */
  ratio?: number
  eager?: boolean
  /** Width/height attributes, so the browser reserves the right shape before the file arrives. */
  dims?: { width: number; height: number }
}) {
  const height = ratio ? (w: number) => Math.round(w / ratio) : undefined
  const src = imageUrl(image, widths[1] ?? widths[0], height?.(widths[1] ?? widths[0]))
  if (!src) return <div className={`bg-dune-deep ${className}`} aria-hidden="true" />
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet(image, widths, height)}
      sizes={sizes}
      alt={alt ?? image.alt ?? ''}
      width={dims?.width}
      height={dims?.height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`bg-dune-deep bg-cover bg-center object-cover ${className}`}
      style={image.lqip ? { backgroundImage: `url(${image.lqip})` } : undefined}
    />
  )
}

/** Stops the page behind an overlay from scrolling. */
function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [active])
}

/* ---------- Justified grid: full photos, no cropping, rows of equal height ---------- */

export function JustifiedGrid({ photos, onOpen, eagerCount = 0 }: { photos: Photo[]; onOpen: (index: number) => void; eagerCount?: number }) {
  return (
    <ul className="flex flex-wrap gap-1.5 [--row:110px] after:grow-[999] after:content-[''] sm:gap-2 sm:[--row:210px] lg:[--row:280px]">
      {photos.map((p, i) => {
        const ratio = ratioOf(p.image)
        return (
          <li key={p.key} className="relative" style={{ flexGrow: ratio, flexBasis: `calc(var(--row) * ${ratio})` }}>
            <i className="block" style={{ paddingBottom: `${100 / ratio}%` }} aria-hidden="true" />
            <button
              type="button"
              onClick={() => onOpen(i)}
              className="group absolute inset-0 overflow-hidden rounded-md focus-visible:outline-offset-2"
              aria-label={`Open photo ${i + 1} of ${photos.length}${p.caption ? `: ${p.caption}` : ''}`}
            >
              <Img
                image={p.image}
                widths={[400, 700, 1000]}
                sizes={`(max-width: 640px) ${Math.round(110 * ratio * 1.5)}px, ${Math.round(280 * ratio)}px`}
                className="size-full transition duration-500 group-hover:brightness-[.85]"
                eager={i < eagerCount}
              />
              {p.caption && (
                <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden translate-y-2 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-10 text-left text-sm text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block">
                  {p.caption}
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/* ---------- Lightbox ---------- */

export function Lightbox({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: Photo[]
  index: number
  onIndex: (index: number) => void
  onClose: () => void
}) {
  const count = photos.length
  const current = photos[index]
  const go = useCallback((step: number) => onIndex((index + step + count) % count), [index, count, onIndex])
  const closeRef = useRef<HTMLButtonElement>(null)
  const stripRef = useRef<HTMLUListElement>(null)
  const touch = useRef<{ x: number; y: number } | null>(null)

  // Keyboard, focus in and back out.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => opener?.focus?.()
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else return
      e.preventDefault()
      e.stopPropagation()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [go, onClose])

  // Load the next and previous photos early, and keep the active thumbnail in view.
  useEffect(() => {
    for (const step of [1, -1]) {
      const p = photos[(index + step + count) % count]
      const url = imageUrl(p.image, 1600)
      if (url) new window.Image().src = url
    }
    stripRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
  }, [index, photos, count])

  if (!current) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo ${index + 1} of ${count}`}
      className="fixed inset-0 z-[70] flex flex-col bg-[#121614] text-[#f4f1ea] animate-in fade-in duration-200"
      onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
      onTouchEnd={(e) => {
        const start = touch.current
        touch.current = null
        if (!start) return
        const dx = e.changedTouches[0].clientX - start.x
        const dy = e.changedTouches[0].clientY - start.y
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
        else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) onClose()
      }}
    >
      <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),1rem)] pb-3 sm:px-6">
        <p className="text-sm tabular-nums text-white/70">
          {index + 1} <span className="text-white/40">/ {count}</span>
        </p>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="-mr-2 rounded-full p-2.5 text-white/80 transition hover:bg-white/10 hover:text-white">
          <X className="size-6" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-20">
        <Img
          key={current.key}
          image={current.image}
          widths={[800, 1600, 2400]}
          sizes="100vw"
          alt={current.image.alt ?? current.caption ?? ''}
          eager
          dims={{ width: 1600, height: Math.round(1600 / ratioOf(current.image)) }}
          className="h-auto max-h-full w-auto max-w-full !object-contain animate-in fade-in duration-300"
        />
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Previous photo" className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 transition hover:bg-white/20 sm:block">
              <ChevronLeft className="size-6" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next photo" className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 transition hover:bg-white/20 sm:block">
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

      <div className="px-4 pt-4 pb-[max(env(safe-area-inset-bottom),1rem)] sm:px-6">
        <div className="mx-auto min-h-10 max-w-2xl text-center">
          {current.caption && <p className="text-[15px] leading-snug">{current.caption}</p>}
          {current.meta && <p className="mt-1 text-sm text-white/55">{current.meta}</p>}
        </div>
        {count > 1 && (
          <ul ref={stripRef} className="mx-auto mt-3 hidden max-w-5xl gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] sm:flex">
            {photos.map((p, i) => (
              <li key={p.key} data-index={i} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onIndex(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === index}
                  className={`block overflow-hidden rounded transition ${i === index ? 'opacity-100 ring-2 ring-amber' : 'opacity-45 hover:opacity-80'}`}
                >
                  <Img image={p.image} widths={[120, 160]} sizes="80px" ratio={1} className="size-14" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/* ---------- Gallery page: filters + justified grid + lightbox ---------- */

export function PhotoLibrary({ photos, filters }: { photos: (Photo & { category?: string | null })[]; filters: { title: string; value: string }[] }) {
  const [filter, setFilter] = useState<string | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  useScrollLock(open !== null)
  const visible = filter ? photos.filter((p) => p.category === filter) : photos
  const used = filters
    .map((f) => ({ ...f, count: photos.filter((p) => p.category === f.value).length }))
    .filter((f) => f.count > 0)

  return (
    <>
      {used.length > 1 && (
        <div role="tablist" aria-label="Filter photos" className="mb-8 flex gap-6 overflow-x-auto border-b border-ink/10 [scrollbar-width:none]">
          {[{ title: 'All photos', value: null as string | null, count: photos.length }, ...used].map((f) => {
            const active = filter === f.value
            return (
              <button
                key={f.title}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f.value)}
                className={`-mb-px flex shrink-0 items-baseline gap-2 border-b-2 pb-3 pt-1 text-[15px] transition ${active ? 'border-ink text-ink' : 'border-transparent text-stone hover:text-ink'}`}
              >
                {f.title}
                <span className="text-xs tabular-nums text-stone">{f.count}</span>
              </button>
            )
          })}
        </div>
      )}
      <JustifiedGrid key={filter ?? 'all'} photos={visible} onOpen={setOpen} eagerCount={6} />
      {open !== null && <Lightbox photos={visible} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </>
  )
}

/* ---------- Partner and retreat pages: mosaic + all photos + lightbox ---------- */

// Which grid cells each photo takes, by how many photos there are (up to 5 are shown).
const LAYOUTS: Record<number, string[]> = {
  1: ['col-span-4 row-span-2'],
  2: ['col-span-2 row-span-2', 'col-span-2 row-span-2'],
  3: ['col-span-2 row-span-2', 'col-span-2', 'col-span-2'],
  4: ['col-span-2 row-span-2', 'col-span-2', '', ''],
  5: ['col-span-2 row-span-2', '', '', '', ''],
}

export function PhotoMosaic({ photos, title, className = '' }: { photos: Photo[]; title: string; className?: string }) {
  const [sheet, setSheet] = useState(false)
  const [open, setOpen] = useState<number | null>(null)
  useScrollLock(sheet || open !== null)

  useEffect(() => {
    if (!sheet || open !== null) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheet(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sheet, open])

  if (!photos.length) return null
  const shown = photos.slice(0, 5)
  const layout = LAYOUTS[shown.length]
  const showAll = (
    <button
      type="button"
      onClick={() => setSheet(true)}
      className="inline-flex min-h-10 items-center gap-2 rounded-full bg-sand px-4 text-sm font-semibold text-ink shadow-[0_1px_2px_rgba(36,51,45,.25)] transition hover:bg-white"
    >
      <Grid2x2 aria-hidden="true" className="size-4" /> Show all {photos.length} photos
    </button>
  )

  return (
    <div className={className}>
      {/* Phones: swipe through the photos */}
      <div className="relative -mx-5 md:hidden">
        <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 [scrollbar-width:none]">
          {photos.map((p, i) => (
            <li key={p.key} className="w-[86%] shrink-0 snap-center">
              <button type="button" onClick={() => setOpen(i)} className="block w-full overflow-hidden rounded-2xl" aria-label={`Open photo ${i + 1} of ${photos.length}`}>
                <Img image={p.image} widths={[500, 800]} sizes="86vw" ratio={4 / 3} className="aspect-[4/3] w-full" eager={i === 0} />
              </button>
            </li>
          ))}
        </ul>
        {photos.length > 1 && <div className="mt-4 px-5">{showAll}</div>}
      </div>

      {/* Tablets and up: one large photo and up to four smaller ones */}
      <div className="relative hidden h-[clamp(360px,42vw,560px)] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-[1.5rem] md:grid">
        {shown.map((p, i) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setOpen(i)}
            className={`group relative overflow-hidden ${layout[i]}`}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
          >
            <Img
              image={p.image}
              widths={i === 0 ? [700, 1200, 1800] : [400, 700, 1000]}
              sizes={i === 0 || shown.length <= 2 ? '(max-width: 1280px) 50vw, 640px' : '(max-width: 1280px) 25vw, 320px'}
              className="absolute inset-0 size-full transition duration-500 group-hover:brightness-[.88]"
              eager={i === 0}
            />
          </button>
        ))}
        {photos.length > 1 && <div className="absolute bottom-4 right-4">{showAll}</div>}
      </div>

      {sheet && (
        <div role="dialog" aria-modal="true" aria-label={`All photos of ${title}`} className="fixed inset-0 z-[60] overflow-y-auto bg-sand animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="sticky top-0 z-10 border-b border-ink/10 bg-sand/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 sm:px-6">
              <button type="button" onClick={() => setSheet(false)} aria-label="Back" className="rounded-full p-2.5 transition hover:bg-dune">
                <ArrowLeft className="size-5" />
              </button>
              <div className="min-w-0">
                <p className="truncate font-display text-xl leading-tight">{title}</p>
                <p className="text-sm text-stone">{photos.length} photos</p>
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-3 py-6 pb-[max(env(safe-area-inset-bottom),2rem)] sm:px-6">
            <JustifiedGrid photos={photos} onOpen={setOpen} eagerCount={6} />
          </div>
        </div>
      )}

      {open !== null && <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />}
    </div>
  )
}
