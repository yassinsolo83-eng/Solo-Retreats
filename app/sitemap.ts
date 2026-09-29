import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'
import { sanityFetch } from '@/sanity/lib/client'
import { partnerSlugsQuery, retreatSlugsQuery } from '@/sanity/lib/queries'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [retreats, partners] = await Promise.all([
    sanityFetch<string[]>(retreatSlugsQuery, {}, []),
    sanityFetch<string[]>(partnerSlugsQuery, {}, []),
  ])
  const pages = ['', '/retreats', '/partners', '/gallery', '/about', '/faq', '/terms', '/privacy']
  return [
    ...pages.map((p) => ({ url: `${siteUrl}${p}` })),
    ...retreats.map((s) => ({ url: `${siteUrl}/retreats/${s}` })),
    ...partners.map((s) => ({ url: `${siteUrl}/partners/${s}` })),
  ]
}
