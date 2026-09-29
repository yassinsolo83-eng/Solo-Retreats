import Link from 'next/link'
import type { LegalDoc } from '@/lib/types'
import { EmptyState } from './page-header'
import { RichText } from './rich-text'

type Props = { doc: LegalDoc | null; title: string; path: string; lang: 'en' | 'ar' }

export function LegalPage({ doc, title, path, lang }: Props) {
  const hasAr = Boolean(doc?.bodyAr?.length)
  const hasEn = Boolean(doc?.bodyEn?.length)
  const showAr = lang === 'ar' && hasAr
  const body = showAr ? doc?.bodyAr : doc?.bodyEn ?? doc?.bodyAr
  const date = doc?.lastUpdated
    ? new Intl.DateTimeFormat(showAr ? 'ar-EG' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${doc.lastUpdated}T00:00:00Z`))
    : null
  const pill = (active: boolean) =>
    `inline-flex min-h-10 items-center rounded-full px-4 text-sm transition ${active ? 'bg-pine text-sand' : 'bg-dune hover:bg-dune-deep'}`

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-10 lg:pt-16">
      {hasAr && hasEn && (
        <nav aria-label="Language" className="mb-8 flex gap-2">
          <Link href={path} className={pill(!showAr)} aria-current={!showAr ? 'page' : undefined} hrefLang="en">English</Link>
          <Link href={`${path}?lang=ar`} className={pill(showAr)} aria-current={showAr ? 'page' : undefined} hrefLang="ar">AR</Link>
        </nav>
      )}
      <article dir={showAr ? 'rtl' : 'ltr'} lang={showAr ? 'ar' : 'en'} className={showAr ? 'font-arabic' : ''}>
        <h1 className="font-display text-5xl leading-[1.05] tracking-[-0.02em] sm:text-6xl">{showAr && doc?.titleAr ? doc.titleAr : title}</h1>
        {date && <p className="mt-4 text-sm text-stone">{showAr ? date : `Last updated ${date}`}</p>}
        {body?.length ? (
          <RichText value={body} className="mt-10" />
        ) : (
          <div className="mt-10"><EmptyState title="Coming soon" text="This page is being written. Message us on WhatsApp with any questions in the meantime." /></div>
        )}
      </article>
    </div>
  )
}
