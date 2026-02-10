import { NextRequest, NextResponse } from "next/server"
import {
  verifySupabaseToken,
  getSubscriptionsByUser,
  getAllSubscriptions,
  sendPush,
  removeSubscription,
} from "@/lib/push"

import { SUPERUSER_EMAILS } from "@/lib/constants"

export async function POST(req: NextRequest) {
  // Verify the sender is a superuser via Supabase auth
  const userId = await verifySupabaseToken(req.headers.get("authorization"))
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check superuser by looking up the user's email
  const { createClient } = await import("@supabase/supabase-js")
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
  )
  const { data: userData } = await supabase.auth.admin.getUserById(userId)
  if (!userData?.user?.email || !SUPERUSER_EMAILS.includes(userData.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { title, body, url, targetUserId } = await req.json()
  if (!title || !body) {
    return NextResponse.json(
      { error: "title and body are required" },
      { status: 400 },
    )
  }

  // Get target subscriptions
  const subs = targetUserId
    ? await getSubscriptionsByUser(targetUserId)
    : await getAllSubscriptions()

  let sent = 0
  let failed = 0
  for (const sub of subs) {
    try {
      await sendPush(sub, { title, body, url })
      sent++
    } catch (err: unknown) {
      const statusCode =
        err && typeof err === "object" && "statusCode" in err
          ? (err as { statusCode: number }).statusCode
          : 0
      if (statusCode === 404 || statusCode === 410) {
        // Subscription expired — clean up
        await removeSubscription(sub.endpoint)
      }
      failed++
    }
  }

  return NextResponse.json({ sent, failed, total: subs.length })
}
