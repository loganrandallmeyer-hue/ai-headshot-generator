import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'
export const maxDuration = 30

const PHOTOMAKER_VERSION = 'ddfc2b08d209f9fa8c1eca692712918bd449f695d785824b1fe844f1af4041a8'

// Starts a Replicate prediction and returns the prediction ID immediately.
// The client polls /api/check-preview to get the result.
export async function POST(req: NextRequest) {
  try {
    const { fileUrls, email } = await req.json()

    if (!fileUrls?.length || !email) {
      return NextResponse.json({ error: 'Missing fileUrls or email' }, { status: 400 })
    }

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! })
    const sessionId = randomUUID()

    const prediction = await replicate.predictions.create({
      version: PHOTOMAKER_VERSION,
      input: {
        prompt: 'professional corporate headshot photo of a person img, white background, studio lighting, sharp focus, high resolution, business attire, confident expression, photorealistic',
        input_image: fileUrls[0],
        num_outputs: 1,
        guidance_scale: 5,
        negative_prompt: 'nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, cartoon, painting, illustration, drawing',
        style_name: 'Photographic (Default)',
        style_strength_ratio: 20,
        num_inference_steps: 30,
      },
    })

    return NextResponse.json({ predictionId: prediction.id, sessionId })
  } catch (error) {
    console.error('Preview start error:', error)
    return NextResponse.json({ error: 'Failed to start preview generation.' }, { status: 500 })
  }
}
