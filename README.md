# Solo Retreats

Next.js site with Sanity Studio built in at `/studio`.

## Editing content

Everything on the site is edited from `/studio`:

- **Site settings**: WhatsApp number, email, social links, home page text and photo, About page, share image.
- **Retreats**: dates, camp, bus company, status, photos, itinerary, what's included.
- **Camps / Bus companies**: partner pages.
- **Gallery, Traveler reviews, FAQ**.
- **Booking terms, Privacy policy**: English and Arabic. Shown at /terms and /privacy (add ?lang=ar for Arabic).
- **Booking requests**: a copy of every request sent from the site.
- **Customers**: travelers who signed in with their email (name, phone, number of requests, your private notes).
- **Site settings → Accounts**: optional perks shown to travelers who sign in.

Published changes show on the site within about a minute.

## Environment variables (Vercel)

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `h9gtpviw` |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_API_WRITE_TOKEN` | Editor token (saves booking requests) |
| `RESEND_API_KEY` | From resend.com. Emails you each booking request |
| `BOOKING_NOTIFY_EMAIL` | Where booking emails go (the email you signed up to Resend with) |
| `BOOKING_FROM_EMAIL` | Optional. Only after verifying your own domain in Resend |
| `AUTH_LOGIN_SECRET` | Long random string. Signs the emailed sign-in links |
| `AUTH_SESSION_SECRET` | A different long random string. Signs the logged-in cookie |
| `GMAIL_USER` | The Gmail address that sends the sign-in emails |
| `GMAIL_APP_PASSWORD` | A Google App Password for that Gmail (not the normal password) |
| `NEXT_PUBLIC_SITE_URL` | Optional. Your custom domain once you have one |

## Booking flow

The booking form on each retreat page opens WhatsApp with the traveler's details filled in and saves a copy under **Booking requests** in the studio. If a retreat is marked **Fully booked**, the form becomes a waitlist.

## Optional sign-in

Travelers can book without an account. If they sign in (email link, no password) they can follow the status of their requests at `/account`, get their name and phone filled in, and can't send a second open request for the same retreat. Request statuses are changed in the studio: New, Contacted, Confirmed, Cancelled.

Customers and booking requests created by the site are stored as **drafts** on purpose. The free Sanity plan only has public datasets, so anything published can be read by anyone who knows the project ID; drafts need a token. Don't publish them (the Publish button is hidden for these). Booking requests saved before this change are published, so they remain publicly readable until deleted or moved.
