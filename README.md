# p-aicujp

**Point, Profile, Post** - AICU会員ポータル

https://p.aicu.jp

## 機能

- **Point**: AICUポイント残高 (Wix Loyalty API)
- **Profile**: メール認証、Wix会員紐付け、サブスクリプション表示
- **Admin**: 管理者ダッシュボード (KPI, Wix連携状況, サブスク統計)
- **Post**: コミュニティ告知 (Phase 3)

## セットアップ

```bash
npm install
cp .env.example .env.local  # 環境変数を設定
npm run dev                  # localhost:3200
```

## コマンド

```bash
npm run dev      # 開発サーバー (localhost:3200)
npm run build    # プロダクションビルド
npm start        # プロダクションサーバー
npm run lint     # ESLint
```

## 検証

```bash
node scripts/verify-production.mjs   # 本番データ検証 (15項目)
```

Wixサイト会員数、Supabaseテーブル、GA4タグ、API認証などを自動チェック。
`.env.local` の認証情報を使用（ローカル実行のみ）。

## テックスタック

| 項目 | 技術 |
|:-----|:-----|
| フレームワーク | Next.js 15 (App Router) + React 19 + TypeScript |
| スタイル | Tailwind CSS 3.4 + AICU カスタムトークン |
| 認証 | Supabase Auth (メールマジックリンク) |
| ポイント | Wix Loyalty API (@wix/loyalty) |
| サブスクリプション | Wix Pricing Plans API (@wix/pricing-plans) |
| ユーザー管理 | Supabase (unified_users テーブル) |
| アナリティクス | GA4 (G-9Z2S3ZBGEV) |
| 通知 | Web Push (VAPID) + Slack Webhook |
| ホスティング | Vercel |

## 環境変数

`.env.example` を参照。主要な変数:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase Auth
- `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` — Supabase Admin
- `WIX_API_KEY` / `WIX_SITE_ID` — Wix API
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — GA4
- `SLACK_WEBHOOK_URL` — Slack 通知

## 管理者

スーパーユーザー (`src/lib/constants.ts`):
- `aki@aicu.ai`
- `japan-wix@aicu.ai`
- `shirai@mail.com`

管理者ダッシュボード: https://p.aicu.jp/dashboard/admin

## ドキュメント

- `CLAUDE.md` — Claude Code 向けガイド
- `AGENTS.md` — アーキテクチャ・API仕様
- `docs/site-completion-status.md` — 完成度・KPI定義・ロードマップ

## ライセンス

Private - AICU Japan Inc.
