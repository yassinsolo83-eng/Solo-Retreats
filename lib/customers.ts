import 'server-only'
import crypto from 'crypto'

// Customers and booking requests are saved as DRAFT documents. The free Sanity plan only
// has public datasets, where anyone who knows the project ID can read every published
// document. Drafts can only be read with a token, so names, phones and emails stay private.
// The Studio still lists and edits drafts normally.
//
// When this moves to Supabase, this file and the API routes are the only things to change.

export const DRAFT = 'drafts.'

/** A new random draft id for a booking request. */
export const newPrivateId = () => `${DRAFT}${crypto.randomUUID()}`

/** One customer per email address, so the id is derived from the email and never duplicates. */
export function customerIdFor(email: string) {
  return `customer-${crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 32)}`
}

/** The stored (draft) id for an id without the drafts. prefix. */
export const asDraftId = (id: string) => (id.startsWith(DRAFT) ? id : `${DRAFT}${id}`)

/** Requests in these states count as "open" for the one-request-per-retreat rule. */
export const ACTIVE_STATUSES = ['new', 'contacted', 'confirmed']

// The Studio uses four statuses; a traveler only ever sees these simpler labels.
export function guestStatusLabel(status: string, kind: string) {
  if (status === 'confirmed') return 'Confirmed'
  if (status === 'cancelled') return 'Cancelled'
  return kind === 'waitlist' ? 'On the waitlist' : 'Under review'
}
