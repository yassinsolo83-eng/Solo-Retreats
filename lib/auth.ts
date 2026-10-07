import crypto from 'crypto'

// Two kinds of signed, stateless tokens. Nothing is stored in Sanity for either one, so
// logging in never adds a document or uses up the free plan's document limit.
//
// 1. A "login token" is emailed as a magic link. It lasts 15 minutes and only proves the
//    click came from that inbox.
// 2. A "session token" lives in a cookie once someone is signed in. It lasts 180 days and
//    says which customer record this browser belongs to.
//
// Both are base64url(JSON) plus an HMAC signature, so they can't be edited or forged
// without the server's secret.

const SESSION_COOKIE = 'solo_session'
const LOGIN_TOKEN_TTL_MS = 15 * 60 * 1000
const SESSION_TTL_MS = 180 * 24 * 60 * 60 * 1000

const encode = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString('base64url')
const decode = <T>(str: string): T => JSON.parse(Buffer.from(str, 'base64url').toString('utf8'))

function getSecret(name: 'AUTH_LOGIN_SECRET' | 'AUTH_SESSION_SECRET'): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not set. Add it in the Vercel environment variables.`)
  return value
}

const sign = (payload: string, secret: string) => crypto.createHmac('sha256', secret).update(payload).digest('base64url')

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
}

const signedToken = (payload: object, secret: string) => {
  const encoded = encode(payload)
  return `${encoded}.${sign(encoded, secret)}`
}

function verifySignedToken<T>(token: string, secret: string): T | null {
  const [encoded, sig] = (token || '').split('.')
  if (!encoded || !sig || !safeEqual(sign(encoded, secret), sig)) return null
  try {
    return decode<T>(encoded)
  } catch {
    return null
  }
}

export function createLoginToken(email: string) {
  return signedToken({ email, exp: Date.now() + LOGIN_TOKEN_TTL_MS }, getSecret('AUTH_LOGIN_SECRET'))
}

export function verifyLoginToken(token: string): { email: string } | null {
  const data = verifySignedToken<{ email: string; exp: number }>(token, getSecret('AUTH_LOGIN_SECRET'))
  return data && Date.now() <= data.exp ? { email: data.email } : null
}

export type Session = { email: string; customerId: string }

export function createSessionToken(session: Session) {
  return signedToken({ ...session, exp: Date.now() + SESSION_TTL_MS }, getSecret('AUTH_SESSION_SECRET'))
}

export function verifySessionToken(token: string): Session | null {
  const data = verifySignedToken<Session & { exp: number }>(token, getSecret('AUTH_SESSION_SECRET'))
  return data && Date.now() <= data.exp ? { email: data.email, customerId: data.customerId } : null
}

/** Reads and verifies the session cookie from a Request (Route Handlers only). Never throws. */
export function sessionFromRequest(request: Request): Session | null {
  const cookie = request.headers.get('cookie') || ''
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`))
  if (!match) return null
  try {
    return verifySessionToken(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

export const SESSION_COOKIE_NAME = SESSION_COOKIE
export const SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000
