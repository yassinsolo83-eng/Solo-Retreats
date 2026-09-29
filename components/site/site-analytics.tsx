'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { captureAttribution } from '@/lib/attribution'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

/**
 * Google Analytics 4 and Meta Pixel. Each loads only if its ID is set in Vercel
 * (NEXT_PUBLIC_GA_ID, NEXT_PUBLIC_META_PIXEL_ID). Also remembers where visitors came from.
 */
export function SiteAnalytics() {
  const pathname = usePathname()
  const first = useRef(true)

  useEffect(() => captureAttribution(), [])

  // GA4 tracks page changes by itself; the Pixel needs a PageView on each navigation.
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.fbq?.('track', 'PageView')
  }, [pathname])

  if (pathname.startsWith('/studio')) return null

  return (
    <>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      )}
      {PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL_ID}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  )
}
