import { PortableText, type PortableTextBlock, type PortableTextComponents } from 'next-sanity'

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="mb-5 last:mb-0">{children}</p>,
    h3: ({ children }) => <h3 className="mb-3 mt-8 font-display text-2xl text-ink">{children}</h3>,
  },
  list: { bullet: ({ children }) => <ul className="mb-5 list-disc space-y-2 pl-5">{children}</ul> },
  marks: {
    link: ({ children, value }) => (
      <a href={value?.href} className="text-clay underline underline-offset-4" target="_blank" rel="noreferrer">{children}</a>
    ),
  },
}

export function RichText({ value, className = '' }: { value?: PortableTextBlock[] | null; className?: string }) {
  if (!value?.length) return null
  return <div className={`text-lg leading-[1.7] text-stone ${className}`}><PortableText value={value} components={components} /></div>
}
