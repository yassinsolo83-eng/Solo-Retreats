import Link from 'next/link'
import { Bus, Tent } from 'lucide-react'
import { isUrl } from '@/lib/site'
import type { PartnerSummary } from '@/lib/types'
import { SanityImage } from './sanity-image'

export function PartnerCard({ partner }: { partner: PartnerSummary }) {
  const isCamp = partner._type === 'camp'
  const detail = partner.location && !isUrl(partner.location) ? partner.location : partner.vehicleType
  const Icon = isCamp ? Tent : Bus
  return (
    <Link href={`/partners/${partner.slug}`} className="group grid grid-cols-[112px_1fr] items-center gap-5 rounded-3xl bg-dune p-3 pr-6 transition-colors hover:bg-dune-deep sm:grid-cols-[160px_1fr]">
      {partner.coverImage?.asset ? (
        <SanityImage image={partner.coverImage} width={320} height={320} className="aspect-square w-full rounded-2xl" />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-pine text-amber" aria-hidden="true">
          <Icon className="size-10" strokeWidth={1.5} />
        </div>
      )}
      <div>
        <p className="text-sm text-clay">{isCamp ? 'Camp' : 'Transport'}{detail ? ` · ${detail}` : ''}</p>
        <h3 className="mt-1 font-display text-2xl sm:text-3xl">{partner.name}</h3>
        {partner.summary && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-stone">{partner.summary}</p>}
      </div>
    </Link>
  )
}
