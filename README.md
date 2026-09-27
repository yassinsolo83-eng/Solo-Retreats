# Solo Retreats

Next.js site with Sanity Studio built in at `/studio`.

## Editing content

Everything on the site is edited from `/studio`:

- **Site settings**: WhatsApp number, email, social links, home page text and photo, About page, share image.
- **Retreats**: dates, camp, bus company, status, photos, itinerary, what's included.
- **Camps / Bus companies**: partner pages.
- **Gallery, Traveler reviews, FAQ**.
- **Booking requests**: a copy of every request sent from the site.

Published changes show on the site within about a minute.

## Environment variables (Vercel)

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `h9gtpviw` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_API_WRITE_TOKEN` | Editor token (saves booking requests) |
| `NEXT_PUBLIC_SITE_URL` | Optional. Your custom domain once you have one |

## Booking flow

The booking form on each retreat page opens WhatsApp with the traveler's details filled in and saves a copy under **Booking requests** in the studio. If a retreat is marked **Fully booked**, the form becomes a waitlist.
