import { createClient, type QueryParams } from 'next-sanity'
import { apiVersion, dataset, isSanityConfigured, projectId } from '../env'

export const client = createClient({
  projectId: projectId || 'missing',
  dataset,
  apiVersion,
  useCdn: true,
})

/** How often (in seconds) published changes in the studio reach the site. */
export const REVALIDATE_SECONDS = 60

/**
 * Fetches from Sanity and never throws: if Sanity is not configured or the
 * request fails, the page renders with the fallback instead of crashing.
 */
export async function sanityFetch<T>(query: string, params: QueryParams = {}, fallback: T): Promise<T> {
  if (!isSanityConfigured) return fallback
  try {
    const result = await client.fetch<T>(query, params, { next: { revalidate: REVALIDATE_SECONDS } })
    return (result ?? fallback) as T
  } catch (error) {
    console.error('Sanity fetch failed:', error)
    return fallback
  }
}
