// 'solo_in' is a harmless marker (no data in it) that tells the browser someone may be signed in,
// so visitors who aren't never wait on the server. Keep the name in step with components/site/account-data.ts.
import { NextResponse } from 'next/server'
import { SESSION_COOKIE_NAME } from '@/lib/auth'

export async function POST() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set(SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 })
  res.cookies.set('solo_in', '', { path: '/', maxAge: 0 })
  return res
}
