import type { Metadata } from 'next'
import { PageHeader } from '@/components/site/page-header'
import { AccountView } from '@/components/site/account-view'
import type { SiteSettings } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { settingsQuery } from '@/sanity/lib/queries'

export const revalidate = 60
// Personal page, so it stays out of Google.
export const metadata: Metadata = { title: 'My bookings', robots: { index: false, follow: false } }

export default async function AccountPage() {
  const settings = await sanityFetch<SiteSettings | null>(settingsQuery, {}, null)
  return (
    <>
      <PageHeader title="My bookings" intro="Follow your requests and keep your details ready for next time." />
      <div className="mx-auto max-w-7xl px-5 pb-24 lg:px-10">
        <AccountView perks={settings?.memberPerks} whatsappNumber={settings?.whatsappNumber} />
      </div>
    </>
  )
}
