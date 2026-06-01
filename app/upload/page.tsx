'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import Image from 'next/image'

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [error, setError] = useState('')

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => [...prev, ...accepted].slice(0, 20))
    setError('')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 20 * 1024 * 1024,
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Compress aggressively — 400px max, quality 0.65 — keeps each image ~15-30KB
  const compressFile = (file: File): Promise<File> =>
    new Promise((resolve) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 400
        const scale = Math.min(MAX / img.width, MAX / img.height, 1)
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(
          (blob) => resolve(new File([blob!], file.name, { type: 'image/jpeg' })),
          'image/jpeg',
          0.65
        )
        URL.revokeObjectURL(img.src)
      }
      img.src = URL.createObjectURL(file)
    })

  const handleSubmit = async () => {
    if (files.length < 10) {
      setError('Please upload at least 10 photos for best results.')
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
      const fileUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        setStatusMsg(`Uploading photo ${i + 1} of ${files.length}...`)
        const compressed = await compressFile(files[i])
        const fd = new FormData()
        fd.append('file', compressed)

        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!res.ok) throw new Error('Upload failed. Please try again.')
        const { url } = await res.json()
        fileUrls.push(url)
        setUploadProgress(Math.round(((i + 1) / files.length) * 60))
      }

      // Start the AI preview generation (returns immediately with a prediction ID)
      setStatusMsg('Starting AI generation...')
      setUploadProgress(65)

      const previewRes = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrls, email }),
      })
      if (!previewRes.ok) throw new Error('Preview generation failed. Please try again.')
      const { predictionId, sessionId } = await previewRes.json()

      // Store file URLs for checkout step
      sessionStorage.setItem(`snapshot_urls_${sessionId}`, JSON.stringify(fileUrls))

      // Poll until the preview is ready
      setStatusMsg('AI is generating your preview...')
      setUploadProgress(70)

      let previewUrl = ''
      for (let attempt = 0; attempt < 60; attempt++) {
        await new Promise((r) => setTimeout(r, 3000))
        const poll = await fetch(`/api/check-preview?id=${predictionId}`)
        const result = await poll.json()

        if (result.status === 'done') {
          previewUrl = result.previewUrl
          break
        }
        if (result.status === 'failed') {
          throw new Error('Preview generation failed. Please try again.')
        }
        // Still pending — update progress bar
        setUploadProgress(Math.min(70 + attempt * 1, 95))
      }

      if (!previewUrl) throw new Error('Preview timed out. Please try again.')

      setUploadProgress(100)

      const params = new URLSearchParams({
        session_id: sessionId,
        email,
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
            Upload <strong className="text-cream">10-20 clear selfies</strong> for the best results.
            Different angles and expressions give you more variety.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: 'sun', tip: 'Good natural lighting' },
            { icon: 'face', tip: 'Face clearly visible' },
            { icon: 'angle', tip: 'Different angles' },
            { icon: 'no', tip: 'No sunglasses or hats' },
          ].map(({ tip }) => (
            <div key={tip} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-charcoal/40">
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
            JPG, PNG, WEBP - Max 20MB each
          </span>
        </div>

        {files.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <span className="font-body text-sm text-cream-muted">
              {files.length} photo{files.length !== 1 ? 's' : ''} selected
              {files.length < 10 && <span className="text-gold ml-1">(need {10 - files.length} more)</span>}
            </span>
            <button onClick={() => setFiles([])} className="font-body text-xs text-cream-muted hover:text-gold transition-colors">
              Clear all
            </button>
          </div>
        )}

        {files.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mb-8">
            {files.map((file, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-charcoal group">
                <Image src={URL.createObjectURL(file)} alt={`Upload ${i + 1}`} fill className="object-cover" />
                <button
                  onClick={() => removeFile(i)}
                  className="absolute inset-0 flex items-center justify-center bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity text-cream text-lg"
                >x</button>
              </div>
            ))}
          </div>
        )}

        <div className="mb-6">
          <label className="block font-body text-sm text-cream-muted mb-2">
            Email - we will send your headshots here
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
              <><span>Photos selected</span><span>{files.length}/10 minimum</span></>
            )}
          </div>
          <div className="h-1.5 rounded-full bg-charcoal overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: loading ? `${uploadProgress}%` : `${Math.min((files.length / 10) * 100, 100)}%`,
                background: (loading || files.length >= 10)
                  ? 'linear-gradient(90deg, #C9A550, #E2C06A)'
                  : 'linear-gradient(90deg, #666, #888)',
              }}
            />
          </div>
          {loading && uploadProgress >= 65 && (
            <p className="font-body text-xs text-cream-muted mt-2 text-center">
              AI is generating your preview - this takes about 30-60 seconds
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || files.length < 10 || !email}
          className={`w-full py-4 rounded-full font-body font-medium text-obsidian transition-all duration-300
            ${(!loading && files.length >= 10 && email) ? 'hover:scale-[1.02] hover:shadow-xl cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
          style={{ background: 'linear-gradient(135deg, #E2C06A, #C9A550)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
              {statusMsg || 'Working...'}
            </span>
          ) : 'Generate Preview'}
        </button>

        <p className="font-body text-xs text-cream-muted text-center mt-4">
          Secured by Stripe - Your photos are never stored beyond 24 hours
        </p>
      </div>
    </main>
  )
}
