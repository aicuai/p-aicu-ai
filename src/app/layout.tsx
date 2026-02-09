import type { Metadata } from 'next'
import Providers from '@/components/Providers'
import '@aicujp/ui/styles'
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
      <body className="min-h-screen bg-gray-950 text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
