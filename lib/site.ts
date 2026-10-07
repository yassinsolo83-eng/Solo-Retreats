export const BRAND = 'Solo Retreats'

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')
).replace(/\/$/, '')

export const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/retreats', label: 'Retreats' },
  { href: '/partners', label: 'Partners' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/about', label: 'About' },
  { href: '/faq', label: 'FAQ' },
]

/** True for text that is a web address, e.g. a Maps link pasted into a name field. */
export const isUrl = (value?: string | null) => Boolean(value && /^(https?:\/\/|www\.)/i.test(value.trim()))

/** Pages that used to be sections of the home page. Linked from the home page and the footer. */
export const moreLinks = [
  { href: '/how-it-works', label: 'How booking works' },
  { href: '/why-us', label: 'Why travel with us' },
  { href: '/traveler-reviews', label: 'Traveler reviews' },
  { href: '/sinai-weather', label: 'Sinai weather' },
]

/** Used on trip pages until the real wording is written in the Studio (Site settings > Payment & cancellation). */
export const DEFAULT_PAYMENT_NOTE = '25% deposit confirms your spot. The rest is paid on the day of departure.'
export const DEFAULT_CANCELLATION_NOTE =
  'Cancel at least 2 weeks before departure and you get a full refund. If you cancel in the last week, the 25% deposit is not refunded.'
