import { revalidatePath, revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'
import { parseBody } from 'next-sanity/webhook'
import { SANITY_TAG } from '@/sanity/lib/client'

/**
 * Called by a Sanity webhook every time you publish, so changes show on the site
 * right away instead of after a minute. Needs SANITY_REVALIDATE_SECRET in Vercel,
 * matching the secret in the webhook settings.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) return NextResponse.json({ ok: false, error: 'SANITY_REVALIDATE_SECRET is not set' }, { status: 500 })

  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret)
    if (!isValidSignature) return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 })

    // Booking requests and reviews waiting for approval don't change any page.
    if (body?._type === 'bookingRequest') return NextResponse.json({ ok: true, skipped: true })

    revalidateTag(SANITY_TAG, { expire: 0 })
    revalidatePath('/', 'layout')
    return NextResponse.json({ ok: true, type: body?._type ?? null })
  } catch (error) {
    console.error('Revalidate webhook failed:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
