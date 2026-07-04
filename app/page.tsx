'use client'

import Link from 'next/link'

const TRUST_POINTS = [
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
    title: 'Preview before you pay',
    desc: 'See a watermarked sample of your results first. Only pay if you like what you see.',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Secure Stripe checkout',
    desc: 'Payments are processed by Stripe. We never see or store your card details.',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    title: 'Photos deleted in 24 hours',
    desc: 'Your uploads are used only to generate your headshots, then permanently removed.',
  },
  {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4 7.2 16.9l.9-5.4L4.2 7.7l5.4-.8L12 2z" />
      </svg>
    ),
    title: 'Full commercial license',
    desc: 'Use your headshots on LinkedIn, resumes, websites, and marketing — forever.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Upload your photos',
    desc: 'Share 10–20 clear selfies taken in good lighting. Any phone camera works — no professional equipment needed.',
  },
  {
    number: '02',
    title: 'Review a free preview',
    desc: 'Our AI generates a watermarked sample so you can judge the quality yourself before spending anything.',
  },
  {
    number: '03',
    title: 'Receive your headshots',
    desc: 'Choose a package and your full set arrives in your inbox within 30 minutes, watermark-free and high resolution.',
  },
]

const STYLES = [
  { name: 'LinkedIn', desc: 'Clean, approachable, business-casual' },
  { name: 'Corporate', desc: 'Formal attire, neutral studio backdrop' },
  { name: 'Executive', desc: 'Commanding presence, dark tones' },
  { name: 'Creative', desc: 'Relaxed, modern, personality-forward' },
  { name: 'Startup', desc: 'Smart-casual, bright and energetic' },
  { name: 'Academic', desc: 'Professional, understated, credible' },
]

