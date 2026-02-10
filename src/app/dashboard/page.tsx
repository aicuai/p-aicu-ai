import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import SignOutButton from "./SignOutButton"
import LinkWixForm from "./LinkWixForm"
import { getUserByEmail } from "@/lib/supabase"
import { getContactByEmail, getLoyaltyByContactId, getMemberByContactId } from "@/lib/wix"
import { SUPERUSER_EMAILS } from "@/lib/constants"
import Link from "next/link"

export default async function Dashboard() {
  const user = await getUser()
  if (!user) redirect("/")

  const email = user.email ?? null
  const isSuperuser = !!email && SUPERUSER_EMAILS.includes(email)

  // Wix データ取得
  let points: number | null = null
  let wixLinked = false
  let unifiedUserId: string | null = null
  let discordLinked = false
  let wixProfile: {
    firstName?: string | null
    lastName?: string | null
    company?: string | null
    profilePhoto?: string | null
    nickname?: string | null
  } | null = null

  try {
    if (email) {
      const unifiedUser = await getUserByEmail(email)
      unifiedUserId = unifiedUser?.id ?? null
      discordLinked = !!unifiedUser?.discord_id

      if (unifiedUser?.wix_contact_id) {
        wixLinked = true

        // ポイント取得
        const loyalty = await getLoyaltyByContactId(unifiedUser.wix_contact_id)
        if (loyalty?.points) {
          points = loyalty.points.balance ?? 0
        }

        // プロフィール取得
        const member = await getMemberByContactId(unifiedUser.wix_contact_id)
        if (member) {
          wixProfile = {
            firstName: member.contact?.firstName,
            lastName: member.contact?.lastName,
            company: member.contact?.company,
            profilePhoto: member.profile?.photo?.url,
            nickname: member.profile?.nickname,
          }
        }
      } else {
        // unified_users に Wix リンクがなくても、メールで直接検索を試みる
        const contact = await getContactByEmail(email)
        if (contact?._id) {
          wixLinked = true
          const loyalty = await getLoyaltyByContactId(contact._id)
          if (loyalty?.points) {
            points = loyalty.points.balance ?? 0
          }
          const member = await getMemberByContactId(contact._id)
          if (member) {
            wixProfile = {
              firstName: member.contact?.firstName,
              lastName: member.contact?.lastName,
              company: member.contact?.company,
              profilePhoto: member.profile?.photo?.url,
              nickname: member.profile?.nickname,
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("[dashboard] Wix data fetch error:", e)
  }

  const displayName = wixProfile?.nickname ?? wixProfile?.firstName ?? user.user_metadata?.full_name ?? email ?? "User"

  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header className="glass-nav" style={{ position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="font-outfit" style={{ fontSize: 20, fontWeight: 800, color: "var(--aicu-teal)", letterSpacing: "-0.02em" }}>
              AICU
            </span>
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
              Portal
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>
              {displayName}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, width: "100%", maxWidth: 640, margin: "0 auto", padding: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Points Card */}
          <div className="animate-in" style={{
            borderRadius: "var(--radius)",
            padding: 20,
            color: "#fff",
            background: "linear-gradient(135deg, var(--aicu-teal), var(--aicu-teal-dark))",
            boxShadow: "0 8px 24px rgba(65, 201, 180, 0.2)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.12)",
            }} />
            <p style={{ fontSize: 13, opacity: 0.85, fontWeight: 500, margin: 0 }}>AICUポイント</p>
            <p style={{ fontSize: 36, fontWeight: 700, marginTop: 4, letterSpacing: "-0.02em" }}>
              {points !== null ? points.toLocaleString() : "---"}
              <span style={{ fontSize: 15, fontWeight: 400, marginLeft: 4, opacity: 0.8 }}>pt</span>
            </p>
            {!wixLinked && (
              <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>Wix 未連携（メールアドレスが一致すると自動連携されます）</p>
            )}
          </div>

          {/* Profile */}
          <div className="card animate-in-delay" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>プロフィール</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <ProfileRow label="名前" value={displayName} />
              {wixProfile?.company && <ProfileRow label="会社" value={wixProfile.company} />}
              <ProfileRow label="メール" value={email ?? "未設定"} />
              <ProfileRow
                label="Discord"
                value={discordLinked ? "連携済み" : "未連携"}
                valueColor={discordLinked ? "#34c759" : "#ff9500"}
              />
              <ProfileRow
                label="Wix"
                value={wixLinked ? "連携済み" : "未連携"}
                valueColor={wixLinked ? "#34c759" : "#ff9500"}
              />
            </div>
          </div>

          {/* Membership */}
          <div className="card animate-in-delay-2" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>会員プラン</h2>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
              <span style={{ color: "var(--text-secondary)" }}>現在のプラン</span>
              <span style={{ color: "var(--aicu-teal)", fontWeight: 600 }}>Free</span>
            </div>
          </div>

          {/* Superuser Panel */}
          {isSuperuser && (
            <div className="card animate-in-delay-2" style={{ padding: 20, border: "1px solid rgba(239, 68, 68, 0.15)" }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#ef4444", marginBottom: 12 }}>Super User</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontFamily: "monospace", color: "var(--text-tertiary)" }}>
                <p>email: {email ?? "—"}</p>
                <p>unified_user_id: {unifiedUserId ?? "—"}</p>
                <p>discord_linked: {discordLinked ? "yes" : "no"}</p>
              </div>
              {!wixLinked && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>Wix に登録しているメールアドレスを入力して連携</p>
                  <LinkWixForm />
                </div>
              )}
            </div>
          )}

          {/* Admin Dashboard Link */}
          {isSuperuser && (
            <Link
              href="/dashboard/admin"
              className="card card-hover animate-in-delay-3"
              style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none" }}
            >
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>管理者ダッシュボード</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>KPI・ユーザー統計</p>
              </div>
              <span style={{
                padding: "6px 14px",
                background: "linear-gradient(135deg, var(--aicu-teal), var(--aicu-teal-dark))",
                color: "#fff",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
              }}>
                Admin
              </span>
            </Link>
          )}

          {/* Discord Community */}
          <a
            href="https://j.aicu.ai/JoinDiscord"
            target="_blank"
            rel="noopener noreferrer"
            className="card card-hover animate-in-delay-3"
            style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none" }}
          >
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Discord</h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>コミュニティに参加する</p>
            </div>
            <span style={{
              padding: "6px 14px",
              background: "#5865F2",
              color: "#fff",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(88, 101, 242, 0.2)",
            }}>
              参加
            </span>
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: "center", fontSize: 11, color: "var(--text-tertiary)", padding: "16px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <a href="https://corp.aicu.ai/ja/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>プライバシーポリシー</a>
          <a href="https://www.aicu.blog/terms/plan-free" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>利用規約</a>
          <a href="https://www.aicu.blog/terms/legal" target="_blank" rel="noopener noreferrer" style={{ color: "var(--text-tertiary)", textDecoration: "none" }}>法的免責事項</a>
        </div>
        <p>&copy; 2026 AICU Japan Inc.</p>
      </footer>
    </main>
  )
}

function ProfileRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: valueColor ?? "var(--text-primary)", fontWeight: valueColor ? 500 : 400 }}>{value}</span>
    </div>
  )
}
