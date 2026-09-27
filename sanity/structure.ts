import type { StructureResolver } from 'sanity/structure'
import { apiVersion } from './env'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Solo Retreats')
    .items([
      S.listItem()
        .title('Site settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site settings')),
      S.divider(),
      S.documentTypeListItem('retreat').title('Retreats'),
      S.listItem()
        .title('Booking requests')
        .schemaType('bookingRequest')
        .child(
          S.list()
            .title('Booking requests')
            .items([
              S.listItem()
                .title('New')
                .schemaType('bookingRequest')
                .child(
                  S.documentList()
                    .title('New requests')
                    .apiVersion(apiVersion)
                    .schemaType('bookingRequest')
                    .filter('_type == "bookingRequest" && status == "new"')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }]),
                ),
              S.listItem()
                .title('All requests')
                .schemaType('bookingRequest')
                .child(
                  S.documentList()
                    .title('All requests')
                    .apiVersion(apiVersion)
                    .schemaType('bookingRequest')
                    .filter('_type == "bookingRequest"')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }]),
                ),
            ]),
        ),
      S.divider(),
      S.documentTypeListItem('camp').title('Camps'),
      S.documentTypeListItem('busCompany').title('Bus companies'),
      S.divider(),
      S.documentTypeListItem('galleryImage').title('Gallery'),
      S.documentTypeListItem('testimonial').title('Traveler reviews'),
      S.documentTypeListItem('faq').title('FAQ'),
    ])
