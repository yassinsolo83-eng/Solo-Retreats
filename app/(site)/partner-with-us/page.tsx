import type { Metadata } from 'next'
import { PageHeader } from '@/components/site/page-header'
import { PartnerRequestForm } from '@/components/site/partner-request-form'

export const metadata: Metadata = {
  title: 'Partner with us',
  description: 'Run a workshop, activity, camp or transport service on a Solo Retreats trip.',
}

export default function PartnerWithUsPage() {
  return (
    <>
      <PageHeader title="Partner with us" intro="Run a workshop, an activity, a camp or a transport service on our small-group trips. Tell us about it and we will get back to you." />
      <div className="mx-auto max-w-2xl px-5 pb-24">
        <PartnerRequestForm />
      </div>
    </>
  )
}
