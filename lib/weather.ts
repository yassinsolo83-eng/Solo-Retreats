import 'server-only'
import { siteUrl } from './site'
import type { Departure } from './types'
import type { WeatherPlace } from './weather-places'

export { DEFAULT_HOME_PLACES, findPlace, SINAI_PLACES } from './weather-places'
export type { WeatherPlace } from './weather-places'

/**
 * Weather for Sinai. Everything updates by itself, nothing is typed in by hand.
 *
 * - Live forecast (about the next 9 days): MET Norway, api.met.no.
 *   Free, no key, commercial use allowed with credit. Cached for 1 hour.
 * - Typical weather for dates further away: NASA POWER daily history for the
 *   last 10 full years, averaged for the same week of the year.
 *   Free, no key, no usage restrictions. Cached for 30 days, and the 10-year
 *   window moves forward by itself every January.
 */

export type DayWeather = {
  date: string // YYYY-MM-DD, Cairo time
  high: number
  low: number
  symbol?: string
  source: 'forecast' | 'typical'
}

type DayRange = { high: number; low: number; symbol?: string }

export type Forecast = {
  now?: { temp: number; symbol?: string }
  days: Map<string, DayRange>
}

export function todayInCairo() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date())
}

const cairoDate = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date(iso))
const cairoHour = (iso: string) =>
  Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', hourCycle: 'h23' }).format(new Date(iso)))

/* ---------- Live forecast: MET Norway ---------- */

type MetEntry = {
  time: string
  data: {
    instant: { details: { air_temperature?: number } }
    next_1_hours?: { summary?: { symbol_code?: string } }
    next_6_hours?: { summary?: { symbol_code?: string } }
  }
}

