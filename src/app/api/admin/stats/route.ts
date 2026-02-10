import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { getAdminSupabase } from "@/lib/supabase"
import { SUPERUSER_EMAILS } from "@/lib/constants"
import { getTotalContactsCount } from "@/lib/wix"

export async function GET() {
  // Auth check
  const user = await getUser()
  if (!user?.email || !SUPERUSER_EMAILS.includes(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = getAdminSupabase()

  // Parallel queries
  const [
    unifiedResult,
    wixLinkedResult,
    discordLinkedResult,
    login7dResult,
    login30dResult,
    newUsers7dResult,
    authUsersResult,
    profilesResult,
    pushSubsResult,
    recentLoginsResult,
  ] = await Promise.all([
    // Total unified_users
    admin.from("unified_users").select("id", { count: "exact", head: true }),
    // Wix linked
    admin.from("unified_users").select("id", { count: "exact", head: true }).not("wix_contact_id", "is", null),
    // Discord linked
    admin.from("unified_users").select("id", { count: "exact", head: true }).not("discord_id", "is", null),
    // Login last 7 days
    admin.from("unified_users").select("id", { count: "exact", head: true }).gte("last_login_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    // Login last 30 days
    admin.from("unified_users").select("id", { count: "exact", head: true }).gte("last_login_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    // New users last 7 days
    admin.from("unified_users").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    // Auth users count (via admin API)
    admin.auth.admin.listUsers({ page: 1, perPage: 1 }),
    // Profiles count
    admin.from("profiles").select("id", { count: "exact", head: true }),
    // Push subscriptions (unique users)
    admin.from("push_subscriptions").select("user_id", { count: "exact", head: true }),
    // Recent logins (top 10)
    admin.from("unified_users").select("primary_email, last_login_at, wix_contact_id, discord_id").order("last_login_at", { ascending: false, nullsFirst: false }).limit(10),
  ])

  const totalUsers = unifiedResult.count ?? 0
  const wixLinked = wixLinkedResult.count ?? 0
  const discordLinked = discordLinkedResult.count ?? 0
  const login7d = login7dResult.count ?? 0
  const login30d = login30dResult.count ?? 0
  const newUsers7d = newUsers7dResult.count ?? 0

  // auth.users total from listUsers response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const authUsersTotal = (authUsersResult as any)?.data?.total ?? totalUsers
  const profilesCount = profilesResult.count ?? 0
  const pushSubsCount = pushSubsResult.count ?? 0

  // Wix total contacts (may fail if Wix not configured)
  let wixTotalContacts = 0
  try {
    wixTotalContacts = await getTotalContactsCount()
  } catch (e) {
    console.error("[admin/stats] Wix contacts count error:", e)
  }

  const safeRate = (n: number, d: number) => d > 0 ? Math.round((n / d) * 1000) / 10 : 0

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    users: {
      total: totalUsers,
      wix_linked: wixLinked,
      wix_linked_rate: safeRate(wixLinked, totalUsers),
      discord_linked: discordLinked,
      discord_linked_rate: safeRate(discordLinked, totalUsers),
      profile_completed: profilesCount,
      profile_completed_rate: safeRate(profilesCount, authUsersTotal),
      push_subscribed: pushSubsCount,
      push_subscribed_rate: safeRate(pushSubsCount, authUsersTotal),
    },
    retention: {
      login_7d: login7d,
      login_30d: login30d,
      wau_mau_ratio: safeRate(login7d, login30d),
      new_users_7d: newUsers7d,
    },
    wix: {
      total_contacts: wixTotalContacts,
    },
    recent_logins: recentLoginsResult.data ?? [],
  })
}
