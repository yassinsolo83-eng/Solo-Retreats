import { createClient, type QueryParams } from 'next-sanity'
import { apiVersion, dataset, isSanityConfigured, projectId } from '../env'

export const client = createClient({
  projectId: projectId || 'missing',
  dataset,
  apiVersion,
  useCdn: true,
})

/** How often (in seconds) published changes reach the site if the instant-publish webhook isn't set up. */
export const REVALIDATE_SECONDS = 60

/** Cache tag on every Sanity request, cleared by /api/revalidate when you publish. */
export const SANITY_TAG = 'sanity'

/** Today's date in Cairo as YYYY-MM-DD, used to move finished retreats to Past automatically. */
export const cairoToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date())

/**
 * Fetches from Sanity and never throws: if Sanity is not configured or the
 * request fails, the page renders with the fallback instead of crashing.
 */
export async function sanityFetch<T>(query: string, params: QueryParams = {}, fallback: T): Promise<T> {
  if (!isSanityConfigured) return fallback
  try {
    const allParams = query.includes('$today') ? { today: cairoToday(), ...params } : params
    const result = await client.fetch<T>(query, allParams, { next: { revalidate: REVALIDATE_SECONDS, tags: [SANITY_TAG] } })
    return (result ?? fallback) as T
  } catch (error) {
    console.error('Sanity fetch failed:', error)
    return fallback
  }
}
