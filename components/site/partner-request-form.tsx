'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'

const field = 'w-full rounded-2xl border border-ink/15 bg-sand px-4 py-3.5 text-base text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20'
const kinds = [
  { value: 'workshop', label: 'Workshop or class' },
  { value: 'activity', label: 'Activity or experience' },
  { value: 'camp', label: 'Camp or stay' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Something else' },
]

export function PartnerRequestForm() {
  const [kind, setKind] = useState('workshop')
  const [name, setName] = useState('')
  const [business, setBusiness] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [link, setLink] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (name.trim().length < 2) return setError('Add your name.')
    if (business.trim().length < 2) return setError('Add the name of your business or workshop.')
    if (phone.replace(/\D/g, '').length < 8) return setError('Add a phone number we can reach you on.')
    if (message.trim().length < 20) return setError('Tell us a little more about what you offer (at least 20 characters).')
    setError('')
    setState('sending')
    try {
      const res = await fetch('/api/partner-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, name, business, phone, email, link, message, company: new FormData(event.currentTarget).get('company') }),
      })
      if (!res.ok) throw new Error()
      track('partner_request', { kind })
      setState('done')
    } catch {
      setState('idle')
      setError("That didn't go through. Please try again, or message us on WhatsApp.")
    }
  }

  if (state === 'done') {
    return (
      <div className="rounded-[2rem] bg-dune p-8 text-center sm:p-12">
        <p className="font-display text-4xl">Thank you, {name.split(' ')[0]}</p>
        <p className="mx-auto mt-3 max-w-sm text-stone">We received your details and will get back to you on WhatsApp or by phone.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 rounded-[2rem] bg-dune p-6 sm:p-8">
      <label className="flex flex-col gap-2 text-sm font-medium">
        What do you offer?
        <select className={field} value={kind} onChange={(e) => setKind(e.target.value)}>
          {kinds.map((k) => <option key={k.value} value={k.value}>{k.label}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Business or workshop name
        <input className={field} value={business} onChange={(e) => setBusiness(e.target.value)} />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Your name
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </label>
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Phone (WhatsApp)
          <input className={field} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Email (optional)
          <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Instagram or website (optional)
        <input className={field} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" />
      </label>
      <label className="flex flex-col gap-2 text-sm font-medium">
        Tell us about it
        <textarea className={`${field} resize-none`} rows={6} maxLength={1500} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What do you offer, who is it for, how long is it, and how many people can join?" />
        <span className="self-end font-normal text-stone">{message.length}/1500</span>
      </label>

      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {error && <p role="alert" className="rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

      <button type="submit" disabled={state === 'sending'} className="flex min-h-14 items-center justify-center rounded-full bg-pine px-6 font-semibold text-sand transition hover:bg-pine-dark disabled:opacity-60">
        {state === 'sending' ? 'Sending…' : 'Send request'}
      </button>
    </form>
  )
}
