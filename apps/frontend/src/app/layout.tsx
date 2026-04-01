import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'curated',
  description: 'save and share the web',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#d9d9d9] min-h-screen">{children}</body>
    </html>
  )
}
