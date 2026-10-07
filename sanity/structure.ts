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
      S.documentTypeListItem('customer').title('Customers'),
      S.divider(),
      S.documentTypeListItem('camp').title('Camps'),
      S.documentTypeListItem('busCompany').title('Bus companies'),
      S.divider(),
      S.documentTypeListItem('galleryImage').title('Gallery'),
      S.listItem()
        .title('Traveler reviews')
        .schemaType('testimonial')
        .child(
          S.list()
            .title('Traveler reviews')
            .items([
              S.listItem()
                .title('Waiting for approval')
                .schemaType('testimonial')
                .child(
                  S.documentList()
                    .title('Waiting for approval')
                    .apiVersion(apiVersion)
                    .schemaType('testimonial')
                    .filter('_type == "testimonial" && approved == false')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }]),
                ),
              S.listItem()
                .title('All reviews')
                .schemaType('testimonial')
                .child(
                  S.documentList()
                    .title('All reviews')
                    .apiVersion(apiVersion)
                    .schemaType('testimonial')
                    .filter('_type == "testimonial"')
                    .defaultOrdering([{ field: '_createdAt', direction: 'desc' }]),
                ),
            ]),
        ),
      S.documentTypeListItem('faq').title('FAQ'),
      S.divider(),
      S.listItem()
        .title('Booking terms')
        .id('bookingTerms')
        .child(S.document().schemaType('bookingTerms').documentId('bookingTerms').title('Booking terms')),
      S.listItem()
        .title('Privacy policy')
        .id('privacyPolicy')
        .child(S.document().schemaType('privacyPolicy').documentId('privacyPolicy').title('Privacy policy')),
    ])
