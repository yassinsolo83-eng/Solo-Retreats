import type { Metadata } from 'next'
import { Plus } from 'lucide-react'
import { EmptyState, PageHeader } from '@/components/site/page-header'
import type { Faq, SiteSettings } from '@/lib/types'
import { whatsappUrl } from '@/lib/whatsapp'
import { sanityFetch } from '@/sanity/lib/client'
import { faqsQuery, settingsQuery } from '@/sanity/lib/queries'

export const revalidate = 60
export const metadata: Metadata = { title: 'FAQ', description: 'Answers about booking, traveling alone, camps and transport.' }

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([
    sanityFetch<Faq[]>(faqsQuery, {}, []),
    sanityFetch<SiteSettings | null>(settingsQuery, {}, null),
  ])
  const wa = whatsappUrl(settings?.whatsappNumber, 'Hi Solo Retreats! I have a question.')

  return (
    <>
      <PageHeader title="Questions, answered" />
      <div className="mx-auto max-w-3xl px-5 pb-24">
        {faqs.length ? (
          <div className="border-t border-ink/15">
            {faqs.map((f) => (
              <details key={f._id} className="group border-b border-ink/15">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-2xl [&::-webkit-details-marker]:hidden">
                  {f.question}
                  <Plus aria-hidden="true" className="shrink-0 text-clay transition-transform group-open:rotate-45" />
                </summary>
                <p className="max-w-2xl whitespace-pre-line pb-7 text-lg leading-relaxed text-stone">{f.answer}</p>
              </details>
            ))}
          </div>
        ) : (
          <EmptyState title="Questions coming soon" text="Until then, ask us anything directly." />
        )}
        {wa && (
          <p className="mt-12 text-lg text-stone">
            Didn't find your answer? <a href={wa} target="_blank" rel="noreferrer" className="text-clay underline underline-offset-4">Ask us on WhatsApp</a>
          </p>
        )}
      </div>
    </>
  )
}
