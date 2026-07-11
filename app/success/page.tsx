'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import Stepper from '../../components/Stepper'
import Reveal from '../../components/Reveal'

function SuccessContent() {
  const params = useSearchParams()
  const email = params.get('email') || 'your inbox'
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://snapshotai.app'
    try {
      if (navigator.share) {
        await navigator.share({ title: 'SnapShot AI', text: 'Professional AI headshots with a free preview', url })
      } else {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      /* user dismissed the share sheet — no action needed */
    }
  }

  return (
    <main className="min-h-screen bg-obsidian text-cream flex flex-col items-center justify-center px-6 text-center">
      {/* Glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(201,165,80,0.08) 0%, transparent 70%)' }} />

      <div className="w-full max-w-sm relative">
        <Stepper current={3} />
      </div>

      {/* Icon */}
      <Reveal as="div"
        className="relative w-24 h-24 rounded-full flex items-center justify-center mb-8 text-gold"
        style={{ background: 'linear-gradient(135deg, rgba(201,165,80,0.2), rgba(201,165,80,0.05))', border: '1px solid rgba(201,165,80,0.3)' }}
      >
        <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </Reveal>

      <p className="font-body text-xs tracking-widest uppercase text-gold mb-4">Payment Confirmed</p>

      <h1 className="font-display t-h1 font-light text-cream mb-6">
        Your headshots<br />
        <em className="gold-shimmer not-italic">are being created</em>
      </h1>

      <p className="font-body text-base text-cream-muted max-w-md mb-4 leading-relaxed">
        Our AI is generating your professional headshots right now. Expect them in your inbox within <strong className="text-cream">15–30 minutes</strong>.
      </p>

      <div className="px-6 py-3 rounded-full border border-gold/30 bg-gold/5 mb-12">
        <p className="font-body text-sm text-gold">Delivering to: {email}</p>
      </div>

      {/* What to do while waiting */}
      <Reveal as="div" delay={100} className="max-w-md w-full p-8 rounded-2xl border border-border bg-charcoal/50 mb-10 text-left">
        <h2 className="font-display text-2xl text-cream mb-4">While you wait...</h2>
        <ul className="space-y-3">
          {[
            "Check your spam/junk folder if you don't see the email",
            "Add hello@pinelightlabs.com to your contacts so it doesn't get filtered",
            'Your headshots will be delivered as high-resolution downloads',
            'You can use them on LinkedIn, resumes, websites — forever',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 font-body text-sm text-cream-muted">
              <span className="text-gold mt-0.5">→</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* Referral / share */}
      <div className="max-w-md w-full p-6 rounded-2xl border border-gold/25 bg-gold/[0.03] mb-10 text-center">
        <p className="font-body text-sm text-cream mb-1">Know someone who needs a great headshot?</p>
        <p className="font-body text-xs text-cream-muted mb-4">They can preview theirs free too — no payment to try.</p>
        <button
          onClick={handleShare}
          className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-body text-sm font-medium border border-gold text-gold hover:bg-gold hover:text-obsidian transition-all duration-300"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              Link copied
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
              Share SnapShot AI
            </>
          )}
        </button>
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
