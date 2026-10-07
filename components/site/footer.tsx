import Link from 'next/link'
import { BRAND, moreLinks, navLinks } from '@/lib/site'
import { Wordmark } from './logo'
import type { SiteSettings } from '@/lib/types'
import { whatsappUrl } from '@/lib/whatsapp'

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const socials = [
    { label: 'Instagram', href: settings?.instagram },
    { label: 'Facebook', href: settings?.facebook },
    { label: 'TikTok', href: settings?.tiktok },
    { label: 'WhatsApp', href: whatsappUrl(settings?.whatsappNumber) },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href))

  return (
    <footer className="bg-pine px-5 pb-28 pt-16 text-sand/80 lg:px-10 lg:pb-12">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-block text-sand"><Wordmark className="h-8 w-auto" /></Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            Small-group retreats across Egypt. We plan each trip and travel with you; camps and transport are run by independent local partners.
          </p>
        </div>
        <div>
          <p className="mb-4 text-sm text-amber">Explore</p>
          <ul className="flex flex-col gap-2 text-sm">
            {[...navLinks, ...moreLinks, { href: '/account', label: 'My bookings' }].map((l) => <li key={l.href}><Link href={l.href} className="hover:text-sand">{l.label}</Link></li>)}
          </ul>
        </div>
        {(socials.length > 0 || settings?.email) && (
          <div>
            <p className="mb-4 text-sm text-amber">Stay in touch</p>
            <ul className="flex flex-col gap-2 text-sm">
              {socials.map((s) => <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer" className="hover:text-sand">{s.label}</a></li>)}
              {settings?.email && <li><a href={`mailto:${settings.email}`} className="hover:text-sand">{settings.email}</a></li>}
            </ul>
          </div>
        )}
      </div>
      <div className="mx-auto mt-14 flex max-w-7xl flex-col gap-3 border-t border-sand/15 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {BRAND}</p>
        <div className="flex gap-5">
          <Link href="/terms" className="hover:text-sand">Booking terms</Link>
          <Link href="/privacy" className="hover:text-sand">Privacy</Link>
        </div>
      </div>
    </footer>
  )
}
