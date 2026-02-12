import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "データ利用方針 | AICU Research",
}

export default function PolicyPage() {
  return (
    <div style={{
      minHeight: "100dvh", background: "#f8f9fa", color: "#1a1a2e",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "40px 20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Noto Sans JP', sans-serif",
    }}>
      <div style={{ maxWidth: 600, width: "100%" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--aicu-teal, #41C9B4)" }}>
              AICU
            </span>
            <span style={{ fontSize: 17, fontWeight: 600, color: "#1a1a2e" }}>Research</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.4, color: "#1a1a2e" }}>
            調査データ利用方針
          </h1>
        </div>

        {/* Content */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: "28px 24px",
          border: "1px solid rgba(0,0,0,0.08)", lineHeight: 1.9, fontSize: 15,
        }}>
          <Section title="1. データの匿名統計処理">
            <p>
              本調査で収集されたデータは、統計的に処理・匿名化されます。
              個人を特定できる形で公表されることはありません。
              調査結果は、学術研究・政策提言・サービス改善の目的で利用されます。
            </p>
          </Section>

          <Section title="2. 第三者提供について">
            <p>
              本調査は、<a href="https://www.dcaj.or.jp/" target="_blank" rel="noopener" style={{ color: "#0031D8", textDecoration: "underline" }}>一般財団法人デジタルコンテンツ協会（DCAJ）</a>との共同調査です。
              調査結果は統計データとしてDCAJに提供されます。
            </p>
            <p style={{ fontWeight: 600, marginTop: 8 }}>
              個人情報であるメールアドレスはDCAJに提供されません。
            </p>
          </Section>

          <Section title="3. 謝礼について">
            <p>
              調査にご回答いただき、メールアドレスをご入力いただいた方に、
              <strong>10,000 AICUポイント</strong>を贈呈いたします。
              メールアドレスの入力は任意です。入力がない場合、謝礼の付与はできません。
            </p>
          </Section>

          <Section title="4. データの管理">
            <p>
              収集されたデータは、AICU Japan 株式会社が厳重に管理します。
              データの保管にはSupabaseを使用し、アクセス制御とデータの暗号化を実施しています。
            </p>
          </Section>

          <Section title="5. オプトアウト">
            <p>
              回答後にデータの削除を希望される場合は、以下の連絡先までご連絡ください。
            </p>
            <p style={{ marginTop: 8 }}>
              連絡先:{" "}
              <a href="mailto:R2602@aicu.jp?subject=Optout%3AR2602&body=https%3A%2F%2Fp.aicu.jp%2Fq%2FR2602%2Fpolicy" style={{ color: "#0031D8", textDecoration: "underline", fontWeight: 600 }}>
                R2602@aicu.jp
              </a>
            </p>
          </Section>

          <Section title="6. プライバシーポリシー" last>
            <p>
              AICU Japan 株式会社のプライバシーポリシーについては、以下をご確認ください。
            </p>
            <p style={{ marginTop: 8 }}>
              <a href="https://corp.aicu.ai/ja/privacy" target="_blank" rel="noopener" style={{ color: "#0031D8", textDecoration: "underline" }}>
                https://corp.aicu.ai/ja/privacy
              </a>
            </p>
          </Section>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#bbb" }}>
          AICU Japan 株式会社 / <a href="https://aicu.jp" style={{ color: "var(--aicu-teal, #41C9B4)", textDecoration: "none" }}>aicu.jp</a>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{
      paddingBottom: last ? 0 : 20,
      marginBottom: last ? 0 : 20,
      borderBottom: last ? "none" : "1px solid rgba(0,0,0,0.06)",
    }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>
        {title}
      </h2>
      <div style={{ color: "#444" }}>
        {children}
      </div>
    </div>
  )
}
