import { UserIcon } from '@sanity/icons/User'
import { defineField, defineType } from 'sanity'

// One document per email address. A customer is created the first time someone signs in
// with an emailed link, and the name, phone, booking count and last-booking date are kept
// up to date automatically from their booking requests. These documents are stored as
// drafts on purpose (see lib/customers.ts), so don't publish them.
export const customer = defineType({
  name: 'customer',
  title: 'Customer',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({ name: 'email', title: 'Email', type: 'string', readOnly: true, description: 'How this traveler signs in.' }),
    defineField({ name: 'name', title: 'Name', type: 'string', readOnly: true }),
    defineField({ name: 'phone', title: 'Phone', type: 'string', readOnly: true, description: 'From their most recent request.' }),
    defineField({ name: 'bookingsCount', title: 'Requests so far', type: 'number', initialValue: 0, readOnly: true }),
    defineField({ name: 'lastBookingAt', title: 'Last request', type: 'datetime', readOnly: true }),
    defineField({ name: 'notes', title: 'Your notes', type: 'text', rows: 4, description: 'Private. Only you see this.' }),
  ],
  orderings: [{ title: 'Last request, newest first', name: 'lastRequest', by: [{ field: 'lastBookingAt', direction: 'desc' }] }],
  preview: {
    select: { name: 'name', email: 'email', phone: 'phone', count: 'bookingsCount' },
    prepare: ({ name, email, phone, count }) => ({
      title: name || email || 'Customer',
      subtitle: [email, phone, count ? `${count} request${count === 1 ? '' : 's'}` : null].filter(Boolean).join(' · '),
    }),
  },
})
