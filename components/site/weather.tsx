import { upcomingDepartures } from '@/lib/dates'
import { TextLink } from './text-link'
import type { Departure, RetreatCard } from '@/lib/types'
import {
  DEFAULT_HOME_PLACES,
  describeSymbol,
  findPlace,
  getForecast,
  getTripWeather,
  SINAI_PLACES,
  summarize,
  todayInCairo,
} from '@/lib/weather'

const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' })
const weekdayOnly = new Intl.DateTimeFormat('en-GB', { weekday: 'long', timeZone: 'UTC' })
const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const asDate = (value: string) => new Date(`${value}T00:00:00Z`)

function Credit({ typical = false, className = '' }: { typical?: boolean; className?: string }) {
  return (
    <p className={`text-xs ${className}`}>
      Forecast by <TextLink href="https://www.met.no/en" arrow={false}>MET Norway</TextLink>
      {typical && (
        <>
          . Typical values from the last {10} years of{' '}
          <TextLink href="https://power.larc.nasa.gov" arrow={false}>NASA POWER</TextLink> data
        </>
      )}
      . Updates by itself.
    </p>
  )
}

/* ---------- Home page: "Sinai right now" ---------- */

export async function SinaiWeather({ placeIds, standalone = false }: { placeIds?: string[] | null; standalone?: boolean }) {
  const ids = placeIds?.length ? placeIds : DEFAULT_HOME_PLACES
  const places = ids.map((id) => SINAI_PLACES.find((p) => p.id === id)).filter((p) => !!p)
  const forecasts = await Promise.all(places.map((p) => getForecast(p)))
  const today = todayInCairo()
  const cards = places
    .map((place, i) => ({ place, forecast: forecasts[i] }))
    .filter((c): c is typeof c & { forecast: NonNullable<typeof c.forecast> } => !!c.forecast?.now)
  if (!cards.length) return null

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-10 lg:pb-28">
      {/* On its own page the page header already says this, so only the credit is kept. */}
      {!standalone && (
        <div className="mb-8 flex flex-col justify-between gap-3 sm:mb-10 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-4xl leading-none tracking-tight sm:text-6xl">Sinai right now</h2>
            <p className="mt-3 max-w-md text-stone sm:mt-4">Live temperatures from the places we travel to.</p>
          </div>
          <Credit className="hidden text-stone sm:block" />
        </div>
      )}

      {/* Phones: one compact row per place */}
      <ul className="overflow-hidden rounded-3xl bg-dune sm:hidden">
        {cards.map(({ place, forecast }) => {
          const now = describeSymbol(forecast.now!.symbol)
          const todayRange = forecast.days.get(today)
          return (
            <li key={place.id} className="flex items-center gap-4 border-t border-ink/10 px-5 py-4 first:border-t-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-medium">{place.name}</p>
                <p className="mt-0.5 text-sm text-stone">
                  {now.label}
                  {todayRange && <span className="whitespace-nowrap">, {todayRange.high}° / {todayRange.low}°</span>}
                </p>
              </div>
              <span aria-hidden="true" className="text-2xl leading-none">{now.icon}</span>
              <p className="w-16 text-right font-display text-4xl font-light leading-none tabular-nums">{forecast.now!.temp}°</p>
            </li>
          )
        })}
      </ul>
      <Credit className={`mt-3 text-stone ${standalone ? '' : 'sm:hidden'}`} />

      {/* Tablets and up: a card per place with the next three days */}
      <ul className="hidden gap-4 sm:grid sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(({ place, forecast }) => {
          const now = describeSymbol(forecast.now!.symbol)
          const todayRange = forecast.days.get(today)
          const nextDays = [...forecast.days.entries()].filter(([date]) => date > today).slice(0, 3)
          return (
            <li key={place.id} className="flex flex-col rounded-[1.75rem] bg-dune p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-2xl leading-tight">{place.name}</h3>
                <span aria-hidden="true" className="text-3xl leading-none">{now.icon}</span>
              </div>
              <p className="mt-6 font-display text-6xl font-light leading-none tracking-tight">{forecast.now!.temp}°</p>
              <p className="mt-3 text-sm text-stone">
                {now.label}
                {todayRange && <>, {todayRange.high}° / {todayRange.low}°</>}
              </p>
              {nextDays.length > 0 && (
                <ul className="mt-6 grid grid-cols-3 gap-2 border-t border-ink/10 pt-4 text-center">
                  {nextDays.map(([date, d]) => (
                    <li key={date}>
                      <p className="text-xs text-stone">{weekday.format(asDate(date))}</p>
                      <p aria-label={describeSymbol(d.symbol).label} className="mt-1 text-lg">{describeSymbol(d.symbol).icon}</p>
                      <p className="text-sm">{d.high}°<span className="text-stone"> {d.low}°</span></p>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ---------- Retreat cards: small weather chip ---------- */

export type CardWeather = { high: number; low: number; icon?: string; typical: boolean }

/** Weather summary for a retreat's next date, or null when the place isn't known. */
export async function cardWeather(retreat: {
  destination?: string | null
  campLocation?: string | null
  showWeather?: boolean | null
  departure?: Departure
}): Promise<CardWeather | null> {
  if (retreat.showWeather === false || !retreat.departure) return null
  const place = findPlace(retreat.destination, retreat.campLocation)
  if (!place) return null
  const summary = summarize(await getTripWeather(place, retreat.departure))
  if (!summary) return null
  return {
    high: summary.high,
    low: summary.low,
    icon: summary.source === 'forecast' ? describeSymbol(summary.symbol).icon : undefined,
    typical: summary.source === 'typical',
  }
}

/** Weather chips for a list of upcoming retreat cards, keyed by retreat id. */
export async function weatherForCards(retreats: RetreatCard[]) {
  const entries = await Promise.all(
    retreats.map(async (r) => [r._id, await cardWeather({ ...r, departure: upcomingDepartures(r.departures)[0] })] as const),
  )
  return new Map(entries)
}

/* ---------- Retreat page: day by day ---------- */

export async function RetreatWeather({
  departure,
  destination,
  campLocation,
}: {
  departure?: Departure
  destination?: string | null
  campLocation?: string | null
}) {
  if (!departure?.departureDate || !departure.returnDate) return null
  const place = findPlace(destination, campLocation)
  if (!place) return null
  const days = await getTripWeather(place, departure)
  if (!days.length) return null
  const hasTypical = days.some((d) => d.source === 'typical')
  const allTypical = days.every((d) => d.source === 'typical')
  const min = Math.min(...days.map((d) => d.low))
  const span = Math.max(Math.max(...days.map((d) => d.high)) - min, 1)

  return (
    <section className="mt-16">
      <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Weather in {place.name}</h2>
      {allTypical && (
        <p className="mt-3 max-w-xl text-stone">
          What these dates usually look like, from the last 10 years. The live forecast replaces it about a week before departure.
        </p>
      )}
      <ul className="mt-6 max-w-2xl overflow-hidden rounded-3xl bg-dune">
        {days.map((d) => {
          const { icon, label } = describeSymbol(d.symbol)
          // Where this day sits between the trip's coolest night and warmest day.
          const left = ((d.low - min) / span) * 100
          const width = Math.max(((d.high - d.low) / span) * 100, 6)
          return (
            <li key={d.date} className="grid grid-cols-[4.75rem_2rem_1fr] items-center gap-3 border-t border-ink/10 px-4 py-3.5 first:border-t-0 sm:grid-cols-[7rem_2.5rem_1fr] sm:px-6">
              <p className="text-[15px] leading-tight">
                {weekdayOnly.format(asDate(d.date))}
                <span className="block text-xs text-stone">{shortDate.format(asDate(d.date))}</span>
              </p>
              {d.source === 'forecast' ? (
                <span role="img" aria-label={label} className="text-center text-xl">{icon}</span>
              ) : (
                <span className="text-center text-[11px] leading-tight text-stone">Usually</span>
              )}
              <div className="flex items-center gap-3 text-[15px] tabular-nums">
                <span className="w-8 text-right text-stone" aria-label={`Low ${d.low}°`}>{d.low}°</span>
                <span className="relative h-1.5 flex-1 rounded-full bg-ink/10" aria-hidden="true">
                  <span className="absolute inset-y-0 rounded-full bg-gradient-to-r from-[#8fb3c4] to-amber" style={{ left: `${left}%`, width: `${width}%` }} />
                </span>
                <span className="w-8 font-medium" aria-label={`High ${d.high}°`}>{d.high}°</span>
              </div>
            </li>
          )
        })}
      </ul>
      <Credit typical={hasTypical} className="mt-3 text-stone" />
    </section>
  )
}

/* ---------- Home hero: today's temperature in Sinai ---------- */

export async function SinaiNowChip() {
  const place = findPlace('dahab')
  const forecast = place ? await getForecast(place) : null
  if (!forecast?.now) return null
  const now = describeSymbol(forecast.now.symbol)
  return (
    <div className="absolute right-5 top-24 z-10 flex items-center gap-2 rounded-full bg-ink/35 px-4 py-2 text-sm text-sand backdrop-blur-md lg:right-10">
      <span aria-hidden="true">{now.icon}</span>
      <span className="font-semibold tabular-nums">{forecast.now.temp}°</span>
      <span className="text-sand/80">Sinai today</span>
    </div>
  )
}
