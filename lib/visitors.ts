import 'server-only'
import { writeClient } from '@/sanity/lib/write-client'

/** Stored as a draft, like bookings, so it never needs to be published. */
export const VISITOR_COUNTER_ID = 'drafts.visitorCounter'

/** How many different browsers the website has counted. */
export async function getVisitorCount() {
  if (!writeClient) return 0
  try {
    return (await writeClient.fetch<number | null>(`*[_id == $id][0].count`, { id: VISITOR_COUNTER_ID })) ?? 0
  } catch (error) {
    console.error('Could not read the visitor counter:', error)
    return 0
  }
}
