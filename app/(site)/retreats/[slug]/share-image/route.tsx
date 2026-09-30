import { ImageResponse } from 'next/og'
import QRCode from 'qrcode'
import { LETTERS, REFLECTION, SUN } from '@/components/site/logo'
import { cardWeather } from '@/components/site/weather'
import { formatRangeShort, isBookable, nights, statusLabel, upcomingDepartures } from '@/lib/dates'
import { siteUrl } from '@/lib/site'
import type { RetreatDetail } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { jpgUrl } from '@/sanity/lib/image'
import { retreatBySlugQuery } from '@/sanity/lib/queries'

/**
 * A ready-to-post image for a retreat: cover photo, dates, stay, transport,
 * weather, price and a QR code to the page.
 *   /retreats/<slug>/share-image                 → story, 1080 × 1920 (WhatsApp status, Instagram story)
 *   /retreats/<slug>/share-image?format=post     → post, 1080 × 1350 (Instagram / Facebook feed)
 */

const PINE = '#26473d'
const PINE_DARK = '#1b352d'
const SAND = '#f6f3ed'
const AMBER = '#d69c55'

const FORMATS = {
  story: { width: 1080, height: 1920, photo: 1020, pad: 72, title: 104, columns: 2, qr: 230 },
  post: { width: 1080, height: 1350, photo: 600, pad: 64, title: 84, columns: 3, qr: 190 },
} as const

type Props = { params: Promise<{ slug: string }> }