const FAQS = [
  {
    q: 'How realistic do the headshots look?',
    a: 'Our AI preserves your actual facial features and places you in studio-quality lighting and settings. You judge for yourself: every order starts with a free watermarked preview generated from your own photos — before any payment.',
  },
  {
    q: 'What photos should I upload?',
    a: 'Clear, well-lit selfies where your face is fully visible. Different angles and expressions give better variety. Avoid sunglasses, hats, or heavy shadows.',
  },
  {
    q: 'How long does it take?',
    a: 'The free preview takes about a minute. After payment, your full set is typically delivered to your email within 15–30 minutes as high-resolution downloads.',
  },
  {
    q: 'What happens to my uploaded photos?',
    a: 'They are used solely to generate your headshots and are permanently deleted within 24 hours. We never sell, share, or use your photos to train models.',
  },
  {
    q: 'Can I use these on LinkedIn, resumes, and websites?',
    a: 'Yes. Every package includes a full commercial-use license. Use your headshots anywhere, for as long as you like.',
  },
  {
    q: 'What if I am not happy with the results?',
    a: 'That is exactly why we show you a watermarked preview before you pay — you only purchase once you have seen the quality of your own results. If something goes wrong with your order, contact us and we will make it right.',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-obsidian text-cream overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/60"
        style={{ background: 'rgba(9,9,9,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-2xl font-semibold tracking-wide text-cream">
            Snap<span className="text-gold">Shot</span> AI
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="font-body text-sm text-cream-muted hover:text-cream transition-colors">How it works</a>
            <a href="#pricing" className="font-body text-sm text-cream-muted hover:text-cream transition-colors">Pricing</a>
            <a href="#faq" className="font-body text-sm text-cream-muted hover:text-cream transition-colors">FAQ</a>
          </div>
          <Link
            href="/upload"
            className="font-body text-sm font-medium px-5 py-2 rounded-full border border-gold text-gold hover:bg-gold hover:text-obsidian transition-all duration-300"
          >
            Get Headshots
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-40 pb-24 text-center">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 35%, rgba(201,165,80,0.08) 0%, transparent 70%)' }} />

        <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          <span className="font-body text-xs text-gold tracking-widest uppercase">Free preview · Delivered in 30 minutes</span>
        </div>

        <h1 className="animate-fade-up delay-100 font-display text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95] tracking-tight mb-6 max-w-4xl">
          Professional headshots,<br />
          <em className="text-gold not-italic font-medium">without the studio.</em>
        </h1>

        <p className="animate-fade-up delay-200 font-body text-lg md:text-xl text-cream-muted max-w-xl mx-auto mb-10 leading-relaxed">
          Upload a few selfies. Preview your AI-generated headshots free — then pick a package from $9.99. One-time payment, no subscription.
        </p>

        <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center gap-5">
          <Link
            href="/upload"
            className="gold-glow inline-flex items-center gap-3 px-8 py-4 rounded-full font-body font-medium text-obsidian transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #E2C06A, #C9A550)' }}
          >
            <span>Try It Free — See Your Preview</span>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="font-body text-sm text-cream-muted">No payment required to preview</p>
        </div>

        {/* Honest trust strip */}
        <div className="animate-fade-up delay-400 mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {['Preview before you pay', 'Secured by Stripe', 'Photos deleted in 24h', 'Commercial license included'].map((item) => (
            <span key={item} className="flex items-center gap-2 font-body text-xs text-cream-muted tracking-wide">
              <svg className="w-3.5 h-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {item}
            </span>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* WHY TRUST US */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Built on Trust</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-cream">You see the quality before you spend a cent</h2>
          <p className="font-body text-sm text-cream-muted mt-4 max-w-2xl mx-auto leading-relaxed">
            Most headshot services ask you to pay upfront and hope for the best. We flipped that: your first result is a free, watermarked preview generated from your own photos.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TRUST_POINTS.map(({ icon, title, desc }) => (
            <div key={title} className="p-6 rounded-2xl border border-border bg-charcoal/50 hover:border-gold/40 transition-colors duration-300">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-gold mb-4 border border-gold/25 bg-gold/5">
                {icon}
              </div>
              <h3 className="font-body text-base font-semibold text-cream mb-2">{title}</h3>
              <p className="font-body text-sm text-cream-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 py-24 max-w-5xl mx-auto scroll-mt-20">
        <div className="text-center mb-16">
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Process</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-cream">Three steps to a better first impression</h2>
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

      {/* STYLES */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Styles</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-cream">Every style. Every industry.</h2>
          <p className="font-body text-sm text-cream-muted mt-4 max-w-xl mx-auto">
            Standard and Premium packages include multiple background styles so your set works everywhere you need it.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {STYLES.map(({ name, desc }) => (
            <div key={name} className="p-6 rounded-2xl border border-border bg-charcoal/40 hover:border-gold/40 transition-colors duration-300">
              <p className="font-display text-xl text-cream mb-1">{name}</p>
              <p className="font-body text-xs text-cream-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 py-24 scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Pricing</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-cream">Simple. One-time. Fair.</h2>
            <p className="font-body text-sm text-cream-muted mt-3">Preview is always free. Pay only when you like what you see.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">

            <div className="rounded-2xl border border-border bg-charcoal/50 p-8 flex flex-col hover:border-gold/40 transition-colors duration-300">
              <p className="font-body text-xs tracking-widest uppercase text-cream-muted mb-2">Basic</p>
              <div className="font-display text-5xl font-semibold text-cream mb-1">$9.99</div>
              <p className="font-body text-xs text-cream-muted mb-6">one-time · no subscription</p>
              <ul className="space-y-2 mb-8 flex-1">
                {['1 professional headshot', 'Studio lighting', 'High-resolution download', 'Commercial use license'].map((item) => (
                  <li key={item} className="flex items-center gap-2 font-body text-sm text-cream-muted">
                    <span className="text-gold">✓</span><span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/upload" className="block w-full py-3 rounded-full font-body font-medium text-center border border-gold text-gold hover:bg-gold hover:text-obsidian transition-all duration-300">
                Start Free Preview
              </Link>
            </div>

            <div className="relative rounded-2xl p-1" style={{ background: 'linear-gradient(135deg, #C9A550, #8B6914, #C9A550)' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-body font-semibold tracking-wider uppercase text-obsidian"
                style={{ background: 'linear-gradient(135deg, #E2C06A, #C9A550)' }}>
                Most Popular
              </div>
              <div className="rounded-[14px] bg-charcoal p-8 flex flex-col h-full">
                <p className="font-body text-xs tracking-widest uppercase text-gold mb-2">Standard</p>
                <div className="font-display text-5xl font-semibold text-cream mb-1">$19.99</div>
                <p className="font-body text-xs text-cream-muted mb-6">one-time · no subscription</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {['15 professional headshots', '3 background styles', 'High-resolution downloads', 'Commercial use license', 'Delivered in 30 min'].map((item) => (
                    <li key={item} className="flex items-center gap-2 font-body text-sm text-cream-muted">
                      <span className="text-gold">✓</span><span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/upload" className="block w-full py-3 rounded-full font-body font-medium text-obsidian text-center transition-all duration-300 hover:scale-[1.02]"
                  style={{ background: 'linear-gradient(135deg, #E2C06A, #C9A550)' }}>
                  Start Free Preview
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-charcoal/50 p-8 flex flex-col hover:border-gold/40 transition-colors duration-300">
              <p className="font-body text-xs tracking-widest uppercase text-cream-muted mb-2">Premium</p>
              <div className="font-display text-5xl font-semibold text-cream mb-1">$24.99</div>
              <p className="font-body text-xs text-cream-muted mb-6">one-time · no subscription</p>
              <ul className="space-y-2 mb-8 flex-1">
                {['30 professional headshots', '5 background styles', 'High-resolution downloads', 'Commercial use license', 'Delivered in 30 min', 'Best value per photo'].map((item) => (
                  <li key={item} className="flex items-center gap-2 font-body text-sm text-cream-muted">
                    <span className="text-gold">✓</span><span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/upload" className="block w-full py-3 rounded-full font-body font-medium text-center border border-gold text-gold hover:bg-gold hover:text-obsidian transition-all duration-300">
                Start Free Preview
              </Link>
            </div>

          </div>
          <p className="font-body text-xs text-cream-muted text-center mt-6">
            Payments secured by Stripe · You always see a watermarked preview before paying
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-24 max-w-3xl mx-auto scroll-mt-20">
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

      {/* FINAL CTA */}
      <section className="px-6 py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(201,165,80,0.06) 0%, transparent 70%)' }} />
        <h2 className="font-display text-4xl md:text-6xl font-light text-cream mb-4 relative">
          See your headshots<br />
          <em className="text-gold not-italic">before you decide.</em>
        </h2>
        <p className="font-body text-sm text-cream-muted mb-8">Free preview · From $9.99 · Delivered in 30 minutes</p>
        <Link
          href="/upload"
          className="gold-glow inline-flex items-center gap-3 px-10 py-5 rounded-full font-body font-medium text-obsidian text-lg transition-all duration-300 hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #E2C06A, #C9A550)' }}
        >
          Start My Free Preview
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-10 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <span className="font-display text-xl text-cream">
              Snap<span className="text-gold">Shot</span> AI
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              <a href="#how-it-works" className="font-body text-xs text-cream-muted hover:text-cream transition-colors">How it works</a>
              <a href="#pricing" className="font-body text-xs text-cream-muted hover:text-cream transition-colors">Pricing</a>
              <a href="#faq" className="font-body text-xs text-cream-muted hover:text-cream transition-colors">FAQ</a>
              <Link href="/privacy" className="font-body text-xs text-cream-muted hover:text-cream transition-colors">Privacy</Link>
              <Link href="/terms" className="font-body text-xs text-cream-muted hover:text-cream transition-colors">Terms</Link>
              <a href="mailto:hello@snapshotai.com" className="font-body text-xs text-cream-muted hover:text-cream transition-colors">Contact</a>
            </div>
          </div>
          <p className="font-body text-xs text-cream-muted/60 text-center md:text-left">
            © {new Date().getFullYear()} SnapShot AI. Headshots are AI-generated from photos you provide. Uploads are deleted within 24 hours.
          </p>
        </div>
      </footer>

    </main>
  )
}
