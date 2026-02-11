import { NextRequest, NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabase"
import { ALL_SURVEY_IDS } from "@/data/surveys"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await params // consume params to satisfy Next.js
  const email = req.nextUrl.searchParams.get("email")

  if (!email) {
    return NextResponse.json(
      { error: "email parameter is required" },
      { status: 400 },
    )
  }

  const db = getAdminSupabase()

  // Find which surveys this email has participated in
  const { data, error } = await db
    .from("survey_responses")
    .select("survey_id")
    .eq("email", email)
    .in("survey_id", ALL_SURVEY_IDS)

  if (error) {
    console.error("Survey status error:", error)
    return NextResponse.json({ error: "Failed to query" }, { status: 500 })
  }

  const participatedIds = new Set((data || []).map((r) => r.survey_id))
  const participated: Record<string, boolean> = {}
  for (const sid of ALL_SURVEY_IDS) {
    participated[sid] = participatedIds.has(sid)
  }

  return NextResponse.json({
    participated,
    totalSurveys: participatedIds.size,
  })
}
