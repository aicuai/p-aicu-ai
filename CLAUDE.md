# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**p-aicujp** — AICU会員ポータル (Point, Profile, Post) at `p.aicu.jp`

3つのコア機能 (3P):
- **Point** (最優先): AICUポイント残高・履歴 — Wix Loyalty API連携
- **Profile** (Phase 2): Discord OAuth認証、Wix会員紐付け、Stripe決済状態
- **Post** (Phase 3): Discord Bot告知・スケジュール投稿

詳細な開発経緯・CEO判断・設計方針は `docs/DEVELOPMENT_CONTEXT.md` を参照。

## Commands

```bash
npm run dev      # 開発サーバー (localhost:3200)
npm run build    # プロダクションビルド
npm start        # プロダクションサーバー起動
npm run lint     # ESLint (next lint)
```

No test framework is configured yet.

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict mode)
- **Tailwind CSS 3.4** with custom AICU color tokens
- **Supabase Auth** (`@supabase/ssr`) — Email magic link (primary), Discord linkable later
- **@aicujp/ui** — Custom UI component library (Liquid Glass design system)
- **Wix SDK** (@wix/sdk, @wix/members, @wix/loyalty) — API Key auth (not OAuth)
- **Stripe** for payments and webhooks
- **Supabase** for auth + Discord↔Wix user linking
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

### Integration Flow

```
User → Email magic link (Supabase Auth) → Dashboard
  ├── Points: Email → Supabase (Email↔Wix mapping) → Wix Loyalty API
  ├── Purchases: Stripe API → purchase history
  └── Profile: Email user info + Wix member data
```

Supabase acts as a mapping layer (not a monolithic DB). Schema includes `unified_users` and `bonus_points` tables.

### Current Implementation Status

Implemented:
- `src/app/page.tsx` — Login page (email magic link form)
- `src/app/LoginForm.tsx` — Client component for email input + submit
- `src/app/auth/callback/route.ts` — Magic link callback (code exchange + Wix auto-link)
- `src/app/auth/verify-request/page.tsx` — "Check your email" page
- `src/app/auth/error/page.tsx` — Auth error page
- `src/app/dashboard/page.tsx` — Dashboard (points, profile, membership)
- `src/app/dashboard/SignOutButton.tsx` — Client-side logout (Supabase)
- `src/lib/auth.ts` — Supabase Auth server actions
- `src/lib/supabase.ts` — Server + Admin Supabase clients
- `src/lib/supabase-browser.ts` — Browser Supabase client
- `src/lib/wix.ts` — Wix SDK wrapper
- `src/middleware.ts` — Supabase Auth route protection

Not yet implemented:
- `src/lib/stripe.ts` (SDK wrapper)
- `src/app/dashboard/points/`, `src/app/dashboard/purchases/` (sub-pages)
- `src/app/api/points/`, `src/app/api/webhook/` (API routes)
- Discord account linking (from dashboard)
- `discord-bot/` (Phase 3)

## Environment Variables

Copy `.env.example` to `.env.local`. Key variables:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase Auth (client-side)
- `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` — Supabase admin (server-side)
- `NEXT_PUBLIC_SITE_URL` — Magic link redirect base URL
- `WIX_API_KEY` / `WIX_SITE_ID` / `WIX_ACCOUNT_ID` — Wix API Key auth
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET`

## Conventions

- Path alias: `@/*` maps to `./src/*`
- UI language: Japanese (`html lang="ja"`)
- Dark theme: `bg-gray-950` background, white text, gradient body via CSS custom properties
- Tailwind custom colors: `aicu-primary` (#6366f1), `aicu-secondary` (#8b5cf6), `aicu-accent` (#f59e0b), Discord blue (#5865F2)
- Liquid Glass design system: CSS variables from `@aicujp/ui/styles` (`--glass-bg`, `--glass-border`, `--glass-blur`, etc.)
- Server Components by default; `"use client"` only for interactivity (SessionProvider, nav, sign-out)
- `next.config.ts`: `transpilePackages: ["@aicujp/ui"]`, Discord CDN images allowed
- Naming: `-aicujp` suffix / `.jp` domain for Japan-specific services

## Related Repositories

- `japan-corp` — 経営管理 (Issue #124: p.aicu.jp, #116: Wix→Stripe移行)
- `aicu-ai` — メインサービス
- `cert.aicu.ai` — 認証サービス
