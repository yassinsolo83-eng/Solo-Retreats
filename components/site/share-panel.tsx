'use client'

import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { Check, Download, Link2, Share2 } from 'lucide-react'

const PINE = '#26473d'
const SAND = '#f6f3ed'

export function SharePanel({ url, title, subtitle }: { url: string; title: string; subtitle?: string }) {
  const [qr, setQr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator)
    QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: PINE, light: SAND } }).then(setQr).catch(() => setQr(null))
  }, [url])

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  async function share() {
    try { await navigator.share({ title, text: subtitle, url }) } catch {}
  }

  /** Builds a 1080×1920 story image: title, dates, QR code and link. */
  async function downloadStory() {
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1920
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    await document.fonts?.ready
    ctx.fillStyle = PINE
    ctx.fillRect(0, 0, 1080, 1920)

    ctx.fillStyle = '#d69c55'
    ctx.font = '500 40px Figtree, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Solo Retreats', 540, 250)

    ctx.fillStyle = SAND
    ctx.font = '400 104px Newsreader, Georgia, serif'
    wrap(ctx, title, 540, 420, 900, 112)

    if (subtitle) {
      ctx.font = '400 42px Figtree, sans-serif'
      ctx.fillStyle = 'rgba(246,243,237,.8)'
      ctx.fillText(subtitle, 540, 760)
    }

    const qrCanvas = document.createElement('canvas')
    await QRCode.toCanvas(qrCanvas, url, { margin: 2, width: 640, color: { dark: PINE, light: SAND } })
    roundRect(ctx, 200, 860, 680, 680, 40)
    ctx.fillStyle = SAND
    ctx.fill()
    ctx.drawImage(qrCanvas, 220, 880, 640, 640)

    ctx.fillStyle = SAND
    ctx.font = '500 44px Figtree, sans-serif'
    ctx.fillText('Scan to book', 540, 1650)
    ctx.font = '400 32px Figtree, sans-serif'
    ctx.fillStyle = 'rgba(246,243,237,.7)'
    ctx.fillText(url.replace(/^https?:\/\//, ''), 540, 1710)

    const link = document.createElement('a')
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-qr.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const button = 'inline-flex min-h-11 items-center gap-2 rounded-full border border-ink/15 px-4 text-sm transition hover:bg-dune'

  return (
    <div className="grid items-center gap-6 rounded-3xl border border-ink/10 p-5 sm:grid-cols-[140px_1fr] sm:p-6">
      <div className="mx-auto size-[140px] overflow-hidden rounded-2xl bg-dune">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {qr && <img src={qr} alt={`QR code that opens the ${title} page`} className="size-full" />}
      </div>
      <div>
        <p className="font-display text-2xl">Share this retreat</p>
        <p className="mt-1 text-sm text-stone">Send the link, or save the QR code as a story-sized image.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {canShare && <button type="button" onClick={share} className={button}><Share2 className="size-4" /> Share</button>}
          <button type="button" onClick={copy} className={button}>
            {copied ? <Check className="size-4" /> : <Link2 className="size-4" />} {copied ? 'Link copied' : 'Copy link'}
          </button>
          <button type="button" onClick={downloadStory} className={button}><Download className="size-4" /> Download QR</button>
        </div>
      </div>
    </div>
  )
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ')
  let line = ''
  let offset = 0
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y + offset)
      line = word
      offset += lineHeight
    } else line = test
  }
  ctx.fillText(line, x, y + offset)
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
