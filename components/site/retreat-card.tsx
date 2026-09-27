import Link from 'next/link'
import { formatRangeShort, nights, statusLabel, upcomingDepartures } from '@/lib/dates'
import type { RetreatCard as RetreatCardType } from '@/lib/types'
import { SanityImage } from './sanity-image'

export function StatusPill({ retreat, onDark = false }: { retreat: Pick<RetreatCardType, 'status' | 'spotsLeft'>; onDark?: boolean }) {
  const label = retreat.status !== 'full' && retreat.status !== 'completed' && retreat.spotsLeft
    ? `${retreat.spotsLeft} spot${retreat.spotsLeft === 1 ? '' : 's'} left`
    : statusLabel[retreat.status]
  const tone = retreat.status === 'full' || retreat.status === 'completed'
    ? onDark ? 'bg-sand/20 text-sand' : 'bg-ink/10 text-ink'
    : retreat.status === 'almostFull' ? 'bg-amber text-ink' : onDark ? 'bg-sand text-pine' : 'bg-pine text-sand'
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{label}</span>
}

export function RetreatCard({ retreat, past = false }: { retreat: RetreatCardType; past?: boolean }) {
  const next = past ? retreat.departures?.[0] : upcomingDepartures(retreat.departures)[0]
  const more = past ? 0 : upcomingDepartures(retreat.departures).length - 1
  return (
    <Link href={`/retreats/${retreat.slug}`} className="group flex flex-col">
      <div className="relative overflow-hidden rounded-[1.75rem]">
        <SanityImage image={retreat.coverImage} width={720} height={860} className={`aspect-[5/6] w-full transition-transform duration-700 group-hover:scale-[1.03] ${past ? 'grayscale-[40%]' : ''}`} sizes="(max-width: 1024px) 100vw, 33vw" />
        <div className="absolute left-4 top-4"><StatusPill retreat={retreat} /></div>
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-3xl leading-tight">{retreat.title}</h3>
        {next && <span className="shrink-0 text-sm text-stone">{nights(next)} nights</span>}
      </div>
      <p className="mt-1 text-sm text-clay">
        {retreat.destination}
        {next && <> · {formatRangeShort(next)}</>}
        {more > 0 && <> · +{more} more date{more > 1 ? 's' : ''}</>}
      </p>
      {retreat.shortDescription && <p className="mt-3 max-w-md text-[15px] leading-relaxed text-stone">{retreat.shortDescription}</p>}
    </Link>
  )
}
