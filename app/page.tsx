'use client'

import Image from 'next/image'
import Link from 'next/link'
import Reveal from '../components/Reveal'
import SiteNav from '../components/SiteNav'
import SiteFooter from '../components/SiteFooter'
import StickyBuyBar from '../components/StickyBuyBar'
import FAQ from '../components/FAQ'
import Showcase from '../components/Showcase'

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
    title: 'Upload one photo',
    desc: 'One clear, well-lit photo is all it takes. Any phone camera works — no professional equipment needed.',
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
  { id: 'linkedin', name: 'LinkedIn', desc: 'Clean, approachable, business-casual' },
  { id: 'corporate', name: 'Corporate', desc: 'Formal attire, neutral studio backdrop' },
  { id: 'executive', name: 'Executive', desc: 'Commanding presence, dark tones' },
  { id: 'creative', name: 'Creative', desc: 'Relaxed, modern, personality-forward' },
  { id: 'startup', name: 'Startup', desc: 'Smart-casual, bright and energetic' },
  { id: 'academic', name: 'Academic', desc: 'Professional, understated, credible' },
]

const COMPARE = {
  studio: [
    'Typically $150–400+ per session',
    'Book days or weeks ahead',
    'Travel to a studio, on their schedule',
    'Usually one outfit and one look',
    'Reshoots cost extra',
    'Hours out of your day',
  ],
  snapshot: [
    'From $9.99 — one-time, no subscription',
    'Ready in about 30 minutes',
    'From your couch, whenever you want',
    'Up to 5 professional styles',
    'Free watermarked preview before you pay',
    'One clear photo is all you need',
  ],
}

