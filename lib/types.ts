import type { PortableTextBlock } from 'next-sanity'

export type SanityImage = {
  asset?: { _ref: string; _type?: string }
  hotspot?: unknown
  crop?: unknown
  alt?: string | null
  /** Only on photos fetched for galleries. */
  _key?: string
  width?: number | null
  height?: number | null
  lqip?: string | null
}

export type RetreatStatus = 'open' | 'almostFull' | 'full' | 'completed'

export type Departure = { _key: string; departureDate: string; returnDate: string; note?: string | null }

export type RetreatCard = {
  _id: string
  title: string
  titleAr?: string | null
  slug: string
  destination: string
  destinationAr?: string | null
  status: RetreatStatus
  spotsLeft?: number | null
  shortDescription?: string | null
  shortDescriptionAr?: string | null
  showPrice?: boolean | null
  price?: string | null
  departures?: Departure[] | null
  coverImage?: SanityImage | null
  campName?: string | null
  campLocation?: string | null
  busName?: string | null
  showWeather?: boolean | null
}

export type PartnerSummary = {
  _id: string
  _type: 'camp' | 'busCompany' | 'workshop' | 'activity'
  name: string
  nameAr?: string | null
  slug: string
  location?: string | null
  locationAr?: string | null
  vehicleType?: string | null
  vehicleTypeAr?: string | null
  host?: string | null
  hostAr?: string | null
  summary?: string | null
  summaryAr?: string | null
  coverImage?: SanityImage | null
}

export type Testimonial = { _id: string; name: string; quote: string; rating?: number | null; _createdAt?: string; photo?: SanityImage | null; retreat?: string | null }

export type ReviewableRetreat = { _id: string; title: string; slug: string; status: RetreatStatus; date?: string | null }

export type TripItem = { _id: string; name: string; nameAr?: string | null }

export type RetreatDetail = RetreatCard & {
  description?: PortableTextBlock[] | null
  descriptionAr?: PortableTextBlock[] | null
  itinerary?: { _key: string; title: string; titleAr?: string | null; text?: string | null; textAr?: string | null }[] | null
  included?: string[] | null
  notIncluded?: string[] | null
  whatToBring?: string[] | null
  includedItems?: TripItem[] | null
  notIncludedItems?: TripItem[] | null
  whatToBringItems?: TripItem[] | null
  meetingPoint?: string | null
  meetingPointAr?: string | null
  meetingPointMap?: string | null
  meetingTime?: string | null
  maxTravelers?: number | null
  images?: SanityImage[] | null
  camp?: PartnerSummary | null
  bus?: PartnerSummary | null
  workshop?: PartnerSummary | null
  activities?: PartnerSummary[] | null
  testimonials?: Testimonial[] | null
}

export type PartnerDetail = PartnerSummary & {
  description?: PortableTextBlock[] | null
  descriptionAr?: PortableTextBlock[] | null
  amenities?: string[] | null
  amenitiesAr?: string[] | null
  instagram?: string | null
  facebook?: string | null
  googleMaps?: string | null
  coverPhoto?: SanityImage | null
  images?: SanityImage[] | null
  retreats?: RetreatCard[] | null
  testimonials?: Testimonial[] | null
}

export type SiteSettings = {
  whatsappNumber?: string | null
  email?: string | null
  instagram?: string | null
  facebook?: string | null
  tiktok?: string | null
  heroTitle?: string | null
  heroText?: string | null
  heroImage?: SanityImage | null
  heroSlides?: HeroSlideData[] | null
  heroSeconds?: number | null
  highlights?: { _key: string; title: string; text?: string | null }[] | null
  organizerName?: string | null
  organizerPhoto?: SanityImage | null
  aboutTitle?: string | null
  aboutText?: PortableTextBlock[] | null
  seoDescription?: string | null
  showSinaiWeather?: boolean | null
  weatherPlaces?: string[] | null
  showVisitorCounter?: boolean | null
  visitorsBefore?: number | null
  memberPerks?: string[] | null
  paymentNote?: string | null
  cancellationNote?: string | null
  shareImage?: SanityImage | null
}

export type HeroSlideData =
  | ({ _key: string; _type: 'heroPhoto' } & SanityImage)
  | { _key: string; _type: 'heroVideo'; source?: string | null; poster?: SanityImage | null }

export type GalleryItem = { _id: string; caption?: string | null; category?: string | null; image: SanityImage; retreat?: string | null }
export type Faq = { _id: string; question: string; answer: string }

export type LegalDoc = { lastUpdated?: string | null; titleAr?: string | null; bodyEn?: PortableTextBlock[] | null; bodyAr?: PortableTextBlock[] | null }
