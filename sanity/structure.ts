import type { StructureBuilder, StructureResolver } from 'sanity/structure'
import { apiVersion } from './env'

const requestList = (S: StructureBuilder, title: string, filter: string) =>
  S.listItem()
    .title(title)
    .schemaType('bookingRequest')
    .child(
      S.documentList()
        .title(title)
        .apiVersion(apiVersion)
        .schemaType('bookingRequest')
        .filter(filter)
        .defaultOrdering([{ field: '_createdAt', direction: 'desc' }]),
    )

const partnerList = (S: StructureBuilder, title: string, filter: string) =>
  S.listItem()
    .title(title)
    .schemaType('partnerRequest')
    .child(
      S.documentList()
        .title(title)
        .apiVersion(apiVersion)
        .schemaType('partnerRequest')
        .filter(filter)
        .defaultOrdering([{ field: '_createdAt', direction: 'desc' }]),
    )

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Solo Retreats')
    .items([
      S.listItem()
        .title('Site settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings').title('Site settings')),
      S.listItem()
        .title('Visitor counter')
        .id('visitorCounter')
        .child(S.document().schemaType('visitorCounter').documentId('visitorCounter').title('Visitor counter')),
      S.divider(),
      S.documentTypeListItem('retreat').title('Retreats'),
      S.documentTypeListItem('tripItem').title('Trip items (included, bring…)'),
      S.listItem()
        .title('Booking requests')
        .schemaType('bookingRequest')
        .child(
          S.list()
            .title('Booking requests')
            .items([
              requestList(S, 'New', '_type == "bookingRequest" && status == "new"'),
              requestList(S, 'Confirmed, not fully paid', '_type == "bookingRequest" && kind != "waitlist" && status == "confirmed" && payment != "paid"'),
              requestList(S, 'Confirmed and paid', '_type == "bookingRequest" && kind != "waitlist" && status == "confirmed" && payment == "paid"'),
              requestList(S, 'Waitlist', '_type == "bookingRequest" && kind == "waitlist" && status != "cancelled"'),
              S.listItem()
                .title('By retreat')
                .child(
                  S.documentTypeList('retreat')
                    .title('Choose a retreat')
                    .child((retreatId: string) =>
                      S.documentList()
                        .title('Requests for this retreat')
                        .apiVersion(apiVersion)
                        .schemaType('bookingRequest')
                        .filter('_type == "bookingRequest" && retreat._ref == $retreatId')
                        .params({ retreatId: retreatId.replace(/^drafts\./, '') })
                        .defaultOrdering([{ field: '_createdAt', direction: 'desc' }]),
                    ),
                ),
              requestList(S, 'All requests', '_type == "bookingRequest"'),
            ]),
        ),
      S.listItem()
        .title('Partner requests')
        .schemaType('partnerRequest')
        .child(
          S.list()
            .title('Partner requests')
            .items([
              partnerList(S, 'New', '_type == "partnerRequest" && status == "new"'),
              partnerList(S, 'All requests', '_type == "partnerRequest"'),
            ]),
        ),
      S.documentTypeListItem('customer').title('Customers'),
      S.divider(),
      S.documentTypeListItem('camp').title('Camps'),
      S.documentTypeListItem('busCompany').title('Bus companies'),
      S.documentTypeListItem('workshop').title('Workshop hosts'),
      S.documentTypeListItem('activity').title('Activity partners'),
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
