import { NextRequest, NextResponse } from 'next/server'
import { generatePreview } from '@/lib/replicate'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'
export const maxDuration = 120

// Called after all photos are uploaded. Generates one watermarked preview via Replicate.
export async function POST(req: NextRequest) {
  try {
    const { fileUrls, email } = await req.json()

    if (!fileUrls?.length || !email) {
      return NextResponse.json({ error: 'Missing fileUrls or email' }, { status: 400 })
    }

    const previewUrl = await generatePreview(fileUrls)
    const sessionId = randomUUID()

    return NextResponse.json({ previewUrl, sessionId })
  } catch (error) {
    console.error('Preview generation error:', error)
    return NextResponse.json({ error: 'Preview generation failed.' }, { status: 500 })
  }
}
