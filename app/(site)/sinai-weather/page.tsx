import type { Metadata } from 'next'
import { PageHeader } from '@/components/site/page-header'
import { SinaiWeather } from '@/components/site/weather'
import type { SiteSettings } from '@/lib/types'
import { sanityFetch } from '@/sanity/lib/client'
import { settingsQuery } from '@/sanity/lib/queries'

export const revalidate = 3600
export const metadata: Metadata = { title: 'Sinai weather', description: 'Live temperatures from the places Solo Retreats travels to in Sinai.' }

export default async function SinaiWeatherPage() {
  const settings = await sanityFetch<SiteSettings | null>(settingsQuery, {}, null)
  return (
    <>
      <PageHeader title="Sinai right now" intro="Live temperatures from the places we travel to." />
      <SinaiWeather placeIds={settings?.weatherPlaces} standalone />
    </>
  )
}
