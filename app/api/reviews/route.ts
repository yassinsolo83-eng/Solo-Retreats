import { NextResponse } from 'next/server'
import { sendReviewEmail } from '@/lib/notify'
import { writeClient } from '@/sanity/lib/write-client'

const clean = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

/** Saves a review as "waiting for approval". Nothing is public until you switch it on in the studio. */
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  if (clean(body.company, 100)) return NextResponse.json({ ok: true })

  const name = clean(body.name, 80)
  const quote = clean(body.quote, 600)
  const retreatId = clean(body.retreatId, 100)
  const rating = Math.round(Number(body.rating))
  if (name.length < 2 || quote.length < 20 || !retreatId || !(rating >= 1 && rating <= 5) || body.consent !== true) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 })
  }
  if (!writeClient) {
    console.error('SANITY_API_WRITE_TOKEN is not set; review was not saved.')
    return NextResponse.json({ ok: false }, { status: 503 })
  }

  try {
    const doc = await writeClient.create({
      _type: 'testimonial',
      approved: false,
      source: 'Website review form',
      name,
      rating,
      quote,
      retreat: { _type: 'reference', _ref: retreatId, _weak: true },
    })
    const retreat = await writeClient.fetch<string | null>('*[_id == $id][0].title', { id: retreatId })
    await sendReviewEmail({ name, rating, quote, retreatTitle: retreat ?? '', id: doc._id }).catch((e) => console.error('Could not send review email:', e))
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Could not save review:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
