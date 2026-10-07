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
