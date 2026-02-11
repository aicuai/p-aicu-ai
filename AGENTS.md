# AGENTS.md - p-aicujp

## 概要

**Poll, Point, Profile, Post** — AICU データ管理 & APIバックエンド

- URL: `p.aicu.jp`（Vercel）
- 目的: **アンケート入力・回答管理（Poll）**、AICUポイント管理、個人情報管理、Wix会員連携、管理者ダッシュボード

## 3サイト アーキテクチャにおける位置づけ（2026-02-11 確定）

```
aicu.jp (app-aicujp)             p.aicu.jp (本プロジェクト)        u.aicu.jp (u-aicujp)
┌──────────────────────┐      ┌──────────────────────┐       ┌──────────────────────┐
│ モバイルポータル        │      │ Poll・データ管理       │       │ パーソナル・ポートフォリオ│
│ スマホ最適化           │      │ アンケート入力UI       │       │ PC最適化              │
│ 新規ユーザー獲得       │─POST→│ survey_responses     │←GET──│ 調査結果ビジュアライズ   │
│ ブランディング中枢     │      │ 個人情報管理          │       │ データ販売/マッチング    │
│ React SPA (Vite)      │←JSON─│ 報酬/ポイントAPI      │       │ CreatorViz (Recharts)  │
│ CF Pages              │      │ Wix同期・設定ページ    │       │ Next.js 16 + TS        │
└──────────────────────┘      │ Slack通知            │       │ Vercel                 │
                               │ Next.js (App Router)  │       └──────────────────────┘
                               │ Vercel                │
                               └──────────────────────┘
                                        │
                               Supabase (共有: auyqabzjljmcefymxwgn)
```

### p.aicu.jp の役割（拡張）

| 機能カテゴリ | 内容 | 状態 |
|:---|:---|:---|
| **Poll** | アンケート入力 UI、survey_responses 保存、Google Form 二重送信 | app-aicujp から移行予定 |
| **Point** | AICUポイント残高表示（Wix Loyalty API）、報酬付与 | 実装済み / API 拡張予定 |
| **Profile** | プロフィール管理、Wix 同期設定ページ | Phase B 設計済み |
| **Post** | コミュニティ告知 | Phase 3（未実装） |
| **Data** | CSV/JSON エクスポート、結果集計 API | 予定 |

### なぜ分離するか

- **Wix SDK** (`@wix/sdk`, `@wix/contacts`, `@wix/members`, `@wix/loyalty`, `@wix/pricing-plans`) はサーバーサイド専用。API Key をクライアントに露出できない
- **unified_users** テーブル操作には Supabase service key が必要
- app-aicujp は Vite SPA（クライアントのみ）なのでこれらを直接扱えない
- ユーザーに **Wix の存在を見せない**。Wix はバックエンド同期のみ

### Wix → Supabase 移行方針

Wix は段階的に Supabase へ移行する。当面は「Wix-primary, Supabase override」方式:

1. **表示優先度**: Supabase profiles → Wix Member → フォールバック
2. **Phase A（現在）**: 「設定」リンクのみ追加。settings ページは次タスク
3. **Phase B（次回）**: `/dashboard/settings` ページ作成
   - Wix の値をプレースホルダーとして表示
   - ユーザーが編集 → Supabase profiles テーブルに保存
   - `/api/profile/update` を拡張して DOB 以外のフィールドも対応
4. **Phase C**: ダッシュボードの displayName 計算を変更
   - 現在: `wixProfile?.nickname ?? wixProfile?.firstName ?? ...`
   - 変更後: `supabaseProfile?.display_name ?? wixProfile?.nickname ?? ...`

### 新規 API エンドポイント（予定）

| エンドポイント | メソッド | 用途 | 優先度 |
|:---|:---|:---|:---|
| `/api/surveys/:id/results` | GET | アンケート集計結果（JSON） | 高 |
| `/api/surveys/:id/export` | GET | CSV/JSON エクスポート | 高 |
| `/api/rewards/grant` | POST | ポイント報酬付与 | 中 |
| `/api/member/profile` | GET | Wix+Supabase 統合プロフィール | 中 |
| `/api/member/points` | GET | AICUポイント残高 | 中 |

## 認証フロー

