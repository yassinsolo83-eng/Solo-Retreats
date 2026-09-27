'use client'

import { usePathname } from 'next/navigation'
import { whatsappUrl } from '@/lib/whatsapp'
import { WhatsAppIcon } from './icons'

/** Sticky bottom action on phones: "Book this retreat" on retreat pages, WhatsApp elsewhere. */
export function MobileBar({ whatsappNumber }: { whatsappNumber?: string | null }) {
  const pathname = usePathname()
  const onRetreat = /^\/retreats\/[^/]+$/.test(pathname)
  const wa = whatsappUrl(whatsappNumber, 'Hi Solo Retreats! I have a question.')
  if (!onRetreat && !wa) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-sand/95 p-3 pb-[calc(.75rem+env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
      {onRetreat ? (
        <a href="#book" className="flex min-h-12 items-center justify-center rounded-full bg-pine text-sm font-semibold text-sand">
          Book this retreat
        </a>
      ) : (
        <a href={wa!} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-pine text-sm font-semibold text-sand">
          <WhatsAppIcon /> Message us on WhatsApp
        </a>
      )}
    </div>
  )
}
