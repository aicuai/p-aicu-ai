import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import SignOutButton from "./SignOutButton"
import DashboardNav from "./DashboardNav"

export default async function Dashboard() {
  const session = await auth()
  if (!session?.user) redirect("/")

  const user = session.user

  return (
    <main className="min-h-screen pb-24">
      {/* Header */}
      <header
        className="sticky top-0 z-40"
        style={{
          background: 'var(--glass-bg)',
          borderBottom: '1px solid var(--glass-border)',
          backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
          WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            AICU <span className="text-aicu-primary">Portal</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.image && (
                <img
                  src={user.image}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm text-gray-300">{user.name}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Points Card */}
        <div className="bg-gradient-to-r from-aicu-primary to-aicu-secondary rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">AICUポイント</p>
              <p className="text-4xl font-bold mt-1">
                ---
                <span className="text-lg ml-1">pt</span>
              </p>
            </div>
            <div className="text-6xl opacity-20">🎯</div>
          </div>
          <div className="mt-4 flex gap-2">
            <Link
              href="/dashboard/points"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
            >
              ポイント履歴
            </Link>
            <Link
              href="/dashboard/purchases"
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
            >
              購入履歴
            </Link>
          </div>
        </div>

        {/* Menu Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Profile */}
          <div
            className="rounded-xl p-6"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
              WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-aicu-primary/20 rounded-full flex items-center justify-center">
                👤
              </div>
              <h2 className="text-lg font-semibold text-white">プロフィール</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--glass-text-dim)' }}>名前</span>
                <span className="text-white">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--glass-text-dim)' }}>メール</span>
                <span className="text-white">{user.email ?? '未設定'}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--glass-text-dim)' }}>Discord</span>
                <span className="text-green-400">連携済み ✅</span>
              </div>
            </div>
          </div>

          {/* Membership */}
          <div
            className="rounded-xl p-6"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
              WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-aicu-accent/20 rounded-full flex items-center justify-center">
                ⭐
              </div>
              <h2 className="text-lg font-semibold text-white">会員プラン</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--glass-text-dim)' }}>現在のプラン</span>
                <span className="text-aicu-primary font-medium">Free</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--glass-text-dim)' }}>Lab+へアップグレード</span>
                <span className="text-white">¥3,500/月</span>
              </div>
            </div>
            <button className="mt-4 w-full py-2 bg-aicu-primary hover:bg-aicu-secondary text-white rounded-lg text-sm transition-colors">
              プランを変更
            </button>
          </div>
        </div>

        {/* Discord Community */}
        <div
          className="rounded-xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(88,101,242,0.3), rgba(88,101,242,0.1))',
            border: '1px solid rgba(88,101,242,0.3)',
            backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">AICUコミュニティ</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--glass-text-dim)' }}>
                Discordでメンバーと交流しよう
              </p>
            </div>
            <a
              href="https://discord.gg/aicu"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#5865F2] text-white rounded-lg text-sm font-medium hover:bg-[#4752C4] transition-colors"
            >
              参加する
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <DashboardNav />
    </main>
  )
}
