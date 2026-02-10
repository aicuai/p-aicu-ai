import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { notifySlack } from "@/lib/slack"

import { createClient as createWixClient, ApiKeyStrategy } from "@wix/sdk"
import { members } from "@wix/members"
import { accounts } from "@wix/loyalty"
import * as contactsPublic from "@wix/contacts/build/cjs/src/contacts-v4-contact.public"

function getBackupWixClient() {
  return createWixClient({
    auth: ApiKeyStrategy({
      apiKey: process.env.WIX_API_KEY!,
      siteId: process.env.WIX_SITE_ID!,
    }),
    modules: {
      contacts: contactsPublic,
      members,
      accounts,
    },
  })
}

/** queryContacts を全件取得（デフォルト50件 → max 1000件ずつページネーション） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAllWixContacts(wixClient: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allContacts: any[] = []
  const PAGE_SIZE = 1000
  let offset = 0

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await wixClient.contacts.queryContacts({
      query: { paging: { limit: PAGE_SIZE, offset } },
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contacts = (result as any).contacts ?? (result as any).items ?? []
    allContacts.push(...contacts)

    if (contacts.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }
  return allContacts
}

/** queryMembers を全件取得（デフォルト100件ずつページネーション） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAllWixMembers(wixClient: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allMembers: any[] = []
  let result = await wixClient.members.queryMembers().limit(100).find()
  allMembers.push(...(result.items ?? []))

  while (result.hasNext()) {
    result = await result.next()
    allMembers.push(...(result.items ?? []))
  }
  return allMembers
}

export async function GET(request: NextRequest) {
  // Vercel Cron Secret 認証
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Supabase admin client
    const supabase = createClient(
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    )

    // 3テーブル取得
    const [unifiedUsers, pushSubscriptions, profiles] = await Promise.all([
      supabase.from("unified_users").select("*"),
      supabase.from("push_subscriptions").select("*"),
      supabase.from("profiles").select("*"),
    ])

    if (unifiedUsers.error) throw unifiedUsers.error
    if (pushSubscriptions.error) throw pushSubscriptions.error
    if (profiles.error) throw profiles.error

    // Wix データ取得（全件ページネーション）
    const wixClient = getBackupWixClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wixContacts: any[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wixMembers: any[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let wixLoyaltyAccounts: any[] = []

    try {
      wixContacts = await fetchAllWixContacts(wixClient)
    } catch (e) {
      console.error("[db-backup] Wix contacts error:", e)
    }

    try {
      wixMembers = await fetchAllWixMembers(wixClient)
    } catch (e) {
      console.error("[db-backup] Wix members error:", e)
    }

    // Loyalty アカウント: 各 contact の contactId で取得
    try {
      const loyaltyPromises = wixContacts
        .filter((c: { _id?: string }) => c._id)
        .map(async (c: { _id: string }) => {
          try {
            const result = await wixClient.accounts.getAccountBySecondaryId({
              contactId: c._id,
            })
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (result as any).account ?? result ?? null
          } catch {
            return null
          }
        })
      const results = await Promise.all(loyaltyPromises)
      wixLoyaltyAccounts = results.filter(Boolean)
    } catch (e) {
      console.error("[db-backup] Wix loyalty error:", e)
    }

    const backup = {
      timestamp: new Date().toISOString(),
      supabase: {
        unified_users: unifiedUsers.data,
        push_subscriptions: pushSubscriptions.data,
        profiles: profiles.data,
      },
      wix: {
        contacts: wixContacts,
        members: wixMembers,
        loyalty_accounts: wixLoyaltyAccounts,
      },
    }

    // Slack にサマリー通知
    const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })
    await notifySlack(
      [
        "📦 DB バックアップ完了",
        `unified_users: ${unifiedUsers.data.length}件`,
        `push_subscriptions: ${pushSubscriptions.data.length}件`,
        `profiles: ${profiles.data.length}件`,
        `wix_contacts: ${wixContacts.length}件`,
        `wix_members: ${wixMembers.length}件`,
        `wix_loyalty: ${wixLoyaltyAccounts.length}件`,
        `Time: ${now}`,
      ].join("\n"),
    )

    return NextResponse.json(backup)
  } catch (error) {
    console.error("[db-backup] error:", error)
    await notifySlack(
      `❌ DB バックアップ失敗\nError: ${error instanceof Error ? error.message : String(error)}`,
    )
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
