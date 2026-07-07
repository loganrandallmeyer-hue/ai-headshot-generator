import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { randomUUID } from 'crypto'
import { HEADSHOT_MODEL, buildHeadshotInput } from '@/lib/replicate'

export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_PHOTOS = 5
const MAX_DATA_URL_CHARS = 1_500_000 // ~1MB image after base64 overhead
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Starts a Kontext prediction on the customer's clearest photo and returns
// the prediction ID immediately; the client polls /api/check-preview.
// The photo is echoed back in the prediction record, which is how the
// webhook recovers it after payment.
export async function POST(req: NextRequest) {
  try {
    const { fileUrls, email } = await req.json()

    if (!Array.isArray(fileUrls) || fileUrls.length === 0 || !email) {
      return NextResponse.json({ error: 'Missing fileUrls or email' }, { status: 400 })
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
    if (fileUrls.length > MAX_PHOTOS) {
      return NextResponse.json({ error: `Maximum ${MAX_PHOTOS} photos allowed.` }, { status: 400 })
    }
    for (const url of fileUrls) {
      if (typeof url !== 'string' || !url.startsWith('data:image/')) {
        return NextResponse.json({ error: 'Invalid photo data.' }, { status: 400 })
      }
      if (url.length > MAX_DATA_URL_CHARS) {
        return NextResponse.json({ error: 'One of your photos is too large. Please try a different photo.' }, { status: 400 })
      }
    }

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })
    const sessionId = randomUUID()

    const prediction = await replicate.predictions.create({
      model: HEADSHOT_MODEL,
      input: buildHeadshotInput(fileUrls[0], 0),
    })

    return NextResponse.json({ predictionId: prediction.id, sessionId })
  } catch (error) {
    console.error('Preview start error:', error)
    return NextResponse.json({ error: 'Failed to start preview generation.' }, { status: 500 })
  }
}
