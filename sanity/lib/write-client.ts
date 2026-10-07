import 'server-only'
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

const token = process.env.SANITY_API_WRITE_TOKEN

// "raw" so server code can also read customers and booking requests, which are kept
// as drafts (see lib/customers.ts) and are not returned by the default "published" view.
export const writeClient = token && projectId
  ? createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: 'raw' })
  : null
