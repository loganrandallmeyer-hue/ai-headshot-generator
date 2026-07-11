import Link from 'next/link'
import Logo from './Logo'

const linkClass = 'link-underline w-fit font-body text-xs text-cream-muted hover:text-cream transition-colors'

export default function SiteFooter() {
  return (
    <footer className="px-6 py-14 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-10 mb-10">
          <div>
            <Logo className="text-xl mb-3" />
            <p className="font-body text-xs text-cream-muted leading-relaxed max-w-xs">
              Professional AI headshots generated from a real photo you provide — preview free, pay only if you like it.
            </p>
          </div>
          <div>
            <p className="font-body text-xs tracking-widest uppercase text-cream-muted mb-4">Explore</p>
            <div className="flex flex-col gap-2.5">
              <a href="/#how-it-works" className={linkClass}>How it works</a>
              <a href="/#pricing" className={linkClass}>Pricing</a>
              <a href="/#faq" className={linkClass}>FAQ</a>
            </div>
          </div>
          <div>
            <p className="font-body text-xs tracking-widest uppercase text-cream-muted mb-4">Legal</p>
            <div className="flex flex-col gap-2.5">
              <Link href="/privacy" className={linkClass}>Privacy</Link>
              <Link href="/terms" className={linkClass}>Terms</Link>
              <a href="mailto:hello@pinelightlabs.com" className={linkClass}>Contact</a>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-border/60">
          <p className="font-body text-xs text-cream-muted/80 text-center sm:text-left">
            © {new Date().getFullYear()} SnapShot AI. Headshots are AI-generated from photos you provide. Uploads are deleted within 24 hours.
          </p>
        </div>
      </div>
    </footer>
  )
}
