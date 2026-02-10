"use server"

import { createServerSupabase } from "@/lib/supabase"
import { redirect } from "next/navigation"

/** サーバーコンポーネント用: 認証ユーザー取得 */
export async function getUser() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/** サーバーアクション: メールマジックリンクでログイン */
export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email") as string
  if (!email) return { error: "メールアドレスを入力してください" }

  const supabase = await createServerSupabase()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3200"
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  redirect("/auth/verify-request")
}

/** サーバーアクション: サインアウト */
export async function signOut() {
  const supabase = await createServerSupabase()
  await supabase.auth.signOut()
  redirect("/")
}
