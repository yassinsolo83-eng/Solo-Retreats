import 'server-only'
import { siteUrl } from './site'

type Booking = {
  kind: 'booking' | 'waitlist'
  name: string
  phone: string
  travelers: number
  retreatTitle: string
  dates: string
  message: string
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Turns "01001234567" or "+20 100 123 4567" into "201001234567" for a wa.me link. */
function toWhatsAppNumber(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.startsWith('0') && digits.length === 11) return `2${digits}`
  return digits
}

/**
 * Emails a new booking request to you through Resend.
 * Needs RESEND_API_KEY and BOOKING_NOTIFY_EMAIL in Vercel. Does nothing if they're missing.
 */
export async function sendBookingEmail(b: Booking) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.BOOKING_NOTIFY_EMAIL
  if (!apiKey || !to) return

  const from = process.env.BOOKING_FROM_EMAIL || 'Solo Retreats <onboarding@resend.dev>'
  const wa = `https://wa.me/${toWhatsAppNumber(b.phone)}?text=${encodeURIComponent(`Hi ${b.name.split(' ')[0]}, this is Solo Retreats about your request for ${b.retreatTitle}.`)}`
  const label = b.kind === 'waitlist' ? 'Waitlist request' : 'Booking request'
  const rows: [string, string][] = [
    ['Retreat', b.retreatTitle],
    ['Dates', b.dates || '—'],
    ['Travelers', String(b.travelers)],
    ['Name', b.name],
    ['Phone', b.phone],
    ['Message', b.message || '—'],
  ]

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#24332d">
    <p style="margin:0 0 4px;color:#8f5526;font-size:13px">${label}</p>
    <h1 style="margin:0 0 20px;font-size:24px;font-weight:600">${escape(b.name)} · ${escape(b.retreatTitle)}</h1>
    <table style="width:100%;border-collapse:collapse;font-size:15px">
      ${rows.map(([k, v]) => `<tr><td style="padding:8px 0;color:#5f6b64;width:110px;vertical-align:top">${k}</td><td style="padding:8px 0">${escape(v).replace(/\n/g, '<br>')}</td></tr>`).join('')}
    </table>
    <p style="margin:24px 0 8px">
      <a href="${wa}" style="display:inline-block;background:#26473d;color:#f6f3ed;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:600">Message on WhatsApp</a>
      &nbsp;
      <a href="tel:${escape(b.phone)}" style="color:#26473d">Call</a>
    </p>
    <p style="margin:20px 0 0;font-size:13px;color:#5f6b64">
      They may not have sent the WhatsApp message yet. All requests are in the <a href="${siteUrl}/studio" style="color:#26473d">studio</a> under Booking requests.
    </p>
  </div>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: to.split(',').map((e) => e.trim()),
      subject: `${label}: ${b.name} · ${b.retreatTitle}`,
      html,
    }),
  })
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${await res.text()}`)
}
