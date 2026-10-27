import { NextResponse } from 'next/server'
import { newPrivateId } from '@/lib/customers'
import { sendPartnerRequestEmail } from '@/lib/notify'
import { writeClient } from '@/sanity/lib/write-client'

const clean = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '')
const kinds = ['camp', 'transport', 'workshop', 'activity', 'other']

/** Saves a partner application in the studio (Partner requests, private) and emails you about it. */
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  // Bots fill the hidden "company" field; pretend it worked.
  if (clean(body.company, 100)) return NextResponse.json({ ok: true })

  const kind = kinds.includes(String(body.kind)) ? String(body.kind) : 'other'
  const name = clean(body.name, 100)
  const business = clean(body.business, 120)
  const phone = clean(body.phone, 30)
  const email = clean(body.email, 120)
  const link = clean(body.link, 200)
  const message = clean(body.message, 1500)
  if (name.length < 2 || business.length < 2 || phone.replace(/\D/g, '').length < 8 || message.length < 20) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
  }

  const [saved, emailed] = await Promise.allSettled([
    writeClient
      ? // Saved as a draft so names and phone numbers are not readable from the public dataset.
        writeClient.create({ _id: newPrivateId(), _type: 'partnerRequest', status: 'new', kind, name, business, phone, email, link, message })
      : Promise.reject(new Error('SANITY_API_WRITE_TOKEN is not set')),
    sendPartnerRequestEmail({ kind, name, business, phone, email, link, message }),
  ])
  if (saved.status === 'rejected') console.error('Could not save partner request:', saved.reason)
  if (emailed.status === 'rejected') console.error('Could not send partner request email:', emailed.reason)

  const ok = saved.status === 'fulfilled' || emailed.status === 'fulfilled'
  return NextResponse.json({ ok }, { status: ok ? 200 : 500 })
}
