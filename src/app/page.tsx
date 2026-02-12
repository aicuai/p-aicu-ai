import { getUser, signInWithEmail } from "@/lib/auth"
import { redirect } from "next/navigation"
import LoginForm from "./LoginForm"

export default async function Home() {
  const user = await getUser()
  if (user) redirect("/dashboard")

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <div style={{ maxWidth: 360, width: "100%" }}>
        {/* Logo */}
        <div className="animate-in" style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg, var(--aicu-teal), var(--aicu-teal-dark))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(65, 201, 180, 0.25)",
            }}>
              <span className="font-outfit" style={{ color: "#fff", fontWeight: 800, fontSize: 20 }}>A</span>
            </div>
          </div>
          <h1 style={{ margin: 0 }}>
            <span className="font-outfit" style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              AICU.jp
            </span>{" "}
            <span className="font-outfit" style={{ fontSize: 28, fontWeight: 600, color: "var(--aicu-teal)" }}>
              Portal
            </span>
          </h1>
          <p style={{ marginTop: 6, fontSize: 14, color: "var(--text-secondary)" }}>
            Point &middot; Profile &middot; Privacy
          </p>
        </div>

        {/* R2602 Survey Banner */}
        <a href="/q/R2602" style={{ textDecoration: "none", display: "block", marginBottom: 20 }}>
          <div className="card animate-in-delay" style={{
            padding: "16px 20px",
            background: "linear-gradient(135deg, rgba(0,49,216,0.04), rgba(65,201,180,0.06))",
            border: "1px solid rgba(0,49,216,0.12)",
            cursor: "pointer",
            transition: "all 0.2s",
          }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.5, marginBottom: 6 }}>
              生成AI時代の&quot;つくる人&quot;調査 2026.02
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 8 }}>
              あなたの創造が、AIと社会をつなぐデータになる。<br />
              所要時間：約5分 / 匿名回答 / 10,000 AICUポイント贈呈
            </div>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", lineHeight: 1.6 }}>
              前回調査結果: <span style={{ color: "#0031D8" }}>R2511</span><br />
              調査協力: <span style={{ color: "var(--text-secondary)" }}>一般財団法人デジタルコンテンツ協会（DCAJ）</span>
            </div>
          </div>
        </a>

        {/* Login Card */}
        <div className="card animate-in-delay" style={{ padding: 24 }}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
              ログイン
            </h2>
            <p style={{ marginTop: 4, fontSize: 13, color: "var(--text-secondary)" }}>
              メールアドレスでログイン
            </p>
          </div>

          <LoginForm signInAction={signInWithEmail} />

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-tertiary)", marginTop: 16 }}>
            パスワード不要 &mdash; メールでログインリンクを送信します
          </p>
        </div>

        {/* Features */}
        <div className="animate-in-delay-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 24 }}>
          {[
            { icon: "\uD83C\uDFAF", title: "Point", desc: "ポイント確認" },
            { icon: "\uD83D\uDC64", title: "Profile", desc: "アンケート" },
            { icon: "\u2764\uFE0F", title: "Privacy", desc: "会員情報" },
          ].map((f) => (
            <div
              key={f.title}
              className="card"
              style={{ padding: 12, textAlign: "center" }}
            >
              <div style={{ fontSize: 20, marginBottom: 4 }}>{f.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
                {f.title}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginTop: 2 }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="animate-in-delay-3" style={{ textAlign: "center", fontSize: 11, color: "var(--text-tertiary)", marginTop: 32, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <a href="https://corp.aicu.ai/ja/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>プライバシーポリシー</a>
            <a href="https://www.aicu.blog/terms/plan-free" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>利用規約</a>
            <a href="https://www.aicu.blog/terms/legal" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>法的免責事項</a>
          </div>
          <p>&copy; 2026 AICU Japan 株式会社</p>
        </footer>
      </div>
    </main>
  )
}
