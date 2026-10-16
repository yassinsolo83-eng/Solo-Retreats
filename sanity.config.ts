'use client'

import { useState } from 'react'
import { defineConfig, type DocumentActionComponent } from 'sanity'
import { structureTool } from 'sanity/structure'
import { dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemaTypes'
import { structure } from './sanity/structure'

const singletonTypes = new Set(['siteSettings', 'bookingTerms', 'privacyPolicy'])
const singletonActions = new Set(['publish', 'discardChanges', 'restore'])
// Customers and new booking requests are kept as drafts so the public dataset can't expose
// them. Hide "Publish" on a draft of these so it can't be made public by accident.
const privateTypes = new Set(['customer', 'bookingRequest', 'visitorCounter'])

/** "Email customer" button on a booking request: tells a signed-in traveler it is confirmed or cancelled. */
const emailCustomer: DocumentActionComponent = (props) => {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  return {
    label: busy ? 'Sending...' : 'Email customer',
    disabled: busy || !props.draft,
    onHandle: async () => {
      setBusy(true)
      try {
        const res = await fetch('/api/notify-booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: props.id }) })
        const data = await res.json().catch(() => ({}))
        setMessage(data.message || 'Something went wrong.')
      } catch {
        setMessage('Could not reach the website.')
      }
      setBusy(false)
    },
    dialog: message ? { type: 'dialog', onClose: () => { setMessage(null); props.onComplete() }, content: message } : undefined,
  }
}

export default defineConfig({
  name: 'solo-retreats',
  title: 'Solo Retreats',
  basePath: '/studio',
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({ schemaType }) => !singletonTypes.has(schemaType)),
  },
  document: {
    actions: (actions, context) => {
      if (singletonTypes.has(context.schemaType)) return actions.filter(({ action }) => action && singletonActions.has(action))
      if (privateTypes.has(context.schemaType)) {
        const wrapped = actions.map((item) =>
          item.action === 'publish' ? Object.assign((props: Parameters<typeof item>[0]) => {
            const result = item(props)
            return props.published ? result : null
          }, { action: 'publish' as const }) : item,
        )
        return context.schemaType === 'bookingRequest' ? [...wrapped, emailCustomer] : wrapped
      }
      return actions
    },
    newDocumentOptions: (options, { creationContext }) =>
      creationContext.type === 'global' ? options.filter((o) => !singletonTypes.has(o.templateId) && o.templateId !== 'bookingRequest' && o.templateId !== 'customer' && o.templateId !== 'visitorCounter') : options,
  },
  plugins: [structureTool({ structure })],
})
