import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { randomUUID } from 'crypto'
import { PHOTOMAKER_VERSION, buildPhotoMakerInput } from '@/lib/replicate'

export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_PHOTOS = 20
const MAX_PHOTO_BYTES = 300 * 1024 // ~300KB per compressed data URL
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Starts a Replicate prediction and returns the prediction ID immediately.
// The client polls /api/check-preview to get the result.
//
// Up to 4 of the user's photos are attached as PhotoMaker reference images:
// better likeness AND the webhook can recover them from this prediction
// record after payment (they're echoed back in prediction.input).
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
      if (url.length > MAX_PHOTO_BYTES * 1.4) { // base64 overhead
        return NextResponse.json({ error: 'One of your photos is too large after compression. Please try different photos.' }, { status: 400 })
      }
    }

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })
    const sessionId = randomUUID()

    const prediction = await replicate.predictions.create({
      version: PHOTOMAKER_VERSION,
      input: buildPhotoMakerInput(
        fileUrls.slice(0, 4),
        'white background, studio lighting',
        1,
        30
      ),
    })

    return NextResponse.json({ predictionId: prediction.id, sessionId })
  } catch (error) {
    console.error('Preview start error:', error)
    return NextResponse.json({ error: 'Failed to start preview generation.' }, { status: 500 })
  }
}
