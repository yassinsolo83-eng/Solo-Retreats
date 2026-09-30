'use client'

import { useEffect, useState } from 'react'
import { Check, Download, Link2, Loader2, Share2 } from 'lucide-react'
import { track } from '@/lib/analytics'

type Format = 'story' | 'post'
const FORMATS: { value: Format; label: string; hint: string }[] = [
  { value: 'story', label: 'Story', hint: 'For WhatsApp status and Instagram stories' },
  { value: 'post', label: 'Post', hint: 'For Instagram and Facebook posts' },
]

/**
 * Share box on the retreat page: send the link, or share/download a ready-made
 * image with the photo, dates, stay, transport, weather, price and a QR code.
 */
export function SharePanel({ url, title, subtitle, imagePath }: { url: string; title: string; subtitle?: string; imagePath: string }) {
  const [format, setFormat] = useState<Format>('story')
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)
  const [busy, setBusy] = useState(false)
  const [loaded, setLoaded] = useState<Record<Format, boolean>>({ story: false, post: false })
  const src = `${imagePath}?format=${format}`
  const fileName = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${format}.png`

  useEffect(() => setCanShare(typeof navigator !== 'undefined' && 'share' in navigator), [])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      track('share', { method: 'copy_link', retreat: title })
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  async function shareLink() {
    try {
      await navigator.share({ title, text: subtitle, url })
      track('share', { method: 'native', retreat: title })
    } catch {}
  }

  /** Phones: opens the share sheet with the image attached. Elsewhere: downloads it. */
  async function shareImage(forceDownload = false) {
    setBusy(true)
    try {
      const blob = await fetch(src).then((r) => {
        if (!r.ok) throw new Error('Image failed')
        return r.blob()
      })
      const file = new File([blob], fileName, { type: 'image/png' })
      if (!forceDownload && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: `${title}\n${url}` })
          track('share', { method: 'image', format, retreat: title })
        } catch {}
        return
      }
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      link.click()
      setTimeout(() => URL.revokeObjectURL(link.href), 5000)
      track('share_image_download', { format, retreat: title })
    } catch {
      window.open(src, '_blank')
    } finally {
      setBusy(false)
    }
  }

  const button = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink/15 px-4 text-sm transition hover:bg-dune disabled:opacity-60'

  return (
    <div className="rounded-3xl border border-ink/10 p-5 sm:p-6">
      <p className="font-display text-2xl">Share this retreat</p>
      <p className="mt-1 text-sm text-stone">Send the link, or post a ready-made image with all the details and a QR code.</p>

      <div className="mt-5 flex gap-2" role="radiogroup" aria-label="Image size">
        {FORMATS.map((f) => (
          <button
            key={f.value}
            type="button"
            role="radio"
            aria-checked={format === f.value}
            title={f.hint}
            onClick={() => setFormat(f.value)}
            className={`min-h-9 rounded-full px-4 text-sm transition ${format === f.value ? 'bg-pine text-sand' : 'bg-dune hover:bg-dune-deep'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => shareImage()}
        className={`relative mx-auto mt-4 block overflow-hidden rounded-2xl bg-pine shadow-[0_12px_30px_-12px_rgba(36,51,45,.45)] ${format === 'story' ? 'w-[62%]' : 'w-[82%]'}`}
        aria-label={`Share the ${format} image`}
      >
        <span className={`block w-full ${format === 'story' ? 'aspect-[9/16]' : 'aspect-[4/5]'}`} aria-hidden="true" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={src}
          src={src}
          alt={`Share image for ${title}`}
          loading="lazy"
          onLoad={() => setLoaded((l) => ({ ...l, [format]: true }))}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${loaded[format] ? 'opacity-100' : 'opacity-0'}`}
        />
        {!loaded[format] && <Loader2 className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 animate-spin text-sand/70" aria-hidden="true" />}
      </button>
      <p className="mt-3 text-center text-xs text-stone">{FORMATS.find((f) => f.value === format)?.hint}</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => shareImage()} disabled={busy} className={`${button} col-span-2 border-pine bg-pine font-semibold text-sand hover:bg-pine-dark`}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Share2 className="size-4" />} {canShare ? 'Share image' : 'Download image'}
        </button>
        {canShare ? (
          <>
            <button type="button" onClick={shareLink} className={button}><Link2 className="size-4" /> Share link</button>
            <button type="button" onClick={() => shareImage(true)} disabled={busy} className={button}><Download className="size-4" /> Save image</button>
          </>
        ) : (
          <button type="button" onClick={copy} className={`${button} col-span-2`}>
            {copied ? <Check className="size-4" /> : <Link2 className="size-4" />} {copied ? 'Link copied' : 'Copy link'}
          </button>
        )}
      </div>
    </div>
  )
}
