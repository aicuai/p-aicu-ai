"use client"

import { createBrowserSupabase } from "@/lib/supabase-browser"
import { useRouter } from "next/navigation"

export default function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createBrowserSupabase()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      style={{ fontSize: 13, color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer", transition: "color 0.2s" }}
    >
      ログアウト
    </button>
  )
}
