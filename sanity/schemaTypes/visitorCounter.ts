import { EyeOpenIcon } from '@sanity/icons/EyeOpen'
import { defineField, defineType } from 'sanity'

/** One record, kept by the website. It counts each browser once. Nothing to edit here. */
export const visitorCounter = defineType({
  name: 'visitorCounter',
  title: 'Visitor counter',
  type: 'document',
  icon: EyeOpenIcon,
  fields: [
    defineField({
      name: 'count',
      title: 'Visitors counted',
      type: 'number',
      readOnly: true,
      description: 'Counted by the website, once per browser. To add visits from before the counter existed, use "Visits before the counter started" in Site settings > Home page.',
    }),
  ],
  preview: { prepare: () => ({ title: 'Visitor counter' }) },
})
