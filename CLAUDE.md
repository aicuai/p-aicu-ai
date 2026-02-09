# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**p-aicu-ai** — AICU会員ポータル (Point, Profile, Post) at `p.aicu.jp`

3つのコア機能:
- **Point**: AICUポイント残高・履歴 (Wix Loyalty API)
- **Profile**: Discord OAuth認証、Wix会員紐付け (NextAuth.js + Supabase)
- **Post**: Discord Bot告知・スケジュール投稿

## Commands

```bash
npm run dev      # 開発サーバー (localhost:3000)
npm run build    # プロダクションビルド
npm start        # プロダクションサーバー起動
npm run lint     # ESLint (next lint)
```

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict mode)
- **Tailwind CSS** with custom `aicu-primary`/`aicu-secondary`/`aicu-accent` colors
- **NextAuth.js v5** (Discord Provider)
- **Wix SDK** (@wix/sdk, @wix/members, @wix/loyalty) for point management
- **Stripe** for payments and webhooks
- **Supabase** for Discord↔Wix user linking
- Deployed on **Vercel**

## Architecture

### App Router Structure

```
src/app/
├── page.tsx                    # Landing/Login page
├── layout.tsx                  # Root layout (lang="ja")
├── dashboard/
│   ├── page.tsx                # Main dashboard
│   ├── points/                 # Points history
│   └── purchases/              # Purchase history
└── api/
    ├── auth/[...nextauth]/     # Discord OAuth endpoints
    ├── points/                 # Points API (Wix Loyalty)
    └── webhook/                # Stripe webhook handler
```

### Key Directories

- `src/components/` — Shared React components (LoginButton, PointsCard, PurchaseHistory)
- `src/lib/` — SDK wrappers and config (wix.ts, stripe.ts, auth.ts)
- `discord-bot/` — Discord Bot (future)

### Integration Flow

```
User → Discord OAuth (NextAuth) → Dashboard
  ├── Points: NextAuth session → Supabase (Discord↔Wix mapping) → Wix Loyalty API
  ├── Purchases: Stripe API → purchase history
  └── Profile: Discord user info + Wix member data
```

## Environment Variables

Copy `.env.example` to `.env.local`. Required variables:
- `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` — Discord OAuth
- `NEXTAUTH_SECRET` / `NEXTAUTH_URL` — NextAuth config
- `WIX_CLIENT_ID` / `WIX_API_KEY` — Wix Loyalty API
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — Stripe
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` — User linking (optional)

## Conventions

- Path alias: `@/*` maps to `./src/*`
- UI language: Japanese (html lang="ja")
- Tailwind custom colors: `aicu-primary` (#6366f1), `aicu-secondary` (#8b5cf6), `aicu-accent` (#f59e0b), Discord blue (#5865F2)
- Server Components by default; use `"use client"` only when needed

## Related Repositories

- `japan-corp` — 経営管理 (Issue #124: p.aicu.jp, #116: Wix→Stripe移行)
- `aicu-ai` — メインサービス
- `cert.aicu.ai` — 認証サービス
