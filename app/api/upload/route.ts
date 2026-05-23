import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToReplicate } from '@/lib/replicate'
import { randomUUID } from 'crypto'

export const runtime = 'nodejs'
export const maxDuration = 60 // 60 seconds timeout for file uploads

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const email = formData.get('email') as string

    if (!files || files.length < 1) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Upload each file to Replicate CDN and collect URLs
    const fileUrls: string[] = []

    for (const file of files) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const mimeType = file.type || 'image/jpeg'

      const url = await uploadFileToReplicate(buffer, mimeType)
      fileUrls.push(url)
    }

    // Generate a unique session ID to track this order
    const sessionId = randomUUID()

    return NextResponse.json({ fileUrls, sessionId, email })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed. Please try again.' },
      { status: 500 }
    )
  }
}
