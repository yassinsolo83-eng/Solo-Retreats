import { CogIcon } from '@sanity/icons/Cog'
import { defineArrayMember, defineField, defineType } from 'sanity'
import { SINAI_PLACES } from '../../lib/weather-places'
import { imageWithAlt, simpleBlocks } from './fields'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'contact', title: 'Contact', default: true },
    { name: 'home', title: 'Home page' },
    { name: 'about', title: 'About page' },
    { name: 'seo', title: 'Sharing & SEO' },
  ],
  fields: [
    defineField({
      name: 'whatsappNumber',
      title: 'WhatsApp number',
      type: 'string',
      group: 'contact',
      description: 'Country code + number, digits only. Example: 201001234567. All booking requests are sent here.',
      validation: (rule) =>
        rule.regex(/^\d{10,15}$/, { name: 'digits only' }).error('Use digits only, starting with the country code (e.g. 201001234567).'),
    }),
    defineField({ name: 'email', title: 'Email', type: 'string', group: 'contact' }),
    defineField({ name: 'instagram', title: 'Instagram link', type: 'url', group: 'contact' }),
    defineField({ name: 'facebook', title: 'Facebook link', type: 'url', group: 'contact' }),
    defineField({ name: 'tiktok', title: 'TikTok link', type: 'url', group: 'contact' }),

    defineField({ name: 'heroTitle', title: 'Headline', type: 'string', group: 'home', initialValue: 'Small-group retreats to the quiet corners of Egypt' }),
    defineField({ name: 'heroText', title: 'Intro text', type: 'text', rows: 3, group: 'home' }),
    defineField({
      name: 'showSinaiWeather',
      title: 'Show "Sinai right now" weather',
      type: 'boolean',
      group: 'home',
      initialValue: true,
      description: 'A live weather section on the home page, under "Coming up". Updates by itself every hour.',
    }),
    defineField({
      name: 'weatherPlaces',
      title: 'Places in "Sinai right now"',
      type: 'array',
      group: 'home',
      of: [{ type: 'string' }],
      options: { list: SINAI_PLACES.map((p) => ({ title: p.name, value: p.id })) },
      description: 'Pick up to 5. Leave empty for Sharm, Dahab, Nuweiba, Taba and Saint Catherine.',
      hidden: ({ document }) => document?.showSinaiWeather === false,
      validation: (rule) => rule.max(5).unique(),
    }),
    defineField({
      name: 'heroSlides',
      title: 'Top photos and videos',
      type: 'array',
      group: 'home',
      description:
        'Shown one after another at the top of the home page, in this order. Drag to reorder. Videos play muted, so they need no sound.',
      of: [
        defineArrayMember({
          name: 'heroPhoto',
          title: 'Photo',
          type: 'image',
          options: { hotspot: true },
          fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', description: 'A short description of the photo.' })],
        }),
        defineArrayMember({
          name: 'heroVideo',
          title: 'Video',
          type: 'object',
          fields: [
            defineField({
              name: 'source',
              title: 'Video file name',
              type: 'string',
              placeholder: 'nuweiba-beach.mp4',
              description:
                'Upload the video to GitHub, inside the "public" folder, then type its exact file name here. MP4, under 10 MB, 10–20 seconds. A full link (https://...) to a video hosted somewhere else also works.',
              validation: (rule) =>
                rule.required().custom((value) => {
                  if (!value) return true
                  const v = String(value).trim()
                  if (/^https?:\/\//i.test(v)) return true
                  if (v.includes('/') || v.includes(' ')) return 'Type only the file name, e.g. nuweiba-beach.mp4 (no folders, no spaces).'
                  return /\.(mp4|webm)$/i.test(v) || 'The file name should end in .mp4 or .webm'
                }),
            }),
            defineField({
              name: 'poster',
              title: 'Still photo',
              type: 'image',
              options: { hotspot: true },
              description: 'Shown while the video loads, and to visitors who turned off motion on their phone. A frame from the video works best.',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'source', media: 'poster' },
            prepare: ({ title, media }) => ({ title: title || 'Video', subtitle: 'Video', media }),
          },
        }),
      ],
      validation: (rule) => rule.max(8),
    }),
    defineField({
      name: 'heroSeconds',
      title: 'Seconds per photo',
      type: 'number',
      group: 'home',
      initialValue: 7,
      description: 'How long each photo stays before the next one. Videos play to the end. Default 7.',
      validation: (rule) => rule.min(4).max(20),
      hidden: ({ document }) => !Array.isArray(document?.heroSlides) || document.heroSlides.length < 2,
    }),
    imageWithAlt('heroImage', 'Main photo (used only when there are no top photos above)'),
    defineField({
      name: 'highlights',
      title: 'Why come with us',
      type: 'array',
      group: 'home',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'text', title: 'Text', type: 'text', rows: 2 }),
          ],
        }),
      ],
      validation: (rule) => rule.max(6),
    }),

    defineField({ name: 'organizerName', title: 'Your name', type: 'string', group: 'about' }),
    imageWithAlt('organizerPhoto', 'Your photo'),
    defineField({ name: 'aboutTitle', title: 'About headline', type: 'string', group: 'about' }),
    simpleBlocks('aboutText', 'About text'),

    defineField({
      name: 'seoDescription',
      title: 'Site description',
      type: 'text',
      rows: 2,
      group: 'seo',
      description: 'Shown on Google and when the site link is shared. Around 150 characters.',
      validation: (rule) => rule.max(170),
    }),
    imageWithAlt('shareImage', 'Share image (1200 × 630)'),
  ].map((field) => {
    // Attach image fields to their groups
    if (field.name === 'heroImage') return { ...field, group: 'home' }
    if (field.name === 'organizerPhoto' || field.name === 'aboutText') return { ...field, group: 'about' }
    if (field.name === 'shareImage') return { ...field, group: 'seo' }
    return field
  }),
  preview: { prepare: () => ({ title: 'Site settings' }) },
})
