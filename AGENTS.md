# AGENTS.md - p-aicujp

## 概要

**Point, Profile, Post** - AICU会員ポータル & APIバックエンド

- URL: `p.aicu.jp`（Vercel）
- 目的: AICUポイント管理、Discord連携、会員プロフィール、Wix/Stripe API中継

## アーキテクチャ上の役割（2026-02-10 確定）

本プロジェクトは **app-aicujp（aicu.jp）のAPIバックエンド** を兼ねる。

```
┌─────────────────────────────┐     ┌─────────────────────────────┐
│  app-aicujp (フロントエンド)   │     │  p-aicujp (本プロジェクト)     │
│  aicu.jp · Cloudflare Pages  │────▶│  p.aicu.jp · Vercel          │
│                              │     │                              │
│  React SPA (Vite + JSX)     │     │  Next.js 15 (App Router)     │
│  クライアントのみ             │     │  サーバーサイド処理            │
│  Supabase Auth (anon key)   │     │  NextAuth (Discord OAuth)    │
│  UI表示・RSS取得             │     │  Wix SDK (API Key認証)       │
└─────────────────────────────┘     │  Supabase (service key)      │
                                    │  Stripe API                  │
                                    └─────────────────────────────┘
```

### なぜ分離するか

- **Wix SDK** (`@wix/sdk`, `@wix/contacts`, `@wix/members`, `@wix/loyalty`) はサーバーサイド専用。API Key をクライアントに露出できない
- **Stripe Webhook** 受信にサーバーが必須
- **unified_users** テーブル操作には Supabase service key が必要
- app-aicujp は Vite SPA（クライアントのみ）なのでこれらを直接扱えない

### 本プロジェクトが提供するAPI（既存 + 将来）

| エンドポイント | 状態 | 説明 |
|:---|:---|:---|
| `/api/auth/[...nextauth]` | 実装済み | Discord OAuth |
| `/api/link-wix` | 実装済み | Wix 手動連携（superuser） |
| `/api/member/profile` | **将来** | app-aicujp 向け Wix プロフィール取得 |
| `/api/member/points` | **将来** | app-aicujp 向け AICUポイント残高 |
| `/api/webhook/stripe` | 将来 | Stripe Webhook 受信 |

### Wix 連携フロー（本プロジェクトが担当）

1. ログイン時: Discord メールで Wix Contact を自動検索 → `unified_users` に紐付け
2. ダッシュボード表示時: `wix_contact_id` で Loyalty/Member API 呼び出し
3. 手動連携: `/api/link-wix` で superuser がメールで紐付け

## 機能

### Point（ポイント）
- AICUポイント残高表示
- ポイント履歴表示
- Wix Loyalty API連携

### Profile（プロフィール）
- Discord OAuth認証
- Wix会員との紐付け（自動: メール一致 / 手動: superuser）
- 会員情報表示

### Post（投稿）
- Discord Bot 告知投稿
- スケジュール投稿
- コミュニティ管理

## 技術スタック

| 項目 | 技術 |
|:-----|:-----|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| スタイル | Tailwind CSS |
| 認証 | NextAuth.js (Discord Provider) |
| ポイントAPI | Wix Loyalty API |
| 決済API | Stripe API |
| DB | Supabase（紐付けテーブル） |
| ホスティング | Vercel |

## ディレクトリ構成

```
p-aicu-ai/
├── src/
│   ├── app/
│   │   ├── page.tsx              # トップ（ログイン画面）
│   │   ├── dashboard/
│   │   │   ├── page.tsx          # ダッシュボード
│   │   │   ├── points/           # ポイント
│   │   │   └── purchases/        # 購入履歴
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # Discord OAuth
│   │   │   ├── points/           # ポイントAPI
│   │   │   └── webhook/          # Stripe Webhook
│   │   └── layout.tsx
│   ├── components/
│   │   ├── LoginButton.tsx
│   │   ├── PointsCard.tsx
│   │   └── PurchaseHistory.tsx
│   └── lib/
│       ├── wix.ts                # Wix SDK
│       ├── stripe.ts             # Stripe SDK
│       └── auth.ts               # NextAuth設定
├── discord-bot/                  # Discord Bot（将来）
├── AGENTS.md
├── README.md
└── package.json
```

## 環境変数

```env
# Discord OAuth
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://p.aicu.jp

# Wix
WIX_CLIENT_ID=
WIX_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

## 開発コマンド

```bash
# 開発サーバー（localhost:3200）
npm run dev

# ビルド
npm run build

# 本番起動
npm start
```

## 関連リポジトリ

| リポジトリ | 関係 | 備考 |
|:---|:---|:---|
| **app-aicujp** | フロントエンドSPA | aicu.jp (Cloudflare Pages)。本プロジェクトをAPIバックエンドとして利用 |
| **japan-corp** | 経営管理 | Issue #124 で管理 |
| **aicu-ai** | メインサービス | コーポレートサイト |
| **cert.aicu.ai** | 共通UI配信 | Liquid Glass CSS等 |

## Issue

- japan-corp#124 - p.aicu.jp プロジェクト
- japan-corp#116 - Wix→Stripe統合移行
