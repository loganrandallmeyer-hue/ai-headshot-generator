import Link from 'next/link'
import Logo from '../../components/Logo'

export const metadata = { title: 'Terms of Service — SnapShot AI' }

const SECTIONS = [
  {
    h: 'The service',
    p: 'SnapShot AI generates professional-style headshot images from photos you provide, using AI image generation. You receive a free watermarked preview before any purchase. Paid packages deliver watermark-free, high-resolution images by email.',
  },
  {
    h: 'Your photos',
    p: 'You must own the photos you upload or have permission to use them, and they must be of you (or someone who has consented). Do not upload photos of other people without their consent, or photos of minors.',
  },
  {
    h: 'License to your headshots',
    p: 'Purchased headshots come with a full commercial-use license. You may use them on professional profiles, resumes, websites, and marketing materials indefinitely. We claim no ownership over your generated images.',
  },
  {
    h: 'AI-generated content',
    p: 'Headshots are AI-generated. While our models preserve your facial features, results are synthetic images, not photographs. Minor variations from your real appearance can occur — this is why we provide a free preview before purchase.',
  },
  {
    h: 'Payments and delivery',
    p: 'All purchases are one-time payments processed by Stripe. Your full set is typically delivered within 30 minutes of payment. If your order fails to deliver, contact us and we will regenerate it or refund you.',
  },
  {
    h: 'Acceptable use',
    p: 'You may not use the service to create misleading identities, impersonate others, or generate content for fraudulent purposes.',
  },
]

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-obsidian text-cream">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
        <Link href="/" className="text-2xl font-semibold">
          <Logo />
        </Link>
        <Link href="/upload" className="btn-tactile font-body text-sm font-medium px-5 py-2 rounded-full border border-gold text-gold hover:bg-gold hover:text-obsidian transition-all duration-300">
          Get Headshots
        </Link>
      </nav>
      <div className="max-w-2xl mx-auto px-6 py-16">
        <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Legal</p>
        <h1 className="font-display text-5xl font-light text-cream mb-4">Terms of Service</h1>
        <p className="font-body text-sm text-cream-muted mb-12">Last updated: July 2026</p>
        <div className="space-y-10">
          {SECTIONS.map(({ h, p }) => (
            <section key={h}>
              <h2 className="font-display text-2xl font-medium text-cream mb-3">{h}</h2>
              <p className="font-body text-sm text-cream-muted leading-relaxed">{p}</p>
            </section>
          ))}
        </div>
        <p className="font-body text-sm text-cream-muted mt-12 pt-8 border-t border-border">
          Questions? Email <a href="mailto:hello@pinelightlabs.com" className="text-gold hover:underline">hello@pinelightlabs.com</a>
        </p>
      </div>
    </main>
  )
}
