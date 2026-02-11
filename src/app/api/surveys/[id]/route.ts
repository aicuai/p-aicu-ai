import { NextRequest, NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabase"
import { createHash } from "crypto"

const WIX_REWARD_WEBHOOK_URL = process.env.WIX_REWARD_WEBHOOK_URL || ""

// Trigger Wix Automation to create account + award points
async function triggerReward(surveyId: string, email: string, points: number) {
  if (!WIX_REWARD_WEBHOOK_URL || !email) return
  try {
    await fetch(WIX_REWARD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        research_id: surveyId,
        string_data: createHash("sha256").update(email + surveyId).digest("hex").slice(0, 8),
        number_field: points,
        research_name: `${surveyId}調査謝礼`,
        dateTime_field: new Date().toISOString(),
        email_field: email,
      }),
    })
  } catch (e) {
    console.error("Wix reward webhook error:", e)
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: surveyId } = await params
  const body = await req.json()
  const { answers, submittedAt, email } = body

  if (!answers || typeof answers !== "object") {
    return NextResponse.json(
      { error: "answers are required" },
      { status: 400 },
    )
  }

  // Hash IP for dedup (never store raw IP)
  const forwarded = req.headers.get("x-forwarded-for")
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown"
  const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 16)

  const db = getAdminSupabase()
  const { error } = await db.from("survey_responses").insert({
    survey_id: surveyId,
    answers,
    submitted_at: submittedAt || new Date().toISOString(),
    ip_hash: ipHash,
    user_agent: req.headers.get("user-agent")?.slice(0, 256) ?? null,
    email: email || null,
    reward_status: email ? "pending" : "none",
  })

  if (error) {
    console.error("Survey insert error:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }

  // Trigger reward (fire-and-forget, don't block response)
  if (email) {
    triggerReward(surveyId, email, 10000).catch(() => {})
  }

  return NextResponse.json({ ok: true })
}

// Preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
