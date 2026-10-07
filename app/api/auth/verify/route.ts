// 'solo_in' is a harmless marker (no data in it) that tells the browser someone may be signed in,
// so visitors who aren't never wait on the server. Keep the name in step with components/site/account-data.ts.
import { NextResponse } from 'next/server'
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS, verifyLoginToken } from '@/lib/auth'
import { asDraftId, customerIdFor } from '@/lib/customers'
import { writeClient } from '@/sanity/lib/write-client'

const safeNext = (value: string | null) => (value && /^\/[\w\-/]*$/.test(value) && !value.startsWith('//') ? value : '/account')

/** The link in the sign-in email lands here: find or create the customer, set the cookie, go to the page. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const next = safeNext(url.searchParams.get('next'))
  const to = (path: string, query: string) => NextResponse.redirect(new URL(`${path}?${query}`, url.origin))

  let data: { email: string } | null
  try {
    data = verifyLoginToken(url.searchParams.get('token') || '')
  } catch (error) {
    console.error('Could not verify the login token:', error)
    return to('/account', 'login=error')
  }
  if (!data) return to('/account', 'login=expired')
  if (!writeClient) {
    console.error('SANITY_API_WRITE_TOKEN is not set, so the customer could not be saved.')
    return to('/account', 'login=error')
  }

  try {
    const customerId = customerIdFor(data.email)
    await writeClient.createIfNotExists({ _id: asDraftId(customerId), _type: 'customer', email: data.email, bookingsCount: 0 })

    const res = to(next, 'welcome=1')
    res.cookies.set(SESSION_COOKIE_NAME, createSessionToken({ email: data.email, customerId }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    })
    res.cookies.set('solo_in', '1', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    })
    return res
  } catch (error) {
    console.error('Signing in failed:', error)
    return to('/account', 'login=error')
  }
}
