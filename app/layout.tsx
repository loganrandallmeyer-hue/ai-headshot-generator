import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SnapShot AI — Professional Headshots in Minutes',
  description: 'Upload 10 photos. Get 50 stunning AI-generated professional headshots delivered to your inbox. No photographer. No studio. Just $24.99.',
  openGraph: {
    title: 'SnapShot AI — Professional Headshots in Minutes',
    description: 'Upload 10 photos. Get 50 stunning AI-generated professional headshots.',
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
