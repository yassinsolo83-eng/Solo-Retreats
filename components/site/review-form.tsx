'use client'

import { useState } from 'react'
import { track } from '@/lib/analytics'
import type { ReviewableRetreat } from '@/lib/types'

const field = 'w-full rounded-2xl border border-ink/15 bg-sand px-4 py-3.5 text-base text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/20'
const labels = ['', 'Not good', 'Okay', 'Good', 'Great', 'Amazing']

export function ReviewForm({ retreats, preselected }: { retreats: ReviewableRetreat[]; preselected?: ReviewableRetreat | null }) {
  const [retreatId, setRetreatId] = useState(preselected?._id ?? '')
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [name, setName] = useState('')
  const [quote, setQuote] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!retreatId) return setError('Choose the retreat you joined.')
    if (!rating) return setError('Tap the stars to rate your trip.')
    if (name.trim().length < 2) return setError('Add your name.')
    if (quote.trim().length < 20) return setError('Write a few more words about your trip (at least 20 characters).')
    if (!consent) return setError('Please tick the box so we can share your review.')
    setError('')
    setState('sending')
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retreatId, rating, name: name.trim(), quote: quote.trim(), consent, company: new FormData(event.currentTarget).get('company') }),
      })
      if (!res.ok) throw new Error()
      track('review_submit', { rating })
      setState('done')
    } catch {
      setState('idle')
      setError("That didn't go through. Please try again, or send your review to us on WhatsApp.")
    }
  }

  if (state === 'done') {
    return (
      <div className="rounded-[2rem] bg-dune p-8 text-center sm:p-12">
        <p className="font-display text-4xl">Thank you, {name.split(' ')[0]}</p>
        <p className="mx-auto mt-3 max-w-sm text-stone">Your review means a lot. It will appear on the site once we've had a look at it.</p>
      </div>
    )
  }

  const shown = hover || rating

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 rounded-[2rem] bg-dune p-6 sm:p-8">
      {preselected ? (
        <p className="rounded-2xl bg-sand px-4 py-3.5"><span className="text-stone">Retreat: </span>{preselected.title}</p>
      ) : (
        <label className="flex flex-col gap-2 text-sm font-medium">
          Which retreat did you join?
          <select className={field} value={retreatId} onChange={(e) => setRetreatId(e.target.value)} required>
            <option value="">Choose a retreat</option>
            {retreats.map((r) => <option key={r._id} value={r._id}>{r.title}</option>)}
          </select>
        </label>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-medium">How was it?</legend>
        <div className="flex items-center gap-4">
          <div className="flex" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="cursor-pointer p-1" onMouseEnter={() => setHover(n)}>
                <input type="radio" name="rating" value={n} checked={rating === n} onChange={() => setRating(n)} className="peer sr-only" />
                <svg viewBox="0 0 20 20" className={`size-9 transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-clay ${n <= shown ? 'fill-amber' : 'fill-dune-deep'}`} aria-hidden="true">
                  <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.1 1.1 5.9L10 15l-5.3 2.8 1.1-5.9L1.4 7.8l6-.8z" />
                </svg>
                <span className="sr-only">{n} star{n > 1 ? 's' : ''}</span>
              </label>
            ))}
          </div>
          <span className="text-sm text-stone" aria-live="polite">{labels[shown]}</span>
        </div>
      </fieldset>

      <label className="flex flex-col gap-2 text-sm font-medium">
        Your name
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        <span className="font-normal text-stone">We only show your first name and last initial.</span>
      </label>

      <label className="flex flex-col gap-2 text-sm font-medium">
        Your review
        <textarea className={`${field} resize-none`} rows={5} maxLength={600} value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="What did you enjoy? What would you tell a friend thinking of coming?" />
        <span className="self-end font-normal text-stone">{quote.length}/600</span>
      </label>

      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-pine" />
        <span>Solo Retreats can show my review with my first name and last initial on the website and social media.</span>
      </label>

      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {error && <p role="alert" className="rounded-2xl bg-clay/10 px-4 py-3 text-sm text-clay">{error}</p>}

      <button type="submit" disabled={state === 'sending'} className="flex min-h-14 items-center justify-center rounded-full bg-pine px-6 font-semibold text-sand transition hover:bg-pine-dark disabled:opacity-60">
        {state === 'sending' ? 'Sending…' : 'Send review'}
      </button>
    </form>
  )
}
