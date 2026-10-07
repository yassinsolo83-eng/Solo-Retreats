import { NextResponse } from 'next/server'
import { sessionFromRequest } from '@/lib/auth'
import { asDraftId, guestStatusLabel } from '@/lib/customers'
import { writeClient } from '@/sanity/lib/write-client'

type CustomerDoc = { name?: string; phone?: string; email?: string }
type BookingDoc = {
  id: string; status: string; kind: string; travelers?: number; dates?: string
  retreatTitle?: string; retreatId?: string; retreatSlug?: string | null; createdAt: string
}

/**
 * Who is signed in (if anyone) and their booking requests. With no cookie this answers
 * straight away without touching Sanity, so ordinary visitors cost no API requests.
 */
export async function GET(request: Request) {
  const session = sessionFromRequest(request)
  if (!session || !writeClient) return NextResponse.json({ loggedIn: false })

  try {
    const [customer, bookings] = await Promise.all([
      writeClient.fetch<CustomerDoc | null>(`*[_id == $id][0]{ name, phone, email }`, { id: asDraftId(session.customerId) }),
      writeClient.fetch<BookingDoc[]>(
        `*[_type == "bookingRequest" && customer._ref == $id] | order(_createdAt desc)[0...50]{
          "id": _id, status, kind, travelers, dates, retreatTitle,
          "retreatId": retreat._ref,
          "retreatSlug": *[_type == "retreat" && _id == ^.retreat._ref][0].slug.current,
          "createdAt": _createdAt
        }`,
        { id: session.customerId },
      ),
    ])
    if (!customer) return NextResponse.json({ loggedIn: false })

    return NextResponse.json(
      {
        loggedIn: true,
        email: customer.email || session.email,
        name: customer.name || '',
        phone: customer.phone || '',
        bookings: bookings.map((b) => ({ ...b, statusLabel: guestStatusLabel(b.status, b.kind) })),
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) {
    console.error('Could not load the signed-in customer:', error)
    return NextResponse.json({ loggedIn: false })
  }
}
