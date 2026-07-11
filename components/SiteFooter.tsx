import Link from 'next/link'

export default function SiteFooter() {
  return (
    <footer className="px-6 py-10 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          <span className="font-display text-xl text-cream">
            Snap<span className="text-gold">Shot</span> AI
          </span>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <a href="/#how-it-works" className="font-body text-xs text-cream-muted hover:text-cream transition-colors">How it works</a>
            <a href="/#pricing" className="font-body text-xs text-cream-muted hover:text-cream transition-colors">Pricing</a>
            <a href="/#faq" className="font-body text-xs text-cream-muted hover:text-cream transition-colors">FAQ</a>
            <Link href="/privacy" className="font-body text-xs text-cream-muted hover:text-cream transition-colors">Privacy</Link>
            <Link href="/terms" className="font-body text-xs text-cream-muted hover:text-cream transition-colors">Terms</Link>
            <a href="mailto:hello@pinelightlabs.com" className="font-body text-xs text-cream-muted hover:text-cream transition-colors">Contact</a>
          </div>
        </div>
        <p className="font-body text-xs text-cream-muted/60 text-center md:text-left">
          © {new Date().getFullYear()} SnapShot AI. Headshots are AI-generated from photos you provide. Uploads are deleted within 24 hours.
        </p>
      </div>
    </footer>
  )
}
