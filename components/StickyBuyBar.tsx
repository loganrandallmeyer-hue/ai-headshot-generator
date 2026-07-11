'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

/**
 * Mobile-only sticky action bar. Appears after the user scrolls past the hero,
 * keeping the primary CTA within thumb reach at all times — the single biggest
 * lever for mobile conversion, where most traffic lands.
 */
export default function StickyBuyBar() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-3 transition-transform duration-300 ${show ? 'translate-y-0' : 'translate-y-[130%]'}`}
      style={{ background: 'linear-gradient(to top, rgba(9,9,9,0.98) 70%, rgba(9,9,9,0))' }}
    >
      <Link
        href="/upload"
        className="bg-grad-gold flex items-center justify-between gap-3 px-5 py-3.5 rounded-full text-obsidian font-body font-medium shadow-xl"
      >
        <span className="flex flex-col leading-tight">
          <span className="text-[11px] opacity-80 tracking-wide">Free preview · From $9.99</span>
          <span className="text-sm font-semibold">See your headshots</span>
        </span>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}
