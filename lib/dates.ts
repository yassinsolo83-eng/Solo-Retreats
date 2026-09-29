import type { Departure, RetreatCard, RetreatStatus } from './types'

const parse = (value: string) => new Date(`${value}T00:00:00Z`)
const dayMonth = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
const full = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
const short = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })

/** "Thu 9 Oct → Sat 11 Oct 2026" */
export function formatDeparture(d: Departure) {
  const year = parse(d.returnDate).getUTCFullYear()
  return `${dayMonth.format(parse(d.departureDate))} → ${dayMonth.format(parse(d.returnDate))} ${year}`
}

/** "9 – 11 Oct 2026" style compact range for cards */
export function formatRangeShort(d: Departure) {
  const from = parse(d.departureDate)
  const to = parse(d.returnDate)
  if (from.getUTCMonth() === to.getUTCMonth()) return `${from.getUTCDate()}–${full.format(to)}`
  return `${short.format(from)} – ${full.format(to)}`
}

export function nights(d: Departure) {
  return Math.max(0, Math.round((parse(d.returnDate).getTime() - parse(d.departureDate).getTime()) / 86_400_000))
}

export function upcomingDepartures(departures: Departure[] | null | undefined) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date())
  return (departures ?? []).filter((d) => d.departureDate && d.returnDate && d.departureDate >= today)
}

export const statusLabel: Record<RetreatStatus, string> = {
  open: 'Booking open',
  almostFull: 'Few spots left',
  full: 'Fully booked',
  completed: 'Completed',
}

export function isBookable(retreat: Pick<RetreatCard, 'status'>) {
  return retreat.status === 'open' || retreat.status === 'almostFull'
}
