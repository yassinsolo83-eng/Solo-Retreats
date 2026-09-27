import Link from 'next/link'
import type { PartnerSummary } from '@/lib/types'
import { SanityImage } from './sanity-image'

export function PartnerCard({ partner }: { partner: PartnerSummary }) {
  return (
    <Link href={`/partners/${partner.slug}`} className="group grid grid-cols-[112px_1fr] items-center gap-5 rounded-3xl bg-dune p-3 pr-6 transition-colors hover:bg-dune-deep sm:grid-cols-[160px_1fr]">
      <SanityImage image={partner.coverImage} width={320} height={320} className="aspect-square w-full rounded-2xl" />
      <div>
        <p className="text-sm text-clay">{partner._type === 'camp' ? 'Camp' : 'Transport'}{partner.location ? ` · ${partner.location}` : partner.vehicleType ? ` · ${partner.vehicleType}` : ''}</p>
        <h3 className="mt-1 font-display text-2xl sm:text-3xl">{partner.name}</h3>
        {partner.summary && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone">{partner.summary}</p>}
      </div>
    </Link>
  )
}
