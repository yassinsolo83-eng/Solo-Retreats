import 'server-only'
import nodemailer from 'nodemailer'
import { BRAND } from './site'

// Sends through a normal Gmail account (SMTP + an App Password), so no domain or paid
// email service is needed. Set GMAIL_USER and GMAIL_APP_PASSWORD in Vercel.
let cached: ReturnType<typeof nodemailer.createTransport> | null = null

function getTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) return null
  if (!cached) cached = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
  return cached
}

export async function sendLoginEmail(to: string, link: string): Promise<boolean> {
  const transporter = getTransporter()
  if (!transporter) {
    console.error('GMAIL_USER / GMAIL_APP_PASSWORD are not set, so sign-in emails cannot be sent.')
    return false
  }
  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #24332d; background: #f6f3ed;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">${BRAND}</h1>
      <p style="font-size: 15px; line-height: 1.7; margin: 0 0 24px;">Tap the button below to sign in and follow your booking requests. This link expires in 15 minutes.</p>
      <p style="margin: 0 0 28px;">
        <a href="${link}" style="background: #26473d; color: #f6f3ed; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-size: 15px; display: inline-block;">Sign in to ${BRAND}</a>
      </p>
      <p style="font-size: 13px; color: #5f6b64; line-height: 1.6; margin: 0;">If you didn't ask for this, you can safely ignore this email.</p>
    </div>`
  try {
    await transporter.sendMail({ from: `"${BRAND}" <${process.env.GMAIL_USER}>`, to, subject: `Sign in to ${BRAND}`, html })
    return true
  } catch (error) {
    console.error('Sending the sign-in email failed:', error)
    return false
  }
}

type StatusEmail = {
  name: string
  status: 'confirmed' | 'cancelled'
  retreatTitle?: string
  dates?: string
  travelers?: number
  seats?: number[]
  accountUrl: string
}

/** Tells a signed-in traveler their request was confirmed or cancelled. */
export async function sendBookingStatusEmail(to: string, b: StatusEmail): Promise<boolean> {
  const transporter = getTransporter()
  if (!transporter) {
    console.error('GMAIL_USER / GMAIL_APP_PASSWORD are not set, so status emails cannot be sent.')
    return false
  }
  const first = (b.name || '').split(' ')[0] || 'there'
  const confirmed = b.status === 'confirmed'
  const rows: [string, string][] = [
    ['Trip', b.retreatTitle || ''],
    ['Dates', b.dates || ''],
    ['Travelers', b.travelers ? String(b.travelers) : ''],
    ['Seats', b.seats?.length ? b.seats.join(', ') : ''],
  ]
  const details = rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 16px 6px 0;color:#5f6b64">${k}</td><td style="padding:6px 0">${v.replace(/</g, '&lt;')}</td></tr>`)
    .join('')
  const html = `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #24332d; background: #f6f3ed;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">${BRAND}</h1>
      <p style="font-size: 15px; line-height: 1.7; margin: 0 0 16px;">Hi ${first.replace(/</g, '&lt;')},</p>
      <p style="font-size: 15px; line-height: 1.7; margin: 0 0 20px;">${
        confirmed ? 'Good news, your spot is confirmed.' : 'Your request has been cancelled. If this is a surprise, just reply on WhatsApp and we will sort it out.'
      }</p>
      <table style="font-size: 15px; margin: 0 0 24px; border-collapse: collapse">${details}</table>
      <p style="margin: 0 0 28px;">
        <a href="${b.accountUrl}" style="background: #26473d; color: #f6f3ed; padding: 12px 28px; border-radius: 999px; text-decoration: none; font-size: 15px; display: inline-block;">See my bookings</a>
      </p>
    </div>`
  try {
    await transporter.sendMail({
      from: `"${BRAND}" <${process.env.GMAIL_USER}>`,
      to,
      subject: confirmed ? `Your spot is confirmed${b.retreatTitle ? `: ${b.retreatTitle}` : ''}` : `Your request was cancelled${b.retreatTitle ? `: ${b.retreatTitle}` : ''}`,
      html,
    })
    return true
  } catch (error) {
    console.error('Sending the status email failed:', error)
    return false
  }
}
