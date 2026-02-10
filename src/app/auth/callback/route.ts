import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { getOrCreateUserByEmail, linkWixContactByEmail } from "@/lib/supabase"
import { getContactByEmail, getMemberByContactId } from "@/lib/wix"
import { notifySlack } from "@/lib/slack"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const redirectTo = new URL("/dashboard", request.url)

  if (code) {
    const response = NextResponse.redirect(redirectTo)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            )
          },
        },
      },
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("[auth/callback] exchangeCodeForSession error:", error)
      return NextResponse.redirect(
        new URL(`/auth/error?error=${encodeURIComponent(error.message)}`, request.url),
      )
    }

    // メールで Wix Contact 自動リンク + unified_users UPSERT
    const email = data.user?.email
    let wixLinked = false
    if (email) {
      try {
        await getOrCreateUserByEmail(email, data.user?.user_metadata?.full_name ?? null)

        const contact = await getContactByEmail(email)
        if (contact?._id) {
          const member = await getMemberByContactId(contact._id)
          await linkWixContactByEmail(email, contact._id, member?._id ?? null)
          wixLinked = true
        }
      } catch (e) {
        console.error("[auth/callback] Wix link error:", e)
      }

      // Slack ログイン通知
      const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
      await notifySlack(
        `✅ ログイン: ${email}\nProvider: ${data.user?.app_metadata?.provider ?? "email"}\nTime: ${now}\nWix: ${wixLinked ? "連携済み" : "未連携"}`,
      )
    }

    return response
  }

  // code がない場合はエラー
  return NextResponse.redirect(
    new URL("/auth/error?error=NoCode", request.url),
  )
}