```
ユーザー → メールアドレス入力 → Supabase signInWithOtp()
  → /auth/verify-request（メール確認ページ）
  → ユーザーがメールリンクをクリック
  → /auth/callback（セッション確立 + Wix 自動連携）
  → /dashboard
```

- `src/middleware.ts` が `/dashboard/*` を保護（未認証 → `/` にリダイレクト）
- Magic link のリダイレクト先はリクエストの `origin` ヘッダーから動的に決定
- Supabase の Redirect URLs に `https://p.aicu.jp/**` を設定済み

## API エンドポイント

| エンドポイント | 状態 | 説明 |
|:---|:---|:---|
| `/api/admin/stats` | 実装済み | 管理者 KPI API（スーパーユーザーのみ） |
| `/api/link-wix` | 実装済み | Wix 手動連携（スーパーユーザー） |
| `/api/profile/update` | 実装済み | プロフィール更新（生年月日等） |
| `/api/push/subscribe` | 実装済み | Web Push 購読登録 |
| `/api/push/unsubscribe` | 実装済み | Web Push 購読解除 |
| `/api/push/send` | 実装済み | Push 通知送信（スーパーユーザー） |
| `/api/cron/db-backup` | 実装済み | DB バックアップ（Vercel Cron） |
| `/api/surveys/dcaj` | 実装済み | アンケート API |

## Wix 連携

### データモデル

- **Wix Contacts** (516人): 全連絡先（会員 + ゲスト購入 + フォーム送信等）
- **Wix Members** (452人): サイト会員のみ
- 差分64人 = ゲスト購入、WIX_FORMS、WIX_APP、空レコード等

### 連携フロー

1. ログイン時: メールで Wix Contact を自動検索 → `unified_users.wix_contact_id` に紐付け
2. ダッシュボード表示時: `wix_contact_id` で Loyalty/Member/Subscription API 呼び出し
3. 手動連携: `/api/link-wix` でスーパーユーザーがメールで紐付け

### Wix SDK パターン（注意事項）

- `@wix/contacts` の index は空 → `@wix/contacts/build/cjs/src/contacts-v4-contact.public` からインポート
- `@wix/members`: `client.members.queryMembers()` （`.members.members` ではない）
- `@wix/loyalty`: `client.accounts.getAccountBySecondaryId({contactId})`
- `queryMembers()` はビルダーパターン → `.eq("contactId", id).find()` → `.items`
- `queryContacts()` のレスポンスは `.contacts` 配列（`.items` ではない）
- Contacts API のページネーション（offset/cursor）は API Key 認証で機能しない（常に同じ50件を返す）

### サブスクリプション（Wix Pricing Plans）

4つのプラン:
- **Free** (¥0/月)
- **Basic** (¥900/月)
- **Lab+** (¥3,500/月)
- **レンタルAI PC** (¥13,500/月)

`orders.managementListOrders()` で取得。ユーザーにはアクティブプランのみ表示、管理者には全履歴表示。

## 機能一覧

### Point（ポイント）— 実装済み
- AICUポイント残高表示（Wix Loyalty API）
- Wix 会員自動連携（メール一致）

### Profile（プロフィール）— 実装済み
- メールマジックリンク認証（Supabase Auth）
- Wix 会員データ表示（名前、会社、ニックネーム）
- サブスクリプション表示（アクティブプラン）
- Discord 連携状態表示

### Admin（管理者ダッシュボード）— 実装済み
- KPI サマリー: 総ユーザー、Wix紐付け率、7日アクティブ、Push購読率
- 継続率: WAU、MAU、WAU/MAU、新規ユーザー、プロフィール完了率
- Wix 連携状況: 会員数 vs 連絡先数 vs アプリ登録者（差分説明付き）
- サブスクリプション統計: プラン別 ACTIVE/CANCELED 集計
- 最近のログイン一覧

### 通知 — 実装済み
- Web Push 通知（VAPID）
- Slack Webhook 通知（生年月日変更等）

### Post（投稿）— Phase 3（未実装）
- コミュニティ告知

## 技術スタック

| 項目 | 技術 |
|:-----|:-----|
| フレームワーク | Next.js 15 (App Router) + React 19 + TypeScript |
| スタイル | Tailwind CSS 3.4 + AICU カスタムトークン |
| 認証 | Supabase Auth (メールマジックリンク) |
| ポイント | Wix Loyalty API (@wix/loyalty) |
| サブスクリプション | Wix Pricing Plans API (@wix/pricing-plans) |
| ユーザー管理 | Supabase (unified_users + profiles テーブル) |
| アナリティクス | GA4 (G-9Z2S3ZBGEV) |
| 通知 | Web Push (VAPID) + Slack Webhook |
| ホスティング | Vercel |

