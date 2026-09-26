import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'),
  title: 'Solo Retreats | Small-Group Retreats and Travel Experiences Across Egypt',
  description: 'Discover small-group retreats, peaceful destinations and carefully planned travel experiences across Egypt.',
  alternates: { canonical: '/' },
  generator: 'v0.app',
  openGraph: {
    title: 'Solo Retreats | Small-Group Retreats and Travel Experiences Across Egypt',
    description: 'Discover small-group retreats, peaceful destinations and carefully planned travel experiences across Egypt.',
    url: 'https://example.com/',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Solo Retreats across Egypt' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solo Retreats | Travel experiences across Egypt',
    description: 'Discover small-group retreats and peaceful destinations across Egypt.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
