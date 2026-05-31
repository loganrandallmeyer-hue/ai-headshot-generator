import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToReplicate } from '@/lib/replicate'

export const runtime = 'nodejs'
export const maxDuration = 30

// Accepts a single file, uploads it to Replicate CDN, returns its URL.
// Called once per photo from the client so we never hit Vercel's 4.5MB body limit.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const mimeType = file.type || 'image/jpeg'

    const url = await uploadFileToReplicate(buffer, mimeType)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }
}
