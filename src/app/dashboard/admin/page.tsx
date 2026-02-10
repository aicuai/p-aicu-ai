import { getUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SUPERUSER_EMAILS } from "@/lib/constants"
import { getAdminSupabase } from "@/lib/supabase"
import { getTotalContactsCount, getTotalMembersCount, getSubscriptionStats } from "@/lib/wix"
import Link from "next/link"

export default async function AdminDashboard() {
  const user = await getUser()
  if (!user?.email || !SUPERUSER_EMAILS.includes(user.email)) {
    redirect("/dashboard")
  }

  const admin = getAdminSupabase()

  // Parallel queries
  const [
    unifiedResult,
    wixLinkedResult,
    discordLinkedResult,
    login7dResult,
    login30dResult,
    newUsers7dResult,
    authUsersResult,
    profilesResult,
    pushSubsResult,
    recentLoginsResult,
  ] = await Promise.all([
    admin.from("unified_users").select("id", { count: "exact", head: true }),
    admin.from("unified_users").select("id", { count: "exact", head: true }).not("wix_contact_id", "is", null),
    admin.from("unified_users").select("id", { count: "exact", head: true }).not("discord_id", "is", null),
    admin.from("unified_users").select("id", { count: "exact", head: true }).gte("last_login_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    admin.from("unified_users").select("id", { count: "exact", head: true }).gte("last_login_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    admin.from("unified_users").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    admin.auth.admin.listUsers({ page: 1, perPage: 1 }),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin.from("push_subscriptions").select("user_id", { count: "exact", head: true }),
    admin.from("unified_users").select("primary_email, last_login_at, wix_contact_id, discord_id").order("last_login_at", { ascending: false, nullsFirst: false }).limit(10),
  ])

  const totalUsers = unifiedResult.count ?? 0
  const wixLinked = wixLinkedResult.count ?? 0
  const discordLinked = discordLinkedResult.count ?? 0
  const login7d = login7dResult.count ?? 0
  const login30d = login30dResult.count ?? 0
  const newUsers7d = newUsers7dResult.count ?? 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authUsersTotal = (authUsersResult as any)?.data?.total ?? totalUsers
  const profilesCount = profilesResult.count ?? 0
  const pushSubsCount = pushSubsResult.count ?? 0

  let wixTotalContacts = 0
  let wixTotalMembers = 0
  let subscriptionStats: { total: number; byPlanAndStatus: Record<string, Record<string, number>> } = { total: 0, byPlanAndStatus: {} }
  try {
    ;[wixTotalContacts, wixTotalMembers, subscriptionStats] = await Promise.all([
      getTotalContactsCount(),
      getTotalMembersCount(),
      getSubscriptionStats(),
    ])
  } catch (e) {
    console.error("[admin] Wix count error:", e)
  }

  const safeRate = (n: number, d: number) => d > 0 ? Math.round((n / d) * 1000) / 10 : 0
  const wixRate = safeRate(wixLinked, totalUsers)
  const discordRate = safeRate(discordLinked, totalUsers)
  const profileRate = safeRate(profilesCount, authUsersTotal)
  const pushRate = safeRate(pushSubsCount, authUsersTotal)
  const wauMauRatio = safeRate(login7d, login30d)

  const recentLogins = recentLoginsResult.data ?? []

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
              Admin
            </span>
          </div>
          <Link href="/dashboard" style={{ fontSize: 13, color: "var(--aicu-teal)", textDecoration: "none", fontWeight: 500 }}>
            &larr; ダッシュボード
          </Link>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, width: "100%", maxWidth: 640, margin: "0 auto", padding: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* KPI Summary Cards */}
          <div className="animate-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <KpiCard label="総ユーザー" value={totalUsers} />
            <KpiCard label="Wix 紐付け率" value={`${wixRate}%`} sub={`${wixLinked}/${totalUsers}`} />
            <KpiCard label="7日アクティブ" value={login7d} sub={`WAU/MAU ${wauMauRatio}%`} />
            <KpiCard label="Push 購読率" value={`${pushRate}%`} sub={`${pushSubsCount}人`} />
          </div>

          {/* Retention Section */}
          <div className="card animate-in-delay" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>継続率</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <StatRow label="WAU（7日アクティブ）" value={String(login7d)} />
              <StatRow label="MAU（30日アクティブ）" value={String(login30d)} />
              <StatRow label="WAU/MAU" value={`${wauMauRatio}%`} highlight />
              <StatRow label="新規ユーザー（7日以内）" value={String(newUsers7d)} />
              <StatRow label="プロフィール完了率" value={`${profileRate}%（${profilesCount}人）`} />
              <StatRow label="Discord 連携率" value={`${discordRate}%（${discordLinked}人）`} />
            </div>
          </div>

          {/* Wix Integration */}
          <div className="card animate-in-delay-2" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>Wix 連携状況</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--text-secondary)" }}>Wix サイト会員</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{wixTotalMembers}人</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--text-secondary)" }}>Wix 連絡先（全体）</span>
                <span style={{ fontWeight: 500, color: "var(--text-tertiary)" }}>{wixTotalContacts}人</span>
              </div>
              {/* Breakdown note */}
              <div style={{ background: "var(--aicu-teal-light)", borderRadius: "var(--radius-sm)", padding: "10px 12px", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>差分 {wixTotalContacts - wixTotalMembers}人の内訳</p>
                <p>サイト会員ではない連絡先（ゲスト購入、フォーム送信、アプリ経由の問い合わせ、自動生成の空レコード等）。Wix ダッシュボード &gt; 顧客・リード管理で「非会員」フィルタで確認可。</p>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--text-secondary)" }}>p.aicu.jp 登録者</span>
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{totalUsers}人</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span style={{ color: "var(--text-secondary)" }}>Wix 連携済み</span>
                <span style={{ fontWeight: 600, color: "var(--aicu-teal)" }}>{wixLinked}人</span>
              </div>
              {/* Ratio bar */}
              <div style={{ marginTop: 4 }}>
                <div style={{ display: "flex", fontSize: 11, color: "var(--text-tertiary)", marginBottom: 4, justifyContent: "space-between" }}>
                  <span>連携済み {wixRate}%</span>
                  <span>会員全体の {wixTotalMembers > 0 ? safeRate(wixLinked, wixTotalMembers) : 0}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: "var(--border)", overflow: "hidden", display: "flex" }}>
                  <div style={{
                    width: `${wixTotalMembers > 0 ? safeRate(wixLinked, wixTotalMembers) : 0}%`,
                    background: "var(--aicu-teal)",
                    borderRadius: 4,
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            </div>
          </div>

          {/* Subscriptions */}
          {subscriptionStats.total > 0 && (
            <div className="card animate-in-delay-2" style={{ padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>サブスクリプション</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Object.entries(subscriptionStats.byPlanAndStatus).map(([planName, statuses]) => {
                  const active = statuses["ACTIVE"] || 0
                  const canceled = statuses["CANCELED"] || 0
                  const other = Object.entries(statuses).filter(([s]) => s !== "ACTIVE" && s !== "CANCELED").reduce((sum, [, n]) => sum + n, 0)
                  return (
                    <div key={planName}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                        <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{planName}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, fontSize: 12 }}>
                        {active > 0 && <span style={{ color: "var(--aicu-teal)", fontWeight: 600 }}>有効 {active}</span>}
                        {canceled > 0 && <span style={{ color: "#ef4444" }}>解約 {canceled}</span>}
                        {other > 0 && <span style={{ color: "var(--text-tertiary)" }}>他 {other}</span>}
                      </div>
                    </div>
                  )
                })}
                <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 4, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
                  ※ Wix API制限により最新50件のみ表示
                </div>
              </div>
            </div>
          )}

          {/* Recent Logins */}
          <div className="card animate-in-delay-3" style={{ padding: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", marginBottom: 12 }}>最近のログイン</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {recentLogins.length === 0 && (
                <p style={{ fontSize: 13, color: "var(--text-tertiary)" }}>ログインデータなし</p>
              )}
              {recentLogins.map((row: { primary_email: string | null; last_login_at: string | null; wix_contact_id: string | null; discord_id: string | null }, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "6px 0", borderBottom: i < recentLogins.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                    <span style={{ color: "var(--text-primary)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {row.primary_email ?? "—"}
                    </span>
                    <span style={{ color: "var(--text-tertiary)", fontSize: 11 }}>
                      {row.last_login_at ? new Date(row.last_login_at).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" }) : "—"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 8 }}>
                    <StatusBadge label="Wix" active={!!row.wix_contact_id} />
                    <StatusBadge label="DC" active={!!row.discord_id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
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

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>{sub}</p>}
    </div>
  )
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: highlight ? "var(--aicu-teal)" : "var(--text-primary)", fontWeight: highlight ? 600 : 400 }}>{value}</span>
    </div>
  )
}

function StatusBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span style={{
      fontSize: 10,
      fontWeight: 600,
      padding: "2px 6px",
      borderRadius: 4,
      background: active ? "rgba(65, 201, 180, 0.12)" : "rgba(0, 0, 0, 0.04)",
      color: active ? "var(--aicu-teal)" : "var(--text-tertiary)",
    }}>
      {label}
    </span>
  )
}
