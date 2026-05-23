import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { generateHeadshots } from '@/lib/replicate'
import { sendHeadshotsEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const runtime = 'nodejs'
export const maxDuration = 300 // 5 min — AI generation takes time

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  // Verify the webhook is genuinely from Stripe
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Only process successful payments
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const metadata = session.metadata || {}
  const email = metadata.email

  if (!email) {
    console.error('No email in session metadata')
    return NextResponse.json({ error: 'No email found' }, { status: 400 })
  }

  try {
    // Reconstruct the file URLs from chunked metadata
    const urlParts: string[] = []
    let i = 0
    while (metadata[`urls_${i}`]) {
      urlParts.push(metadata[`urls_${i}`])
      i++
    }
    const fileUrls = urlParts.join('').split(',').filter(Boolean)

    if (fileUrls.length === 0) {
      throw new Error('No file URLs found in metadata')
    }

    console.log(`Generating headshots for ${email} with ${fileUrls.length} source images`)

    // Generate headshots with AI
    const headshots = await generateHeadshots(fileUrls)

    console.log(`Generated ${headshots.length} headshots for ${email}`)

    // Email the results
    await sendHeadshotsEmail(email, headshots)

    console.log(`Headshots delivered to ${email}`)

    return NextResponse.json({ success: true, count: headshots.length })
  } catch (error) {
    console.error('Generation/email error:', error)
    // In production: add retry logic or alert system here
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    )
  }
}
