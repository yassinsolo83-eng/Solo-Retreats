'use client'

import { useState } from 'react'

const field = 'w-full rounded-2xl border border-ink/15 bg-sand px-4 py-3.5 text-base text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20'

/** Email-only sign-in. Sends a link; there is no password. `next` is where the link brings them back to. */
export function SigninForm({ next, notice }: { next: string; notice?: string }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const [trap, setTrap] = useState('')

  // A div, not a form: this also sits inside the booking form, and forms can't be nested.
  async function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setState('error')
      setMessage('Enter a valid email address.')
      return
    }
    setState('sending')
    try {
      const res = await fetch('/api/auth/request-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), next, company: trap }),
      })
      if (res.status === 429) {
        setState('error')
        setMessage('Too many attempts. Please wait a few minutes and try again.')
        return
      }
      if (!res.ok) throw new Error(String(res.status))
      setState('sent')
    } catch {
      setState('error')
      setMessage("We couldn't send the link. Please try again, or just send your request without signing in.")
    }
  }

  if (state === 'sent') {
    return (
      <p role="status" className="rounded-2xl bg-pine/10 px-4 py-3.5 text-sm text-pine">
        Check your inbox for a sign-in link from us. It works for 15 minutes. If you can't see it, look in spam.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }}>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Your email
        <input className={field} type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={150} />
      </label>
      <input type="text" value={trap} onChange={(e) => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {notice && state === 'idle' && <p role="alert" className="rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{notice}</p>}
      {state === 'error' && <p role="alert" className="rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{message}</p>}
      <button type="button" onClick={submit} disabled={state === 'sending'} className="flex min-h-12 items-center justify-center rounded-full bg-pine px-6 text-sm font-semibold text-sand transition hover:bg-pine-dark disabled:opacity-60">
        {state === 'sending' ? 'Sending…' : 'Email me a sign-in link'}
      </button>
    </div>
  )
}

/** The reasons to sign in. The basics are always true; extra perks come from the Studio. */
export function PerksList({ perks }: { perks?: string[] | null }) {
  const items = ['Follow the status of your requests', "Your name and phone filled in next time", ...(perks ?? [])]
  return (
    <ul className="grid gap-1.5 text-sm text-stone">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span aria-hidden="true" className="w-3 shrink-0 text-clay">✓</span>
          {item}
        </li>
      ))}
    </ul>
  )
}
