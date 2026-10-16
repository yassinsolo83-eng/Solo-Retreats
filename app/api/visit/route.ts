import { NextResponse } from 'next/server'
import { VISITOR_COUNTER_ID } from '@/lib/visitors'
import { writeClient } from '@/sanity/lib/write-client'

const COOKIE = 'solo_v'
const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse|monitor|curl|wget/i

/** Counts a browser once. The browser remembers it with a cookie, so repeat visits cost nothing. */
export async function POST(request: Request) {
  const response = NextResponse.json({ ok: true })
  if (request.headers.get('cookie')?.includes(`${COOKIE}=`)) return response
  if (BOT.test(request.headers.get('user-agent') ?? '')) return response
  if (!writeClient) return response

  try {
    await writeClient
      .transaction()
      .createIfNotExists({ _id: VISITOR_COUNTER_ID, _type: 'visitorCounter', count: 0 })
      .patch(VISITOR_COUNTER_ID, (p) => p.inc({ count: 1 }))
      .commit()
    // Only remember the visitor once the count really went up.
    response.cookies.set(COOKIE, '1', { maxAge: 60 * 60 * 24 * 365, path: '/', sameSite: 'lax', httpOnly: false })
  } catch (error) {
    console.error('Could not count the visit:', error)
  }
  return response
}
