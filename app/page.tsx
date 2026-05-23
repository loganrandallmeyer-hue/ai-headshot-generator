'use client'

import Link from 'next/link'
import Image from 'next/image'

const EXAMPLES = [
  { id: 10, style: 'LinkedIn' },
  { id: 20, style: 'Corporate' },
  { id: 30, style: 'Creative' },
  { id: 40, style: 'Executive' },
  { id: 50, style: 'Startup' },
  { id: 60, style: 'Academic' },
]

const STEPS = [
  {
    number: '01',
    title: 'Upload Your Photos',
    desc: 'Share 10–20 clear selfies taken in good lighting. Any phone camera works perfectly.',
  },
  {
    number: '02',
    title: 'Pay Once, Keep Forever',
    desc: 'One flat fee of $24.99. No subscriptions, no hidden costs. Yours to keep forever.',
  },
  {
    number: '03',
    title: 'Receive 50 Headshots',
    desc: 'Your AI-generated headshots land in your inbox within 30 minutes. Ready to use anywhere.',
  },
]

const FAQS = [
  {
    q: 'How realistic do the headshots look?',
    a: 'Extremely realistic. Our AI is trained on millions of professional photos and preserves your facial features while placing you in studio-quality settings.',
  },
  {
    q: 'What photos should I upload?',
    a: 'Clear, well-lit selfies where your face is fully visible. Different angles and expressions give better variety. Avoid sunglasses or heavy shadows.',
  },
  {
    q: 'How long does it take?',
    a: 'Typically 15–30 minutes after payment. We email your 50 headshots directly to you as high-resolution downloads.',
  },
  {
    q: 'Can I use these on LinkedIn, resumes, and websites?',
    a: 'Absolutely. You get full commercial rights to every image. Use them anywhere, forever.',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-obsidian text-cream overflow-x-hidden">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{ background: 'linear-gradient(to bottom, rgba(9,9,9,0.95), transparent)' }}>
        <span className="font-display text-2xl font-semibold tracking-wide text-cream">
          Snap<span className="text-gold">Shot</span> AI
        </span>
        <Link
          href="/upload"
          className="font-body text-sm font-medium px-5 py-2 rounded-full border border-gold text-gold hover:bg-gold hover:text-obsidian transition-all duration-300"
        >
          Get Headshots →
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center">
        {/* Background radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,165,80,0.08) 0%, transparent 70%)' }} />

        {/* Badge */}
        <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
          <span className="font-body text-xs text-gold tracking-widest uppercase">AI-Powered · Delivered in 30 min</span>
        </div>

        {/* Headline */}
        <h1 className="animate-fade-up delay-100 font-display text-6xl md:text-8xl lg:text-9xl font-light leading-[0.9] tracking-tight mb-6 max-w-5xl">
          Professional<br />
          <em className="gold-shimmer not-italic font-semibold">Headshots</em><br />
          Without the Studio
        </h1>

        {/* Subheadline */}
        <p className="animate-fade-up delay-200 font-body text-lg md:text-xl text-cream-muted max-w-xl mx-auto mb-10 leading-relaxed">
          Upload 10 selfies. Receive 50 stunning, professional-grade AI headshots in your inbox within 30 minutes — for just $24.99.
        </p>

        {/* CTA */}
        <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/upload"
            className="gold-glow inline-flex items-center gap-3 px-8 py-4 rounded-full font-body font-medium text-obsidian transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #E2C06A, #C9A550)' }}
          >
            <span>Generate My Headshots</span>
            <span className="text-lg">→</span>
          </Link>
          <p className="font-body text-sm text-cream-muted">$24.99 one-time · No subscription</p>
        </div>

        {/* Social proof */}
        <div className="animate-fade-up delay-400 mt-14 flex items-center gap-4">
          <div className="flex -space-x-3">
            {[10, 20, 30, 40, 50].map((id) => (
              <div key={id} className="w-8 h-8 rounded-full border-2 border-obsidian overflow-hidden bg-charcoal">
                <Image src={`https://i.pravatar.cc/32?img=${id}`} alt="user" width={32} height={32} />
              </div>
            ))}
          </div>
          <p className="font-body text-sm text-cream-muted">
            <span className="text-cream font-medium">2,400+</span> professionals upgraded their image this month
          </p>
        </div>
      </section>

      {/* ── EXAMPLE GRID ── */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Real Results</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-cream">
            Every style. Every industry.
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {EXAMPLES.map(({ id, style }, i) => (
            <div
              key={id}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] bg-charcoal"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <Image
                src={`https://i.pravatar.cc/400?img=${id}`}
                alt={`${style} headshot example`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="font-body text-xs tracking-widest uppercase text-gold">{style}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="px-6 py-24 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Process</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-cream">
            Three steps to a better first impression
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map(({ number, title, desc }) => (
            <div key={number} className="relative p-8 rounded-2xl border border-border bg-charcoal/50 hover:border-gold/40 transition-colors duration-300">
              <div className="font-display text-6xl font-semibold text-gold/20 mb-4 leading-none">{number}</div>
              <h3 className="font-display text-2xl font-medium text-cream mb-3">{title}</h3>
              <p className="font-body text-sm text-cream-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="px-6 py-24">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-10">
            <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Pricing</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-cream">Simple. One-time. Fair.</h2>
          </div>

          <div
            className="relative rounded-3xl p-1"
            style={{ background: 'linear-gradient(135deg, #C9A550, #8B6914, #C9A550)' }}
          >
            <div className="rounded-[22px] bg-charcoal p-10 text-center">
              <div className="font-display text-7xl font-semibold text-cream mb-1">$24.99</div>
              <p className="font-body text-sm text-cream-muted mb-8">one-time payment · no subscription ever</p>

              <ul className="space-y-3 mb-10 text-left">
                {[
                  '50 unique AI-generated headshots',
                  '5 different background styles',
                  'High-resolution downloads (4K)',
                  'Commercial use license included',
                  'Delivered to your inbox in 30 min',
                  'Full refund if unsatisfied',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-body text-sm text-cream-muted">
                    <span className="text-gold text-lg">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/upload"
                className="block w-full py-4 rounded-full font-body font-medium text-obsidian text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{ background: 'linear-gradient(135deg, #E2C06A, #C9A550)' }}
              >
                Get My Headshots Now →
              </Link>

              <p className="font-body text-xs text-cream-muted mt-4">
                Secured by Stripe · Instant delivery
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">FAQ</p>
          <h2 className="font-display text-4xl font-light text-cream">Questions answered</h2>
        </div>

        <div className="space-y-4">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="p-6 rounded-2xl border border-border bg-charcoal/40 hover:border-gold/30 transition-colors duration-300">
              <h3 className="font-display text-xl font-medium text-cream mb-2">{q}</h3>
              <p className="font-body text-sm text-cream-muted leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="px-6 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(201,165,80,0.06) 0%, transparent 70%)' }} />
        <h2 className="font-display text-5xl md:text-7xl font-light text-cream mb-6 relative">
          Your best photo,<br />
          <em className="gold-shimmer not-italic">finally taken.</em>
        </h2>
        <Link
          href="/upload"
          className="gold-glow inline-flex items-center gap-3 px-10 py-5 rounded-full font-body font-medium text-obsidian text-lg transition-all duration-300 hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #E2C06A, #C9A550)' }}
        >
          Start Now — $24.99
        </Link>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-8 py-8 border-t border-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-display text-xl text-cream-muted">
            Snap<span className="text-gold">Shot</span> AI
          </span>
          <p className="font-body text-xs text-cream-muted">
            © {new Date().getFullYear()} SnapShot AI · All rights reserved
          </p>
        </div>
      </footer>

    </main>
  )
}
