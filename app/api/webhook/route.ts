import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { generateHeadshots, getInputImagesFromPrediction, TIERS, Tier } from '@/lib/replicate'
import { sendHeadshotsEmail } from '@/lib/email'

export const runtime = 'nodejs'
export const maxDuration = 300 // parallel AI generation + email, worst case ~2-3 min

// How long a fulfillment "claim" is honored before a Stripe retry may re-attempt
const CLAIM_TTL_MS = 10 * 60 * 1000

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  })
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

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const metadata = session.metadata || {}
  const email = metadata.email
  const tier = (metadata.tier || 'premium') as Tier
  const predictionId = metadata.prediction_id

  if (!email || !predictionId) {
    console.error('Missing email or prediction_id in session metadata', metadata)
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
  }

  // --- Idempotency: Stripe retries webhooks; never generate or email twice ---
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id

  if (paymentIntentId) {
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
    if (pi.metadata.fulfilled === 'true') {
      console.log(`Order ${paymentIntentId} already fulfilled — skipping duplicate webhook`)
      return NextResponse.json({ received: true, duplicate: true })
    }
    const claimedAt = Number(pi.metadata.fulfillment_claimed_at || 0)
    if (claimedAt && Date.now() - claimedAt < CLAIM_TTL_MS) {
      console.log(`Order ${paymentIntentId} fulfillment in progress — skipping concurrent webhook`)
      return NextResponse.json({ received: true, inProgress: true })
    }
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: { fulfillment_claimed_at: String(Date.now()) },
    })
  }

  try {
    // Recover the customer's photos from the preview prediction record —
    // no photo data ever passes through Stripe.
    const inputImages = await getInputImagesFromPrediction(predictionId)

    const count = TIERS[tier]?.count ?? 30
    console.log(`Generating ${count} headshots for ${email} (tier: ${tier}, ${inputImages.length} reference photos)`)

    const headshots = await generateHeadshots(inputImages, count)
    console.log(`Generated ${headshots.length} headshots for ${email}`)

    // Email results as ATTACHMENTS — Replicate URLs expire within ~1 hour,
    // so links alone would be dead by the time many customers open the email.
    await sendHeadshotsEmail(email, headshots)
    console.log(`Headshots delivered to ${email}`)

    if (paymentIntentId) {
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: { fulfilled: 'true', delivered_count: String(headshots.length) },
      })
    }

    return NextResponse.json({ success: true, count: headshots.length })
  } catch (error) {
    console.error('Generation/email error:', error)
    // Release the claim so Stripe's automatic retry can attempt again
    if (paymentIntentId) {
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: { fulfillment_claimed_at: '' },
      }).catch(() => {})
    }
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
