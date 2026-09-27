import { CommentIcon } from '@sanity/icons/Comment'
import { HelpCircleIcon } from '@sanity/icons/HelpCircle'
import { ImageIcon } from '@sanity/icons/Image'
import { defineField, defineType } from 'sanity'
import { galleryCategories } from './categories'


export const galleryImage = defineType({
  name: 'galleryImage',
  title: 'Gallery photo',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
    defineField({ name: 'category', title: 'Category', type: 'string', options: { list: galleryCategories } }),
    defineField({ name: 'retreat', title: 'From which retreat?', type: 'reference', to: [{ type: 'retreat' }] }),
    defineField({ name: 'order', title: 'Order', type: 'number', description: 'Lower numbers show first. Optional.' }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'caption', subtitle: 'category', media: 'image' }, prepare: ({ title, subtitle, media }) => ({ title: title || 'Untitled photo', subtitle, media }) },
})

export const faq = defineType({
  name: 'faq',
  title: 'Question',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({ name: 'question', title: 'Question', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'answer', title: 'Answer', type: 'text', rows: 4, validation: (r) => r.required() }),
    defineField({ name: 'order', title: 'Order', type: 'number', description: 'Lower numbers show first. Optional.' }),
  ],
  orderings: [{ title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'question', subtitle: 'answer' } },
})

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Traveler review',
  type: 'document',
  icon: CommentIcon,
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'quote', title: 'What they said', type: 'text', rows: 4, validation: (r) => r.required().max(400) }),
    defineField({ name: 'retreat', title: 'Retreat', type: 'reference', to: [{ type: 'retreat' }] }),
    defineField({ name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true } }),
  ],
  preview: { select: { title: 'name', subtitle: 'quote', media: 'photo' } },
})
