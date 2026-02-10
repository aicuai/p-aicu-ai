import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { createServerClient as createSSRServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// ─── 1. ブラウザ用 → src/lib/supabase-browser.ts に分離 ───

// ─── 2. サーバー用 (anon key + cookies, Server Component / Route Handler 用) ───
export async function createServerSupabase() {
  const cookieStore = await cookies()
  return createSSRServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Component からの呼び出しでは set できない場合がある
          }
        },
      },
    },
  )
}

// ─── 3. 管理用 (service key, バックエンド処理用) ───
let _adminSupabase: SupabaseClient | null = null

function getAdminSupabase() {
  if (!_adminSupabase) {
    _adminSupabase = createClient(
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!,
    )
  }
  return _adminSupabase
}

// ─── Types ───
export type UnifiedUser = {
  id: string
  discord_id: string | null
  discord_email: string | null
  discord_username: string | null
  wix_contact_id: string | null
  wix_member_id: string | null
  stripe_customer_id: string | null
  primary_email: string | null
  display_name: string | null
  created_at: string
  updated_at: string
  last_login_at: string | null
}

// ─── User CRUD (admin client) ───

/** メールアドレスで unified_users を UPSERT（なければ作成） */
export async function getOrCreateUserByEmail(
  email: string,
  name: string | null,
) {
  const { data, error } = await getAdminSupabase()
    .from("unified_users")
    .upsert(
      {
        primary_email: email,
        display_name: name,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "primary_email" },
    )
    .select()
    .single()

  if (error) throw error
  return data as UnifiedUser
}

/** Discord ログイン時に unified_users を UPSERT（なければ作成） */
export async function getOrCreateUser(
  discordId: string,
  email: string | null,
  name: string | null,
) {
  const { data, error } = await getAdminSupabase()
    .from("unified_users")
    .upsert(
      {
        discord_id: discordId,
        discord_email: email,
        discord_username: name,
        primary_email: email,
        display_name: name,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "discord_id" },
    )
    .select()
    .single()

  if (error) throw error
  return data as UnifiedUser
}

/** メールアドレスから unified_user を取得 */
export async function getUserByEmail(email: string) {
  const { data, error } = await getAdminSupabase()
    .from("unified_users")
    .select()
    .eq("primary_email", email)
    .single()

  if (error && error.code !== "PGRST116") throw error
  return (data as UnifiedUser) ?? null
}

/** Wix の contactId / memberId をメールアドレスベースで紐付け */
export async function linkWixContactByEmail(
  email: string,
  wixContactId: string,
  wixMemberId: string | null,
) {
  const { data, error } = await getAdminSupabase()
    .from("unified_users")
    .update({
      wix_contact_id: wixContactId,
      wix_member_id: wixMemberId,
      updated_at: new Date().toISOString(),
    })
    .eq("primary_email", email)
    .select()
    .single()

  if (error) throw error
  return data as UnifiedUser
}

/** Wix の contactId / memberId を unified_users に紐付け（Discord ID ベース） */
export async function linkWixContact(
  discordId: string,
  wixContactId: string,
  wixMemberId: string | null,
) {
  const { data, error } = await getAdminSupabase()
    .from("unified_users")
    .update({
      wix_contact_id: wixContactId,
      wix_member_id: wixMemberId,
      updated_at: new Date().toISOString(),
    })
    .eq("discord_id", discordId)
    .select()
    .single()

  if (error) throw error
  return data as UnifiedUser
}

/** Discord ID から unified_user を取得 */
export async function getUserByDiscordId(discordId: string) {
  const { data, error } = await getAdminSupabase()
    .from("unified_users")
    .select()
    .eq("discord_id", discordId)
    .single()

  if (error && error.code !== "PGRST116") throw error
  return (data as UnifiedUser) ?? null
}
