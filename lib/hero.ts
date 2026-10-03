import type { HeroSlideData, SanityImage } from './types'

export type HeroSlide =
  | { key: string; kind: 'image'; image: SanityImage }
  | { key: string; kind: 'video'; src: string; poster: SanityImage | null }

/** Turns the slides from Sanity into what the slideshow plays, skipping empty ones. */
export function toHeroSlides(data: HeroSlideData[] | null | undefined): HeroSlide[] {
  return (data ?? []).flatMap((s): HeroSlide[] => {
    if (s._type === 'heroPhoto') return s.asset ? [{ key: s._key, kind: 'image', image: s }] : []
    const source = s.source?.trim()
    if (!source) return []
    // A bare file name points to the site's public folder on GitHub; a full link is used as is.
    const src = /^https?:\/\//i.test(source) ? source : `/${encodeURIComponent(source)}`
    return [{ key: s._key, kind: 'video', src, poster: s.poster ?? null }]
  })
}

