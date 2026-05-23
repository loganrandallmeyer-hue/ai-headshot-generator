'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const email = params.get('email') || 'your inbox'

  return (
    <main className="min-h-screen bg-obsidian text-cream flex flex-col items-center justify-center px-6 text-center">
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(201,165,80,0.08) 0%, transparent 70%)' }} />

      {/* Icon */}
      <div
        className="relative w-24 h-24 rounded-full flex items-center justify-center mb-8 text-4xl"
        style={{ background: 'linear-gradient(135deg, rgba(201,165,80,0.2), rgba(201,165,80,0.05))', border: '1px solid rgba(201,165,80,0.3)' }}
      >
        ✨
      </div>

      <p className="font-body text-xs tracking-widest uppercase text-gold mb-4">Payment Confirmed</p>

      <h1 className="font-display text-5xl md:text-7xl font-light text-cream mb-6 leading-tight">
        Your headshots<br />
        <em className="gold-shimmer not-italic">are being created</em>
      </h1>

      <p className="font-body text-base text-cream-muted max-w-md mb-4 leading-relaxed">
        Our AI is generating your 50 professional headshots right now. Expect them in your inbox within <strong className="text-cream">15–30 minutes</strong>.
      </p>

      <div className="px-6 py-3 rounded-full border border-gold/30 bg-gold/5 mb-12">
        <p className="font-body text-sm text-gold">📨 Sending to: {email}</p>
      </div>

      {/* What to do while waiting */}
      <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-charcoal/50 mb-10 text-left">
        <h2 className="font-display text-2xl text-cream mb-4">While you wait...</h2>
        <ul className="space-y-3">
          {[
            'Check your spam/junk folder if you don't see the email',
            'Add hello@snapshotai.com to your contacts so it doesn't get filtered',
            'Your headshots will be delivered as high-resolution downloads',
            'You can use them on LinkedIn, resumes, websites — forever',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 font-body text-sm text-cream-muted">
              <span className="text-gold mt-0.5">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/"
        className="font-body text-sm text-cream-muted hover:text-gold transition-colors"
      >
        ← Back to home
      </Link>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
