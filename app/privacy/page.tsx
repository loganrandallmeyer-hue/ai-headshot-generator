import Link from 'next/link'
import Logo from '../../components/Logo'

export const metadata = { title: 'Privacy Policy — SnapShot AI' }

const SECTIONS = [
  {
    h: 'What we collect',
    p: 'We collect the photos you upload, your email address, and payment confirmation from Stripe. That is all. We do not collect browsing profiles, sell data to advertisers, or track you across other websites.',
  },
  {
    h: 'How your photos are used',
    p: 'Your uploaded photos are used for one purpose: generating your AI headshots. They are transmitted securely to our AI processing partner (Replicate) to create your images, then permanently deleted from our systems within 24 hours of your order.',
  },
  {
    h: 'What we never do with your photos',
    p: 'We never sell your photos, share them with third parties for marketing, use them to train AI models, or display them publicly. Your likeness belongs to you.',
  },
  {
    h: 'Payments',
    p: 'All payments are processed by Stripe. Your card number never touches our servers. We receive only a confirmation that payment succeeded, along with the email address for delivery.',
  },
  {
    h: 'Email',
    p: 'We use your email address solely to deliver your headshots and order updates. We do not add you to marketing lists without your consent.',
  },
  {
    h: 'Your rights',
    p: 'You may request deletion of any data we hold about you at any time by emailing hello@pinelightlabs.com. Since photos are auto-deleted within 24 hours, in most cases the only data we retain is your order record.',
  },
]

export default function PrivacyPage() {
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
        <h1 className="font-display text-5xl font-light text-cream mb-4">Privacy Policy</h1>
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
