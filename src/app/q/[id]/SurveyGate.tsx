"use client"

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

import { useState, useEffect, useMemo } from "react"
import type { SurveyConfig } from "@/data/surveys"
import SurveyForm from "./SurveyForm"

type Props = {
  surveyId: string
  config: SurveyConfig
  email?: string
}

type Participation = Record<string, boolean>

const CONSENT_KEY_PREFIX = "consent_q_"
const BLUE = "#0031D8"

function yearOptions() {
  const currentYear = new Date().getFullYear()
  const years: number[] = []
  for (let y = currentYear; y >= 1920; y--) years.push(y)
  return years
}

const months = Array.from({ length: 12 }, (_, i) => i + 1)

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

export default function SurveyGate({ surveyId, config, email }: Props) {
  const [phase, setPhase] = useState<"gate" | "survey">("gate")
  const [birthYear, setBirthYear] = useState("")
  const [birthMonth, setBirthMonth] = useState("")
  const [birthDay, setBirthDay] = useState("")
  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [participation, setParticipation] = useState<Participation | null>(null)
  const [loadingStatus, setLoadingStatus] = useState(false)

  // Check if already consented
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CONSENT_KEY_PREFIX + surveyId)
      if (saved) setPhase("survey")
    } catch { /* ignore */ }
  }, [surveyId])

  // Fetch participation status
  useEffect(() => {
    if (!email) return
    setLoadingStatus(true)
    fetch(`/api/surveys/${surveyId}/status?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.participated) setParticipation(data.participated)
      })
      .catch(() => { /* ignore */ })
      .finally(() => setLoadingStatus(false))
  }, [email, surveyId])

  const dayOptions = useMemo(() => {
    if (!birthYear || !birthMonth) return Array.from({ length: 31 }, (_, i) => i + 1)
    return Array.from(
      { length: daysInMonth(Number(birthYear), Number(birthMonth)) },
      (_, i) => i + 1,
    )
  }, [birthYear, birthMonth])

  const canProceed = birthYear && birthMonth && birthDay && termsChecked && privacyChecked

  const handleConsent = () => {
    if (!canProceed) return
    const consent = {
      birthDate: `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`,
      termsAgreed: true,
      privacyAgreed: true,
      consentedAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem(CONSENT_KEY_PREFIX + surveyId, JSON.stringify(consent))
    } catch { /* ignore */ }
    // GTAG: survey consent
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "survey_consent", { survey_id: surveyId })
    }
    setPhase("survey")
  }

  // Extract birth year from consent data (current form state or saved localStorage)
  const consentBirthYear = useMemo(() => {
    // If user just filled the gate form, use that value
    if (birthYear) return birthYear
    // Otherwise read from localStorage (returning user)
    try {
      const saved = localStorage.getItem(CONSENT_KEY_PREFIX + surveyId)
      if (saved) {
        const consent = JSON.parse(saved)
        if (consent.birthDate) return consent.birthDate.split("-")[0]
      }
    } catch { /* ignore */ }
    return ""
  }, [birthYear, surveyId])

  if (phase === "survey") {
    return <SurveyForm surveyId={surveyId} config={config} email={email} birthYear={consentBirthYear} />
  }

  return (
    <div style={{
      minHeight: "100dvh", background: "#f8f9fa", color: "#1a1a2e",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "40px 20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Noto Sans JP', sans-serif",
    }}>
      <div style={{ maxWidth: 440, width: "100%", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--aicu-teal, #41C9B4)" }}>
              AICU
            </span>
            <span style={{ fontSize: 17, fontWeight: 600, color: "#1a1a2e" }}>Research</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.4, marginBottom: 8, color: "#1a1a2e" }}>
            {config.title}
          </h2>
          {config.description && (
            <p style={{ fontSize: 15, color: "#666", lineHeight: 1.6 }}>{config.description}</p>
          )}
        </div>

        {/* Info block */}
        <div style={{
          padding: "16px 20px", borderRadius: 16, marginBottom: 24,
          background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
          fontSize: 13, color: "#888", lineHeight: 2,
        }}>
          {config.estimatedMinutes && <div>所要時間: 約{config.estimatedMinutes}分</div>}
          {config.reward && <div>報酬: {config.reward}</div>}
          <div>
            前回調査結果:{" "}
            <a href="https://u.aicu.jp/r/R2511" target="_blank" rel="noopener" style={{ color: BLUE, textDecoration: "underline" }}>R2511</a>
          </div>
          <div>
            結果速報の例:{" "}
            <a href="/q/R2602/results" style={{ color: BLUE, textDecoration: "underline" }}>R2602 速報ページ</a>
          </div>
          <div>
            データ利用方針:{" "}
            <a href="/q/R2602/policy" target="_blank" rel="noopener" style={{ color: BLUE, textDecoration: "underline" }}>p.aicu.jp/q/R2602/policy</a>
          </div>
          <div>
            調査協力:{" "}
            <a href="https://www.dcaj.or.jp/" target="_blank" rel="noopener" style={{ color: BLUE, textDecoration: "underline" }}>一般財団法人デジタルコンテンツ協会</a>
            {" "}(DCAJ)
          </div>
        </div>

        {/* Participation status */}
        {email && (
          <div style={{
            padding: "16px 20px", borderRadius: 16, marginBottom: 24,
            background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#999", marginBottom: 10 }}>
              過去の参加状況
            </div>
            {loadingStatus ? (
              <div style={{ fontSize: 14, color: "#999" }}>読み込み中...</div>
            ) : participation ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(participation).map(([sid, done]) => (
                  <div key={sid} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                    <span style={{ color: done ? "#34d399" : "#ccc" }}>
                      {done ? "✓" : "○"}
                    </span>
                    <span style={{ color: done ? "#333" : "#999" }}>
                      {sid}
                    </span>
                    <span style={{ fontSize: 12, color: "#bbb" }}>
                      {done ? "回答済み" : "未回答"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 14, color: "#999" }}>情報なし</div>
            )}
          </div>
        )}

        {/* Birthday */}
        <div style={{
          padding: "16px 20px", borderRadius: 16, marginBottom: 20,
          background: "#fff", border: "1px solid rgba(0,0,0,0.08)",
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#999", marginBottom: 12 }}>
            年齢確認（生年月日）
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={birthYear} onChange={(e) => setBirthYear(e.target.value)} style={selectStyle}>
              <option value="">年</option>
              {yearOptions().map((y) => (
                <option key={y} value={y}>{y}年</option>
              ))}
            </select>
            <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} style={selectStyle}>
              <option value="">月</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
            <select value={birthDay} onChange={(e) => setBirthDay(e.target.value)} style={selectStyle}>
              <option value="">日</option>
              {dayOptions.map((d) => (
                <option key={d} value={d}>{d}日</option>
              ))}
            </select>
          </div>
        </div>

        {/* Consent checkboxes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: BLUE }}
            />
            <span style={{ color: "#333" }}>
              <a href="https://www.aicu.blog/terms/plan-free" target="_blank" rel="noopener" style={{ color: BLUE, textDecoration: "underline" }}>利用規約</a>
              に同意する
            </span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14 }}>
            <input
              type="checkbox"
              checked={privacyChecked}
              onChange={(e) => setPrivacyChecked(e.target.checked)}
              style={{ width: 18, height: 18, accentColor: BLUE }}
            />
            <span style={{ color: "#333" }}>
              <a href="https://corp.aicu.ai/ja/privacy" target="_blank" rel="noopener" style={{ color: BLUE, textDecoration: "underline" }}>プライバシーポリシー</a>
              に同意する
            </span>
          </label>
        </div>

        {/* Submit button */}
        <button
          onClick={handleConsent}
          disabled={!canProceed}
          style={{
            width: "100%", padding: "16px 24px", borderRadius: 12,
            border: "none", fontSize: 17, fontWeight: 700,
            fontFamily: "inherit", cursor: canProceed ? "pointer" : "default",
            background: canProceed ? BLUE : "rgba(0,0,0,0.08)",
            color: canProceed ? "#fff" : "#bbb",
            transition: "all 0.2s",
            boxShadow: canProceed ? "0 4px 20px rgba(0,49,216,0.25)" : "none",
          }}
        >
          同意して開始
        </button>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#bbb" }}>
          Powered by{" "}
          <span style={{ fontFamily: "'Outfit', sans-serif", color: "var(--aicu-teal, #41C9B4)", fontWeight: 700 }}>AICU</span>
          {" "}LiquidGlassForm
        </div>
      </div>
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  flex: 1, padding: "10px 8px", borderRadius: 12,
  background: "#fff", border: "1px solid rgba(0,0,0,0.12)",
  color: "#333", fontSize: 15, fontFamily: "inherit",
  appearance: "auto" as const, WebkitAppearance: "menulist" as const,
}
