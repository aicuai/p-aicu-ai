import { createClient, ApiKeyStrategy } from "@wix/sdk"
import { members } from "@wix/members"
import { accounts } from "@wix/loyalty"
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

/** contactId から Loyalty アカウント（ポイント情報）を取得 */
export async function getLoyaltyByContactId(contactId: string) {
  const result = await getWixClient().accounts.getAccountBySecondaryId({
    contactId,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (result as any).account ?? result ?? null
}
