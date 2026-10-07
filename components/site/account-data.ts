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

// Set at sign-in, cleared at sign-out. Must match SIGNED_IN_FLAG_NAME in lib/auth.ts.
const FLAG = 'solo_in'

/** True when this browser may be signed in. False means we can skip asking the server. */
export const maybeSignedIn = () => typeof document !== 'undefined' && document.cookie.split('; ').some((c) => c.startsWith(`${FLAG}=`))

const clearFlag = () => {
  document.cookie = `${FLAG}=; path=/; max-age=0`
}

export async function fetchMe(): Promise<Me> {
  // Most visitors aren't signed in: answer straight away instead of waiting on the server.
  if (!maybeSignedIn()) return { loggedIn: false }
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' })
    const me = (await res.json()) as Me
    // The session ran out or was removed: forget the marker so the next visit is instant.
    if (!me.loggedIn) clearFlag()
    return me
  } catch {
    return { loggedIn: false }
  }
}

export async function signOut() {
  clearFlag()
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
  } catch {}
}
