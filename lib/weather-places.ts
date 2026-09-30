/**
 * Sinai places the site knows how to show weather for.
 * No server code here, so Sanity Studio can use the same list for its options.
 */

export type WeatherPlace = {
  id: string
  name: string
  /** Lowercase words that identify the place in a destination or camp location. */
  match: string[]
  lat: number
  lon: number
}

export const SINAI_PLACES: WeatherPlace[] = [
  // Ras Shitan comes before Nuweiba so "Ras Shitan, Nuweiba" matches Ras Shitan.
  { id: 'ras-shitan', name: 'Ras Shitan', match: ['ras shitan', 'ras shetan', 'ras shaitan'], lat: 29.13, lon: 34.69 },
  { id: 'nuweiba', name: 'Nuweiba', match: ['nuweiba', 'nuwaiba', 'nueiba'], lat: 29.03, lon: 34.66 },
  { id: 'dahab', name: 'Dahab', match: ['dahab'], lat: 28.5, lon: 34.51 },
  { id: 'sharm', name: 'Sharm El Sheikh', match: ['sharm'], lat: 27.91, lon: 34.33 },
  { id: 'taba', name: 'Taba', match: ['taba'], lat: 29.49, lon: 34.89 },
  { id: 'st-catherine', name: 'Saint Catherine', match: ['catherine', 'katherine'], lat: 28.56, lon: 33.95 },
  { id: 'ras-sudr', name: 'Ras Sudr', match: ['sudr', 'sidr'], lat: 29.59, lon: 32.71 },
  { id: 'el-tor', name: 'El Tor', match: ['el tor', 'al tur', 'el tur'], lat: 28.24, lon: 33.62 },
]

/** Shown on the home page when no places are picked in Site settings. */
export const DEFAULT_HOME_PLACES = ['sharm', 'dahab', 'nuweiba', 'taba', 'st-catherine']

/** Finds the Sinai place mentioned in any of the given texts (destination, camp location). */
export function findPlace(...texts: (string | null | undefined)[]) {
  const haystack = texts.filter(Boolean).join(' ').toLowerCase()
  if (!haystack) return null
  return SINAI_PLACES.find((p) => p.match.some((word) => haystack.includes(word))) ?? null
}
