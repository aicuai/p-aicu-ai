import { createClient, ApiKeyStrategy } from "@wix/sdk"
import { members } from "@wix/members"
import { accounts } from "@wix/loyalty"
import { orders, plans } from "@wix/pricing-plans"
import * as contactsPublic from "@wix/contacts/build/cjs/src/contacts-v4-contact.public"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _wixClient: any = null

function getWixClient() {
  if (!_wixClient) {
    _wixClient = createClient({
      auth: ApiKeyStrategy({
        apiKey: process.env.WIX_API_KEY!,
        siteId: process.env.WIX_SITE_ID!,
      }),
      modules: {
        contacts: contactsPublic,
        members,
        accounts,
        orders,
        plans,
      },
    })
  }
  return _wixClient
}

/** Wix Contact の総数を取得 */
export async function getTotalContactsCount(): Promise<number> {
  const result = await getWixClient().contacts.queryContacts({ paging: { limit: 1 } })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta = (result as any).pagingMetadata
  return meta?.total ?? meta?.count ?? 0
}

/** Wix サイト会員の総数を取得 */
export async function getTotalMembersCount(): Promise<number> {
  const result = await getWixClient().members.queryMembers().limit(1).find()
  return result.totalCount ?? result.items?.length ?? 0
}

/** メールアドレスで Wix Contact を検索 */
export async function getContactByEmail(email: string) {
  // queryContacts の search はメール完全一致検索に対応
  const result = await getWixClient().contacts.queryContacts({
    search: email,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contacts = (result as any).contacts ?? (result as any).items ?? []
  return contacts[0] ?? null
}

/** contactId から Wix Member を取得 */
export async function getMemberByContactId(contactId: string) {
  const result = await getWixClient().members.queryMembers()
    .eq("contactId", contactId)
    .find()
  return result.items?.[0] ?? null
}

// ─── Subscription types ───
export type WixSubscription = {
  planName: string
  status: string
  startDate: string | null
  endDate: string | null
}

/** memberId で現在のアクティブなサブスクリプションを取得 */
export async function getActiveSubscriptions(memberId: string): Promise<WixSubscription[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (getWixClient().orders as any).managementListOrders({
    buyerIds: [memberId],
    orderStatuses: ["ACTIVE"],
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (result.orders || []).map((o: any) => ({
    planName: o.planName ?? "?",
    status: o.status ?? "UNKNOWN",
    startDate: o.startDate ?? null,
    endDate: o.endDate ?? null,
  }))
}

/** memberId でキャンセル・期限切れ含む全サブスクリプション履歴を取得 */
export async function getAllSubscriptions(memberId: string): Promise<WixSubscription[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (getWixClient().orders as any).managementListOrders({
    buyerIds: [memberId],
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (result.orders || []).map((o: any) => ({
    planName: o.planName ?? "?",
    status: o.status ?? "UNKNOWN",
    startDate: o.startDate ?? null,
    endDate: o.endDate ?? null,
  }))
}

/** 管理用: 全サブスクリプションのサマリーを取得 */
export async function getSubscriptionStats() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (getWixClient().orders as any).managementListOrders()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allOrders = (result.orders || []) as any[]

  const byPlanAndStatus: Record<string, Record<string, number>> = {}
  for (const o of allOrders) {
    const plan = o.planName ?? "?"
    const status = o.status ?? "UNKNOWN"
    if (!byPlanAndStatus[plan]) byPlanAndStatus[plan] = {}
    byPlanAndStatus[plan][status] = (byPlanAndStatus[plan][status] || 0) + 1
  }

  return { total: allOrders.length, byPlanAndStatus }
}

/** contactId から Loyalty アカウント（ポイント情報）を取得 */
export async function getLoyaltyByContactId(contactId: string) {
  const result = await getWixClient().accounts.getAccountBySecondaryId({
    contactId,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (result as any).account ?? result ?? null
}
