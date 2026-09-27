import type { Metadata } from 'next'
import { Footer } from '@/components/site/footer'
import { MobileBar } from '@/components/site/mobile-bar'
import { Nav } from '@/components/site/nav'
import { BRAND } from '@/lib/site'
import type { RetreatCard, SiteSettings } from '@/lib/types'
import { ogImageUrl } from '@/sanity/lib/image'
import { sanityFetch } from '@/sanity/lib/client'
import { settingsQuery, upcomingRetreatsQuery } from '@/sanity/lib/queries'

export async function generateMetadata(): Promise<Metadata> {
  const [settings, retreats] = await Promise.all([
    sanityFetch<SiteSettings | null>(settingsQuery, {}, null),
    sanityFetch<RetreatCard[]>(upcomingRetreatsQuery, {}, []),
  ])
  // Share image → home photo → next retreat's cover, so a shared link always has a preview.
  const source = [settings?.shareImage, settings?.heroImage, retreats[0]?.coverImage].find((img) => img?.asset)
  const image = ogImageUrl(source)
  const description = settings?.seoDescription || 'Small-group retreats and carefully planned trips to quiet places across Egypt.'
  return {
    description,
    openGraph: { siteName: BRAND, type: 'website', description, images: image ? [{ url: image, width: 1200, height: 630, alt: BRAND }] : undefined },
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
