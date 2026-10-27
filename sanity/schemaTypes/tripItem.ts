import { TagIcon } from '@sanity/icons/Tag'
import { defineField, defineType } from 'sanity'

export const tripItemKinds = [
  { title: 'Included', value: 'included' },
  { title: 'Not included', value: 'notIncluded' },
  { title: 'What to bring', value: 'bring' },
]

/** A reusable line such as "Breakfast" or "Swimsuit", written once in English and Arabic, then picked in any retreat. */
export const tripItem = defineType({
  name: 'tripItem',
  title: 'Trip item',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', placeholder: 'Breakfast', validation: (r) => r.required() }),
    defineField({ name: 'nameAr', title: 'Arabic name', type: 'string' }),
    defineField({
      name: 'kinds',
      title: 'Where it is used',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: tripItemKinds, layout: 'grid' },
      description: 'Tick where you will pick it, so each list only offers the right items. Leave empty to offer it everywhere.',
    }),
  ],
  orderings: [{ title: 'Name', name: 'nameAsc', by: [{ field: 'name', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'nameAr' } },
})
