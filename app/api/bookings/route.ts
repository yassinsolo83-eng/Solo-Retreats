import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/write-client'

const clean = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

/** Saves a copy of each booking request in the studio (Booking requests). */
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

  if (!writeClient) {
    console.warn('SANITY_API_WRITE_TOKEN is not set; booking request was not saved.')
    return NextResponse.json({ ok: false, error: 'Saving is not configured' }, { status: 503 })
  }

  const travelers = Math.min(20, Math.max(1, Math.round(Number(body.travelers) || 1)))
  try {
    await writeClient.create({
      _type: 'bookingRequest',
      status: 'new',
      kind: body.kind === 'waitlist' ? 'waitlist' : 'booking',
      name,
      phone,
      travelers,
      retreat: { _type: 'reference', _ref: retreatId, _weak: true },
      retreatTitle: clean(body.retreatTitle, 150),
      dates: clean(body.dates, 100),
      message: clean(body.message, 1000),
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Could not save booking request:', error)
    return NextResponse.json({ ok: false, error: 'Could not save' }, { status: 500 })
  }
}
