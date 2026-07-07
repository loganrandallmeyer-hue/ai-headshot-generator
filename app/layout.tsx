import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SnapShot AI — Professional AI Headshots with a Free Preview',
  description:
    'Upload one photo and preview your AI-generated professional headshots free. Packages from $9.99, delivered in 30 minutes. One-time payment, photos deleted in 24 hours.',
  openGraph: {
    title: 'SnapShot AI — Professional AI Headshots with a Free Preview',
    description:
      'Preview your AI headshots free before you pay. Packages from $9.99, delivered in 30 minutes.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="grain">{children}</body>
    </html>
  )
}
