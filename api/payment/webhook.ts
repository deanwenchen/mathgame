import { sql } from '@vercel/postgres'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const body = req.body
    const eventName = body.meta?.event_name

    if (eventName === 'order_created' || eventName === 'subscription_created') {
      const customerEmail = body.data?.attributes?.user_email
      const orderId = body.data?.id

      if (customerEmail) {
        await sql`
          UPDATE users SET is_premium = true, premium_expires_at = NOW() + INTERVAL '1 year'
          WHERE username = ${customerEmail}
        `
        console.log(`[Payment] Order ${orderId} - Premium activated for ${customerEmail}`)
      }
    }

    res.status(200).json({ success: true })
  } catch (error: any) {
    console.error('[Payment Webhook Error]', error)
    res.status(500).json({ error: error.message })
  }
}
