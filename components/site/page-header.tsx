export function PageHeader({ title, intro, children }: { title: string; intro?: string | null; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-12 pt-10 lg:px-10 lg:pb-16 lg:pt-16">
      <h1 className="max-w-4xl font-display text-5xl leading-[1.02] tracking-[-0.02em] sm:text-7xl">{title}</h1>
      {intro && <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone">{intro}</p>}
      {children}
    </div>
  )
}

export function EmptyState({ title, text, action }: { title: string; text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-ink/20 px-6 py-16 text-center">
      <p className="font-display text-3xl">{title}</p>
      <p className="mx-auto mt-3 max-w-md text-stone">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
