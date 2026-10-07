import { NextResponse } from 'next/server'
import { createLoginToken } from '@/lib/auth'
import { sendLoginEmail } from '@/lib/mailer'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Best-effort limit so nobody can use the form to flood an inbox (or use up Gmail's daily
// sending limit). Resets when the server restarts, which is fine for this purpose.
const recent = new Map<string, number[]>()
function tooMany(key: string) {
  const now = Date.now()
  const hits = (recent.get(key) ?? []).filter((t) => now - t < 10 * 60 * 1000)
  hits.push(now)
  recent.set(key, hits)
  if (recent.size > 500) recent.clear()
  return hits.length > 3
}

/** The next page after signing in: only a plain path on this site, never another address. */
const safeNext = (value: unknown) => (typeof value === 'string' && /^\/[\w\-/]*$/.test(value) && !value.startsWith('//') ? value : '/account')

/**
 * Starts a sign-in by emailing a 15-minute magic link. No account is created here; the
 * customer record is made (or matched) only when the link is actually clicked.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  if (typeof body.company === 'string' && body.company.trim()) return NextResponse.json({ ok: true })

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 150) : ''
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  if (tooMany(email)) return NextResponse.json({ error: 'too_many' }, { status: 429 })

  let token: string
  try {
    token = createLoginToken(email)
  } catch (error) {
    console.error('Could not create a login token:', error)
    return NextResponse.json({ error: 'not_configured' }, { status: 500 })
  }

  const origin = new URL(request.url).origin
  const link = `${origin}/api/auth/verify?token=${encodeURIComponent(token)}&next=${encodeURIComponent(safeNext(body.next))}`

  const sent = await sendLoginEmail(email, link)
  if (!sent) return NextResponse.json({ error: 'send_failed' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