## ディレクトリ構成

```
p-aicujp/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # トップ（ログイン画面）
│   │   ├── LoginForm.tsx               # メール入力フォーム
│   │   ├── layout.tsx                  # ルートレイアウト + GA4
│   │   ├── auth/
│   │   │   ├── callback/route.ts       # Magic link コールバック
│   │   │   ├── verify-request/page.tsx # メール確認ページ
│   │   │   └── error/page.tsx          # 認証エラーページ
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # ユーザーダッシュボード
│   │   │   ├── admin/page.tsx          # 管理者ダッシュボード
│   │   │   ├── SignOutButton.tsx        # ログアウトボタン
│   │   │   └── LinkWixForm.tsx         # Wix 手動連携フォーム
│   │   └── api/
│   │       ├── admin/stats/route.ts    # KPI API
│   │       ├── link-wix/route.ts       # Wix 手動連携
│   │       ├── profile/update/route.ts # プロフィール更新
│   │       ├── push/                   # Web Push API
│   │       ├── cron/db-backup/route.ts # DB バックアップ
│   │       └── surveys/dcaj/route.ts   # アンケート
│   ├── components/
│   │   ├── GoogleAnalytics.tsx         # GA4 gtag.js
│   │   └── Providers.tsx               # コンテキストプロバイダー
│   └── lib/
│       ├── auth.ts                     # Supabase Auth サーバーアクション
│       ├── supabase.ts                 # Server + Admin Supabase クライアント
│       ├── supabase-browser.ts         # Browser Supabase クライアント
│       ├── wix.ts                      # Wix SDK ラッパー
│       ├── slack.ts                    # Slack Webhook
│       ├── push.ts                     # Web Push
│       └── constants.ts                # スーパーユーザー定義等
├── scripts/
│   └── verify-production.mjs           # 本番データ検証 (15項目)
├── docs/
│   ├── site-completion-status.md       # 完成度・KPI定義・ロードマップ
│   ├── DEVELOPMENT_CONTEXT.md          # 開発経緯・設計方針
│   ├── slack-notification-and-db-backup.md
│   └── wix-user-migration-notice.md
├── supabase/migrations/                # Supabase マイグレーション
├── vercel.json                         # Vercel Cron 設定
├── AGENTS.md
├── CLAUDE.md
└── README.md
```

## 環境変数

```env
# Supabase Auth (クライアントサイド)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase Admin (サーバーサイド)
SUPABASE_URL=
SUPABASE_SERVICE_KEY=

# Wix API
WIX_API_KEY=
WIX_SITE_ID=

# GA4
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-9Z2S3ZBGEV

# Slack
SLACK_WEBHOOK_URL=

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# サイトURL
NEXT_PUBLIC_SITE_URL=https://p.aicu.jp
```

## スーパーユーザー

`src/lib/constants.ts` で一元管理:
- `aki@aicu.ai`
- `japan-wix@aicu.ai`
- `shirai@mail.com`

## 検証

```bash
node scripts/verify-production.mjs   # 本番データ検証 (15項目)
```

Wix 会員数、Supabase テーブル、GA4タグ、API認証などを自動チェック。

## 関連リポジトリ

| リポジトリ | 役割 | URL | 備考 |
|:---|:---|:---|:---|
| **app-aicujp** | モバイルポータル | aicu.jp (CF Pages) | スマホ最適化、新規ユーザー獲得、ブランディング中枢 |
| **u-aicujp** | パーソナル・ポートフォリオ | u.aicu.jp (Vercel) | 調査結果可視化、データ販売、PC向け。Neon→Supabase 移行中 |
| **japan-corp** | 経営管理 | — | Issue #124 で管理 |
| **aicu-ai** | コーポレートサイト | aicu.ai | — |

## GitHub Issues

- p-aicujp#6 — フッター法的リンク（プライバシーポリシー、利用規約、法的免責事項）
- p-aicujp#8 — メールニュースレター配信（Resend 検討中）
- japan-corp#124 — p.aicu.jp プロジェクト
- japan-corp#116 — Wix→Stripe統合移行
