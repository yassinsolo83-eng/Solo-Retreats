import 'server-only'
import { siteUrl } from './site'
import type { Departure } from './types'

/**
 * Weather for Sinai.
 *
 * - Live forecast: MET Norway (api.met.no). Free, no API key, commercial use
 *   allowed as long as we credit "MET Norway" next to the data.
 *   It covers roughly the next 9 days.
 * - Dates further away: typical monthly highs/lows from the table below.
 *
 * Results are cached by Next.js for one hour, so the site calls MET Norway
 * at most once per place per hour, whatever the traffic.
 */

export type WeatherPlace = {
  id: string
  name: string
  /** Lowercase words that identify the place in a destination or camp location. */
  match: string[]
  lat: number
  lon: number
  /** Typical [high, low] in °C for Jan…Dec. Approximate long-term averages. */
  climate: [number, number][]
}

// Coastal Gulf of Aqaba climate, reused for places close to each other.
const NUWEIBA_CLIMATE: [number, number][] = [
  [21, 10], [22, 11], [25, 14], [29, 17], [33, 21], [36, 24],
  [37, 26], [37, 26], [34, 24], [30, 21], [26, 16], [22, 12],
]

export const SINAI_PLACES: WeatherPlace[] = [
  { id: 'ras-shitan', name: 'Ras Shitan', match: ['ras shitan', 'ras shetan', 'ras shaitan'], lat: 29.13, lon: 34.69, climate: NUWEIBA_CLIMATE },
  { id: 'nuweiba', name: 'Nuweiba', match: ['nuweiba', 'nuwaiba', 'nueiba'], lat: 29.03, lon: 34.66, climate: NUWEIBA_CLIMATE },
  {
    id: 'dahab', name: 'Dahab', match: ['dahab'], lat: 28.5, lon: 34.51,
    climate: [[22, 12], [23, 13], [25, 15], [29, 19], [33, 22], [35, 25], [37, 27], [37, 27], [35, 25], [31, 22], [27, 17], [23, 14]],
  },
  {
    id: 'sharm', name: 'Sharm El Sheikh', match: ['sharm'], lat: 27.91, lon: 34.33,
    climate: [[22, 13], [22, 13], [25, 16], [29, 19], [33, 23], [36, 26], [37, 27], [37, 27], [35, 26], [31, 23], [27, 18], [23, 15]],
  },
  {
    id: 'taba', name: 'Taba', match: ['taba'], lat: 29.49, lon: 34.89,
    climate: [[21, 10], [22, 11], [26, 14], [30, 18], [35, 22], [38, 25], [39, 27], [39, 27], [36, 25], [32, 21], [27, 16], [22, 12]],
  },
  {
    id: 'st-catherine', name: 'Saint Catherine', match: ['catherine', 'katherine'], lat: 28.56, lon: 33.95,
    climate: [[13, 2], [14, 3], [17, 5], [21, 9], [25, 12], [28, 15], [30, 17], [30, 17], [27, 15], [24, 11], [19, 7], [15, 3]],
  },
  {
    id: 'ras-sudr', name: 'Ras Sudr', match: ['sudr', 'sidr'], lat: 29.59, lon: 32.71,
    climate: [[20, 10], [21, 11], [23, 13], [27, 16], [31, 20], [34, 23], [35, 25], [35, 25], [33, 23], [30, 20], [25, 15], [21, 12]],
  },
  {
    id: 'el-tor', name: 'El Tor', match: ['el tor', 'al tur', 'el tur'], lat: 28.24, lon: 33.62,
    climate: [[21, 12], [22, 12], [24, 15], [28, 18], [32, 22], [34, 24], [35, 26], [36, 26], [33, 24], [30, 21], [26, 17], [22, 13]],
  },
]

/** Places shown in the "Sinai right now" strip on the home page. */
export const SINAI_OVERVIEW = ['sharm', 'dahab', 'nuweiba', 'taba', 'st-catherine']

/** Finds the Sinai place mentioned in any of the given texts (destination, camp location). */
export function findPlace(...texts: (string | null | undefined)[]) {
  const haystack = texts.filter(Boolean).join(' ').toLowerCase()
  if (!haystack) return null
  return SINAI_PLACES.find((p) => p.match.some((word) => haystack.includes(word))) ?? null
}

export type DayWeather = {
  date: string // YYYY-MM-DD, Cairo time
  high: number
  low: number
  symbol?: string
  source: 'forecast' | 'typical'
}

export type Forecast = {
  now?: { temp: number; symbol?: string }
  days: Map<string, Omit<DayWeather, 'date' | 'source'>>
}

const cairoDate = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date(iso))
const cairoHour = (iso: string) =>
  Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', hour: '2-digit', hourCycle: 'h23' }).format(new Date(iso)))

type MetEntry = {
  time: string
  data: {
    instant: { details: { air_temperature?: number } }
    next_1_hours?: { summary?: { symbol_code?: string } }
    next_6_hours?: { summary?: { symbol_code?: string } }
  }
}

/** Live forecast for one place. Returns null if MET Norway is unreachable, so pages still render. */
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
      // Use the symbol closest to midday as the icon for the day.
      const symbol = entry.data.next_1_hours?.summary?.symbol_code ?? entry.data.next_6_hours?.summary?.symbol_code
      const score = Math.abs(cairoHour(entry.time) - 12)
      if (symbol && score < bucket.symbolScore) {
        bucket.symbol = symbol
        bucket.symbolScore = score
      }
      buckets.set(date, bucket)
    }

    const days = new Map<string, Omit<DayWeather, 'date' | 'source'>>()
    for (const [date, b] of buckets) {
      // Skip half-covered days (usually the last one in the forecast).
      if (b.temps.length < 3) continue
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

/** Day-by-day weather for a trip: forecast where available, typical values for the rest. */
export function tripWeather(place: WeatherPlace, departure: Departure, forecast: Forecast | null): DayWeather[] {
  return eachDate(departure.departureDate, departure.returnDate).map((date) => {
    const live = forecast?.days.get(date)
    if (live) return { date, ...live, source: 'forecast' }
    const [high, low] = place.climate[Number(date.slice(5, 7)) - 1]
    return { date, high, low, source: 'typical' }
  })
}

export function todayInCairo() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Cairo' }).format(new Date())
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
