import { NextResponse } from 'next/server'
import { asDraftId } from '@/lib/customers'
import { sendBookingStatusEmail } from '@/lib/mailer'
import { siteUrl } from '@/lib/site'
import { writeClient } from '@/sanity/lib/write-client'

type Doc = { _id: string; status?: string; email?: string; name?: string; retreatTitle?: string; dates?: string; travelers?: number; seats?: number[]; notifiedStatus?: string }

/**
 * Emails the traveler about their request's current status (Confirmed or Cancelled).
 * Called by the "Email customer" button in the Studio. The request id is a random draft id,
 * and the email only goes to the address saved on that request, so nothing can be sent anywhere else.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { id?: unknown }
  const id = typeof body.id === 'string' ? body.id.slice(0, 100) : ''
  if (!id || !writeClient) return NextResponse.json({ ok: false, message: 'Not available.' }, { status: 400 })

  const draftId = asDraftId(id)
  const doc = await writeClient.fetch<Doc | null>(`*[_id == $id && _type == "bookingRequest"][0]`, { id: draftId })
  if (!doc) return NextResponse.json({ ok: false, message: 'Request not found.' }, { status: 404 })
  if (!doc.email) return NextResponse.json({ ok: false, message: 'This traveler booked without signing in, so there is no email on file. Message them on WhatsApp instead.' })
  if (doc.status !== 'confirmed' && doc.status !== 'cancelled') return NextResponse.json({ ok: false, message: 'Set the status to Confirmed or Cancelled first.' })
  if (doc.notifiedStatus === doc.status) return NextResponse.json({ ok: false, message: `An email for "${doc.status}" was already sent to ${doc.email}.` })

  const sent = await sendBookingStatusEmail(doc.email, {
    name: doc.name || '',
    status: doc.status,
    retreatTitle: doc.retreatTitle,
    dates: doc.dates,
    travelers: doc.travelers,
    seats: doc.seats,
    accountUrl: `${siteUrl}/account`,
  })
  if (!sent) return NextResponse.json({ ok: false, message: 'The email could not be sent. Check the Gmail settings in Vercel.' })

  await writeClient.patch(draftId).set({ notifiedStatus: doc.status }).commit().catch((e) => console.error('Could not save notifiedStatus:', e))
  return NextResponse.json({ ok: true, message: `Email sent to ${doc.email}.` })
}
