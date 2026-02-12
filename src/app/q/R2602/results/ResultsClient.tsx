"use client"

import { useState, useEffect } from "react"

type ChartQuestion = {
  id: string
  question: string
  type: string
  counts: Record<string, number>
  answered: number
}

type ResultsData = {
  totalResponses: number
  questions: ChartQuestion[]
  updatedAt: string
}

const COLORS = [
  "#4285F4", "#EA4335", "#FBBC04", "#34A853", "#FF6D01",
  "#46BDC6", "#7B1FA2", "#C2185B", "#0097A7", "#689F38",
  "#F4511E", "#6D4C41", "#546E7A", "#D81B60", "#1E88E5",
]

export default function ResultsClient() {
  const [data, setData] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/surveys/R2602/results")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{
      minHeight: "100dvh", background: "#f8f9fa", color: "#1a1a2e",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Noto Sans JP', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid rgba(0,0,0,0.08)",
        padding: "20px 16px", textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "#41C9B4" }}>AICU</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a2e" }}>Research</span>
        </div>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>
          R2602 調査結果（速報）
        </h1>
        {data && (
          <p style={{ fontSize: 13, color: "#888", marginTop: 6 }}>
            回答数: {data.totalResponses}件 / 最終更新: {new Date(data.updatedAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
          </p>
        )}
      </div>

      {/* Notice */}
      <div style={{
        maxWidth: 720, margin: "16px auto 0", padding: "12px 20px",
        background: "#FFF8E1", border: "1px solid #FFE082", borderRadius: 8,
        fontSize: 13, color: "#6D4C00", lineHeight: 1.7,
      }}>
        <p style={{ margin: 0, fontWeight: 600 }}>こちらは速報（テスト入力）です</p>
        <p style={{ margin: "4px 0 0" }}>個人情報に当たるデータは含まれておりません。アンケート参加後は最新のデータをみることができます。</p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px 60px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#999" }}>読み込み中...</div>
        ) : !data || data.totalResponses === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#999" }}>回答データがありません</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {data.questions.map((q, qi) => (
              <ChartCard key={q.id} q={q} colorOffset={qi} total={data.totalResponses} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "20px 16px", fontSize: 12, color: "#bbb", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <a href="/q/R2602" style={{ color: "#0031D8", textDecoration: "none", fontWeight: 600 }}>調査に回答する</a>
        {" / "}
        <a href="/q/R2602/policy" style={{ color: "#888", textDecoration: "none" }}>データ利用方針</a>
        <p style={{ marginTop: 8 }}>&copy; 2026 AICU Japan 株式会社</p>
      </div>
    </div>
  )
}

function ChartCard({ q, colorOffset, total }: { q: ChartQuestion; colorOffset: number; total: number }) {
  const entries = Object.entries(q.counts).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
  const maxVal = entries.length > 0 ? Math.max(...entries.map(([, v]) => v)) : 1

  return (
    <div style={{
      background: "#fff", borderRadius: 12, padding: "20px 24px",
      border: "1px solid rgba(0,0,0,0.08)",
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e", margin: "0 0 4px", lineHeight: 1.5 }}>
        {q.question}
      </h3>
      <p style={{ fontSize: 12, color: "#999", margin: "0 0 16px" }}>
        {q.answered}件の回答{q.type === "multi_choice" ? "（複数選択）" : ""}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {entries.map(([label, count], i) => {
          const pct = q.answered > 0 ? Math.round((count / q.answered) * 100) : 0
          const barWidth = maxVal > 0 ? (count / maxVal) * 100 : 0
          const color = COLORS[(i + colorOffset) % COLORS.length]
          return (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                <span style={{ color: "#333", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
                <span style={{ color: "#666", fontWeight: 600, marginLeft: 8, whiteSpace: "nowrap" }}>{count} ({pct}%)</span>
              </div>
              <div style={{ height: 20, background: "rgba(0,0,0,0.04)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  background: color,
                  width: `${barWidth}%`,
                  transition: "width 0.5s ease",
                  minWidth: count > 0 ? 2 : 0,
                }} />
              </div>
            </div>
          )
        })}
        {entries.length === 0 && (
          <div style={{ fontSize: 13, color: "#ccc" }}>回答なし</div>
        )}
      </div>
    </div>
  )
}
