import { NextResponse } from 'next/server'
import { SEAT_STATUSES } from '@/lib/seats'
import { writeClient } from '@/sanity/lib/write-client'

export const dynamic = 'force-dynamic'

/** Seat numbers already taken on one trip. Only numbers are returned, never names. */
export async function GET(request: Request) {
  const retreat = new URL(request.url).searchParams.get('retreat')?.slice(0, 100)
  if (!retreat || !writeClient) return NextResponse.json({ taken: [] })
  try {
    const taken = await writeClient.fetch<number[]>(
      `*[_type == "bookingRequest" && retreat._ref == $retreat && kind == "booking" && status in $statuses].seats[]`,
      { retreat, statuses: SEAT_STATUSES },
    )
    return NextResponse.json({ taken: [...new Set(taken ?? [])].sort((a, b) => a - b) })
  } catch (error) {
    console.error('Could not read taken seats:', error)
    return NextResponse.json({ taken: [] })
  }
}
