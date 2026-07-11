'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

/**
 * Fixed top navigation with a scroll-progress indicator and a mobile menu.
 * The progress bar gives a subtle sense of momentum through the page, and the
 * mobile menu ensures the primary CTA is always one tap away on small screens.
 */
export default function SiteNav() {
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement
      const scrolled = h.scrollTop
      const max = h.scrollHeight - h.clientHeight
      setProgress(max > 0 ? (scrolled / max) * 100 : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/60"
      style={{ background: 'rgba(9,9,9,0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      {/* Scroll progress */}
      <div className="absolute top-0 left-0 h-[2px] transition-[width] duration-150"
        style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #C9A550, #E2C06A)' }} />

      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-2xl font-semibold tracking-wide text-cream">
          Snap<span className="text-gold">Shot</span> AI
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="link-underline font-body text-sm text-cream-muted hover:text-cream transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/upload"
            className="hidden sm:inline-flex font-body text-sm font-medium px-5 py-2 rounded-full border border-gold text-gold hover:bg-gold hover:text-obsidian transition-all duration-300"
          >
            Get Headshots
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-border text-cream"
          >
            {open ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-border/60 px-6 py-4 flex flex-col gap-4"
          style={{ background: 'rgba(9,9,9,0.97)' }}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="font-body text-sm text-cream-muted hover:text-cream transition-colors">
              {l.label}
            </a>
          ))}
          <Link
            href="/upload"
            className="bg-grad-gold mt-2 inline-flex justify-center font-body text-sm font-medium px-5 py-3 rounded-full text-obsidian"
          >
            Get Headshots
          </Link>
        </div>
      )}
    </nav>
  )
}
