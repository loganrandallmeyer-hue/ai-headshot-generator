import Link from 'next/link'
import Logo from './Logo'

type FlowNavProps = {
  /** Short status label shown on the right, e.g. "Secure Upload", "Preview Ready". */
  status: string
  /** Pulse the status dot — use for active/in-progress states. */
  live?: boolean
}

/**
 * Slim shared nav for the funnel pages (upload/preview/success). Replaces
 * three hand-rolled <nav> blocks with one consistent, art-directed header.
 */
export default function FlowNav({ status, live = false }: FlowNavProps) {
  return (
    <nav className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-border">
      <Link href="/" className="text-2xl font-semibold">
        <Logo />
      </Link>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full bg-gold ${live ? 'pulse-soft' : ''}`} />
        <span className="font-body text-xs text-cream-muted tracking-wider uppercase">{status}</span>
      </div>
    </nav>
  )
}
