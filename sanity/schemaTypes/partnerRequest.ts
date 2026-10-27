import { UsersIcon } from '@sanity/icons/Users'
import { defineField, defineType } from 'sanity'

export const partnerStatuses = [
  { title: 'New', value: 'new' },
  { title: 'Talking', value: 'talking' },
  { title: 'Accepted', value: 'accepted' },
  { title: 'Declined', value: 'declined' },
]

export const partnerKinds = [
  { title: 'Camp', value: 'camp' },
  { title: 'Transport', value: 'transport' },
  { title: 'Workshop', value: 'workshop' },
  { title: 'Activity', value: 'activity' },
  { title: 'Other', value: 'other' },
]

export const partnerRequest = defineType({
  name: 'partnerRequest',
  title: 'Partner request',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({ name: 'status', title: 'Status', type: 'string', options: { list: partnerStatuses, layout: 'radio', direction: 'horizontal' }, initialValue: 'new' }),
    defineField({ name: 'kind', title: 'Type', type: 'string', readOnly: true, options: { list: partnerKinds } }),
    defineField({ name: 'name', title: 'Contact name', type: 'string', readOnly: true }),
    defineField({ name: 'business', title: 'Business or workshop name', type: 'string', readOnly: true }),
    defineField({ name: 'phone', title: 'Phone', type: 'string', readOnly: true }),
    defineField({ name: 'email', title: 'Email', type: 'string', readOnly: true }),
    defineField({ name: 'link', title: 'Instagram or website', type: 'string', readOnly: true }),
    defineField({ name: 'message', title: 'About their offer', type: 'text', rows: 5, readOnly: true }),
    defineField({ name: 'notes', title: 'Your notes', type: 'text', rows: 3, description: 'Private. Only you see this.' }),
  ],
  orderings: [{ title: 'Newest first', name: 'createdDesc', by: [{ field: '_createdAt', direction: 'desc' }] }],
  preview: {
    select: { name: 'name', business: 'business', kind: 'kind', status: 'status' },
    prepare: ({ name, business, kind, status }) => ({
      title: business || name || 'Unknown',
      subtitle: [partnerKinds.find((k) => k.value === kind)?.title, partnerStatuses.find((s) => s.value === status)?.title].filter(Boolean).join(' · '),
    }),
  },
})
