import { HomeIcon } from '@sanity/icons/Home'
import { TransferIcon } from '@sanity/icons/Transfer'
import { defineField, defineType } from 'sanity'
import { imageGallery, imageWithAlt, linkFields, simpleBlocks } from './fields'

const slugField = defineField({
  name: 'slug',
  title: 'Link',
  type: 'slug',
  description: 'The page address, e.g. /partners/lily-camp. Press Generate.',
  options: { source: 'name', maxLength: 60 },
  validation: (r) => r.required(),
})

export const camp = defineType({
  name: 'camp',
  title: 'Camp',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    slugField,
    defineField({ name: 'location', title: 'Location', type: 'string', placeholder: 'Nuweiba, South Sinai' }),
    defineField({ name: 'summary', title: 'Short description', type: 'text', rows: 2, validation: (r) => r.max(220) }),
    simpleBlocks('description', 'Full description'),
    defineField({ name: 'amenities', title: 'What guests get', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    imageWithAlt('coverImage', 'Cover photo'),
    imageGallery(),
    ...linkFields,
  ],
  preview: { select: { title: 'name', subtitle: 'location', media: 'coverImage' } },
})

export const busCompany = defineType({
  name: 'busCompany',
  title: 'Bus company',
  type: 'document',
  icon: TransferIcon,
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    slugField,
    defineField({ name: 'vehicleType', title: 'Vehicle', type: 'string', placeholder: 'VIP mini-bus, 28 seats' }),
    defineField({ name: 'summary', title: 'Short description', type: 'text', rows: 2, validation: (r) => r.max(220) }),
    simpleBlocks('description', 'Full description'),
    defineField({ name: 'amenities', title: 'On board', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
    imageWithAlt('coverImage', 'Cover photo'),
    imageGallery(),
    ...linkFields,
  ],
  preview: { select: { title: 'name', subtitle: 'vehicleType', media: 'coverImage' } },
})
