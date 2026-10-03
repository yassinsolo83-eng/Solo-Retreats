import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Figtree, IBM_Plex_Sans_Arabic, Newsreader } from 'next/font/google'
import { SiteAnalytics } from '@/components/site/site-analytics'
import { BRAND, siteUrl } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${BRAND} | Small-group retreats across Egypt`, template: `%s | ${BRAND}` },
  description: 'Small-group retreats and carefully planned trips to quiet places across Egypt.',
  // Google Search Console: paste the code from the "HTML tag" method into Vercel.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

// Fonts are downloaded at build time and served from the site itself, so they always load.
const newsreader = Newsreader({ subsets: ['latin'], axes: ['opsz'], variable: '--font-newsreader', display: 'swap' })
const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' })
const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['400', '500', '600'], variable: '--font-plex-arabic', display: 'swap' })

export const viewport: Viewport = { themeColor: '#26473d' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${newsreader.variable} ${figtree.variable} ${plexArabic.variable}`}>
      <body className="antialiased">
        {children}
        <SiteAnalytics />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
