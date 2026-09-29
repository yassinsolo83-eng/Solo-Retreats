type Params = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

// Meta Pixel standard events, used later for Instagram/Facebook ads.
const metaEvents: Record<string, string> = { booking_request: 'Lead', whatsapp_click: 'Contact' }

/** Sends an event to Google Analytics and the Meta Pixel, if they're switched on. Safe to call anytime. */
export function track(event: string, params: Params = {}) {
  try {
    window.gtag?.('event', event, params)
    if (window.fbq) {
      if (metaEvents[event]) window.fbq('track', metaEvents[event], params)
      else window.fbq('trackCustom', event, params)
    }
  } catch {}
}
