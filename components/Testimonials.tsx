'use client'

import Reveal from './Reveal'

export interface Testimonial {
  quote: string
  name: string
  role?: string
}

/**
 * Social-proof section. Renders NOTHING until real testimonials exist —
 * add entries to the TESTIMONIALS array in app/page.tsx as buyers reply
 * (first name + their words + optional role). Never fake these.
 */
export default function Testimonials({ items }: { items: Testimonial[] }) {
  if (items.length === 0) return null

  return (
    <section className="px-6 section-py-lg max-w-6xl mx-auto">
      <Reveal className="text-center mb-12">
        <p className="font-body text-xs tracking-widest uppercase text-gold mb-3">Real customers</p>
        <h2 className="font-display t-h2 font-light text-cream">People who upgraded their first impression</h2>
      </Reveal>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((t, i) => (
          <Reveal key={t.name} delay={i * 80}>
            <figure className="surface-base h-full p-6 rounded-2xl flex flex-col">
              <div className="flex items-center gap-1 text-gold mb-4" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg key={s} className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4 7.2 16.9l.9-5.4L4.2 7.7l5.4-.8L12 2z" />
                  </svg>
                ))}
              </div>
              <blockquote className="font-body text-sm text-cream leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 font-body text-sm text-cream-muted">
                <span className="text-cream font-medium">{t.name}</span>
                {t.role && <span> — {t.role}</span>}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
