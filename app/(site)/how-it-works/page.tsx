import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/site/page-header'
import { PerksList } from '@/components/site/signin-form'
import { TextLink } from '@/components/site/text-link'
import type { SiteSettings } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { settingsQuery } from '@/sanity/lib/queries'

export const revalidate = 60
export const metadata: Metadata = { title: 'How booking works', description: 'From picking a retreat to travelling with the group, step by step.' }

const steps = [
  ['Pick a retreat', 'Every trip page lists the dates, the camp, the transport and what is included.'],
  ['Send a request', 'The booking form opens WhatsApp with your details filled in.'],
  ['Get the details', 'We reply with the price, the meeting point and how to confirm your spot.'],
  ['Show up', 'We handle the planning and travel with the group the whole way.'],
]

export default async function HowItWorksPage() {
  const settings = await sanityFetch<SiteSettings | null>(settingsQuery, {}, null)
  return (
    <>
      <PageHeader title="How booking works" intro="Four steps from picking a trip to travelling with the group." />
      <div className="mx-auto max-w-7xl px-5 pb-24 lg:px-10">
        <ol className="grid gap-x-10 sm:grid-cols-2">
          {steps.map(([title, text], i) => (
            <li key={title} className="border-t border-ink/15 py-8">
              <span className="font-display text-3xl text-clay">{i + 1}</span>
              <h2 className="mt-3 font-display text-3xl">{title}</h2>
              <p className="mt-2 max-w-sm leading-relaxed text-stone">{text}</p>
            </li>
          ))}
        </ol>

        <section className="mt-16 max-w-3xl rounded-[2rem] bg-dune p-6 sm:p-10">
          <h2 className="font-display text-3xl">Want to follow your request?</h2>
          <p className="mt-3 text-stone">You can book without an account. If you sign in with your email, you also get:</p>
          <div className="mt-5"><PerksList perks={settings?.memberPerks} /></div>
          <p className="mt-6"><TextLink href="/account">Sign in or see my bookings</TextLink></p>
        </section>

        <Link href="/retreats" className="mt-12 inline-flex min-h-12 items-center rounded-full bg-pine px-7 font-semibold text-sand hover:bg-pine-dark">See upcoming retreats</Link>
      </div>
    </>
  )
}
