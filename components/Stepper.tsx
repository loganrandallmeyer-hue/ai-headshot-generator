const STEPS = ['Upload', 'Preview', 'Download']

/**
 * Three-node progress indicator for the purchase funnel.
 * `current` is 1-indexed (1 = Upload, 2 = Preview, 3 = Download).
 * Showing progress reduces abandonment by making the path feel short and finite.
 */
export default function Stepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-10" aria-label={`Step ${current} of 3`}>
      {STEPS.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-body text-xs font-semibold border transition-colors
                  ${active ? 'bg-grad-gold step-active-fill text-obsidian border-transparent' : done ? 'text-gold border-gold/50' : 'text-cream-muted border-border'}`}
              >
                {done ? (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  step
                )}
              </span>
              <span className={`font-body text-xs tracking-wide hidden sm:inline ${active ? 'text-cream' : 'text-cream-muted'}`}>
                {label}
              </span>
            </div>
            {step < STEPS.length && (
              <span className={`w-6 sm:w-10 h-px ${done ? 'bg-gold/50' : 'bg-border'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
