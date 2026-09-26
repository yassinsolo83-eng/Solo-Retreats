# Solo Retreats

## Updating the website

The editable content lives in `components/retreats-landing.tsx`:

- Update `siteConfig.contact` for WhatsApp, email, Facebook and Instagram.
- Update the `retreats` array for destinations, dates, prices, partners, inclusions and availability. Keep unconfirmed values clearly marked as placeholders.
- Update `gallery`, `faqs` and partner cards in the same central data area.
- Replace `/public/og-image.jpg` when the official social sharing image is available.

The booking form currently validates in the browser and shows a demo success state. Connect the TODO in `BookingForm` to a server endpoint before accepting real reservations.

Solo Retreats organizes and curates travel experiences in cooperation with independent accommodation and transportation partners.
