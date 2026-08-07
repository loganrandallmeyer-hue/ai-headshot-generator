import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { HEADSHOT_MODEL, buildHeadshotInput, newReplicate, isValidStyle } from '@/lib/replicate'

export const runtime = 'nodejs'
export const maxDuration = 30

const MAX_PHOTOS = 5
const MAX_DATA_URL_CHARS = 1_500_000 // ~1MB image after base64 overhead
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Cheap per-IP burst protection for the free-preview endpoint. Each preview
 * costs ~$0.04 of Replicate credits, so one viral post without a limiter can
 * drain the account via curious lurkers or bots. This is an in-memory window
 * (per serverless instance) — not a perfect distributed limiter, but it stops
 * the burst that matters. If abuse persists, move to Vercel KV or a WAF rule.
 */
const PREVIEWS_PER_IP = 5
const PREVIEW_WINDOW_MS = 24 * 60 * 60 * 1000
const previewHits = new Map<string, { count: number; resetAt: number }>()

function isPreviewLimited(ip: string): boolean {
  const now = Date.now()
  const rec = previewHits.get(ip)
  if (!rec || now > rec.resetAt) {
    // Prune stale entries occasionally so the map can't grow unbounded
    if (previewHits.size > 10_000) {
      previewHits.forEach((v, k) => {
        if (now > v.resetAt) previewHits.delete(k)
      })
    }
    previewHits.set(ip, { count: 1, resetAt: now + PREVIEW_WINDOW_MS })
    return false
  }
  rec.count += 1
  return rec.count > PREVIEWS_PER_IP
}

/**
 * Host the customer's photo on Replicate's file storage and return a short,
 * stable URL. We must NOT feed the raw data URI straight into the prediction:
 * Replicate truncates large input values when a prediction is read back, so
 * the webhook's post-payment recovery (getInputImagesFromPrediction) would get
 * a mangled data URI and every order would fail with "input was invalid (E006)".
 * A short hosted URL round-trips through the prediction record intact.
 */
async function hostPhoto(dataUri: string): Promise<string> {
  const match = dataUri.match(/^data:(.*?);base64,(.*)$/)
  if (!match) throw new Error('Photo is not a valid base64 data URI')
  const [, mime, b64] = match
  const bytes = Buffer.from(b64, 'base64')
  const ext = (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg')

  const form = new FormData()
  form.append('content', new Blob([bytes], { type: mime }), `upload.${ext}`)

  const res = await fetch('https://api.replicate.com/v1/files', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.REPLICATE_API_TOKEN}` },
    body: form,
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Photo upload failed: ${res.status} ${await res.text()}`)
  }
  const file = (await res.json()) as { urls?: { get?: string } }
  const url = file.urls?.get
  if (!url) throw new Error('Photo upload returned no URL')
  return url
}

// Starts a Kontext prediction on the customer's clearest photo and returns
// the prediction ID immediately; the client polls /api/check-preview.
// The photo is echoed back in the prediction record, which is how the
// webhook recovers it after payment.
export async function POST(req: NextRequest) {
  try {
    // Per-IP rate limit: 5 free previews per 24h per IP (burst protection)
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    if (isPreviewLimited(ip)) {
      return NextResponse.json(
        { error: 'You have reached the free preview limit. Please try again tomorrow.' },
        { status: 429 }
      )
    }

    const { fileUrls, email, style } = await req.json()

    if (!Array.isArray(fileUrls) || fileUrls.length === 0 || !email) {
      return NextResponse.json({ error: 'Missing fileUrls or email' }, { status: 400 })
    }
    if (!isValidStyle(style)) {
      return NextResponse.json({ error: 'Missing or invalid style' }, { status: 400 })
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

    const replicate = newReplicate()
    const sessionId = randomUUID()

    // Upload first so the prediction's input_image is a short, stable URL that
    // the webhook can recover intact after payment (see hostPhoto above).
    const hostedUrl = await hostPhoto(fileUrls[0])

    const prediction = await replicate.predictions.create({
      model: HEADSHOT_MODEL,
      input: buildHeadshotInput(hostedUrl, style),
    })

    return NextResponse.json({ predictionId: prediction.id, sessionId })
  } catch (error) {
    console.error('Preview start error:', error)
    return NextResponse.json({ error: 'Failed to start preview generation.' }, { status: 500 })
  }
}
