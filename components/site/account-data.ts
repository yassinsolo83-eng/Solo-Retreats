export type MyBooking = {
  id: string
  status: string
  statusLabel: string
  kind: 'booking' | 'waitlist'
  travelers?: number
  dates?: string
  retreatTitle?: string
  retreatId?: string
  retreatSlug?: string | null
  createdAt: string
}

export type Me =
  | { loggedIn: false }
  | { loggedIn: true; email: string; name: string; phone: string; bookings: MyBooking[] }

/** The open (not cancelled) request for a retreat, if this traveler already has one. */
export function activeFor(me: Me, retreatId: string, kind: string) {
  if (!me.loggedIn) return null
  return me.bookings.find((b) => b.retreatId === retreatId && b.kind === kind && b.status !== 'cancelled') ?? null
}

export async function fetchMe(): Promise<Me> {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' })
    return (await res.json()) as Me
  } catch {
    return { loggedIn: false }
  }
}

export async function signOut() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
  } catch {}
}
