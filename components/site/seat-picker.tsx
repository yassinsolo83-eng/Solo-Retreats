'use client'

import { BUS_ROWS } from '@/lib/seats'

function Wheel() {
  return (
    <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full border-2 border-stone/40 text-stone/60">
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /><path d="M3 12h7M14 12h7M12 14v7" /></svg>
    </span>
  )
}

export function SeatPicker({ taken, selected, onToggle, needed }: { taken: number[]; selected: number[]; onToggle: (seat: number) => void; needed: number }) {
  const seat = (n: number) => {
    const isTaken = taken.includes(n)
    const isSelected = selected.includes(n)
    const full = !isSelected && selected.length >= needed
    return (
      <button
        key={n}
        type="button"
        disabled={isTaken}
        aria-pressed={isSelected}
        aria-label={`Seat ${n}${isTaken ? ', taken' : ''}`}
        onClick={() => onToggle(n)}
        className={`flex size-12 items-center justify-center rounded-xl border text-sm font-semibold transition ${
          isTaken
            ? 'cursor-not-allowed border-transparent bg-ink/10 text-stone/50 line-through'
            : isSelected
              ? 'border-pine bg-pine text-sand'
              : full
                ? 'border-ink/10 bg-sand text-stone'
                : 'border-ink/20 bg-sand hover:border-pine'
        }`}
      >
        {n}
      </button>
    )
  }
  const empty = <span className="size-12" aria-hidden="true" />

  return (
    <div>
      <div className="mx-auto w-fit rounded-3xl border border-ink/10 bg-sand p-4">
        <p className="mb-3 text-center text-xs uppercase tracking-widest text-stone">Front of the bus</p>
        <div className="flex flex-col gap-2">
          {BUS_ROWS.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              {row.left.map((cell, j) => (cell === 'wheel' ? <Wheel key={j} /> : cell === 0 ? <span key={j}>{empty}</span> : seat(cell)))}
              <span className="w-8" aria-hidden="true" />
              {row.right ? seat(row.right) : empty}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-stone">
        <span>Free</span>
        <span className="text-pine">Yours</span>
        <span className="line-through">Taken</span>
      </p>
    </div>
  )
}
