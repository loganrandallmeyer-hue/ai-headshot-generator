'use client'

import { useState } from 'react'

export interface QA {
  q: string
  a: string
}

/**
 * Accessible accordion FAQ. All answer text stays in the DOM (collapsed via
 * max-height) so it remains crawlable and available without JS — the toggle
 * only controls visual expansion.
 */
export default function FAQ({ items }: { items: QA[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      {items.map(({ q, a }, i) => {
        const isOpen = open === i
        return (
          <div
            key={q}
            className="rounded-2xl border border-border bg-charcoal/40 overflow-hidden transition-colors duration-300 hover:border-gold/30"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
            >
              <span className="font-display text-lg md:text-xl font-medium text-cream">{q}</span>
              <span
                className={`shrink-0 w-7 h-7 rounded-full border border-gold/40 flex items-center justify-center text-gold transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </button>
            <div className={`accordion-panel px-6 ${isOpen ? 'open pb-5' : ''}`}>
              <p className="font-body text-sm text-cream-muted leading-relaxed">{a}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
