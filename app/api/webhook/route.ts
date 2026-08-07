import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { generateHeadshots, getInputImagesFromPrediction, TIERS, Tier, isValidStyle, DEFAULT_STYLE } from '@/lib/replicate'
import { sendHeadshotsEmail, sendRecoveryEmail } from '@/lib/email'

export const runtime = 'nodejs'
export const maxDuration = 300 // parallel AI generation + email, worst case ~2-3 min

// How long a fulfillment "claim" is honored before a Stripe retry may re-attempt
const CLAIM_TTL_MS = 10 * 60 * 1000

// stripe-node v14 predates checkout.sessions.update() (added alongside API
// version 2024-09-30), but the POST /v1/checkout/sessions/:id endpoint accepts
// metadata updates. Expose it via the SDK's documented custom-resource
// mechanism rather than upgrading the dependency.
const CheckoutSessionUpdater = Stripe.StripeResource.extend({
  update: Stripe.StripeResource.method<Stripe.Checkout.Session>({
    method: 'POST',
    fullPath: '/v1/checkout/sessions/{id}',
  }),
})

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

  // Abandoned checkout → gentle recovery email (photos only held 24h).
  // Best-effort: a failed recovery send must not fail the webhook ack.
  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const email = session.customer_email || session.metadata?.email
    if (email) {
      sendRecoveryEmail(email)
        .then(() => console.log(`Recovery email sent to ${email}`))
        .catch((err) => console.error('Recovery email failed:', err))
    }
    return NextResponse.json({ received: true })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const metadata = session.metadata || {}
  const email = metadata.email
  const tier = (metadata.tier || 'premium') as Tier
  const predictionId = metadata.prediction_id
  const photoUrl = metadata.photo_url
  // Orders created before style selection shipped won't have this — fall
  // back rather than fail fulfillment for otherwise-valid in-flight orders.
  const style = isValidStyle(metadata.style) ? metadata.style : DEFAULT_STYLE

  if (!email || !predictionId) {
    console.error('Missing email or prediction_id in session metadata', metadata)
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
  }

  // Only fulfill settled orders: 'paid' for normal orders, and
  // 'no_payment_required' for $0 orders (e.g. 100%-off promotion codes).
  if (
    session.payment_status !== 'paid' &&
    session.payment_status !== 'no_payment_required'
  ) {
    console.log(`Session ${session.id} payment_status=${session.payment_status} — not fulfillable, skipping`)
    return NextResponse.json({ received: true })
  }

  // --- Idempotency: Stripe retries webhooks; never generate or email twice ---
  // Fulfillment state lives on the PaymentIntent when one exists (paid orders).
  // $0 orders (100%-off promo codes) have NO PaymentIntent, so their state
  // lives on the Checkout Session's own metadata instead, keyed by session.id.
  const paymentIntentId = typeof session.payment_intent === 'string'
    ? session.payment_intent
    : session.payment_intent?.id

  const orderId = paymentIntentId ?? session.id

  // Retries redeliver the ORIGINAL event payload, so session.metadata in the
  // event is a stale snapshot — always re-read current state from the API.
  const readFulfillmentState = async (): Promise<Record<string, string>> => {
    if (paymentIntentId) {
      const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
      return pi.metadata
    }
    const fresh = await stripe.checkout.sessions.retrieve(session.id)
    return fresh.metadata || {}
  }

  // Stripe merges metadata per-key, so this never clobbers email/tier/prediction_id.
  const sessionUpdater = new CheckoutSessionUpdater(stripe)
  const writeFulfillmentState = async (state: Record<string, string>) => {
    if (paymentIntentId) {
      await stripe.paymentIntents.update(paymentIntentId, { metadata: state })
    } else {
      await sessionUpdater.update(session.id, { metadata: state })
    }
  }

  const state = await readFulfillmentState()
  if (state.fulfilled === 'true') {
    console.log(`Order ${orderId} already fulfilled — skipping duplicate webhook`)
    return NextResponse.json({ received: true, duplicate: true })
  }
  const claimedAt = Number(state.fulfillment_claimed_at || 0)
  if (claimedAt && Date.now() - claimedAt < CLAIM_TTL_MS) {
    console.log(`Order ${orderId} fulfillment in progress — skipping concurrent webhook`)
    return NextResponse.json({ received: true, inProgress: true })
  }
  await writeFulfillmentState({ fulfillment_claimed_at: String(Date.now()) })

  try {
    // Prefer the photo URL stored directly on the Checkout Session at creation
    // time — durable regardless of Replicate's prediction data retention.
    // Fall back to re-deriving it from the prediction record for orders
    // created before photo_url existed.
    const inputImages = photoUrl
      ? [photoUrl]
      : await getInputImagesFromPrediction(predictionId)

    const count = TIERS[tier]?.count ?? 30
    console.log(`Generating ${count} headshots for ${email} (tier: ${tier}, style: ${style}, ${inputImages.length} reference photos)`)

    const headshots = await generateHeadshots(inputImages, count, style)
    console.log(`Generated ${headshots.length} headshots for ${email}`)

    // Email results as ATTACHMENTS — Replicate URLs expire within ~1 hour,
    // so links alone would be dead by the time many customers open the email.
    await sendHeadshotsEmail(email, headshots)
    console.log(`Headshots delivered to ${email}`)

    await writeFulfillmentState({
      fulfilled: 'true',
      delivered_count: String(headshots.length),
    })

    return NextResponse.json({ success: true, count: headshots.length })
  } catch (error) {
    console.error('Generation/email error:', error)
    // Release the claim so Stripe's automatic retry can attempt again
    await writeFulfillmentState({ fulfillment_claimed_at: '' }).catch(() => {})
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
