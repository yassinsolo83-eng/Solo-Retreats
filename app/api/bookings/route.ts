import { NextResponse } from 'next/server'
import { sendBookingEmail } from '@/lib/notify'
import { writeClient } from '@/sanity/lib/write-client'

const clean = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

/** Saves each booking request in the studio (Booking requests) and emails you about it. */
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }

  // Bots fill the hidden "company" field; pretend it worked.
  if (clean(body.company, 100)) return NextResponse.json({ ok: true })

  const name = clean(body.name, 100)
  const phone = clean(body.phone, 30)
  const retreatId = clean(body.retreatId, 100)
  if (name.length < 2 || phone.replace(/\D/g, '').length < 8 || !retreatId) {
    return NextResponse.json({ ok: false, error: 'Missing name, phone or retreat' }, { status: 400 })
  }

  const booking = {
    kind: (body.kind === 'waitlist' ? 'waitlist' : 'booking') as 'booking' | 'waitlist',
    name,
    phone,
    travelers: Math.min(20, Math.max(1, Math.round(Number(body.travelers) || 1))),
    retreatTitle: clean(body.retreatTitle, 150),
    dates: clean(body.dates, 100),
    message: clean(body.message, 1000),
  }
  const source = clean(body.source, 120)

  // Save and email at the same time; one failing doesn't stop the other.
  const [saved, emailed] = await Promise.allSettled([
    writeClient
      ? writeClient.create({
          _type: 'bookingRequest',
          status: 'new',
          ...booking,
          source,
          retreat: { _type: 'reference', _ref: retreatId, _weak: true },
        })
      : Promise.reject(new Error('SANITY_API_WRITE_TOKEN is not set')),
    sendBookingEmail(booking),
  ])

  if (saved.status === 'rejected') console.error('Could not save booking request:', saved.reason)
  if (emailed.status === 'rejected') console.error('Could not send booking email:', emailed.reason)

  const ok = saved.status === 'fulfilled' || emailed.status === 'fulfilled'
  return NextResponse.json({ ok }, { status: ok ? 200 : 500 })
}
