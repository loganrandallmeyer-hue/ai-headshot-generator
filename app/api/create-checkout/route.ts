import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { TIERS, Tier } from '@/lib/replicate'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
  })
  try {
    const { email, fileUrls, sessionId, tier } = await req.json()

    if (!email || !fileUrls?.length || !sessionId || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!(tier in TIERS)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const selectedTier = TIERS[tier as Tier]

    // Store file URLs in Stripe metadata (split across multiple keys — 500 char limit per value)
    const urlChunks: Record<string, string> = {}
    const urlString = fileUrls.join(',')
    const chunkSize = 490
    for (let i = 0; i < urlString.length; i += chunkSize) {
      urlChunks[`urls_${Math.floor(i / chunkSize)}`] = urlString.slice(i, i + chunkSize)
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `SnapShot AI — ${selectedTier.label}`,
              description: `${selectedTier.count === 1 ? '1 high-resolution' : `${selectedTier.count} high-resolution`} AI-generated professional headshot${selectedTier.count !== 1 ? 's' : ''}, delivered to your inbox.`,
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
        url_count: fileUrls.length.toString(),
        ...urlChunks,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?email=${encodeURIComponent(email)}&session_id=${sessionId}&tier=${tier}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/upload`,
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
