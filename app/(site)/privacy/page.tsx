import type { Metadata } from 'next'
import { LegalPage } from '@/components/site/legal-page'
import type { LegalDoc } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { legalQuery } from '@/sanity/lib/queries'

export const metadata: Metadata = { title: 'Privacy policy', description: 'How Solo Retreats collects and uses your information.', alternates: { canonical: '/privacy' } }

type Props = { searchParams: Promise<{ lang?: string }> }

export default async function PrivacyPage({ searchParams }: Props) {
  const { lang } = await searchParams
  const doc = await sanityFetch<LegalDoc | null>(legalQuery, { type: 'privacyPolicy' }, null)
  return <LegalPage doc={doc} title="Privacy policy" path="/privacy" lang={lang === 'ar' ? 'ar' : 'en'} />
}
