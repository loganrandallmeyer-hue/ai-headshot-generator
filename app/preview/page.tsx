'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import FlowNav from '../../components/FlowNav'
import Stepper from '../../components/Stepper'
import Reveal from '../../components/Reveal'
import { HEADSHOT_STYLES, DEFAULT_STYLE, isValidStyle } from '@/lib/replicate'

const TIERS = [
  {
    id: 'basic',
    label: '1 Headshot',
    price: '$9.99',
    priceCents: 999,
    description: 'Perfect if you just need one great shot.',
    perPhoto: '',
    features: ['1 professional headshot', 'Studio lighting', 'High resolution'],
  },
  {
    id: 'standard',
    label: '15 Headshots',
    price: '$19.99',
    priceCents: 1999,
    description: 'Multiple takes in your chosen style.',
    perPhoto: '≈ $1.33 / photo',
    features: ['15 professional headshots', 'Your chosen style', 'High resolution'],
    popular: true,
  },
  {
    id: 'premium',
    label: '30 Headshots',
    price: '$24.99',
    priceCents: 2499,
    description: 'The full set — maximum variety.',
    perPhoto: '≈ $0.83 / photo',
    features: ['30 professional headshots', 'Your chosen style', 'High resolution', 'Best value'],
  },
]

function PreviewContent() {
  const searchParams = useSearchParams()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedTier, setSelectedTier] = useState<string>('standard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewReady, setPreviewReady] = useState(false)

  // Session data passed via URL params + sessionStorage
  const sessionId = searchParams.get('session_id') ?? ''
  const email = searchParams.get('email') ?? ''
  const predictionId = searchParams.get('prediction_id') ?? ''
  const previewUrl = searchParams.get('preview_url') ? decodeURIComponent(searchParams.get('preview_url')!) : ''
  const styleParam = searchParams.get('style')
  const style = isValidStyle(styleParam) ? styleParam : DEFAULT_STYLE

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
    if (!email || !predictionId || !sessionId) {
      setError('Session data missing. Please start over.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, predictionId, sessionId, tier: selectedTier, style }),
      })

      if (res.status === 409) {
        throw new Error('Your preview session has expired. Please start over from the upload page — it only takes a minute.')
      }
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

      <FlowNav status="Preview Ready" live />

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Header */}
        <Stepper current={2} />
        <Reveal as="div" className="text-center mb-12">
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Almost done · Step 2</p>
          <h1 className="font-display t-h1 font-light text-cream mb-4">
            Your Preview Is Ready
          </h1>
          <p className="font-body text-sm text-cream-muted">
            Here&rsquo;s a sample of what your AI headshots look like. Purchase to unlock your full set — watermark-free.
          </p>
          <span className="inline-flex items-center gap-2 mt-4 px-3 py-1 rounded-full border border-gold/30 bg-gold/5 font-body text-xs text-gold">
            Style: {HEADSHOT_STYLES[style].label}
          </span>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* Watermarked Preview */}
          <div>
            <p className="font-body text-xs uppercase tracking-widest text-cream-muted mb-3">Sample Preview</p>
            <div className="surface-hero relative rounded-2xl overflow-hidden">
              <span className="absolute left-3 top-3 z-10 rounded-full bg-obsidian/80 px-3 py-1 text-[10px] uppercase tracking-wide text-gold border border-gold/30">
                Your result
              </span>
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
              Watermark removed after purchase
            </p>
          </div>

          {/* Tier Selection */}
          <div>
            <p className="font-body text-xs uppercase tracking-widest text-cream-muted mb-2">Choose Your Package</p>
            <p className="font-body text-xs text-cream-muted/80 mb-4 leading-relaxed">
              A studio session typically runs <span className="text-cream">$150–400</span>. Your full set starts at <span className="text-gold">$9.99</span> — one-time.
            </p>

            <div className="flex flex-col gap-3 mb-6">
              {TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`lift relative text-left px-5 py-4 rounded-2xl transition-all duration-200 ${
                    selectedTier === tier.id ? 'surface-hero' : 'surface-base hover:border-gold/40'
                  } ${tier.popular ? 'lg:scale-[1.02]' : ''}`}
                >
                  {tier.popular && (
                    <span className="bg-grad-gold absolute -top-2.5 left-4 px-3 py-0.5 rounded-full text-[10px] font-body font-semibold tracking-wider uppercase text-obsidian">
                      Most Popular
                    </span>
                  )}
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-lg text-cream">{tier.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex flex-col items-end leading-tight">
                        <span className="font-display text-2xl text-gold">{tier.price}</span>
                        {tier.perPhoto && <span className="font-body text-[10px] text-cream-muted">{tier.perPhoto}</span>}
                      </span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        selectedTier === tier.id ? 'border-gold bg-gold' : 'border-border'
                      }`}>
                        <svg
                          className={`w-3.5 h-3.5 text-obsidian transition-all duration-200 ${
                            selectedTier === tier.id ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                          }`}
                          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        >
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
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
              <div role="alert" className="mb-4 px-4 py-3 rounded-xl border border-red-800 bg-red-900/20">
                <p className="font-body text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className={`bg-grad-gold cta-gold w-full py-4 rounded-full font-body font-medium text-obsidian transition-all duration-300
                ${!loading ? 'hover:scale-[1.02] hover:shadow-xl cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
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

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-4">
              {['Secured by Stripe', 'Watermark removed', 'Delivered in ~30 min', 'Commercial license'].map((t) => (
                <span key={t} className="flex items-center gap-1.5 font-body text-[11px] text-cream-muted">
                  <svg className="w-3 h-3 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {t}
                </span>
              ))}
            </div>
            <p className="font-body text-xs text-cream-muted text-center mt-3">
              Headshots delivered to <strong className="text-cream">{email}</strong>
            </p>
          </div>
        </div>

      </div>
    </main>
  )
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-obsidian text-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </main>
    }>
      <PreviewContent />
    </Suspense>
  )
}

