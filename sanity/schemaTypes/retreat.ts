import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { RetreatLinks } from '../components/retreat-links'
import { imageGallery, imageWithAlt, simpleBlocks } from './fields'

export const retreatStatuses = [
  { title: 'Booking open', value: 'open' },
  { title: 'Few spots left', value: 'almostFull' },
  { title: 'Fully booked', value: 'full' },
  { title: 'Completed (moves to past retreats)', value: 'completed' },
]

export const retreat = defineType({
  name: 'retreat',
  title: 'Retreat',
  type: 'document',
  icon: EarthGlobeIcon,
  groups: [
    { name: 'main', title: 'Main', default: true },
    { name: 'trip', title: 'Dates & logistics' },
    { name: 'details', title: 'Details' },
    { name: 'photos', title: 'Photos' },
  ],
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', group: 'main', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Link',
      type: 'slug',
      group: 'main',
      description: 'The page address, e.g. /retreats/siwa-reset. Press Generate.',
      options: { source: 'title', maxLength: 60 },
      validation: (r) =>
          r.required().custom((value: { current?: string } | undefined) =>
            !value?.current || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current)
              ? true
              : 'Use lowercase English letters, numbers and dashes only. Press Generate to fix it.',
          ),
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'string',
      group: 'main',
      description: 'Copy these to share the retreat or ask travelers for a review.',
      readOnly: true,
      components: { input: RetreatLinks },
    }),
    defineField({ name: 'destination', title: 'Destination', type: 'string', group: 'main', placeholder: 'Siwa Oasis', validation: (r) => r.required() }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'main',
      description: 'Retreats move to Past retreats by themselves the day after their last return date. Use Completed only to end one early.',
      options: { list: retreatStatuses, layout: 'radio' },
      initialValue: 'open',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'spotsLeft',
      title: 'Spots left',
      type: 'number',
      group: 'main',
      description: 'Optional. Shown on the site as "4 spots left". Leave empty to hide.',
      validation: (r) => r.min(0).integer(),
    }),
    defineField({
      name: 'maxTravelers',
      title: 'Group size (maximum)',
      type: 'number',
      group: 'main',
      description: 'Optional. Shows "Up to N travelers" on the trip page. Leave empty to hide it.',
      validation: (r) => r.min(1).max(100).integer(),
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short description',
      type: 'text',
      rows: 3,
      group: 'main',
      description: 'One or two sentences for the retreat card and link previews.',
      validation: (r) => r.required().max(220),
    }),
    defineField({
      name: 'showPrice',
      title: 'Show price on the site',
      type: 'boolean',
      group: 'main',
      initialValue: false,
      description: 'When off, the page shows "Ask for the price on WhatsApp".',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
      group: 'main',
      placeholder: 'From EGP 4,500 per person',
      hidden: ({ document }) => !document?.showPrice,
    }),

    defineField({
      name: 'departures',
      title: 'Dates',
      type: 'array',
      group: 'trip',
      description: 'Add one row per trip date. If there is more than one, travelers choose when booking.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'departure',
          fields: [
            defineField({ name: 'departureDate', title: 'Departure', type: 'date', validation: (r) => r.required() }),
            defineField({ name: 'returnDate', title: 'Return', type: 'date', validation: (r) => r.required().min(r.valueOfField('departureDate')) }),
            defineField({ name: 'note', title: 'Note', type: 'string', placeholder: 'e.g. Long weekend' }),
          ],
          preview: {
            select: { from: 'departureDate', to: 'returnDate', note: 'note' },
            prepare: ({ from, to, note }) => ({ title: `${from || '?'} → ${to || '?'}`, subtitle: note }),
          },
        }),
      ],
      validation: (r) => r.min(1).error('Add at least one date.'),
    }),
    defineField({ name: 'camp', title: 'Camp', type: 'reference', group: 'trip', to: [{ type: 'camp' }] }),
    defineField({ name: 'busCompany', title: 'Bus company', type: 'reference', group: 'trip', to: [{ type: 'busCompany' }] }),
    defineField({ name: 'meetingPoint', title: 'Meeting point', type: 'string', group: 'trip', placeholder: 'Nasr City, in front of City Stars Gate 5' }),
    defineField({
      name: 'meetingPointMap',
      title: 'Meeting point on Google Maps',
      type: 'url',
      group: 'trip',
      description: 'Paste the Google Maps share link (e.g. https://maps.app.goo.gl/...). Shows an "Open in Maps" link on the retreat page.',
    }),
    defineField({ name: 'meetingTime', title: 'Meeting time', type: 'string', group: 'trip', placeholder: '11:00 PM' }),
    defineField({
      name: 'showWeather',
      title: 'Show weather on the page',
      type: 'boolean',
      group: 'trip',
      initialValue: true,
      description: 'Updates by itself. Works when the destination or camp location names a Sinai town (Nuweiba, Ras Shitan, Dahab, Sharm, Taba, Saint Catherine, Ras Sudr, El Tor).',
    }),

    simpleBlocks('description', 'Full description'),
    defineField({
      name: 'itinerary',
      title: 'Day by day',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'day',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', placeholder: 'Day 1 — Arrival', validation: (r) => r.required() }),
            defineField({ name: 'text', title: 'What happens', type: 'text', rows: 3 }),
          ],
        }),
      ],
    }),
    defineField({ name: 'included', title: 'Included', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'notIncluded', title: 'Not included', type: 'array', of: [{ type: 'string' }] }),
    defineField({ name: 'whatToBring', title: 'What to bring', type: 'array', of: [{ type: 'string' }] }),

    imageWithAlt('coverImage', 'Cover photo', true),
    imageGallery('images', 'More photos'),
  ].map((field) => {
    if (['description', 'itinerary', 'included', 'notIncluded', 'whatToBring'].includes(field.name)) return { ...field, group: 'details' }
    if (['coverImage', 'images'].includes(field.name)) return { ...field, group: 'photos' }
    return field
  }),
  orderings: [
    { title: 'Newest first', name: 'createdDesc', by: [{ field: '_createdAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', destination: 'destination', status: 'status', media: 'coverImage' },
    prepare: ({ title, destination, status, media }) => ({
      title,
      subtitle: [destination, retreatStatuses.find((s) => s.value === status)?.title].filter(Boolean).join(' · '),
      media,
    }),
  },
})
