import type { Departure } from '@/lib/types'
import {
  describeSymbol,
  findPlace,
  getForecast,
  SINAI_OVERVIEW,
  SINAI_PLACES,
  todayInCairo,
  tripWeather,
} from '@/lib/weather'

const dayLabel = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
const monthLabel = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' })
const asDate = (value: string) => new Date(`${value}T00:00:00Z`)

function Credit({ className = '' }: { className?: string }) {
  return (
    <p className={`text-xs ${className}`}>
      Forecast by{' '}
      <a href="https://www.met.no/en" target="_blank" rel="noreferrer" className="underline underline-offset-2">
        MET Norway
      </a>
      , updated hourly.
    </p>
  )
}

/** Home page strip: current temperature and today's high/low across Sinai. */
export async function SinaiWeather() {
  const places = SINAI_OVERVIEW.map((id) => SINAI_PLACES.find((p) => p.id === id)!).filter(Boolean)
  const forecasts = await Promise.all(places.map((p) => getForecast(p)))
  if (forecasts.every((f) => !f)) return null
  const today = todayInCairo()

  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-10 lg:pb-28">
      <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <h2 className="font-display text-4xl leading-none tracking-tight sm:text-5xl">Sinai right now</h2>
        <Credit className="text-stone" />
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {places.map((place, i) => {
          const f = forecasts[i]
          if (!f?.now) return null
          const todayRange = f.days.get(today)
          const { icon, label } = describeSymbol(f.now.symbol)
          return (
            <li key={place.id} className="rounded-3xl bg-dune p-5">
              <p className="text-sm text-stone">{place.name}</p>
              <p className="mt-3 flex items-center gap-2">
                <span aria-hidden="true" className="text-2xl">{icon}</span>
                <span className="font-display text-4xl">{f.now.temp}°</span>
              </p>
              <p className="mt-2 text-sm text-stone">
                {label}
                {todayRange && <> · {todayRange.high}° / {todayRange.low}°</>}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** Retreat page: weather for each day of the next trip date. */
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

  const forecast = await getForecast(place)
  const days = tripWeather(place, departure, forecast)
  if (!days.length) return null
  const hasForecast = days.some((d) => d.source === 'forecast')
  const highs = days.map((d) => d.high)
  const lows = days.map((d) => d.low)
  const month = monthLabel.format(asDate(departure.departureDate))

  return (
    <section className="mt-16">
      <h2 className="font-display text-4xl tracking-tight">Weather in {place.name}</h2>
      {hasForecast ? (
        <>
          <ul className="mt-8 flex gap-3 overflow-x-auto pb-2">
            {days.map((d) => {
              const { icon, label } = describeSymbol(d.symbol)
              return (
                <li key={d.date} className="min-w-28 flex-1 rounded-2xl bg-dune p-4 text-center">
                  <p className="text-sm text-stone">{dayLabel.format(asDate(d.date))}</p>
                  {d.source === 'forecast' ? (
                    <p aria-label={label} className="mt-2 text-2xl">{icon}</p>
                  ) : (
                    <p className="mt-2 text-xs text-stone">Typical</p>
                  )}
                  <p className="mt-2 font-display text-2xl">{d.high}°</p>
                  <p className="text-sm text-stone">{d.low}° at night</p>
                </li>
              )
            })}
          </ul>
          <Credit className="mt-3 text-stone" />
        </>
      ) : (
        <div className="mt-6 rounded-3xl bg-dune p-6 sm:p-8">
          <p className="text-lg leading-relaxed">
            In {month}, days in {place.name} are usually around <strong className="font-semibold">{Math.max(...highs)}°C</strong> and nights
            around <strong className="font-semibold">{Math.min(...lows)}°C</strong>.
          </p>
          <p className="mt-2 text-sm text-stone">The day-by-day forecast shows up here about a week before departure.</p>
        </div>
      )}
    </section>
  )
}
