'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemaTypes'
import { structure } from './sanity/structure'

const singletonTypes = new Set(['siteSettings', 'bookingTerms', 'privacyPolicy'])
const singletonActions = new Set(['publish', 'discardChanges', 'restore'])
// Customers and new booking requests are kept as drafts so the public dataset can't expose
// them. Hide "Publish" on a draft of these so it can't be made public by accident.
const privateTypes = new Set(['customer', 'bookingRequest'])

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
        return actions.map((item) =>
          item.action === 'publish' ? Object.assign((props: Parameters<typeof item>[0]) => (props.published ? item(props) : null), { action: 'publish' as const }) : item,
        )
      }
      return actions
    },
    newDocumentOptions: (options, { creationContext }) =>
      creationContext.type === 'global' ? options.filter((o) => !singletonTypes.has(o.templateId) && o.templateId !== 'bookingRequest' && o.templateId !== 'customer') : options,
  },
  plugins: [structureTool({ structure })],
})
