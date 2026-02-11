# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**p-aicujp** — AICU会員ポータル (Point, Profile, Post) at `p.aicu.jp`

3つのコア機能 (3P):
- **Point** (実装済み): AICUポイント残高 — Wix Loyalty API連携
- **Profile** (実装済み): メール認証、Wix会員紐付け、サブスクリプション表示
- **Admin** (実装済み): 管理者ダッシュボード（KPI、Wix連携状況、サブスク統計）
- **Post** (Phase 3): コミュニティ告知（未実装）

詳細は `AGENTS.md` と `docs/site-completion-status.md` を参照。

## Commands

```bash
npm run dev      # 開発サーバー (localhost:3200)
npm run build    # プロダクションビルド
npm start        # プロダクションサーバー起動
npm run lint     # ESLint (next lint)
```

### Production Verification

```bash
node scripts/verify-production.mjs   # 本番データ検証 (15項目)
```

Wix会員数、Supabaseテーブル、GA4タグ、API認証を自動チェック。`.env.local` の認証情報を使用。

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict mode)
- **Tailwind CSS 3.4** with custom AICU color tokens
- **Supabase Auth** (`@supabase/ssr`) — Email magic link (OTP)
- **Wix SDK** (@wix/sdk, @wix/members, @wix/loyalty, @wix/pricing-plans) — API Key auth
- **Supabase** for auth + user data (unified_users, profiles, push_subscriptions)
- **GA4** (G-9Z2S3ZBGEV) — gtag.js via GoogleAnalytics component
- **Web Push** (VAPID) + **Slack Webhook** for notifications
- Deployed on **Vercel**

## Architecture

### Auth Flow

```
Supabase Auth middleware (src/middleware.ts) protects /dashboard/* only
  → Unauthenticated users redirected to / (login page)
  → Email magic link via Supabase Auth signInWithOtp()
  → /auth/verify-request — "メールを確認してください" page
  → /auth/callback — exchanges code for session, auto-links Wix by email
  → Session available server-side via getUser() from src/lib/auth.ts
```

Supabase client split:
- `src/lib/supabase-browser.ts` — Browser client (anon key, client components)
- `src/lib/supabase.ts` — Server client (anon key + cookies) + Admin client (service key)
- `src/lib/auth.ts` — Server actions: getUser(), signInWithEmail(), signOut()

Magic link redirect is dynamic based on request `origin` header (supports both p.aicu.jp and aicu.jp).

### Integration Flow

```
User → Email magic link (Supabase Auth) → Dashboard
  ├── Points: unified_users.wix_contact_id → Wix Loyalty API
  ├── Subscriptions: Wix Pricing Plans API → active/historical plans
  ├── Profile: Wix Member data (name, company, nickname)
  └── Admin: Supabase queries + Wix API → KPI dashboard
```

### Key Files

| File | Purpose |
|:-----|:--------|
| `src/lib/auth.ts` | Supabase Auth server actions |
| `src/lib/supabase.ts` | Server + Admin Supabase clients |
| `src/lib/supabase-browser.ts` | Browser Supabase client |
| `src/lib/wix.ts` | Wix SDK wrapper (contacts, members, loyalty, subscriptions) |
| `src/lib/constants.ts` | Superuser emails (centralized) |
| `src/lib/slack.ts` | Slack Webhook integration |
| `src/lib/push.ts` | Web Push (VAPID) |
| `src/app/dashboard/page.tsx` | User dashboard (points, profile, subscriptions) |
| `src/app/dashboard/admin/page.tsx` | Admin dashboard (KPI, Wix stats, recent logins) |
| `src/components/GoogleAnalytics.tsx` | GA4 gtag.js client component |

## Wix SDK Notes

These patterns are critical when working with Wix APIs:

- `@wix/contacts` has empty index — import from `@wix/contacts/build/cjs/src/contacts-v4-contact.public`
- `@wix/members`: `client.members.queryMembers()` (NOT `.members.members`)
- `@wix/loyalty`: `client.accounts.getAccountBySecondaryId({contactId})`
- `queryMembers()` is a builder: `.eq("contactId", id).find()` → `.items`
- `queryContacts()` response uses `.contacts` array (not `.items`)
- Contacts API pagination (offset/cursor) is broken with API Key auth — always returns same 50 records
- `pagingMetadata.total` is the correct total count field (NOT `totalResults`)

## Environment Variables

Copy `.env.example` to `.env.local`. Key variables:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase Auth (client-side)
- `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` — Supabase admin (server-side)
- `NEXT_PUBLIC_SITE_URL` — Magic link redirect base URL (fallback)
- `WIX_API_KEY` / `WIX_SITE_ID` — Wix API Key auth
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — GA4 (G-9Z2S3ZBGEV)
- `SLACK_WEBHOOK_URL` — Slack notifications
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — Web Push

## Conventions

- Path alias: `@/*` maps to `./src/*`
- UI language: Japanese (`html lang="ja"`)
- Light theme: AICU design system with CSS custom properties (`--aicu-teal`, `--text-primary`, etc.)
- Server Components by default; `"use client"` only for interactivity
- Superuser emails centralized in `src/lib/constants.ts`
- `next.config.ts`: `transpilePackages: ["@aicujp/ui"]`

## Superusers

Defined in `src/lib/constants.ts`:
- `aki@aicu.ai`
- `japan-wix@aicu.ai`
- `shirai@mail.com`

Admin dashboard: https://p.aicu.jp/dashboard/admin

## Related Repositories

- `japan-corp` — 経営管理 (Issue #124: p.aicu.jp, #116: Wix→Stripe移行)
- `app-aicujp` — フロントエンドSPA (aicu.jp, Cloudflare Pages)
- `aicu-ai` — メインサービス
