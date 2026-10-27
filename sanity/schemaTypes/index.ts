import { bookingRequest } from './bookingRequest'
import { customer } from './customer'
import { faq, galleryImage, testimonial } from './content'
import { bookingTerms, privacyPolicy } from './legal'
import { tripItem } from './tripItem'
import { partnerRequest } from './partnerRequest'
import { busCompany, camp, workshop, activity } from './partners'
import { retreat } from './retreat'
import { siteSettings } from './siteSettings'
import { visitorCounter } from './visitorCounter'

export const schemaTypes = [siteSettings, retreat, tripItem, camp, busCompany, workshop, activity, galleryImage, testimonial, faq, bookingRequest, partnerRequest, customer, bookingTerms, privacyPolicy, visitorCounter]
