import type { PortableTextBlock } from 'next-sanity'

export type SanityImage = {
  asset?: { _ref: string; _type?: string }
  hotspot?: unknown
  crop?: unknown
  alt?: string | null
}

export type RetreatStatus = 'open' | 'almostFull' | 'full' | 'completed'

export type Departure = { _key: string; departureDate: string; returnDate: string; note?: string | null }

export type RetreatCard = {
  _id: string
  title: string
  slug: string
  destination: string
  status: RetreatStatus
  spotsLeft?: number | null
  shortDescription?: string | null
  showPrice?: boolean | null
  price?: string | null
  departures?: Departure[] | null
  coverImage?: SanityImage | null
  campName?: string | null
  busName?: string | null
}

export type PartnerSummary = {
  _id: string
  _type: 'camp' | 'busCompany'
  name: string
  slug: string
  location?: string | null
  vehicleType?: string | null
  summary?: string | null
  coverImage?: SanityImage | null
}

export type Testimonial = { _id: string; name: string; quote: string; rating?: number | null; _createdAt?: string; photo?: SanityImage | null; retreat?: string | null }

export type ReviewableRetreat = { _id: string; title: string; slug: string; status: RetreatStatus; date?: string | null }

export type RetreatDetail = RetreatCard & {
  description?: PortableTextBlock[] | null
  itinerary?: { _key: string; title: string; text?: string | null }[] | null
  included?: string[] | null
  notIncluded?: string[] | null
  whatToBring?: string[] | null
  meetingPoint?: string | null
  meetingPointMap?: string | null
  meetingTime?: string | null
  showWeather?: boolean | null
  images?: SanityImage[] | null
  camp?: PartnerSummary | null
  bus?: PartnerSummary | null
  testimonials?: Testimonial[] | null
}

export type PartnerDetail = PartnerSummary & {
  description?: PortableTextBlock[] | null
  amenities?: string[] | null
  instagram?: string | null
  facebook?: string | null
  googleMaps?: string | null
  images?: SanityImage[] | null
  retreats?: RetreatCard[] | null
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
  highlights?: { _key: string; title: string; text?: string | null }[] | null
  organizerName?: string | null
  organizerPhoto?: SanityImage | null
  aboutTitle?: string | null
  aboutText?: PortableTextBlock[] | null
  seoDescription?: string | null
  showSinaiWeather?: boolean | null
  shareImage?: SanityImage | null
}

export type GalleryItem = { _id: string; caption?: string | null; category?: string | null; image: SanityImage; retreat?: string | null }
export type Faq = { _id: string; question: string; answer: string }

export type LegalDoc = { lastUpdated?: string | null; titleAr?: string | null; bodyEn?: PortableTextBlock[] | null; bodyAr?: PortableTextBlock[] | null }
