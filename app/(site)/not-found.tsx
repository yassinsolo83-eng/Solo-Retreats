import { Footer } from '@/components/site/footer'
import { MobileBar } from '@/components/site/mobile-bar'
import { Nav } from '@/components/site/nav'
import { NotFoundContent } from '@/components/site/not-found-content'
import type { SiteSettings } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { settingsQuery } from '@/sanity/lib/queries'

/** 404 for any address that doesn't match a page, shown with the normal site header and footer. */
export default async function RootNotFound() {
  const settings = await sanityFetch<SiteSettings | null>(settingsQuery, {}, null)
  return (
    <div className="site min-h-screen bg-sand text-ink">
      <Nav />
      <main id="main" className="pt-20"><NotFoundContent /></main>
      <Footer settings={settings} />
      <MobileBar whatsappNumber={settings?.whatsappNumber} />
    </div>
  )
}
