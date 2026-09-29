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
