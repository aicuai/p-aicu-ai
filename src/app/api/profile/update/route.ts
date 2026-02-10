import { NextRequest, NextResponse } from "next/server"
import { verifySupabaseToken } from "@/lib/push"
import { createClient } from "@supabase/supabase-js"
import { notifySlack } from "@/lib/slack"

export async function POST(req: NextRequest) {
  const userId = await verifySupabaseToken(req.headers.get("authorization"))
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { date_of_birth } = await req.json()
  if (!date_of_birth) {
    return NextResponse.json(
      { error: "date_of_birth is required" },
      { status: 400 },
    )
  }

  // Check existing DOB
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  )

  const { data: existing } = await supabase
    .from("profiles")
    .select("date_of_birth")
    .eq("id", userId)
    .single()

  const oldDob = existing?.date_of_birth
  const dobChanged = oldDob && oldDob !== date_of_birth

  // Update profile
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    date_of_birth,
    age_verified: true,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Notify Slack if DOB changed
  if (dobChanged) {
    await notifySlack(
      `⚠️ DOB変更検知\nUser: ${userId}\n旧: ${oldDob}\n新: ${date_of_birth}`,
    )
  }

  return NextResponse.json({ ok: true, dob_changed: !!dobChanged })
}
