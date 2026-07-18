import { Resend } from 'resend'

// Lazy initialization - only create when RESEND_API_KEY is available
let resendInstance: Resend | null = null

export const getResend = () => {
  if (!resendInstance && process.env.RESEND_API_KEY) {
    resendInstance = new Resend(process.env.RESEND_API_KEY)
  }
  return resendInstance
}

const FROM = 'Ownzo <noreply@ownzo.in>'

export type EmailPayload =
  | { type: 'new_message';       to: string; senderName: string; preview: string;   chatId: string }
  | { type: 'offer_received';    to: string; buyerName: string;  offerPrice: number; listingTitle: string; offerId: string }
  | { type: 'offer_accepted';    to: string; sellerName: string; listingTitle: string; offerPrice: number }
  | { type: 'offer_rejected';    to: string; sellerName: string; listingTitle: string }
  | { type: 'buy_request_match'; to: string; listingTitle: string; requestTitle: string; buyRequestId: string }

function base(title: string, body: string, ctaLabel: string, ctaUrl: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08)">
        <!-- Header -->
        <tr><td style="background:#1B4332;padding:24px 32px">
          <p style="margin:0;color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px">Ownzo</p>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:12px">Your Community Marketplace</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px">
          <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#111">${title}</h2>
          <div style="font-size:14px;line-height:1.6;color:#444">${body}</div>
          <table style="margin-top:28px"><tr><td>
            <a href="${ctaUrl}" style="display:inline-block;background:#1B4332;color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:10px">${ctaLabel}</a>
          </td></tr></table>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 32px;border-top:1px solid #f0f0f0;text-align:center">
          <p style="margin:0;font-size:11px;color:#aaa">You received this because you use Ownzo · <a href="#" style="color:#aaa">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const resend = getResend()
  if (!resend) {
    console.warn('[email] Resend not configured, skipping email')
    return
  }

  const APP = process.env.NEXT_PUBLIC_APP_URL ?? 'https://ownzo.in'

  let subject: string, html: string

  switch (payload.type) {
    case 'new_message':
      subject = `💬 ${payload.senderName} sent you a message`
      html = base(
        `New message from ${payload.senderName}`,
        `<p>${payload.senderName} sent you:</p><blockquote style="margin:12px 0;padding:12px 16px;background:#f9f9f9;border-left:4px solid #1B4332;border-radius:4px;font-style:italic">"${payload.preview}"</blockquote>`,
        'Open Chat', `${APP}/chat?chatId=${payload.chatId}`
      )
      break

    case 'offer_received':
      subject = `💰 New offer on your listing!`
      html = base(
        `You received an offer of ₹${payload.offerPrice.toLocaleString('en-IN')}`,
        `<p><strong>${payload.buyerName}</strong> made an offer on <strong>${payload.listingTitle}</strong>.</p>
         <p>Offered: <strong style="color:#1B4332;font-size:18px">₹${payload.offerPrice.toLocaleString('en-IN')}</strong></p>
         <p>Review the offer and accept, decline or start chatting.</p>`,
        'Review Offer', `${APP}/offers`
      )
      break

    case 'offer_accepted':
      subject = `🎉 Your offer was accepted!`
      html = base(
        `Offer accepted — great news!`,
        `<p><strong>${payload.sellerName}</strong> accepted your offer of <strong>₹${payload.offerPrice.toLocaleString('en-IN')}</strong> for <strong>${payload.listingTitle}</strong>.</p>
         <p>Contact the seller to arrange pickup/delivery.</p>`,
        'Open Chat', `${APP}/chat`
      )
      break

    case 'offer_rejected':
      subject = `Your offer on ${payload.listingTitle} was declined`
      html = base(
        'Offer not accepted',
        `<p>Unfortunately <strong>${payload.sellerName}</strong> declined your offer on <strong>${payload.listingTitle}</strong>.</p>
         <p>You can browse similar listings or make a different offer.</p>`,
        'Browse Listings', `${APP}/listings`
      )
      break

    case 'buy_request_match':
      subject = `📦 Someone is looking for: ${payload.requestTitle}`
      html = base(
        `A buyer wants something you might have!`,
        `<p>A buyer posted a request for <strong>${payload.requestTitle}</strong> and your listing <strong>${payload.listingTitle}</strong> looks like a match.</p>
         <p>Tap "I Have This" to start a conversation.</p>`,
        'View Request', `${APP}/buy-requests`
      )
      break

    default:
      return
  }

  try {
    await resend.emails.send({ from: FROM, to: payload.to, subject, html })
  } catch (err) {
    console.error('[email] Failed to send:', err)
    // Non-critical — don't throw
  }
}
