import { defineQuery } from 'next-sanity'

const image = `{ asset, hotspot, crop, alt }`

const retreatCard = `
  _id,
  title,
  "slug": slug.current,
  destination,
  status,
  spotsLeft,
  shortDescription,
  showPrice,
  price,
  departures[]{ _key, departureDate, returnDate, note },
  coverImage${image},
  "campName": camp->name,
  "busName": busCompany->name
`

export const settingsQuery = defineQuery(`*[_type == "siteSettings"][0]{
  whatsappNumber, email, instagram, facebook, tiktok,
  heroTitle, heroText, heroImage${image}, highlights[]{ _key, title, text },
  organizerName, organizerPhoto${image}, aboutTitle, aboutText,
  seoDescription, shareImage${image}
}`)

export const upcomingRetreatsQuery = defineQuery(`*[_type == "retreat" && status != "completed" && defined(slug.current)]
  | order(coalesce(departures[0].departureDate, "9999") asc){ ${retreatCard} }`)

export const pastRetreatsQuery = defineQuery(`*[_type == "retreat" && status == "completed" && defined(slug.current)]
  | order(departures[0].departureDate desc){ ${retreatCard} }`)

export const retreatSlugsQuery = defineQuery(`*[_type == "retreat" && defined(slug.current)].slug.current`)

export const retreatBySlugQuery = defineQuery(`*[_type == "retreat" && slug.current == $slug][0]{
  ${retreatCard},
  description,
  itinerary[]{ _key, title, text },
  included, notIncluded, whatToBring,
  meetingPoint, meetingTime,
  images[]${image},
  "camp": camp->{ name, "slug": slug.current, location, summary, coverImage${image} },
  "bus": busCompany->{ name, "slug": slug.current, vehicleType, summary, coverImage${image} },
  "testimonials": *[_type == "testimonial" && retreat._ref == ^._id]{ _id, name, quote, photo${image} }
}`)

const partnerFields = `
  _id, _type, name, "slug": slug.current, location, vehicleType, summary,
  coverImage${image}
`

export const partnersQuery = defineQuery(`{
  "camps": *[_type == "camp" && defined(slug.current)] | order(name asc){ ${partnerFields} },
  "buses": *[_type == "busCompany" && defined(slug.current)] | order(name asc){ ${partnerFields} }
}`)

export const partnerSlugsQuery = defineQuery(`*[_type in ["camp", "busCompany"] && defined(slug.current)].slug.current`)

export const partnerBySlugQuery = defineQuery(`*[_type in ["camp", "busCompany"] && slug.current == $slug][0]{
  ${partnerFields},
  description, amenities, instagram, facebook, googleMaps,
  images[]${image},
  "retreats": *[_type == "retreat" && references(^._id) && status != "completed" && defined(slug.current)]{ ${retreatCard} }
}`)

export const galleryQuery = defineQuery(`*[_type == "galleryImage" && defined(image.asset)]
  | order(coalesce(order, 9999) asc, _createdAt desc){
  _id, caption, category, image{ asset, hotspot, crop, "alt": ^.caption }, "retreat": retreat->title
}`)

export const faqsQuery = defineQuery(`*[_type == "faq"] | order(coalesce(order, 9999) asc, _createdAt asc){ _id, question, answer }`)

export const testimonialsQuery = defineQuery(`*[_type == "testimonial"] | order(_createdAt desc)[0...6]{
  _id, name, quote, photo${image}, "retreat": retreat->title
}`)

export const legalQuery = defineQuery(`*[_type == $type][0]{ lastUpdated, titleAr, bodyEn, bodyAr }`)
