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
            Point &middot; Profile &middot; Post
          </p>
        </div>

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
            { icon: "\uD83D\uDC64", title: "Profile", desc: "会員情報" },
            { icon: "\uD83D\uDCE2", title: "Post", desc: "お知らせ" },
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
        <p className="animate-in-delay-3" style={{ textAlign: "center", fontSize: 11, color: "var(--text-tertiary)", marginTop: 32 }}>
          &copy; 2026 AICU Japan Inc.
        </p>
      </div>
    </main>
  )
}