const FAQS = [
  {
    q: 'How realistic do the headshots look?',
    a: 'Very — our AI edits your actual photo rather than generating a lookalike, so your exact facial features are preserved. You judge for yourself: every order starts with a free watermarked preview generated from your own photo, before any payment.',
  },
  {
    q: 'What photos should I upload?',
    a: 'One clear, well-lit photo where your face is fully visible and fills a good part of the frame. Avoid sunglasses, hats, or heavy shadows. Our AI transforms your actual photo, so the better the input, the better every headshot.',
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
      <SiteNav />

      {/* HERO */}
      <section className="relative px-6 pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 25%, rgba(201,165,80,0.08) 0%, transparent 70%)' }} />

        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-10 items-center lg:items-start relative">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold/30 bg-gold/5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-gold pulse-soft" />
              <span className="font-body text-xs text-gold tracking-widest uppercase">Free preview · Delivered in 30 minutes</span>
            </div>

            <h1 className="animate-fade-up delay-100 font-display t-display font-light mb-6">
              Professional headshots,<br />
              <em className="text-gold not-italic font-medium">without the studio.</em>
            </h1>

            <p className="animate-fade-up delay-200 font-body text-lg md:text-xl text-cream-muted max-w-xl mx-auto lg:mx-0 mb-9 leading-relaxed">
              Upload one clear photo. Preview your AI-generated headshots free — then pick a package from $9.99. One-time payment, no subscription.
            </p>

            <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center lg:items-start gap-4">
              <Link
                href="/upload"
                className="bg-grad-gold cta-gold gold-glow inline-flex items-center gap-3 px-8 py-4 rounded-full font-body font-medium text-obsidian transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <span>Try It Free — See Your Preview</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                </svg>
              </Link>
              <p className="font-body text-sm text-cream-muted sm:pt-4">No payment required to preview</p>
            </div>

            {/* Honest trust strip */}
            <div className="animate-fade-up delay-400 mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3">
              {['Preview before you pay', 'Secured by Stripe', 'Photos deleted in 24h', 'Commercial license'].map((item) => (
                <span key={item} className="flex items-center gap-2 font-body text-xs text-cream-muted tracking-wide">
                  <svg className="w-3.5 h-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Before/after showcase — real transformation example, offset to overlap the copy column at lg+ */}
          <div className="animate-fade-up delay-300 relative hidden lg:block lg:mt-16 lg:-ml-6 z-10">
            <Showcase
              beforeSrc="/showcase/before-1.jpg"
              afterSrc="/showcase/after-1.jpg"
              afterLabel="Executive"
              priority
              className="max-w-sm mx-auto"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* WHY TRUST US */}
      <section className="px-6 section-py-lg max-w-6xl mx-auto">
        <Reveal className="text-center mb-14">
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Built on Trust</p>
          <h2 className="font-display t-h2 font-light text-cream">You see the quality before you spend a cent</h2>
          <p className="font-body text-sm text-cream-muted mt-4 max-w-2xl mx-auto leading-relaxed">
            Most headshot services ask you to pay upfront and hope for the best. We flipped that: your first result is a free, watermarked preview generated from your own photos.
          </p>
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TRUST_POINTS.map(({ icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 80}>
              <div className="lift surface-base h-full p-6 rounded-2xl hover:border-gold/40">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-gold mb-4 border border-gold/25 bg-gold/5">
                  {icon}
                </div>
                <h3 className="font-body text-base font-semibold text-cream mb-2">{title}</h3>
                <p className="font-body text-sm text-cream-muted leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="px-6 section-py-xl max-w-5xl mx-auto scroll-mt-20">
        <Reveal className="mb-16 max-w-2xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-gold" />
            <p className="font-body text-xs tracking-widest uppercase text-gold">Process</p>
          </div>
          <h2 className="font-display t-h2 font-light text-cream">Three steps to a better first impression</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map(({ number, title, desc }, i) => (
            <Reveal key={number} delay={i * 100}>
              <div className="lift surface-raised relative h-full p-8 rounded-2xl hover:border-gold/40">
                <div className="font-display text-6xl font-semibold text-gold/20 mb-4 leading-none">{number}</div>
                <h3 className="font-display text-2xl font-medium text-cream mb-3">{title}</h3>
                <p className="font-body text-sm text-cream-muted leading-relaxed">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* COMPARISON — factual vs a traditional studio */}
      <section className="px-6 section-py-md max-w-5xl mx-auto">
        <Reveal className="text-center mb-14">
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">The Math</p>
          <h2 className="font-display t-h2 font-light text-cream">A fraction of the cost. None of the hassle.</h2>
        </Reveal>
        <div className="grid md:grid-cols-2 gap-5 items-center">
          <Reveal>
            <div className="h-full p-8 rounded-2xl border border-border bg-charcoal/20 lg:mt-6 lg:scale-[0.97] opacity-80">
              <p className="font-body text-xs tracking-widest uppercase text-cream-muted mb-5">Traditional studio</p>
              <ul className="space-y-3">
                {COMPARE.studio.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-body text-sm text-cream-muted">
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-cream-muted/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="surface-hero relative z-10 h-full p-8 rounded-2xl">
              <p className="font-body text-xs tracking-widest uppercase text-gold mb-5">SnapShot AI</p>
              <ul className="space-y-3">
                {COMPARE.snapshot.map((item) => (
                  <li key={item} className="flex items-start gap-3 font-body text-sm text-cream">
                    <svg className="w-4 h-4 mt-0.5 shrink-0 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* STYLES */}
      <section className="px-6 section-py-lg max-w-6xl mx-auto">
        <Reveal className="mb-14 max-w-xl">
          <div className="flex items-center gap-3 mb-3">
            <span className="h-px w-8 bg-gold" />
            <p className="font-body text-xs tracking-widest uppercase text-gold">Styles</p>
          </div>
          <h2 className="font-display t-h2 font-light text-cream">Every style. Every industry.</h2>
          <p className="font-body text-sm text-cream-muted mt-4">
            Pick the style that fits — every headshot in your set is generated to match it.
          </p>
        </Reveal>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {STYLES.map(({ id, name, desc }, i) => (
            <Reveal key={id} delay={i * 60}>
              <div className="lift surface-base h-full rounded-2xl overflow-hidden hover:border-gold/40">
                <div className="relative aspect-[832/1216]">
                  <Image
                    src={`/styles/${id}.jpg`}
                    alt={`${name} style example`}
                    width={832}
                    height={1216}
                    sizes="(max-width: 768px) 45vw, 220px"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-display text-xl text-cream mb-1">{name}</p>
                    <p className="font-body text-xs text-cream-muted leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Styles proof strip — layered trio of real examples */}
        <Reveal className="mt-14">
          <div className="flex justify-center items-end -space-x-6 sm:-space-x-10">
            {[
              { id: 'corporate', label: 'Corporate', rotate: '-rotate-3', z: 'z-10' },
              { id: 'creative', label: 'Creative', rotate: 'rotate-0', z: 'z-20 scale-110' },
              { id: 'startup', label: 'Startup', rotate: 'rotate-3', z: 'z-10' },
            ].map((card) => (
              <div key={card.label} className={`relative ${card.rotate} ${card.z} w-28 sm:w-36 shrink-0`}>
                <div className="relative aspect-[832/1216] overflow-hidden rounded-xl border border-gold/25 shadow-[var(--shadow-2)]">
                  <Image
                    src={`/styles/${card.id}.jpg`}
                    alt={`Polished AI-generated headshot — ${card.label} style`}
                    width={832}
                    height={1216}
                    sizes="150px"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="mt-2 block text-center font-body text-[11px] tracking-wide text-cream-muted">{card.label}</span>
              </div>
            ))}
          </div>
          <p className="font-body text-[11px] text-cream-muted/80 text-center mt-4">Real examples, generated from a real uploaded photo.</p>
        </Reveal>
      </section>

      {/* PRICING */}
      <section id="pricing" className="px-6 section-py-xl scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-12">
            <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Pricing</p>
            <h2 className="font-display t-h2 font-light text-cream">Simple. One-time. Fair.</h2>
            <p className="font-body text-sm text-cream-muted mt-3">Preview is always free. Pay only when you like what you see.</p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6 md:items-center">

            <Reveal>
              <div className="lift surface-base rounded-2xl p-8 flex flex-col h-full hover:border-gold/40 lg:mt-6">
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
                <Link href="/upload" className="btn-tactile block w-full py-3 rounded-full font-body font-medium text-center border border-gold text-gold hover:bg-gold hover:text-obsidian transition-all duration-300">
                  Start Free Preview
                </Link>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <div className="relative z-10 rounded-2xl p-1 h-full lg:scale-105 lg:-translate-y-4 shadow-[var(--shadow-3)]" style={{ background: 'linear-gradient(135deg, #C9A550, #8B6914, #C9A550)' }}>
                <div className="bg-grad-gold absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-body font-semibold tracking-wider uppercase text-obsidian z-10">
                  Most Popular
                </div>
                <div className="rounded-[14px] bg-charcoal p-8 flex flex-col h-full">
                  <p className="font-body text-xs tracking-widest uppercase text-gold mb-2">Standard</p>
                  <div className="font-display text-5xl font-semibold text-cream mb-1">$19.99</div>
                  <p className="font-body text-xs text-cream-muted mb-6">≈ $1.33 per photo · no subscription</p>
                  <ul className="space-y-2 mb-8 flex-1">
                    {['15 professional headshots', 'Your chosen style', 'High-resolution downloads', 'Commercial use license', 'Delivered in 30 min'].map((item) => (
                      <li key={item} className="flex items-center gap-2 font-body text-sm text-cream-muted">
                        <span className="text-gold">✓</span><span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/upload" className="bg-grad-gold cta-gold block w-full py-3 rounded-full font-body font-medium text-obsidian text-center transition-all duration-300 hover:scale-[1.02]">
                    Start Free Preview
                  </Link>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200}>
              <div className="lift surface-base rounded-2xl p-8 flex flex-col h-full hover:border-gold/40 lg:mt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-body text-xs tracking-widest uppercase text-cream-muted">Premium</p>
                  <span className="px-2 py-0.5 rounded-full border border-gold/40 text-gold font-body text-[10px] tracking-wider uppercase">Best value</span>
                </div>
                <div className="font-display text-5xl font-semibold text-cream mb-1">$24.99</div>
                <p className="font-body text-xs text-cream-muted mb-6">≈ $0.83 per photo · no subscription</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {['30 professional headshots', 'Your chosen style', 'High-resolution downloads', 'Commercial use license', 'Delivered in 30 min', 'Best value per photo'].map((item) => (
                    <li key={item} className="flex items-center gap-2 font-body text-sm text-cream-muted">
                      <span className="text-gold">✓</span><span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/upload" className="btn-tactile block w-full py-3 rounded-full font-body font-medium text-center border border-gold text-gold hover:bg-gold hover:text-obsidian transition-all duration-300">
                  Start Free Preview
                </Link>
              </div>
            </Reveal>

          </div>
          <p className="font-body text-xs text-cream-muted text-center mt-6">
            Payments secured by Stripe · You always see a watermarked preview before paying
          </p>
        </div>
      </section>

      {/* GUARANTEE — risk reversal */}
      <section className="px-6 section-py-md">
        <Reveal className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-gold/30 bg-charcoal/40 shadow-[var(--shadow-2)] p-10 md:p-14 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 0%, rgba(201,165,80,0.10) 0%, transparent 70%)' }} />
            <div className="relative">
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-gold mb-6 border border-gold/30 bg-gold/5">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <h2 className="font-display t-h2 font-light text-cream mb-4">Our whole model is the guarantee</h2>
              <p className="font-body text-base text-cream-muted max-w-2xl mx-auto leading-relaxed">
                You never pay to find out if it worked. We generate a real preview from your own photo, watermarked, for free — and you decide from there. No surprises, no risk, no reason to hesitate.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 section-py-lg max-w-3xl mx-auto scroll-mt-20">
        <Reveal className="text-center mb-12">
          <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">FAQ</p>
          <h2 className="font-display t-h2 font-light text-cream">Questions answered</h2>
        </Reveal>
        <Reveal>
          <FAQ items={FAQS} />
        </Reveal>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 section-py-xl text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(201,165,80,0.06) 0%, transparent 70%)' }} />
        <Reveal>
          <h2 className="font-display t-h2 font-light text-cream mb-4 relative">
            See your headshots<br />
            <em className="text-gold not-italic">before you decide.</em>
          </h2>
          <p className="font-body text-sm text-cream-muted mb-8">Free preview · From $9.99 · Delivered in 30 minutes</p>
          <Link
            href="/upload"
            className="bg-grad-gold cta-gold gold-glow inline-flex items-center gap-3 px-10 py-5 rounded-full font-body font-medium text-obsidian text-lg transition-all duration-300 hover:scale-105"
          >
            Start My Free Preview
          </Link>
        </Reveal>
      </section>

      <SiteFooter />
      <StickyBuyBar />
    </main>
  )
}
