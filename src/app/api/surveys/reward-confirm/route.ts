import { NextRequest, NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabase"

const CALLBACK_SECRET = process.env.WIX_CALLBACK_SECRET || ""

/**
 * POST /api/surveys/reward-confirm
 *
 * Called by Wix Automation after reward (AICU points) is distributed.
 * Updates survey_responses.reward_status = 'confirmed'.
 *
 * Payload from Wix:
 * {
 *   "email": "user@example.com",
 *   "research_id": "R2602",
 *   "points": 10000,
 *   "status": "completed" | "failed",
 *   "secret": "<WIX_CALLBACK_SECRET>"
 * }
 */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, research_id, points, status, secret } = body

  // Auth: check secret from body or header
  const headerSecret = req.headers.get("x-callback-secret") || ""
  if (CALLBACK_SECRET && secret !== CALLBACK_SECRET && headerSecret !== CALLBACK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  if (!email || !research_id) {
    return NextResponse.json({ error: "email and research_id required" }, { status: 400 })
  }

  const rewardStatus = status === "failed" ? "failed" : "confirmed"
  const db = getAdminSupabase()

  // Find the most recent survey response for this email + survey
  const { data: rows, error: findErr } = await db
    .from("survey_responses")
    .select("id, reward_status")
    .eq("survey_id", research_id)
    .eq("email", email)
    .order("submitted_at", { ascending: false })
    .limit(1)

  if (findErr || !rows || rows.length === 0) {
    console.error("Reward confirm - not found:", { email, research_id, findErr })
    return NextResponse.json({ error: "response not found" }, { status: 404 })
  }

  const row = rows[0]

  // Update reward status
  const { error: updateErr } = await db
    .from("survey_responses")
    .update({
      reward_status: rewardStatus,
      reward_confirmed_at: new Date().toISOString(),
    })
    .eq("id", row.id)

  if (updateErr) {
    console.error("Reward confirm update error:", updateErr)
    return NextResponse.json({ error: "update failed" }, { status: 500 })
  }

  console.log(`Reward ${rewardStatus}: ${email} / ${research_id} / ${points}pt`)
  return NextResponse.json({
    ok: true,
    reward_status: rewardStatus,
    survey_response_id: row.id,
  })
}

// Preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 })
}
