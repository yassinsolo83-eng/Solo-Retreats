import { defineArrayMember, defineField } from 'sanity'

export const imageWithAlt = (name: string, title: string, required = false) =>
  defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    fields: [
      defineField({
        name: 'alt',
        title: 'Alt text',
        type: 'string',
        description: 'A short description of the photo for screen readers and Google.',
      }),
    ],
    validation: required ? (rule) => rule.required() : undefined,
  })

export const imageGallery = (name = 'images', title = 'Photos') =>
  defineField({
    name,
    title,
    type: 'array',
    options: { layout: 'grid' },
    of: [
      defineArrayMember({
        type: 'image',
        options: { hotspot: true },
        fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string' })],
      }),
    ],
  })

export const simpleBlocks = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'array',
    of: [
      defineArrayMember({
        type: 'block',
        styles: [
          { title: 'Normal', value: 'normal' },
          { title: 'Heading', value: 'h3' },
        ],
        lists: [{ title: 'Bullet', value: 'bullet' }],
      }),
    ],
  })

export const linkFields = [
  defineField({ name: 'instagram', title: 'Instagram link', type: 'url' }),
  defineField({ name: 'facebook', title: 'Facebook link', type: 'url' }),
  defineField({ name: 'googleMaps', title: 'Google Maps link', type: 'url' }),
]
