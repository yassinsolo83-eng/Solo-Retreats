import type { Metadata } from 'next'
import { LegalPage } from '@/components/site/legal-page'
import type { LegalDoc } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { legalQuery } from '@/sanity/lib/queries'

export const metadata: Metadata = { title: 'Booking terms', description: 'Booking, payment and cancellation terms for Solo Retreats trips.', alternates: { canonical: '/terms' } }

type Props = { searchParams: Promise<{ lang?: string }> }

export default async function TermsPage({ searchParams }: Props) {
  const { lang } = await searchParams
  const doc = await sanityFetch<LegalDoc | null>(legalQuery, { type: 'bookingTerms' }, null)
  return <LegalPage doc={doc} title="Booking terms" path="/terms" lang={lang === 'ar' ? 'ar' : 'en'} />
}
