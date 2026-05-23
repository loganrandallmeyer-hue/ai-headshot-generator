import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

const PRICE_CENTS = 2499 // $24.99

export async function POST(req: NextRequest) {
  try {
    const { email, fileUrls, sessionId } = await req.json()

    if (!email || !fileUrls?.length || !sessionId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Store file URLs in Stripe metadata (split across multiple keys if needed)
    // Stripe metadata values have a 500 char limit, so we chunk the URLs
    const urlChunks: Record<string, string> = {}
    const urlString = fileUrls.join(',')

    // Split into chunks of 490 chars
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
              name: '50 AI Professional Headshots',
              description: 'High-resolution AI-generated headshots delivered to your inbox within 30 minutes.',
              images: [], // optionally add a product image URL here
            },
            unit_amount: PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      metadata: {
        session_id: sessionId,
        email,
        url_count: fileUrls.length.toString(),
        ...urlChunks,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?email=${encodeURIComponent(email)}&session_id=${sessionId}`,
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
