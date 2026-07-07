import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { normalizeOutput } from '@/lib/replicate'

export const runtime = 'nodejs'
export const maxDuration = 15

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const predictionId = searchParams.get('id')

  if (!predictionId) {
    return NextResponse.json({ error: 'Missing prediction ID' }, { status: 400 })
  }

  try {
    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })
    const prediction = await replicate.predictions.get(predictionId)

    if (prediction.status === 'succeeded') {
      const urls = normalizeOutput(prediction.output)
      if (!urls[0]) {
        return NextResponse.json({ status: 'failed', error: 'No image was generated.' })
      }
      return NextResponse.json({ status: 'done', previewUrl: urls[0] })
    }

    if (prediction.status === 'failed' || prediction.status === 'canceled') {
      return NextResponse.json({ status: 'failed', error: 'Preview generation failed.' })
    }

    return NextResponse.json({ status: 'pending' })
  } catch (error) {
    // Transient Replicate/network error — the client polls again rather than aborting
    console.error('check-preview error:', error)
    return NextResponse.json({ status: 'pending', transient: true })
  }
}
