import type { Metadata } from 'next'
import { Footer } from '@/components/site/footer'
import { MobileBar } from '@/components/site/mobile-bar'
import { Nav } from '@/components/site/nav'
import { BRAND } from '@/lib/site'
import type { SiteSettings } from '@/lib/types'
import { imageUrl } from '@/sanity/lib/image'
import { sanityFetch } from '@/sanity/lib/client'
import { settingsQuery } from '@/sanity/lib/queries'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch<SiteSettings | null>(settingsQuery, {}, null)
  const image = imageUrl(settings?.shareImage ?? settings?.heroImage, 1200, 630)
  const description = settings?.seoDescription || 'Small-group retreats and carefully planned trips to quiet places across Egypt.'
  return {
    description,
    openGraph: { siteName: BRAND, type: 'website', description, images: image ? [{ url: image, width: 1200, height: 630 }] : undefined },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await sanityFetch<SiteSettings | null>(settingsQuery, {}, null)
  return (
    <div className="site min-h-screen bg-sand text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-pine focus:px-4 focus:py-2 focus:text-sand">Skip to content</a>
      <Nav />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <MobileBar whatsappNumber={settings?.whatsappNumber} />
    </div>
  )
}
