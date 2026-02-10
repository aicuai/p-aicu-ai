"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, string> = {
    NoCode: "認証コードが見つかりませんでした。リンクを再度お試しください。",
    AccessDenied: "アクセスが拒否されました",
    Verification: "認証リンクの有効期限が切れています。再度ログインしてください。",
    Default: "認証エラーが発生しました",
  }

  const message = errorMessages[error ?? ""] ?? error ?? errorMessages.Default

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 16 }}>認証エラー</h1>
        <div className="card" style={{ padding: 20, border: "1px solid rgba(239, 68, 68, 0.15)" }}>
          <p style={{ fontSize: 14, color: "#ef4444" }}>{message}</p>
        </div>
        <a
          href="/"
          style={{
            display: "inline-block",
            marginTop: 20,
            padding: "8px 24px",
            background: "var(--aicu-teal)",
            color: "#fff",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          ログインに戻る
        </a>
      </div>
    </main>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
