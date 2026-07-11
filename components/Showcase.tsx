import Image from 'next/image'

type ShowcaseProps = {
  beforeSrc: string
  afterSrc: string
  afterLabel: string
  priority?: boolean
  className?: string
}

/**
 * Layered before/after pair: an elevated "after" card offset in front of a
 * smaller "before" card. Driven entirely by public/showcase/ file paths —
 * see public/showcase/README.md for the asset spec.
 */
export default function Showcase({
  beforeSrc,
  afterSrc,
  afterLabel,
  priority = false,
  className = '',
}: ShowcaseProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute -left-6 -top-6 w-[62%] rotate-[-4deg] rounded-xl border border-border bg-charcoal/60 p-1.5 shadow-[var(--shadow-1)] sm:-left-10 sm:-top-8">
        <div className="relative aspect-[832/1216] overflow-hidden rounded-lg">
          <Image
            src={beforeSrc}
            alt="Casual snapshot before AI headshot transformation"
            width={832}
            height={1216}
            sizes="(max-width: 768px) 40vw, 220px"
            className="h-full w-full object-cover opacity-80"
          />
        </div>
        <span className="absolute left-2 top-2 rounded-full bg-obsidian/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-cream-muted">
          Before
        </span>
      </div>

      <div className="relative ml-auto w-[78%] rounded-xl border border-gold/30 bg-charcoal/60 p-1.5 shadow-[var(--shadow-3)]">
        <div className="relative aspect-[832/1216] overflow-hidden rounded-lg">
          <Image
            src={afterSrc}
            alt={`Polished AI-generated headshot — ${afterLabel} style`}
            width={832}
            height={1216}
            priority={priority}
            sizes="(max-width: 768px) 60vw, 340px"
            className="h-full w-full object-cover"
          />
        </div>
        <span className="absolute left-2 top-2 rounded-full bg-obsidian/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gold">
          {afterLabel}
        </span>
      </div>

      <span className="absolute -bottom-3 right-2 rounded-full border border-border bg-obsidian px-3 py-1 text-[11px] tracking-wide text-cream-muted shadow-[var(--shadow-1)]">
        Illustrative example
      </span>
    </div>
  )
}
