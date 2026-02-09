import type { Metadata } from 'next'
import Providers from '@/components/Providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'AICU Portal - Point, Profile, Post',
  description: 'AICUポイント管理・Discord連携ポータル',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-900 text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
