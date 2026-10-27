import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { defineField, defineType } from 'sanity'

export const bookingStatuses = [
  { title: 'New', value: 'new' },
  { title: 'Contacted', value: 'contacted' },
  { title: 'Confirmed', value: 'confirmed' },
  { title: 'Cancelled', value: 'cancelled' },
]

export const paymentStatuses = [
  { title: 'Unpaid', value: 'unpaid' },
  { title: 'Deposit paid', value: 'deposit' },
  { title: 'Paid in full', value: 'paid' },
]

export const bookingRequest = defineType({
  name: 'bookingRequest',
  title: 'Booking request',
  type: 'document',
  icon: EnvelopeIcon,
  fields: [
    defineField({ name: 'status', title: 'Status', type: 'string', options: { list: bookingStatuses, layout: 'radio', direction: 'horizontal' }, initialValue: 'new' }),
    defineField({ name: 'kind', title: 'Type', type: 'string', readOnly: true, options: { list: [{ title: 'Booking', value: 'booking' }, { title: 'Waitlist', value: 'waitlist' }] } }),
    defineField({ name: 'customer', title: 'Customer account', type: 'reference', to: [{ type: 'customer' }], weak: true, readOnly: true, description: 'Filled in when the traveler was signed in.' }),
    defineField({ name: 'name', title: 'Name', type: 'string', readOnly: true }),
    defineField({ name: 'email', title: 'Email', type: 'string', readOnly: true, description: 'Only when the traveler was signed in.' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string', readOnly: true }),
    defineField({ name: 'travelers', title: 'Travelers', type: 'number', readOnly: true }),
    defineField({ name: 'seats', title: 'Bus seats', type: 'array', of: [{ type: 'number' }], description: 'Seat numbers picked on the site. Taken while the request is New, Contacted or Confirmed; free again when Cancelled. You can edit them.' }),
    defineField({ name: 'retreat', title: 'Retreat', type: 'reference', to: [{ type: 'retreat' }], weak: true, readOnly: true }),
    defineField({ name: 'retreatTitle', title: 'Retreat name (at time of request)', type: 'string', readOnly: true }),
    defineField({ name: 'dates', title: 'Dates', type: 'string', readOnly: true }),
    defineField({ name: 'message', title: 'Message', type: 'text', rows: 3, readOnly: true }),
    defineField({ name: 'source', title: 'Came from', type: 'string', readOnly: true, description: 'Where they first found the site (Instagram, Google, a shared link...).' }),
    defineField({
      name: 'payment',
      title: 'Payment',
      type: 'string',
      options: { list: paymentStatuses, layout: 'radio', direction: 'horizontal' },
      initialValue: 'unpaid',
      description: 'Your own tracking. Does not change seats or the emails sent to the traveler.',
    }),
    defineField({ name: 'amountPaid', title: 'Amount paid (EGP)', type: 'number', validation: (r) => r.min(0) }),
    defineField({ name: 'notifiedStatus', title: 'Last emailed status', type: 'string', readOnly: true, description: 'Set by the Email customer button, so the same email is not sent twice.' }),
    defineField({ name: 'notes', title: 'Your notes', type: 'text', rows: 3, description: 'Private. Only you see this.' }),
  ],
  orderings: [{ title: 'Newest first', name: 'createdDesc', by: [{ field: '_createdAt', direction: 'desc' }] }],
  preview: {
    select: { name: 'name', retreat: 'retreatTitle', travelers: 'travelers', status: 'status', kind: 'kind', payment: 'payment' },
    prepare: ({ name, retreat, travelers, status, kind, payment }) => ({
      title: `${name || 'Unknown'}${kind === 'waitlist' ? ' (waitlist)' : ''}`,
      subtitle: [retreat, travelers ? `${travelers} traveler${travelers > 1 ? 's' : ''}` : null, bookingStatuses.find((s) => s.value === status)?.title, kind !== 'waitlist' && status === 'confirmed' ? paymentStatuses.find((p) => p.value === payment)?.title ?? 'Unpaid' : null].filter(Boolean).join(' · '),
    }),
  },
})
