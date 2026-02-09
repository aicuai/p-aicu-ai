import { auth, signIn } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()
  if (session) redirect("/dashboard")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">
            AICU <span className="text-aicu-primary">Portal</span>
          </h1>
          <p className="mt-2 text-gray-400">
            Point・Profile・Post
          </p>
        </div>

        {/* Login Card — Liquid Glass */}
        <div
          className="rounded-2xl p-8 space-y-6"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
            boxShadow: 'var(--glass-shadow)',
          }}
        >
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">
              ログイン
            </h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--glass-text-dim)' }}>
              Discordアカウントで接続
            </p>
          </div>

          {/* Discord Login Button */}
          <form
            action={async () => {
              "use server"
              await signIn("discord")
            }}
          >
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-3 px-4 py-3
                         bg-[#5865F2] hover:bg-[#4752C4]
                         text-white font-medium rounded-lg
                         transition-colors duration-200 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Discordでログイン
            </button>
          </form>

          {/* Info */}
          <div className="text-center text-sm" style={{ color: 'var(--glass-text-dim)' }}>
            <p>初回ログイン時にAICUアカウントと紐付けます</p>
          </div>
        </div>

        {/* Features — Liquid Glass cards */}
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🎯', title: 'Point', desc: 'ポイント確認' },
            { icon: '👤', title: 'Profile', desc: '会員情報' },
            { icon: '📢', title: 'Post', desc: 'お知らせ' },
          ].map((f) => (
            <div
              key={f.title}
              className="p-4 rounded-xl"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
                WebkitBackdropFilter: 'blur(var(--glass-blur)) saturate(var(--glass-saturate))',
              }}
            >
              <div className="text-2xl mb-1">{f.icon}</div>
              <div className="text-sm font-medium text-white">{f.title}</div>
              <div className="text-xs" style={{ color: 'var(--glass-text-dim)' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>&copy; 2026 AICU Japan Inc.</p>
        </div>
      </div>
    </main>
  )
}
