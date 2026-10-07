import { NextResponse } from 'next/server'
import { sessionFromRequest } from '@/lib/auth'
import { ACTIVE_STATUSES, asDraftId, newPrivateId } from '@/lib/customers'
import { sendBookingEmail } from '@/lib/notify'
import { writeClient } from '@/sanity/lib/write-client'

const clean = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

/**
 * Saves each booking request in the studio (Booking requests) and emails you about it.
 * Signing in is optional: a signed-in traveler's request is linked to their customer
 * record (so they can follow its status), a guest's is saved on its own as before.
 */
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
  const session = sessionFromRequest(request)

  // A signed-in traveler can have only one open request per retreat (and per type, so a
  // waitlist spot doesn't block booking once the trip opens). Changes go through WhatsApp.
  if (session && writeClient) {
    try {
      const hasActive = await writeClient.fetch<boolean>(
        `count(*[_type == "bookingRequest" && customer._ref == $id && retreat._ref == $retreat && kind == $kind && status in $statuses]) > 0`,
        { id: session.customerId, retreat: retreatId, kind: booking.kind, statuses: ACTIVE_STATUSES },
      )
      if (hasActive) return NextResponse.json({ ok: false, error: 'active_booking_exists' }, { status: 409 })
    } catch (error) {
      // Don't block a booking because this check failed; the request is still saved below.
      console.error('Could not check for an existing booking request:', error)
    }
  }

  const doc = {
    // Saved as a draft so the public Sanity dataset can't expose names and phone numbers.
    _id: newPrivateId(),
    _type: 'bookingRequest',
    status: 'new',
    ...booking,
    source,
    ...(session && { email: session.email, customer: { _type: 'reference', _ref: session.customerId, _weak: true } }),
    retreat: { _type: 'reference', _ref: retreatId, _weak: true },
  }

  // Save and email at the same time; one failing doesn't stop the other.
  const [saved, emailed] = await Promise.allSettled([
    writeClient ? writeClient.create(doc) : Promise.reject(new Error('SANITY_API_WRITE_TOKEN is not set')),
    sendBookingEmail(booking),
  ])

  if (saved.status === 'rejected') console.error('Could not save booking request:', saved.reason)
  if (emailed.status === 'rejected') console.error('Could not send booking email:', emailed.reason)

  // Keep the customer record up to date. Never allowed to fail the booking itself.
  if (session && writeClient && saved.status === 'fulfilled') {
    try {
      await writeClient
        .patch(asDraftId(session.customerId))
        .setIfMissing({ bookingsCount: 0 })
        .inc({ bookingsCount: 1 })
        .set({ name, phone, lastBookingAt: new Date().toISOString() })
        .commit()
    } catch (error) {
      console.error('Could not update the customer record (the request itself was saved):', error)
    }
  }

  const ok = saved.status === 'fulfilled' || emailed.status === 'fulfilled'
  return NextResponse.json({ ok }, { status: ok ? 200 : 500 })
}
