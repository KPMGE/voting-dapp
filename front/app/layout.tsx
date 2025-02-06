import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dapp voting system',
  description: 'A Dapp for a voting system!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
