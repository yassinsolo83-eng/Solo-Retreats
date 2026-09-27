export function whatsappUrl(number: string | null | undefined, text?: string) {
  if (!number) return null
  const base = `https://wa.me/${number.replace(/\D/g, '')}`
  return text ? `${base}?text=${encodeURIComponent(text)}` : base
}

type BookingMessage = {
  kind: 'booking' | 'waitlist'
  retreatTitle: string
  dates?: string
  name: string
  phone: string
  travelers: number
  message?: string
  link: string
}

export function bookingMessage(b: BookingMessage) {
  const lines = [
    b.kind === 'waitlist'
      ? `Hi Solo Retreats! Please add me to the waitlist for ${b.retreatTitle}.`
      : `Hi Solo Retreats! I'd like to book ${b.retreatTitle}.`,
    '',
    b.dates ? `Dates: ${b.dates}` : null,
    `Travelers: ${b.travelers}`,
    `Name: ${b.name}`,
    `Phone: ${b.phone}`,
    b.message ? `Message: ${b.message}` : null,
    '',
    b.link,
  ]
  return lines.filter((l) => l !== null).join('\n')
}
