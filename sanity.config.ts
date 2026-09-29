'use client'

import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemaTypes'
import { structure } from './sanity/structure'

const singletonTypes = new Set(['siteSettings', 'bookingTerms', 'privacyPolicy'])
const singletonActions = new Set(['publish', 'discardChanges', 'restore'])

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
    actions: (actions, context) =>
      singletonTypes.has(context.schemaType) ? actions.filter(({ action }) => action && singletonActions.has(action)) : actions,
    newDocumentOptions: (options, { creationContext }) =>
      creationContext.type === 'global' ? options.filter((o) => !singletonTypes.has(o.templateId) && o.templateId !== 'bookingRequest') : options,
  },
  plugins: [structureTool({ structure })],
})
