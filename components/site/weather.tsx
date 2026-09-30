import { upcomingDepartures } from '@/lib/dates'
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
const dayLabel = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
const asDate = (value: string) => new Date(`${value}T00:00:00Z`)

function Credit({ typical = false, className = '' }: { typical?: boolean; className?: string }) {
  const link = 'underline underline-offset-2'
  return (
    <p className={`text-xs ${className}`}>
      Forecast by <a href="https://www.met.no/en" target="_blank" rel="noreferrer" className={link}>MET Norway</a>
      {typical && (
        <>
          . Typical values from the last {10} years of{' '}
          <a href="https://power.larc.nasa.gov" target="_blank" rel="noreferrer" className={link}>NASA POWER</a> data
        </>
      )}
      . Updates by itself.
    </p>
  )
}

/* ---------- Home page: "Sinai right now" ---------- */

export async function SinaiWeather({ placeIds }: { placeIds?: string[] | null }) {
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
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-5xl leading-none tracking-tight sm:text-6xl">Sinai right now</h2>
          <p className="mt-4 max-w-md text-stone">Live temperatures from the places we travel to.</p>
        </div>
        <Credit className="text-stone" />
      </div>

      <ul className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0">
        {cards.map(({ place, forecast }) => {
          const now = describeSymbol(forecast.now!.symbol)
          const todayRange = forecast.days.get(today)
          const nextDays = [...forecast.days.entries()].filter(([date]) => date > today).slice(0, 3)
          return (
            <li key={place.id} className="flex w-[72%] shrink-0 snap-start flex-col rounded-[1.75rem] bg-dune p-6 sm:w-[40%] lg:w-auto">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-2xl leading-tight">{place.name}</h3>
                <span aria-hidden="true" className="text-3xl leading-none">{now.icon}</span>
              </div>
              <p className="mt-6 font-display text-6xl font-light leading-none tracking-tight">{forecast.now!.temp}°</p>
              <p className="mt-3 text-sm text-stone">
                {now.label}
                {todayRange && <> · {todayRange.high}° / {todayRange.low}°</>}
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

  return (
    <section className="mt-16">
      <h2 className="font-display text-4xl tracking-tight">Weather in {place.name}</h2>
      {allTypical && (
        <p className="mt-3 max-w-xl text-stone">
          What these dates usually look like, from the last 10 years. The live forecast replaces it about a week before departure.
        </p>
      )}
      <ul className="mt-8 flex gap-3 overflow-x-auto pb-2">
        {days.map((d) => {
          const { icon, label } = describeSymbol(d.symbol)
          return (
            <li key={d.date} className="min-w-28 flex-1 rounded-2xl bg-dune p-4 text-center">
              <p className="text-sm text-stone">{dayLabel.format(asDate(d.date))}</p>
              {d.source === 'forecast' ? (
                <p aria-label={label} className="mt-2 text-2xl">{icon}</p>
              ) : (
                <p className="mt-2 text-xs uppercase tracking-wide text-stone">Usually</p>
              )}
              <p className="mt-2 font-display text-2xl">{d.high}°</p>
              <p className="text-sm text-stone">{d.low}° at night</p>
            </li>
          )
        })}
      </ul>
      <Credit typical={hasTypical} className="mt-3 text-stone" />
    </section>
  )
}
