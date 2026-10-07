'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { fetchMe, signOut, type Me } from './account-data'
import { PerksList, SigninForm } from './signin-form'
import { TextLink } from './text-link'
import { whatsappUrl } from '@/lib/whatsapp'

const pill: Record<string, string> = {
  confirmed: 'bg-pine text-sand',
  cancelled: 'bg-ink/10 text-stone',
}

export function AccountView({ perks, whatsappNumber }: { perks?: string[] | null; whatsappNumber?: string | null }) {
  const [me, setMe] = useState<Me | null>(null)
  const [notice, setNotice] = useState('')
  const [welcome, setWelcome] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('login') === 'expired') setNotice('That sign-in link has expired. Enter your email to get a new one.')
    if (params.get('login') === 'error') setNotice('Something went wrong signing you in. Please try again.')
    if (params.get('welcome')) setWelcome(true)
    fetchMe().then(setMe)
  }, [])

  if (!me) return <p className="text-stone" aria-busy="true">Loading…</p>

  if (!me.loggedIn) {
    return (
      <div className="grid max-w-3xl gap-10 rounded-[2rem] bg-dune p-6 sm:p-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-3xl">Sign in with your email</h2>
          <p className="mt-3 text-stone">No password. We email you a link and you are in. Signing in is optional; you can always book without it.</p>
          <div className="mt-6"><PerksList perks={perks} /></div>
        </div>
        <SigninForm next="/account" notice={notice} />
      </div>
    )
  }

  const wa = (text: string) => whatsappUrl(whatsappNumber, text)

  return (
    <div className="max-w-3xl">
      {welcome && <p role="status" className="mb-6 rounded-2xl bg-pine/10 px-4 py-3.5 text-pine">You're signed in. Welcome{me.name ? `, ${me.name.split(' ')[0]}` : ''}.</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 text-stone">
        <p>Signed in as <span className="text-ink">{me.email}</span></p>
        <button type="button" onClick={() => signOut().then(() => setMe({ loggedIn: false }))} className="text-clay underline underline-offset-4">Sign out</button>
      </div>

      <h2 className="mt-10 font-display text-4xl tracking-tight">Your requests</h2>
      {me.bookings.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-ink/20 px-6 py-12 text-center">
          <p className="font-display text-2xl">No requests yet</p>
          <p className="mt-2 text-stone">When you send a booking request while signed in, it shows up here.</p>
          <p className="mt-5"><TextLink href="/retreats">See upcoming retreats</TextLink></p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {me.bookings.map((b) => {
            const help = wa(`Hi Solo Retreats! About my ${b.kind === 'waitlist' ? 'waitlist spot' : 'request'} for ${b.retreatTitle ?? 'a retreat'}${b.dates ? ` (${b.dates})` : ''}.`)
            return (
              <li key={b.id} className="rounded-3xl bg-dune p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="font-display text-2xl">
                    {b.retreatSlug ? <Link href={`/retreats/${b.retreatSlug}`} className="hover:underline">{b.retreatTitle}</Link> : b.retreatTitle || 'Retreat'}
                  </h3>
                  <span className={`rounded-full px-3 py-1 text-sm ${pill[b.status] ?? 'bg-amber/30 text-ink'}`}>{b.statusLabel}</span>
                </div>
                <p className="mt-2 text-stone">
                  {[b.dates, b.travelers ? `${b.travelers} traveler${b.travelers > 1 ? 's' : ''}` : null, b.kind === 'waitlist' ? 'Waitlist' : null].filter(Boolean).join(' · ')}
                </p>
                {b.status === 'confirmed' && <p className="mt-3 text-sm text-stone">Your spot is confirmed.</p>}
                {b.status !== 'cancelled' && help && <p className="mt-4"><TextLink href={help}>Change or cancel on WhatsApp</TextLink></p>}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
