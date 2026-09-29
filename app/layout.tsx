import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { BRAND, siteUrl } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${BRAND} | Small-group retreats across Egypt`, template: `%s | ${BRAND}` },
  description: 'Small-group retreats and carefully planned trips to quiet places across Egypt.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = { themeColor: '#26473d' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