export async function GET(request: Request, { params }: Props) {
  const slug = decodeURIComponent((await params).slug)
  const formatName = new URL(request.url).searchParams.get('format') === 'post' ? 'post' : 'story'
  const f = FORMATS[formatName]

  const retreat = await sanityFetch<RetreatDetail | null>(retreatBySlugQuery, { slug }, null)
  if (!retreat) return new Response('Not found', { status: 404 })

  const pageUrl = `${siteUrl}/retreats/${retreat.slug}`
  const upcoming = upcomingDepartures(retreat.departures)
  const next = upcoming[0] ?? retreat.departures?.[0]
  const [display, body, qr, weather] = await Promise.all([
    googleFont('Newsreader', 400),
    googleFont('Figtree', 500),
    QRCode.toDataURL(pageUrl, { margin: 1, width: f.qr * 2, color: { dark: PINE, light: SAND } }).catch(() => null),
    next && retreat.status !== 'completed'
      ? cardWeather({ destination: retreat.destination, campLocation: retreat.camp?.location, showWeather: retreat.showWeather, departure: next }).catch(() => null)
      : null,
  ])

  const photo = await imageData(jpgUrl(retreat.coverImage, f.width, f.photo))
  const status =
    retreat.status !== 'completed' && retreat.status !== 'full' && retreat.spotsLeft
      ? `${retreat.spotsLeft} spot${retreat.spotsLeft === 1 ? '' : 's'} left`
      : statusLabel[retreat.status]

  const details = [
    next ? { label: 'Dates', value: formatRangeShort(next) + (upcoming.length > 1 ? ` (+${upcoming.length - 1} more)` : '') } : null,
    next ? { label: 'Length', value: `${nights(next)} nights` } : null,
    retreat.camp?.name ? { label: 'Stay', value: retreat.camp.name } : null,
    retreat.bus?.name ? { label: 'Transport', value: retreat.bus.name } : null,
    weather ? { label: weather.typical ? 'Usual weather' : 'Forecast', value: `${weather.high}° day, ${weather.low}° night` } : null,
    { label: 'Price', value: retreat.showPrice && retreat.price ? retreat.price : 'Ask on WhatsApp' },
  ].filter((d): d is { label: string; value: string } => Boolean(d))

  const titleSize = retreat.title.length > 40 ? f.title * 0.72 : retreat.title.length > 24 ? f.title * 0.85 : f.title
  const fonts = [
    display && { name: 'Newsreader', data: display, weight: 400 as const, style: 'normal' as const },
    body && { name: 'Figtree', data: body, weight: 500 as const, style: 'normal' as const },
  ].filter((x): x is NonNullable<typeof x> => Boolean(x))
  // If a font can't be downloaded, the renderer falls back to its built-in font.
  const serif = 'Newsreader'
  const sans = 'Figtree'

  return new ImageResponse(
    (
      <div style={{ width: f.width, height: f.height, display: 'flex', flexDirection: 'column', background: PINE, color: SAND, fontFamily: sans }}>
        {/* Photo */}
        <div style={{ position: 'relative', display: 'flex', width: f.width, height: f.photo }}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} width={f.width} height={f.photo} alt="" style={{ width: f.width, height: f.photo, objectFit: 'cover' }} />
          ) : (
            <div style={{ display: 'flex', width: f.width, height: f.photo, background: PINE_DARK }} />
          )}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: f.width,
              height: f.photo,
              display: 'flex',
              backgroundImage: `linear-gradient(180deg, rgba(27,53,45,.6) 0%, rgba(27,53,45,0) 26%, rgba(38,71,61,0) 58%, ${PINE} 100%)`,
            }}
          />
          <div style={{ position: 'absolute', top: f.pad, left: f.pad, right: f.pad, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <svg width={300} height={40} viewBox="0 -75.5 588.40 78.00">
              <path fill={SAND} d={LETTERS} />
              <path fill={AMBER} d={SUN} />
              <path fill={AMBER} fillOpacity={0.45} d={REFLECTION} />
            </svg>
            {retreat.status !== 'completed' && (
              <div
                style={{
                  display: 'flex',
                  padding: '12px 26px',
                  borderRadius: 999,
                  fontSize: 28,
                  background: retreat.status === 'almostFull' ? AMBER : isBookable(retreat) ? SAND : 'rgba(246,243,237,.25)',
                  color: isBookable(retreat) ? PINE : SAND,
                }}
              >
                {status}
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: `0 ${f.pad}px ${f.pad}px`, marginTop: formatName === 'story' ? -150 : -110 }}>
          <div style={{ display: 'flex', fontSize: formatName === 'story' ? 34 : 30, color: AMBER }}>{retreat.destination}</div>
          <div style={{ display: 'flex', marginTop: 14, fontFamily: serif, fontSize: titleSize, lineHeight: 1.02, letterSpacing: -2 }}>{retreat.title}</div>

          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: formatName === 'story' ? 56 : 40, borderTop: '2px solid rgba(246,243,237,.18)' }}>
            {details.map((d) => (
              <div
                key={d.label}
                style={{ display: 'flex', flexDirection: 'column', width: `${100 / f.columns}%`, paddingTop: 26, paddingBottom: 6, paddingRight: 24 }}
              >
                <div style={{ display: 'flex', fontSize: 24, color: 'rgba(246,243,237,.6)' }}>{d.label}</div>
                <div style={{ display: 'flex', marginTop: 6, fontSize: formatName === 'story' ? 36 : 30, lineHeight: 1.2 }}>{d.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', paddingTop: 32, gap: 36 }}>
            {qr && (
              <div style={{ display: 'flex', padding: 14, borderRadius: 28, background: SAND }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} width={f.qr} height={f.qr} alt="" />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontFamily: serif, fontSize: formatName === 'story' ? 52 : 44 }}>Scan to book</div>
              <div style={{ display: 'flex', marginTop: 10, fontSize: 26, color: 'rgba(246,243,237,.7)' }}>{pageUrl.replace(/^https?:\/\//, '')}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: f.width,
      height: f.height,
      fonts: fonts.length ? fonts : undefined,
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=86400',
        'Content-Disposition': `inline; filename="${retreat.slug}-${formatName}.png"`,
      },
    },
  )
}

/** Downloads a Google Font as TTF for the image renderer. Returns null if it can't, so a default font is used. */
async function googleFont(family: string, weight: number) {
  try {
    const css = await fetch(`https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}`, {
      next: { revalidate: 60 * 60 * 24 * 7 },
    }).then((r) => r.text())
    const url = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/)?.[1]
    if (!url) return null
    return await fetch(url, { next: { revalidate: 60 * 60 * 24 * 7 } }).then((r) => r.arrayBuffer())
  } catch {
    return null
  }
}

/** Fetches the cover photo up front, so a slow or missing photo never breaks the whole image. */
async function imageData(url: string | null) {
  if (!url) return null
  try {
    const res = await fetch(url, { next: { revalidate: 60 * 60 } })
    if (!res.ok) return null
    return `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`
  } catch {
    return null
  }
}
