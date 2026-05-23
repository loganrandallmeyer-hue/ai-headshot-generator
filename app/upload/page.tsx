'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import Link from 'next/link'
import Image from 'next/image'

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onDrop = useCallback((accepted: File[]) => {
    setFiles((prev) => {
      const combined = [...prev, ...accepted]
      return combined.slice(0, 20) // max 20 photos
    })
    setError('')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 10 * 1024 * 1024, // 10MB per file
  })

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

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

    try {
      // 1. Upload images to our API (which uploads to Replicate CDN)
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      formData.append('email', email)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadRes.ok) throw new Error('Upload failed. Please try again.')
      const { fileUrls, sessionId } = await uploadRes.json()

      // 2. Create Stripe checkout session
      const checkoutRes = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fileUrls, sessionId }),
      })

      if (!checkoutRes.ok) throw new Error('Payment setup failed. Please try again.')
      const { checkoutUrl } = await checkoutRes.json()

      // 3. Redirect to Stripe
      window.location.href = checkoutUrl
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-obsidian text-cream">

      {/* NAV */}
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

        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Step 1 of 2</p>
          <h1 className="font-display text-5xl font-light text-cream mb-4">
            Upload Your Photos
          </h1>
          <p className="font-body text-sm text-cream-muted leading-relaxed">
            Upload <strong className="text-cream">10–20 clear selfies</strong> for the best results.
            Different angles and expressions give you more variety in the final headshots.
          </p>
        </div>

        {/* Tips */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: '☀️', tip: 'Good natural lighting' },
            { icon: '🙂', tip: 'Face clearly visible' },
            { icon: '📐', tip: 'Different angles' },
            { icon: '🚫', tip: 'No sunglasses or hats' },
          ].map(({ icon, tip }) => (
            <div key={tip} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-charcoal/40">
              <span className="text-lg">{icon}</span>
              <span className="font-body text-xs text-cream-muted">{tip}</span>
            </div>
          ))}
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 mb-6
            ${isDragActive
              ? 'border-gold bg-gold/5'
              : 'border-border hover:border-gold/50 bg-charcoal/30 hover:bg-charcoal/50'
            }`}
        >
          <input {...getInputProps()} />
          <div className="text-4xl mb-3">📸</div>
          <p className="font-display text-xl text-cream mb-1">
            {isDragActive ? 'Drop your photos here' : 'Drag & drop your photos'}
          </p>
          <p className="font-body text-sm text-cream-muted mb-4">or click to browse your files</p>
          <span className="inline-block px-4 py-2 rounded-full border border-gold/40 text-gold font-body text-xs">
            JPG, PNG, WEBP · Max 10MB each
          </span>
        </div>

        {/* File count indicator */}
        {files.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <span className="font-body text-sm text-cream-muted">
              {files.length} photo{files.length !== 1 ? 's' : ''} selected
              {files.length < 10 && (
                <span className="text-gold ml-1">(need {10 - files.length} more)</span>
              )}
            </span>
            <button
              onClick={() => setFiles([])}
              className="font-body text-xs text-cream-muted hover:text-gold transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Photo previews */}
        {files.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mb-8">
            {files.map((file, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-charcoal group">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Upload ${i + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => removeFile(i)}
                  className="absolute inset-0 flex items-center justify-center bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity text-cream text-lg"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Email */}
        <div className="mb-6">
          <label className="block font-body text-sm text-cream-muted mb-2">
            Email — we'll send your headshots here
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-xl border border-border bg-charcoal/60 text-cream font-body text-sm placeholder-cream-muted/40 focus:outline-none focus:border-gold transition-colors"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl border border-red-800 bg-red-900/20">
            <p className="font-body text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Progress bar for min photos */}
        <div className="mb-6">
          <div className="flex justify-between font-body text-xs text-cream-muted mb-1">
            <span>Photos uploaded</span>
            <span>{files.length}/10 minimum</span>
          </div>
          <div className="h-1.5 rounded-full bg-charcoal overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((files.length / 10) * 100, 100)}%`,
                background: files.length >= 10
                  ? 'linear-gradient(90deg, #C9A550, #E2C06A)'
                  : 'linear-gradient(90deg, #666, #888)',
              }}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading || files.length < 10 || !email}
          className={`w-full py-4 rounded-full font-body font-medium text-obsidian transition-all duration-300
            ${(!loading && files.length >= 10 && email)
              ? 'hover:scale-[1.02] hover:shadow-xl cursor-pointer'
              : 'opacity-40 cursor-not-allowed'
            }`}
          style={{ background: 'linear-gradient(135deg, #E2C06A, #C9A550)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
              Uploading securely...
            </span>
          ) : (
            'Continue to Payment — $24.99 →'
          )}
        </button>

        <p className="font-body text-xs text-cream-muted text-center mt-4">
          🔒 Secured by Stripe · Your photos are never stored beyond 24 hours
        </p>

      </div>
    </main>
  )
}
