export default function VerifyRequestPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
      <div style={{ maxWidth: 360, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
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
        </div>

        <div className="card animate-in" style={{ padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>&#x2709;&#xFE0F;</div>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
            メールを確認してください
          </h2>
          <p style={{ marginTop: 12, fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            ログインリンクをメールで送信しました。<br />
            受信箱を確認して、リンクをクリックしてください。
          </p>
          <p style={{ marginTop: 16, fontSize: 12, color: "var(--text-tertiary)" }}>
            メールが届かない場合は、迷惑メールフォルダもご確認ください。
          </p>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <a
            href="/"
            style={{
              fontSize: 13,
              color: "var(--aicu-teal)",
              textDecoration: "none",
            }}
          >
            ログインに戻る
          </a>
        </div>
      </div>
    </main>
  )
}
