'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'

interface PhotoItem {
  file: File
  preview: string // object URL for the thumbnail grid
}

const MIN_PHOTOS = 1
const MAX_PHOTOS = 5

export default function UploadPage() {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [error, setError] = useState('')
  const photosRef = useRef<PhotoItem[]>([])
  photosRef.current = photos

  // Revoke all object URLs on unmount (prevents memory leaks)
  useEffect(() => {
    return () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.preview))
  }, [])

  const onDrop = useCallback((accepted: File[]) => {
    setPhotos((prev) => {
      const room = MAX_PHOTOS - prev.length
      const added = accepted.slice(0, room).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }))
      return [...prev, ...added]
    })
    setError('')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 20 * 1024 * 1024,
  })

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  const clearAll = () => {
    photos.forEach((p) => URL.revokeObjectURL(p.preview))
    setPhotos([])
  }

  // Compress in the browser and produce a data URL directly —
  // no server round-trip needed per photo.
  const compressToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new window.Image()
      const objectUrl = URL.createObjectURL(file)
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          // High resolution matters: the AI edits this exact photo,
          // so facial detail in = facial detail out.
          const MAX = 1024
          const scale = Math.min(MAX / img.width, MAX / img.height, 1)
          canvas.width = Math.round(img.width * scale)
          canvas.height = Math.round(img.height * scale)
          canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', 0.85))
        } catch (e) {
          reject(e)
        } finally {
          URL.revokeObjectURL(objectUrl)
        }
      }
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error(`Could not read ${file.name}. Please remove it and try another photo.`))
      }
      img.src = objectUrl
    })

  const handleSubmit = async () => {
    if (photos.length < MIN_PHOTOS) {
      setError('Please upload a photo of yourself.')
      return
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    setError('')
    setUploadProgress(0)

    try {
      // Encode all photos locally (fast — no uploads yet)
      const fileUrls: string[] = []
      for (let i = 0; i < photos.length; i++) {
        setStatusMsg(`Preparing photo ${i + 1} of ${photos.length}...`)
        fileUrls.push(await compressToDataUrl(photos[i].file))
        setUploadProgress(Math.round(((i + 1) / photos.length) * 40))
      }

      // Start the AI preview generation (returns immediately with a prediction ID)
      setStatusMsg('Starting AI generation...')
      setUploadProgress(50)

      const previewRes = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrls, email }),
      })
      if (!previewRes.ok) {
        const data = await previewRes.json().catch(() => ({}))
        throw new Error(data.error || 'Preview generation failed. Please try again.')
      }
      const { predictionId, sessionId } = await previewRes.json()

      // Poll until the preview is ready — tolerating transient network errors
      setStatusMsg('AI is generating your preview...')
      setUploadProgress(55)

      let previewUrl = ''
      let consecutiveFailures = 0
      for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise((r) => setTimeout(r, 3000))
        try {
          const poll = await fetch(`/api/check-preview?id=${predictionId}`)
          const result = await poll.json()
          consecutiveFailures = 0

          if (result.status === 'done') {
            previewUrl = result.previewUrl
            break
          }
          if (result.status === 'failed') {
            throw new Error('FATAL:Preview generation failed. Please try again.')
          }
        } catch (e) {
          if (e instanceof Error && e.message.startsWith('FATAL:')) {
            throw new Error(e.message.slice(6))
          }
          // Transient network/server hiccup — keep polling unless persistent
          consecutiveFailures++
          if (consecutiveFailures >= 5) {
            throw new Error('Lost connection while generating your preview. Please try again.')
          }
        }
        setUploadProgress(Math.min(55 + attempt, 95))
      }

      if (!previewUrl) throw new Error('Preview timed out. Please try again.')

      setUploadProgress(100)

      const params = new URLSearchParams({
        session_id: sessionId,
        email,
        prediction_id: predictionId,
        preview_url: encodeURIComponent(previewUrl),
      })
      window.location.href = `/preview?${params.toString()}`
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
      setUploadProgress(0)
      setStatusMsg('')
    }
  }

  return (
    <main className="min-h-screen bg-obsidian text-cream">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <Link href="/" className="font-display text-2xl font-semibold">
          Snap<span className="text-gold">Shot</span> AI
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gold" />
          <span className="font-body text-xs text-cream-muted tracking-wider uppercase">Secure Upload</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Step 1 of 2</p>
          <h1 className="font-display text-5xl font-light text-cream mb-4">Upload Your Photos</h1>
          <p className="font-body text-sm text-cream-muted leading-relaxed">
            Upload <strong className="text-cream">one clear, well-lit photo</strong> of yourself &mdash;
            our AI transforms it into professional headshots while keeping your exact likeness.
            Add up to 4 spares in case you want to try a different shot.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            {
              tip: 'Good natural lighting',
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              ),
            },
            {
              tip: 'Face clearly visible',
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
                </svg>
              ),
            },
            {
              tip: 'Face fills the frame',
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="12" cy="10" r="3" /><path d="M6 21c0-3 2.7-5 6-5s6 2 6 5" />
                </svg>
              ),
            },
            {
              tip: 'No sunglasses or hats',
              icon: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M5 5l14 14" />
                </svg>
              ),
            },
          ].map(({ tip, icon }) => (
            <div key={tip} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-charcoal/40">
              <span className="text-gold shrink-0">{icon}</span>
              <span className="font-body text-xs text-cream-muted">{tip}</span>
            </div>
          ))}
        </div>

        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 mb-6
            ${isDragActive ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/50 bg-charcoal/30 hover:bg-charcoal/50'}`}
        >
          <input {...getInputProps()} />
          <p className="font-display text-xl text-cream mb-1">
            {isDragActive ? 'Drop your photos here' : 'Drag and drop your photos'}
          </p>
          <p className="font-body text-sm text-cream-muted mb-4">or click to browse your files</p>
          <span className="inline-block px-4 py-2 rounded-full border border-gold/40 text-gold font-body text-xs">
            JPG, PNG, WEBP &middot; Max 20MB each
          </span>
        </div>

        {photos.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <span className="font-body text-sm text-cream-muted">
              {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
              {photos.length > 1 && <span className="text-cream-muted/60 ml-1">(we use the first — remove any to reorder)</span>}
            </span>
            <button onClick={clearAll} className="font-body text-xs text-cream-muted hover:text-gold transition-colors">
              Clear all
            </button>
          </div>
        )}

        {photos.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mb-8">
            {photos.map((photo, i) => (
              <div key={photo.preview} className="relative aspect-square rounded-xl overflow-hidden bg-charcoal group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.preview} alt={`Upload ${i + 1}`} className="absolute inset-0 w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute inset-0 flex items-center justify-center bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity text-cream text-lg"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6">
          <label className="block font-body text-sm text-cream-muted mb-2">
            Email &middot; we will send your headshots here
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-border bg-charcoal/60 text-cream font-body text-sm placeholder-cream-muted/40 focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl border border-red-800 bg-red-900/20">
            <p className="font-body text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between font-body text-xs text-cream-muted mb-1">
            {loading ? (
              <><span>{statusMsg}</span><span>{uploadProgress}%</span></>
            ) : (
              <><span>Photos selected</span><span>{photos.length > 0 ? 'ready' : 'add a photo to start'}</span></>
            )}
          </div>
          <div className="h-1.5 rounded-full bg-charcoal overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: loading ? `${uploadProgress}%` : `${Math.min((photos.length / MIN_PHOTOS) * 100, 100)}%`,
                background: (loading || photos.length >= MIN_PHOTOS)
                  ? 'linear-gradient(90deg, #C9A550, #E2C06A)'
                  : 'linear-gradient(90deg, #666, #888)',
              }}
            />
          </div>
          {loading && uploadProgress >= 50 && (
            <p className="font-body text-xs text-cream-muted mt-2 text-center">
              AI is generating your preview &mdash; this takes about 30&ndash;60 seconds
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || photos.length < MIN_PHOTOS || !email}
          className={`w-full py-4 rounded-full font-body font-medium text-obsidian transition-all duration-300
            ${(!loading && photos.length >= MIN_PHOTOS && email) ? 'hover:scale-[1.02] hover:shadow-xl cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
          style={{ background: 'linear-gradient(135deg, #E2C06A, #C9A550)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
              {statusMsg || 'Working...'}
            </span>
          ) : 'Generate Free Preview'}
        </button>

        <p className="font-body text-xs text-cream-muted text-center mt-4">
          Free watermarked preview &mdash; no payment required &middot; Photos permanently deleted within 24 hours
        </p>
      </div>
    </main>
  )
}
