'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// useLayoutEffect warns on the server; this runs it only in the browser.
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

// True once the intro has played in this visit. It lives in the page's memory, so moving
// around the site keeps it, and a refresh or a new visit starts it fresh.
let playedThisVisit = false

// The logo's "o" sun, in the wordmark's own units (see SUN in components/site/logo.tsx).
// The arc runs between x 60.23 and 107.87 on the horizon (y -20.79) with radius 24.3,
// so the circle's center sits about 4.8 units above the horizon.
const WORDMARK = { left: 0, top: -75.5, width: 588.4, height: 78, sunX: 84.05, sunY: -25.596, sunR: 24.3 }
// The icon's sun, in the icon's 0–100 units.
const ICON_SUN = { x: 58, y: 51, r: 21 }

/**
 * Plays the first time the home page is seen in a visit, and on every refresh (about 3.6 seconds): the sun rises, a lone traveler
 * walks across the dune, crouches and jumps, and the whole icon flies up and lands on the
 * sun in the "Solo" logo. A tap or a key press skips it. Hidden entirely for visitors who
 * turned off motion on their device. Works as plain CSS too, so it never gets stuck.
 */
export function HomeIntro() {
  const [done, setDone] = useState(() => playedThisVisit)
  const [skipping, setSkipping] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)

  // Aim the final flight at the sun in the header logo. Measured from layout sizes (not the
  // on-screen box, which is still scaled by the opening animation), and measured again just
  // before take-off in case the header moved.
  useBrowserLayoutEffect(() => {
    if (playedThisVisit) return
    playedThisVisit = true
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDone(true)
      return
    }
    aim()
    const timer = window.setTimeout(aim, 2450)
    return () => window.clearTimeout(timer)
  }, [])

  function aim() {
    const icon = iconRef.current
    const logo = document.querySelector<SVGSVGElement>('header nav a[href="/"] svg')
    if (!icon || !logo) return
    const size = icon.offsetWidth
    const mark = logo.getBoundingClientRect()
    if (!size || !mark.width) return
    // Where the icon's sun is with no animation applied (the icon is centered in the screen).
    const fromX = icon.offsetLeft + (ICON_SUN.x / 100) * size
    const fromY = icon.offsetTop + (ICON_SUN.y / 100) * size
    // The drawing keeps its proportions inside the logo's box (centered if the box is off by a pixel).
    const unit = Math.min(mark.width / WORDMARK.width, mark.height / WORDMARK.height)
    const offsetX = (mark.width - WORDMARK.width * unit) / 2
    const offsetY = (mark.height - WORDMARK.height * unit) / 2
    const toX = mark.left + offsetX + (WORDMARK.sunX - WORDMARK.left) * unit
    const toY = mark.top + offsetY + (WORDMARK.sunY - WORDMARK.top) * unit
    const scale = (WORDMARK.sunR * unit) / ((ICON_SUN.r / 100) * size)
    icon.style.setProperty('--fly-x', `${toX - fromX}px`)
    icon.style.setProperty('--fly-y', `${toY - fromY}px`)
    icon.style.setProperty('--fly-scale', String(scale))
  }

  // Keep the page still while it plays; any tap, scroll or key skips to the end.
  useEffect(() => {
    if (done) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const skip = () => setSkipping(true)
    window.addEventListener('keydown', skip)
    window.addEventListener('wheel', skip, { passive: true })
    const timer = window.setTimeout(() => setDone(true), 3800)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', skip)
      window.removeEventListener('wheel', skip)
      window.clearTimeout(timer)
    }
  }, [done])

  useEffect(() => {
    if (!skipping) return
    const timer = window.setTimeout(() => setDone(true), 350)
    return () => window.clearTimeout(timer)
  }, [skipping])

  if (done) return null

  return (
    <div
      className={`home-intro${skipping ? ' home-intro-skip' : ''}`}
      onPointerDown={() => setSkipping(true)}
      onTouchMove={() => setSkipping(true)}
      aria-hidden="true"
    >
      <div ref={iconRef} className="home-intro-icon">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="home-intro-circle">
              <circle cx="50" cy="50" r="48" />
            </clipPath>
            {/* On landing, the sun is cut at the same horizon as the logo's "o" (55.15 = 51 + 0.198 × 21). */}
            <clipPath id="home-intro-horizon">
              <rect className="hi-horizon" x="0" y="-100" width="100" height="155.15" />
            </clipPath>
          </defs>
          <g clipPath="url(#home-intro-circle)">
            <rect className="hi-fade" width="100" height="100" fill="#26473d" />
            <g clipPath="url(#home-intro-horizon)">
              <g className="hi-sun">
                <circle cx="58" cy="51" r="21" fill="#d69c55" />
              </g>
            </g>
            {/* The traveler: feet at the group's origin, so moving the group moves them along the dune. */}
            <g className="hi-fade">
            <g className="hi-walk">
              <g className="hi-jump">
                <g className="hi-crouch">
                  <g className="hi-bob">
                    <g transform="translate(-0.9 -8.2)">
                      <rect className="hi-leg hi-leg-back" x="-0.95" y="0" width="1.9" height="8.6" rx="0.95" fill="#132721" />
                    </g>
                    <g transform="translate(0.9 -8.2)">
                      <rect className="hi-leg hi-leg-front" x="-0.95" y="0" width="1.9" height="8.6" rx="0.95" fill="#132721" />
                    </g>
                    {/* Arms rest inside the body's outline, then open up and out on the jump. */}
                    <g transform="translate(-1.3 -15.2)">
                      <rect className="hi-arm hi-arm-left" x="-0.85" y="0" width="1.7" height="7.4" rx="0.85" fill="#132721" />
                    </g>
                    <g transform="translate(1.3 -15.2)">
                      <rect className="hi-arm hi-arm-right" x="-0.85" y="0" width="1.7" height="7.4" rx="0.85" fill="#132721" />
                    </g>
                    <rect x="-2.3" y="-16.6" width="4.6" height="9.6" rx="2.2" fill="#132721" />
                    <circle cx="0" cy="-19.6" r="2.7" fill="#132721" />
                  </g>
                </g>
              </g>
            </g>
            </g>
            <path className="hi-fade" d="M0 80 C 22 71, 40 65.5, 58 66.5 S 86 73, 100 69 L100 100 L0 100 Z" fill="#e6d7bd" />
          </g>
        </svg>
      </div>
    </div>
  )
}
