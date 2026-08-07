import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import Preloader from '../components/Preloader'
import './globals.css'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

const body = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://snapshotai.pinelightlabs.com'),
  alternates: {
    canonical: '/',
  },
  title: 'SnapShot AI — Professional AI Headshots with a Free Preview',
  description:
    'Upload one photo and preview your AI-generated professional headshots free. Packages from $9.99, delivered in 30 minutes. One-time payment, photos deleted in 24 hours.',
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'SnapShot AI — Professional AI Headshots with a Free Preview',
    description:
      'Preview your AI headshots free before you pay. Packages from $9.99, delivered in 30 minutes.',
    type: 'website',
    images: ['/og.png'],
  },
}

export const viewport = {
  themeColor: '#090909',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        {/* If JS is disabled, scroll-reveal elements must still be visible. */}
        <noscript>
          <style>{`.reveal{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className="grain">
        <Preloader />
        {children}
      </body>
    </html>
  )
}
