/**
 * CSS-only obsidian fade-out, no JS. Purely decorative (no text/image), so it
 * never becomes an LCP candidate and pointer-events:none means it never blocks
 * interaction, even mid-fade. Reduced-motion collapses it to instant via the
 * global animation-duration override in globals.css.
 */
export default function Preloader() {
  return <div aria-hidden="true" className="preloader-fade" />
}
