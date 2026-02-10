import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { getContactByEmail, getMemberByContactId } from "@/lib/wix"
import { linkWixContactByEmail } from "@/lib/supabase"

const SUPERUSER_EMAIL = "shirai@mail.com"

export async function POST(req: NextRequest) {
  // Supabase Auth からユーザー取得
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email || user.email !== SUPERUSER_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  const { wixEmail } = await req.json()
  if (!wixEmail || typeof wixEmail !== "string") {
    return NextResponse.json({ error: "wixEmail is required" }, { status: 400 })
  }

  // Wix Contact 検索
  const contact = await getContactByEmail(wixEmail)
  if (!contact?._id) {
    return NextResponse.json({ error: `Wix Contact not found for ${wixEmail}` }, { status: 404 })
  }

  // Member 検索（任意）
  let memberId: string | null = null
  try {
    const member = await getMemberByContactId(contact._id)
    memberId = member?._id ?? null
  } catch {
    // Member がいなくても OK
  }

  // unified_users にリンク（メールベース）
  const linkedUser = await linkWixContactByEmail(user.email, contact._id, memberId)

  return NextResponse.json({
    success: true,
    wix_contact_id: contact._id,
    wix_member_id: memberId,
    user: linkedUser,
  })
}