/** Returns null if MET Norway can't be reached, so pages still render. */
export async function getForecast(place: WeatherPlace): Promise<Forecast | null> {
  try {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${place.lat.toFixed(2)}&lon=${place.lon.toFixed(2)}`
    const res = await fetch(url, {
      headers: { 'User-Agent': `SoloRetreats/1.0 ${siteUrl}` },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const json = (await res.json()) as { properties?: { timeseries?: MetEntry[] } }
    const series = json.properties?.timeseries ?? []
    if (!series.length) return null

    const buckets = new Map<string, { temps: number[]; symbol?: string; symbolScore: number }>()
    for (const entry of series) {
      const temp = entry.data.instant.details.air_temperature
      if (typeof temp !== 'number') continue
      const date = cairoDate(entry.time)
      const bucket = buckets.get(date) ?? { temps: [], symbolScore: 99 }
      bucket.temps.push(temp)
      // The symbol closest to midday becomes the icon for the day.
      const symbol = entry.data.next_1_hours?.summary?.symbol_code ?? entry.data.next_6_hours?.summary?.symbol_code
      const score = Math.abs(cairoHour(entry.time) - 12)
      if (symbol && score < bucket.symbolScore) {
        bucket.symbol = symbol
        bucket.symbolScore = score
      }
      buckets.set(date, bucket)
    }

    const days = new Map<string, DayRange>()
    for (const [date, b] of buckets) {
      if (b.temps.length < 3) continue // half-covered day, usually the last one
      days.set(date, { high: Math.round(Math.max(...b.temps)), low: Math.round(Math.min(...b.temps)), symbol: b.symbol })
    }

    const first = series[0]
    const nowTemp = first.data.instant.details.air_temperature
    return {
      now: typeof nowTemp === 'number' ? { temp: Math.round(nowTemp), symbol: first.data.next_1_hours?.summary?.symbol_code } : undefined,
      days,
    }
  } catch {
    return null
  }
}

/* ---------- Typical weather: NASA POWER history ---------- */

const YEARS = 10
const WINDOW = 3 // days on each side of the date, so each value averages ~70 real days

/** Day of year 0–364, with 29 Feb counted as 28 Feb. */
function dayOfYear(month: number, day: number) {
  const d = month === 2 && day === 29 ? 28 : day
  return Math.round((Date.UTC(2001, month - 1, d) - Date.UTC(2001, 0, 1)) / 86_400_000)
}

type Climate = { high: number; low: number }[] // index = day of year

/** Returns null if NASA POWER can't be reached. */
export async function getClimate(place: WeatherPlace): Promise<Climate | null> {
  try {
    const lastYear = Number(todayInCairo().slice(0, 4)) - 1
    const url =
      'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M_MAX,T2M_MIN&community=RE&format=JSON' +
      `&latitude=${place.lat.toFixed(2)}&longitude=${place.lon.toFixed(2)}&start=${lastYear - YEARS + 1}0101&end=${lastYear}1231`
    const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 * 30 } })
    if (!res.ok) return null
    const json = (await res.json()) as {
      properties?: { parameter?: { T2M_MAX?: Record<string, number>; T2M_MIN?: Record<string, number> } }
    }
    const maxes = json.properties?.parameter?.T2M_MAX ?? {}
    const mins = json.properties?.parameter?.T2M_MIN ?? {}

    const sum = Array.from({ length: 365 }, () => ({ high: 0, low: 0, n: 0 }))
    for (const [key, high] of Object.entries(maxes)) {
      const low = mins[key]
      // NASA marks missing values as -999.
      if (typeof high !== 'number' || typeof low !== 'number' || high < -100 || low < -100) continue
      const doy = dayOfYear(Number(key.slice(4, 6)), Number(key.slice(6, 8)))
      sum[doy].high += high
      sum[doy].low += low
      sum[doy].n += 1
    }
    if (sum.every((s) => !s.n)) return null

    return sum.map((_, doy) => {
      let high = 0, low = 0, n = 0
      for (let k = -WINDOW; k <= WINDOW; k++) {
        const s = sum[(doy + k + 365) % 365]
        high += s.high
        low += s.low
        n += s.n
      }
      return n ? { high: Math.round(high / n), low: Math.round(low / n) } : { high: NaN, low: NaN }
    })
  } catch {
    return null
  }
}

function typicalFor(climate: Climate | null, date: string) {
  const value = climate?.[dayOfYear(Number(date.slice(5, 7)), Number(date.slice(8, 10)))]
  return value && Number.isFinite(value.high) ? value : null
}

/* ---------- Putting it together ---------- */

function eachDate(from: string, to: string) {
  const dates: string[] = []
  const d = new Date(`${from}T00:00:00Z`)
  const end = new Date(`${to}T00:00:00Z`)
  while (d <= end && dates.length < 31) {
    dates.push(d.toISOString().slice(0, 10))
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return dates
}

/** Day by day for a trip: live forecast where available, typical weather for the rest. */
export async function getTripWeather(place: WeatherPlace, departure: Departure): Promise<DayWeather[]> {
  const dates = eachDate(departure.departureDate, departure.returnDate)
  const forecast = await getForecast(place)
  const needsClimate = dates.some((date) => !forecast?.days.has(date))
  const climate = needsClimate ? await getClimate(place) : null

  return dates.flatMap((date): DayWeather[] => {
    const live = forecast?.days.get(date)
    if (live) return [{ date, ...live, source: 'forecast' }]
    const typical = typicalFor(climate, date)
    return typical ? [{ date, ...typical, source: 'typical' }] : []
  })
}

/** One line summary for a trip, e.g. for a retreat card: warmest day and coolest night. */
export function summarize(days: DayWeather[]) {
  if (!days.length) return null
  const firstLive = days.find((d) => d.source === 'forecast')
  return {
    high: Math.max(...days.map((d) => d.high)),
    low: Math.min(...days.map((d) => d.low)),
    symbol: firstLive?.symbol,
    source: firstLive ? ('forecast' as const) : ('typical' as const),
  }
}

/** MET Norway symbol code → emoji + short label. */
export function describeSymbol(code?: string) {
  if (!code) return { icon: '☀️', label: 'Clear' }
  const night = code.endsWith('_night')
  if (code.includes('thunder')) return { icon: '⛈️', label: 'Thunderstorms' }
  if (code.includes('snow') || code.includes('sleet')) return { icon: '🌨️', label: 'Snow or sleet' }
  if (code.includes('rain')) return { icon: '🌧️', label: code.includes('light') ? 'Light rain' : 'Rain' }
  if (code.startsWith('fog')) return { icon: '🌫️', label: 'Fog' }
  if (code.startsWith('cloudy')) return { icon: '☁️', label: 'Cloudy' }
  if (code.startsWith('partlycloudy')) return { icon: night ? '☁️' : '⛅', label: 'Partly cloudy' }
  if (code.startsWith('fair')) return { icon: night ? '🌙' : '🌤️', label: 'Mostly clear' }
  return { icon: night ? '🌙' : '☀️', label: 'Clear' }
}
