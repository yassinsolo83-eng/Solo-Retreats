'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { HeroSlide } from '@/lib/hero'
import type { SanityImage } from '@/lib/types'
import { imageUrl } from '@/sanity/lib/image'

const FADE_MS = 1600
// Four slow camera moves, used in turn so consecutive photos don't move the same way.
const MOVES = ['kb-a', 'kb-b', 'kb-c', 'kb-d']

function Photo({ image, priority, className = '' }: { image: SanityImage | null; priority?: boolean; className?: string }) {
  const src = imageUrl(image, 1600, 1040)
  if (!src) return <div className={`absolute inset-0 bg-pine ${className}`} aria-hidden="true" />
  const srcSet = [800, 1200, 1600, 2200].map((w) => `${imageUrl(image, w, Math.round(w * 0.65))} ${w}w`).join(', ')
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes="100vw"
      alt=""
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={`absolute inset-0 size-full bg-cover bg-center object-cover ${className}`}
      style={image?.lqip ? { backgroundImage: `url(${image.lqip})` } : undefined}
    />
  )
}

/**
 * Full-bleed background for the home hero. Photos drift and zoom slowly (Ken Burns),
 * then cross-fade into the next one. Videos play muted to the end, then move on.
 * One photo on its own "breathes" in and out. Everything holds still for visitors
 * who turned off motion on their device.
 */
export function HeroSlideshow({ slides, seconds = 7 }: { slides: HeroSlide[]; seconds?: number }) {
  const [active, setActive] = useState(0)
  // How many times each slide has come on screen; a new number restarts its camera move.
  const [runs, setRuns] = useState<Record<number, number>>({ 0: 1 })
  const [seen, setSeen] = useState<Set<number>>(() => new Set([0]))
  const [reduced, setReduced] = useState(false)
  const [hidden, setHidden] = useState(false)
  const videos = useRef<Map<number, HTMLVideoElement>>(new Map())
  const count = slides.length
  const single = count === 1
  const current = slides[active]
  const duration = Math.max(4, Math.min(20, seconds))

  const next = useCallback(() => setActive((i) => (i + 1) % count), [count])
  const failTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener('change', update)
    const onVisibility = () => setHidden(document.visibilityState === 'hidden')
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      media.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useEffect(() => {
    if (active !== 0 || Object.keys(runs).length > 1) setRuns((r) => ({ ...r, [active]: (r[active] ?? 0) + 1 }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active])

  // Load the current slide and the one after it; keep loaded ones mounted.
  useEffect(() => {
    setSeen((s) => (s.has(active) && s.has((active + 1) % count) ? s : new Set([...s, active, (active + 1) % count])))
  }, [active, count])

  // Photos advance on a timer. Videos advance when they end (see onEnded).
  useEffect(() => {
    if (single || hidden || !current) return
    if (current.kind === 'video' && !reduced) return
    const timer = window.setTimeout(next, duration * 1000)
    return () => window.clearTimeout(timer)
  }, [active, single, hidden, reduced, current, duration, next])

  // Only the visible video plays; the others rewind and wait. Nothing plays while the tab is hidden.
  useEffect(() => {
    videos.current.forEach((video, index) => {
      if (index === active && !reduced && !hidden) {
        // Some phones block autoplay (e.g. battery saver). Then the still photo shows and the slideshow moves on.
        video.play().catch(() => {
          if (!single) failTimer.current = window.setTimeout(next, duration * 1000)
        })
      } else {
        video.pause()
        if (index !== active) window.setTimeout(() => (video.currentTime = 0), FADE_MS)
      }
    })
    return () => window.clearTimeout(failTimer.current)
  }, [active, reduced, hidden, seen, single, next, duration])

  if (!count) return <div className="absolute inset-0 bg-pine" aria-hidden="true" />

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {slides.map((slide, i) => {
        const isActive = i === active
        if (!seen.has(i) && i !== 0) return null
        const move = single ? 'kb-breathe' : MOVES[i % MOVES.length]
        const style = {
          opacity: isActive ? 1 : 0,
          transition: `opacity ${FADE_MS}ms ease-in-out`,
          '--kb-duration': `${duration * 1000 + FADE_MS * 2}ms`,
        } as React.CSSProperties

        return (
          <div key={slide.key} className="absolute inset-0 overflow-hidden" style={style}>
            {slide.kind === 'image' ? (
              <div
                // A new key restarts the camera move whenever this slide comes into view.
                key={`${slide.key}-${runs[i] ?? 0}`}
                className={`absolute inset-0 ${!reduced && (runs[i] || single) ? move : ''}`}
              >
                <Photo image={slide.image} priority={i === 0} />
              </div>
            ) : (
              <>
                <Photo image={slide.poster} priority={i === 0} />
                {!reduced && (
                  <video
                    ref={(el) => {
                      if (el) videos.current.set(i, el)
                      else videos.current.delete(i)
                    }}
                    className="absolute inset-0 size-full object-cover"
                    muted
                    playsInline
                    loop={single}
                    preload={isActive ? 'auto' : 'metadata'}
                    autoPlay={isActive}
                    poster={imageUrl(slide.poster, 1600, 1040) ?? undefined}
                    onEnded={() => !single && next()}
                    onError={() => !single && isActive && next()}
                  >
                    <source
                      src={slide.src}
                      type={/\.webm($|\?)/i.test(slide.src) ? 'video/webm' : 'video/mp4'}
                      // A wrong file name shows the still photo and moves on instead of getting stuck.
                      onError={() => !single && i === active && next()}
                    />
                  </video>
                )}
              </>
            )}
          </div>
        )
      })}

      {count > 1 && (
        <div className="absolute bottom-5 right-5 z-10 flex gap-1.5 lg:right-10">
          {slides.map((slide, i) => (
            <span key={slide.key} className="relative block h-[3px] w-7 overflow-hidden rounded-full bg-sand/30">
              {i === active && (
                <span
                  key={`${slide.key}-${runs[i] ?? 0}`}
                  className={`absolute inset-0 origin-left rounded-full bg-sand ${slide.kind === 'image' && !reduced && !hidden ? 'hero-progress' : ''}`}
                  style={{ '--kb-duration': `${duration * 1000}ms` } as React.CSSProperties}
                />
              )}
              {i < active && <span className="absolute inset-0 rounded-full bg-sand/70" />}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
