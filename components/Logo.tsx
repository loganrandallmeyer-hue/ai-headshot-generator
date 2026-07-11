type LogoProps = {
  className?: string
  markClassName?: string
}

/**
 * Shared wordmark: a small gold ring mark + refined "SnapShot AI" kerning.
 * Kept as a single component so the nav, footer, and flow nav stay in sync.
 */
export default function Logo({ className = '', markClassName = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 font-display tracking-wide text-cream ${className}`}>
      <span
        aria-hidden="true"
        className={`inline-block h-[0.55em] w-[0.55em] rounded-full border-[1.5px] border-gold ${markClassName}`}
      />
      <span>
        Snap<span className="text-gold">Shot</span> <span className="font-light">AI</span>
      </span>
    </span>
  )
}
