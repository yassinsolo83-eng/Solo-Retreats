/** One bus layout for every trip: 12 passenger seats, numbered as on the bus. */
export const BUS_SEATS = 12

/** Rows from the front. 0 = empty space, 'wheel' = the driver. Left pair, then the right single seat. */
export const BUS_ROWS: { left: (number | 'wheel' | 0)[]; right: number }[] = [
  { left: ['wheel', 0], right: 1 },
  { left: [2, 3], right: 0 },
  { left: [4, 5], right: 6 },
  { left: [7, 8], right: 9 },
  { left: [10, 11], right: 12 },
]

export const SEAT_STATUSES = ['new', 'contacted', 'confirmed']

/** Reads a list of seat numbers from request data: whole numbers 1-12, no repeats. */
export function parseSeats(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null
  const seats = value.map((v) => Number(v))
  if (seats.some((n) => !Number.isInteger(n) || n < 1 || n > BUS_SEATS)) return null
  if (new Set(seats).size !== seats.length) return null
  return seats.sort((a, b) => a - b)
}
