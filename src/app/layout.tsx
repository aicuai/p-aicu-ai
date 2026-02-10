import type { Metadata } from 'next'
import { Noto_Sans_JP, Outfit } from 'next/font/google'
import Providers from '@/components/Providers'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import './globals.css'

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '900'],
  variable: '--font-noto',
})

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-outfit',
})

export const metadata: Metadata = {
  title: 'AICU.jp Portal - Point, Profile, Post',
  description: 'AICU.jpポイント管理・Discord連携ポータル',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${outfit.variable}`}>
      <body className="min-h-screen">
        <GoogleAnalytics />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
