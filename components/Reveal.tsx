'use client'

import { useEffect, useRef, useState, type ReactNode, type ElementType } from 'react'

interface RevealProps {
  children: ReactNode
  /** Stagger the animation, in ms. */
  delay?: number
  className?: string
  /** Render as a different element (default: div). */
  as?: ElementType
}

/**
 * Wraps content and fades/slides it in the first time it scrolls into view.
 * Degrades gracefully: if IntersectionObserver is missing or JS never hydrates
 * (see the <noscript> rule in layout.tsx), content is shown immediately.
 */
export default function Reveal({ children, delay = 0, className = '', as }: RevealProps) {
  const Tag = (as || 'div') as ElementType
  const ref = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const t = setTimeout(() => setVisible(true), delay)
            observer.disconnect()
            return () => clearTimeout(t)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <Tag ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`}>
      {children}
    </Tag>
  )
}
