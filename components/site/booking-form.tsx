'use client'

import { TextLink } from './text-link'
import { useEffect, useState } from 'react'
import { activeFor, fetchMe, signOut, type Me } from './account-data'
import { PerksList, SigninForm } from './signin-form'
import { formatDeparture } from '@/lib/dates'
import { track } from '@/lib/analytics'
import { getAttribution } from '@/lib/attribution'
import type { Departure } from '@/lib/types'
import { bookingMessage, whatsappUrl } from '@/lib/whatsapp'
import { WhatsAppIcon } from './icons'

type Props = {
  retreatId: string
  retreatTitle: string
  departures: Departure[]
  kind: 'booking' | 'waitlist'
  whatsappNumber?: string | null
  pageUrl: string
  /** Path of this page, so a sign-in link brings the traveler back here. */
  pagePath: string
  perks?: string[] | null
  /** Most people one request can include; set per retreat in Studio. */
  maxTravelers?: number | null
}

const field = 'w-full rounded-2xl border border-ink/15 bg-sand px-4 py-3.5 text-base text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20'

export function BookingForm({ retreatId, retreatTitle, departures, kind, whatsappNumber, pageUrl, pagePath, perks, maxTravelers }: Props) {
  const maxPeople = Math.min(20, Math.max(1, maxTravelers ?? 10))
  const [departureKey, setDepartureKey] = useState(departures[0]?._key ?? '')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [travelers, setTravelers] = useState(1)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sentWithoutWhatsapp, setSentWithoutWhatsapp] = useState(false)
  const [me, setMe] = useState<Me | null>(null)
  const [sending, setSending] = useState(false)

  // Signing in is optional. When someone is signed in we fill in their details and stop a
  // second open request for the same retreat. Without the cookie this costs no API request.
  useEffect(() => {
    fetchMe().then((data) => {
      setMe(data)
      if (data.loggedIn) {
        setName((current) => current || data.name)
        setPhone((current) => current || data.phone)
      }
    })
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const honeypot = new FormData(event.currentTarget).get('company')
    if (name.trim().length < 2) return setError('Add your name so we know who to reply to.')
    if (phone.replace(/\D/g, '').length < 8) return setError('Add a phone number we can reach you on.')
    setError('')

    const departure = departures.find((d) => d._key === departureKey)
    const dates = departure ? formatDeparture(departure) : undefined
    const payload = { kind, retreatId, retreatTitle, dates, name: name.trim(), phone: phone.trim(), travelers, message: message.trim(), company: honeypot }
    track(kind === 'waitlist' ? 'waitlist_request' : 'booking_request', { retreat: retreatTitle, travelers })

    // Keep a copy in the studio. keepalive lets the request finish while WhatsApp opens.
    const save = () => fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, source: getAttribution() }), keepalive: true })

    if (me?.loggedIn) {
      // Wait for the answer so a duplicate request is caught before WhatsApp opens.
      // Any other failure is ignored: the WhatsApp message is what matters to the traveler.
      setSending(true)
      try {
        const res = await save()
        if (res.status === 409) {
          setMe(await fetchMe())
          setSending(false)
          return
        }
      } catch {}
    } else {
      save().catch(() => {})
    }

    const url = whatsappUrl(whatsappNumber, bookingMessage({ ...payload, link: pageUrl }))
    if (url) window.location.href = url
    else setSentWithoutWhatsapp(true)
    setSending(false)
  }

  if (sentWithoutWhatsapp) {
    return (
      <div className="rounded-3xl bg-sand p-8 text-center">
        <p className="font-display text-3xl">Request sent</p>
        <p className="mt-3 text-stone">Thanks, {name.split(' ')[0]}. We'll call or message you on {phone} soon.</p>
      </div>
    )
  }

  const open = me ? activeFor(me, retreatId, kind) : null
  if (open) {
    const change = whatsappUrl(whatsappNumber, `Hi Solo Retreats! About my ${kind === 'waitlist' ? 'waitlist spot' : 'request'} for ${retreatTitle}.`)
    return (
      <div className="rounded-3xl bg-sand p-6">
        <p className="text-sm text-stone">You already have a {kind === 'waitlist' ? 'waitlist spot' : 'request'} for this retreat</p>
        <p className="mt-1 font-display text-3xl">{open.statusLabel}</p>
        {open.dates && <p className="mt-2 text-stone">{open.dates}{open.travelers ? ` · ${open.travelers} traveler${open.travelers > 1 ? 's' : ''}` : ''}</p>}
        <div className="mt-5 flex flex-col gap-3">
          {change && <a href={change} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-pine px-6 text-sm font-semibold text-sand transition hover:bg-pine-dark"><WhatsAppIcon /> Change it on WhatsApp</a>}
          <TextLink href="/account">See all my requests</TextLink>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {me?.loggedIn && (
        <p className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-sand px-4 py-3 text-sm text-stone">
          <span>Signed in as <span className="text-ink">{me.email}</span></span>
          <button type="button" onClick={() => signOut().then(() => setMe({ loggedIn: false }))} className="text-clay underline underline-offset-4">Sign out</button>
        </p>
      )}
      {me && !me.loggedIn && (
        <details className="group rounded-2xl bg-sand px-4 py-3.5">
          <summary className="cursor-pointer list-none text-sm font-medium [&::-webkit-details-marker]:hidden">
            Sign in (optional) <span className="font-normal text-stone">to follow your request and skip retyping</span>
          </summary>
          <div className="mt-4 flex flex-col gap-4">
            <PerksList perks={perks} />
            <SigninForm next={pagePath} />
          </div>
        </details>
      )}
      {departures.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Choose your dates</legend>
          <div className="flex flex-col gap-2">
            {departures.map((d) => (
              <label key={d._key} className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 transition ${departureKey === d._key ? 'border-pine bg-pine text-sand' : 'border-ink/15 bg-sand hover:border-ink/40'}`}>
                <span className="flex items-center gap-3">
                  <input type="radio" name="departure" value={d._key} checked={departureKey === d._key} onChange={() => setDepartureKey(d._key)} className="sr-only" />
                  <span>{formatDeparture(d)}</span>
                </span>
                {d.note && <span className={`text-sm ${departureKey === d._key ? 'text-sand/75' : 'text-stone'}`}>{d.note}</span>}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {departures.length === 1 && (
        <p className="rounded-2xl bg-sand px-4 py-3.5 text-ink"><span className="text-stone">Dates: </span>{formatDeparture(departures[0])}</p>
      )}

      <label className="flex flex-col gap-2 text-sm font-medium">
        Your name
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Phone number
        <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="01x xxxx xxxx" required />
      </label>
      <div className="flex flex-col gap-2 text-sm font-medium">
        <span id="travelers-label">How many people?</span>
        <div className="flex items-center gap-3" role="group" aria-labelledby="travelers-label">
          <button type="button" aria-label="Fewer people" onClick={() => setTravelers(Math.max(1, travelers - 1))} className="size-12 rounded-full border border-ink/15 bg-sand text-xl disabled:opacity-40" disabled={travelers <= 1}>−</button>
          <output aria-live="polite" className="min-w-24 text-center text-base">{travelers === 1 ? 'Just me' : `${travelers} people`}</output>
          <button type="button" aria-label="More people" onClick={() => setTravelers(Math.min(maxPeople, travelers + 1))} className="size-12 rounded-full border border-ink/15 bg-sand text-xl disabled:opacity-40" disabled={travelers >= maxPeople}>+</button>
        </div>
      </div>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Anything we should know? <span className="font-normal text-stone">(optional)</span>
        <textarea className={`${field} resize-none`} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      {/* Spam trap: hidden from people, bots fill it in */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {error && <p role="alert" className="rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

      <button type="submit" disabled={sending} className="mt-2 flex min-h-14 items-center justify-center gap-2 rounded-full bg-pine px-6 font-semibold text-sand transition hover:bg-pine-dark disabled:opacity-60">
        <WhatsAppIcon />
        {kind === 'waitlist' ? 'Join the waitlist on WhatsApp' : 'Send booking request on WhatsApp'}
      </button>
      <p className="text-center text-sm text-stone">
        {kind === 'waitlist' ? "We'll message you if a spot opens up or when we run this trip again." : "WhatsApp opens with your details filled in. We'll reply with the price and next steps."}
      </p>
      <p className="text-center text-xs text-stone">
        By sending a request you agree to our <TextLink href="/terms" arrow={false}>booking terms</TextLink> and <TextLink href="/privacy" arrow={false}>privacy policy</TextLink>.
      </p>
    </form>
  )
}
