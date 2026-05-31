'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

const TIERS = [
  {
    id: 'basic',
    label: '1 Headshot',
    price: '$9.99',
    priceCents: 999,
    description: 'Perfect if you just need one great shot.',
    features: ['1 professional headshot', 'Studio lighting', 'High resolution'],
  },
  {
    id: 'standard',
    label: '15 Headshots',
    price: '$19.99',
    priceCents: 1999,
    description: 'Great variety across three styles.',
    features: ['15 professional headshots', '3 background styles', 'High resolution'],
    popular: true,
  },
  {
    id: 'premium',
    label: '30 Headshots',
    price: '$24.99',
    priceCents: 2499,
    description: 'The full set — maximum variety.',
    features: ['30 professional headshots', '5 background styles', 'High resolution', 'Best value'],
  },
]

export default function PreviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedTier, setSelectedTier] = useState<string>('standard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewReady, setPreviewReady] = useState(false)

  // Session data passed via URL params + sessionStorage
  const sessionId = searchParams.get('session_id') ?? ''
  const email = searchParams.get('email') ?? ''
  const previewUrl = searchParams.get('preview_url') ? decodeURIComponent(searchParams.get('preview_url')!) : ''
  const fileUrlsRaw = typeof window !== 'undefined' ? sessionStorage.getItem(`snapshot_urls_${sessionId}`) : null
  const fileUrls: string[] = fileUrlsRaw ? JSON.parse(fileUrlsRaw) : []

  // Draw watermarked preview on canvas
  useEffect(() => {
    if (!previewUrl || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      // Draw diagonal watermark tiles
      ctx.save()
      ctx.globalAlpha = 0.35
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${Math.floor(img.width * 0.06)}px Arial, sans-serif`
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate(-Math.PI / 6)

      const text = '✦ SnapShot AI PREVIEW ✦'
      const textWidth = ctx.measureText(text).width
      const lineHeight = img.height * 0.12

      for (let row = -3; row <= 3; row++) {
        for (let col = -2; col <= 2; col++) {
          ctx.fillText(text, col * (textWidth * 1.2) - textWidth / 2, row * lineHeight)
        }
      }
      ctx.restore()

      // Dark vignette overlay so watermark is clearly visible
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.75
      )
      gradient.addColorStop(0, 'rgba(0,0,0,0)')
      gradient.addColorStop(1, 'rgba(0,0,0,0.4)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      setPreviewReady(true)
    }
    img.onerror = () => {
      // If CORS blocks the image, just show it without canvas watermark
      setPreviewReady(true)
    }
    img.src = previewUrl
  }, [previewUrl])

  const handleCheckout = async () => {
    if (!email || !fileUrls.length || !sessionId) {
      setError('Session data missing. Please start over.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fileUrls, sessionId, tier: selectedTier }),
      })

      if (!res.ok) throw new Error('Payment setup failed. Please try again.')
      const { checkoutUrl } = await res.json()
      window.location.href = checkoutUrl
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setLoading(false)
    }
  }

  if (!previewUrl || !sessionId || !email) {
    return (
      <main className="min-h-screen bg-obsidian text-cream flex items-center justify-center">
        <div className="text-center">
          <p className="font-body text-cream-muted mb-4">Session not found.</p>
          <Link href="/upload" className="text-gold underline font-body text-sm">Start over</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-obsidian text-cream">

      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <Link href="/" className="font-display text-2xl font-semibold">
          Snap<span className="text-gold">Shot</span> AI
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span className="font-body text-xs text-cream-muted tracking-wider uppercase">Preview Ready</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Step 2 of 2</p>
          <h1 className="font-display text-5xl font-light text-cream mb-4">
            Your Preview Is Ready
          </h1>
          <p className="font-body text-sm text-cream-muted">
            Here&rsquo;s a sample of what your AI headshots look like. Purchase to unlock your full set — watermark-free.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Watermarked Preview */}
          <div>
            <p className="font-body text-xs uppercase tracking-widest text-cream-muted mb-3">Sample Preview</p>
            <div className="relative rounded-2xl overflow-hidden border border-border bg-charcoal/30">
              {previewUrl && (
                <canvas
                  ref={canvasRef}
                  className="w-full h-auto block"
                  style={{ display: previewReady ? 'block' : 'none' }}
                />
              )}
              {!previewReady && (
                <div className="aspect-square flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                    <p className="font-body text-xs text-cream-muted">Loading preview...</p>
                  </div>
                </div>
              )}
            </div>
            <p className="font-body text-xs text-cream-muted text-center mt-3">
              🔒 Watermark removed after purchase
            </p>
          </div>

          {/* Tier Selection */}
          <div>
            <p className="font-body text-xs uppercase tracking-widest text-cream-muted mb-3">Choose Your Package</p>

            <div className="flex flex-col gap-3 mb-6">
              {TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`relative text-left px-5 py-4 rounded-2xl border transition-all duration-200 ${
                    selectedTier === tier.id
                      ? 'border-gold bg-gold/8'
                      : 'border-border bg-charcoal/30 hover:border-gold/40'
                  }`}
                >
                  {tier.popular && (
                    <span className="absolute -top-2.5 left-4 px-3 py-0.5 rounded-full text-[10px] font-body font-semibold tracking-wider uppercase text-obsidian"
                      style={{ background: 'linear-gradient(135deg, #E2C06A, #C9A550)' }}>
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-lg text-cream">{tier.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-2xl text-gold">{tier.price}</span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedTier === tier.id ? 'border-gold bg-gold' : 'border-border'
                      }`}>
                        {selectedTier === tier.id && (
                          <div className="w-2 h-2 rounded-full bg-obsidian" />
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="font-body text-xs text-cream-muted mb-2">{tier.description}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {tier.features.map((f) => (
                      <span key={f} className="font-body text-xs text-cream-muted flex items-center gap-1">
                        <span className="text-gold">✓</span> {f}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl border border-red-800 bg-red-900/20">
                <p className="font-body text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className={`w-full py-4 rounded-full font-body font-medium text-obsidian transition-all duration-300
                ${!loading ? 'hover:scale-[1.02] hover:shadow-xl cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
              style={{ background: 'linear-gradient(135deg, #E2C06A, #C9A550)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-obsidian/30 border-t-obsidian rounded-full animate-spin" />
                  Setting up payment...
                </span>
              ) : (
                `Unlock ${TIERS.find(t => t.id === selectedTier)?.label} — ${TIERS.find(t => t.id === selectedTier)?.price} →`
              )}
            </button>

            <p className="font-body text-xs text-cream-muted text-center mt-4">
              🔒 Secured by Stripe · Headshots delivered to <strong className="text-cream">{email}</strong>
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}
