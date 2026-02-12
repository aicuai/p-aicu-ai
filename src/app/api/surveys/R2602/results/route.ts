import { NextResponse } from "next/server"
import { getAdminSupabase } from "@/lib/supabase"
import { R2602_CONFIG } from "@/data/surveys/R2602"

// Question IDs to exclude from results (email, text, consent, VoC)
const EXCLUDE_IDS = new Set([
  "entry_1127213393", // consent
  "entry_1243761143", // email
  "entry_388832134",  // VoC textarea
  "entry_1784426158", // VoC textarea
  "entry_611811208",  // VoC textarea
  "dcaj_Q1a",         // textarea
  "dcaj_Q5a",         // textarea
])

const CHOICE_TYPES = new Set(["single_choice", "multi_choice", "dropdown"])

export async function GET() {
  const db = getAdminSupabase()
  // Try with is_test filter; fallback without it if column doesn't exist yet
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rows: { answers: Record<string, any> }[] | null = null
  const { data: d1, error: e1 } = await db
    .from("survey_responses")
    .select("answers")
    .eq("survey_id", "R2602")
    .neq("is_test", true)

  if (e1) {
    // is_test column may not exist yet — retry without filter
    const { data: d2, error: e2 } = await db
      .from("survey_responses")
      .select("answers")
      .eq("survey_id", "R2602")
    if (e2) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
    }
    rows = d2
  } else {
    rows = d1
  }

  const totalResponses = rows?.length ?? 0

  // Build chart-ready question list from config
  const chartQuestions = R2602_CONFIG.questions
    .filter((q) => CHOICE_TYPES.has(q.type) && !EXCLUDE_IDS.has(q.id) && q.options)
    .map((q) => {
      const counts: Record<string, number> = {}
      const options = q.options!
      for (const opt of options) counts[opt] = 0

      // Count answers
      for (const row of rows ?? []) {
        const ans = row.answers?.[q.id]
        if (ans === undefined || ans === null) continue
        if (Array.isArray(ans)) {
          for (const v of ans) {
            if (v in counts) counts[v]++
            else counts[v] = (counts[v] ?? 0) + 1  // custom "その他: xxx"
          }
        } else {
          if (ans in counts) counts[ans]++
          else counts[ans] = (counts[ans] ?? 0) + 1
        }
      }

      // Answered count for this question
      const answered = (rows ?? []).filter((r) => {
        const a = r.answers?.[q.id]
        return a !== undefined && a !== null && a !== "" && (!Array.isArray(a) || a.length > 0)
      }).length

      return {
        id: q.id,
        question: (q.question ?? "").split("\n")[0],
        type: q.type,
        counts,
        answered,
      }
    })

  return NextResponse.json(
    { totalResponses, questions: chartQuestions, updatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } },
  )
}
