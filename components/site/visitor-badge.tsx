import { getVisitorCount } from '@/lib/visitors'

/** "1,234 visitors" strip on the home page. The number is the real count plus the starting number set in Site settings. */
export async function VisitorBadge({ before, show }: { before?: number | null; show?: boolean | null }) {
  if (show === false) return null
  const total = (await getVisitorCount()) + Math.max(0, Math.round(before ?? 0))
  if (total <= 0) return null
  return (
    <div className="border-b border-ink/10 bg-dune/60">
      <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-5 py-3 text-sm text-stone lg:px-10">
        <span aria-hidden="true" className="size-2 rounded-full bg-amber" />
        <span className="font-semibold tabular-nums text-ink">{new Intl.NumberFormat('en').format(total)}</span> people have visited Solo Retreats
      </p>
    </div>
  )
}
