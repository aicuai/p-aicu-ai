import type { Metadata } from "next"
import ResultsClient from "./ResultsClient"

export const metadata: Metadata = {
  title: "R2602 調査結果（速報） | AICU Research",
  description: "生成AI時代の\"つくる人\"調査 2026.02 — 結果速報",
  openGraph: {
    title: "R2602 調査結果（速報） | AICU Research",
    description: "生成AI時代の\"つくる人\"調査 2026.02 — 結果速報",
    images: [{ url: "https://p.aicu.jp/ogp/R2602.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "R2602 調査結果（速報） | AICU Research",
    description: "生成AI時代の\"つくる人\"調査 2026.02 — 結果速報",
    images: ["https://p.aicu.jp/ogp/R2602.png"],
  },
}

export default function ResultsPage() {
  return <ResultsClient />
}
