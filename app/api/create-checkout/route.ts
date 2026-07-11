import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { TIERS, Tier, newReplicate } from '@/lib/replicate'

// Replicate auto-deletes API prediction inputs after 1 hour. We only sell
// while the customer's photos are still recoverable: the preview must be
// under 25 min old at checkout creation, and the checkout session itself
// expires after 30 min — worst case ~55 min, safely inside the window.
const MAX_PREDICTION_AGE_MS = 25 * 60 * 1000

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  })
  try {
    const { email, sessionId, tier, predictionId } = await req.json()

    if (!email || !sessionId || !tier || !predictionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!(tier in TIERS)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const selectedTier = TIERS[tier as Tier]

    // Confirm the preview prediction still holds the customer's photos
    const replicate = newReplicate()
    const prediction = await replicate.predictions.get(predictionId)
    const input = (prediction.input ?? {}) as Record<string, unknown>
    const age = Date.now() - new Date(prediction.created_at).getTime()
    if (!input.input_image || age > MAX_PREDICTION_AGE_MS) {
      return NextResponse.json(
        { error: 'expired', message: 'Your preview session has expired. Please start over — it only takes a minute.' },
        { status: 409 }
      )
    }
    // Persist the hosted photo URL now, while it's confirmed to exist. Replicate
    // purges prediction input data after its own retention window (observed:
    // gone within a few days), independent of anything we control — if the
    // webhook fires late (Stripe retries failing webhooks for up to 3 days),
    // re-deriving the photo from the prediction record can fail even though the
    // order is otherwise perfectly fulfillable. Storing it directly in Stripe
    // metadata makes fulfillment durable regardless of Replicate's retention.
    const photoUrl = String(input.input_image)

    // We also keep prediction_id for backward compatibility with in-flight
    // orders created before photo_url existed — the webhook falls back to
    // re-deriving the photo from Replicate if photo_url is ever absent.
    //
    // Redirect back to the domain the customer is actually on. Deriving this
    // from the request means a missing or placeholder NEXT_PUBLIC_BASE_URL can
    // never send paying customers to the wrong site (e.g. a Vercel login page).
    const configuredBase = process.env.NEXT_PUBLIC_BASE_URL
    const baseUrl =
      req.headers.get('origin') ||
      (configuredBase && !configuredBase.includes('your-app.vercel.app')
        ? configuredBase
        : null) ||
      req.nextUrl.origin

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      allow_promotion_codes: true,
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `SnapShot AI — ${selectedTier.label}`,
              description: `${selectedTier.count} high-resolution AI-generated professional headshot${selectedTier.count !== 1 ? 's' : ''}, delivered to your inbox.`,
            },
            unit_amount: selectedTier.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        session_id: sessionId,
        email,
        tier,
        prediction_id: predictionId,
        photo_url: photoUrl,
      },
      expires_at: Math.floor(Date.now() / 1000) + 31 * 60, // Stripe minimum is 30 min
      success_url: `${baseUrl}/success?email=${encodeURIComponent(email)}&session_id=${sessionId}&tier=${tier}`,
      cancel_url: `${baseUrl}/upload`,
    })

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
