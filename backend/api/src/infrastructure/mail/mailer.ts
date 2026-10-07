import { Resend } from 'resend'
import { logger } from '../logging/logger.js'

const apiKey = process.env.RESEND_API_KEY
const resend = apiKey ? new Resend(apiKey) : null
const FROM = process.env.MAIL_FROM || 'SyncRank <onboarding@resend.dev>'

export async function sendOtpMail(to: string, code: string) {
  if (!resend) {
    // No key configured: don't crash in dev, just log the code
    logger.warn({ msg: 'RESEND_API_KEY not set, OTP not emailed', to, code })
    return
  }
  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: 'Your SyncRank verification code',
    html: `<div style="font-family:sans-serif">
      <h2>Verify your email</h2>
      <p>Your SyncRank code is:</p>
      <p style="font-size:32px;letter-spacing:6px;font-weight:700">${code}</p>
      <p>It expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>`,
  })
  if (error) throw new Error(`Resend error: ${error.message}`)
}
