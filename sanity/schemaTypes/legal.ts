import { DocumentTextIcon } from '@sanity/icons/DocumentText'
import { defineArrayMember, defineField, defineType } from 'sanity'

const body = (name: string, title: string, rtl = false) =>
  defineField({
    name,
    title,
    type: 'array',
    description: rtl ? 'Arabic version. Shown right-to-left.' : 'English version.',
    of: [
      defineArrayMember({
        type: 'block',
        styles: [
          { title: 'Normal', value: 'normal' },
          { title: 'Heading', value: 'h3' },
        ],
        lists: [
          { title: 'Bullet', value: 'bullet' },
          { title: 'Numbered', value: 'number' },
        ],
      }),
    ],
  })

const legalFields = [
  defineField({ name: 'lastUpdated', title: 'Last updated', type: 'date' }),
  defineField({ name: 'titleAr', title: 'Arabic page title', type: 'string', description: 'Shown as the heading when the page is in Arabic.' }),
  body('bodyEn', 'English'),
  body('bodyAr', 'Arabic', true),
]

export const bookingTerms = defineType({
  name: 'bookingTerms',
  title: 'Booking terms',
  type: 'document',
  icon: DocumentTextIcon,
  fields: legalFields,
  preview: { prepare: () => ({ title: 'Booking terms' }) },
})

export const privacyPolicy = defineType({
  name: 'privacyPolicy',
  title: 'Privacy policy',
  type: 'document',
  icon: DocumentTextIcon,
  fields: legalFields,
  preview: { prepare: () => ({ title: 'Privacy policy' }) },
})
