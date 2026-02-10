# p.aicu.jp サイト完成度・分析ドキュメント

最終更新: 2026-02-11

## 実装済み機能

| 機能 | ステータス | ファイル |
|------|-----------|---------|
| メールマジックリンク認証 (Supabase Auth) | 完了 | `src/lib/auth.ts`, `src/app/page.tsx` |
| 認証コールバック + Wix 自動紐付け | 完了 | `src/app/auth/callback/route.ts` |
| ダッシュボード (ポイント・プロフィール表示) | 完了 | `src/app/dashboard/page.tsx` |
| Wix Loyalty ポイント表示 | 完了 | `src/lib/wix.ts` |
| Wix 手動メール連携 (スーパーユーザー) | 完了 | `src/app/api/link-wix/route.ts` |
| unified_users テーブル (Email↔Wix↔Discord マッピング) | 完了 | `supabase/migrations/001, 003` |
| profiles テーブル (生年月日・職業) | 完了 | `supabase/migrations/004` |
| プロフィール更新 API | 完了 | `src/app/api/profile/update/route.ts` |
| Web Push 通知 (VAPID) | 完了 | `src/app/api/push/` |
| 生年月日変更 Slack 通知 | 完了 | `src/lib/slack.ts` |
| スーパーユーザー定数統一 | 完了 | `src/lib/constants.ts` |
| GA4 (gtag.js) 埋め込み | 完了 | `src/components/GoogleAnalytics.tsx` |
| 管理者ダッシュボード (KPI) | 完了 | `src/app/dashboard/admin/page.tsx` |
| 管理者 KPI API | 完了 | `src/app/api/admin/stats/route.ts` |
| Supabase ミドルウェア認証保護 | 完了 | `src/middleware.ts` |
| AICU デザインシステム (ライトテーマ) | 完了 | `src/app/globals.css` |

## 未実装機能

| 機能 | Phase | 優先度 | 備考 |
|------|-------|--------|------|
| Stripe 決済連携 | 2 | 高 | `src/lib/stripe.ts` 未作成 |
| 購入履歴表示 | 2 | 高 | `/dashboard/purchases` |
| ポイント詳細・履歴ページ | 2 | 中 | `/dashboard/points` |
| Discord アカウントリンク (ダッシュボードから) | 2 | 中 | Discord OAuth ボタン |
| Webhook (Stripe / Wix イベント) | 2 | 中 | `/api/webhook/` |
| ボーナスポイント付与 | 2 | 低 | `bonus_points` テーブル |
| Discord Bot (告知・スケジュール投稿) | 3 | — | `discord-bot/` ディレクトリ |
| 管理者 — ユーザー個別詳細 | 3 | 低 | 管理UIの拡張 |

## KPI 定義と計算式

管理者ダッシュボード (`/dashboard/admin`) および API (`/api/admin/stats`) で使用。

| KPI | 計算式 | データソース |
|-----|--------|-------------|
| 総ユーザー数 | `COUNT(unified_users)` | `unified_users` |
| Wix 紐付け率 | `wix_contact_id IS NOT NULL / total * 100` | `unified_users` |
| Discord 連携率 | `discord_id IS NOT NULL / total * 100` | `unified_users` |
| プロフィール完了率 | `COUNT(profiles) / COUNT(auth.users) * 100` | `profiles`, `auth.users` |
| Push 通知購読率 | `COUNT(push_subscriptions) / COUNT(auth.users) * 100` | `push_subscriptions`, `auth.users` |
| WAU (7日アクティブ) | `last_login_at >= NOW() - 7 days` | `unified_users` |
| MAU (30日アクティブ) | `last_login_at >= NOW() - 30 days` | `unified_users` |
| WAU/MAU ratio | `WAU / MAU * 100` | 計算値 |
| 新規ユーザー (7日) | `created_at >= NOW() - 7 days` | `unified_users` |
| Wix 全会員数 | `queryContacts totalResults` | Wix API |

## GA4 設定手順

1. [Google Analytics](https://analytics.google.com) で既存プロパティ「AICUjp」を開く
2. 管理 → データストリーム → ウェブストリームを追加（または既存を使用）
   - ストリーム URL: `https://p.aicu.jp`
   - 測定 ID: `G-9Z2S3ZBGEV`（現在のストリーム）
3. Vercel で環境変数を設定:
   ```
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-9Z2S3ZBGEV
   ```
4. デプロイ後、GA4 リアルタイムレポートで動作確認

### 注意事項
- `NEXT_PUBLIC_` プレフィックスが必須（クライアントサイドで読み取るため）
- 測定 ID が未設定の場合、`<GoogleAnalytics />` コンポーネントは何もレンダリングしない

## Vercel 環境変数チェックリスト

| 変数名 | 必須 | 用途 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 必須 | Supabase Auth (クライアント) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 必須 | Supabase Auth (クライアント) |
| `SUPABASE_URL` | 必須 | Supabase Admin (サーバー) |
| `SUPABASE_SERVICE_KEY` | 必須 | Supabase Admin (サーバー) |
| `NEXT_PUBLIC_SITE_URL` | 必須 | マジックリンクリダイレクト先 (`https://p.aicu.jp`) |
| `WIX_API_KEY` | 必須 | Wix API 認証 |
| `WIX_SITE_ID` | 必須 | Wix サイト ID |
| `WIX_ACCOUNT_ID` | 推奨 | Wix アカウント ID |
| `STRIPE_SECRET_KEY` | Phase 2 | Stripe 決済 |
| `STRIPE_PUBLISHABLE_KEY` | Phase 2 | Stripe クライアント |
| `STRIPE_WEBHOOK_SECRET` | Phase 2 | Stripe Webhook 検証 |
| `SLACK_WEBHOOK_URL` | 推奨 | Slack 通知 |
| `CRON_SECRET` | 推奨 | Vercel Cron 認証 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 推奨 | GA4 トラッキング |

## ロードマップ

### Phase 1: Point + 基本 Profile（現在 — 概ね完了）
- [x] メール認証
- [x] Wix ポイント表示
- [x] プロフィール基本情報
- [x] Push 通知
- [x] GA4 トラッキング
- [x] 管理者ダッシュボード (KPI)
- [ ] ストリーム URL を `p.aicu.jp` に更新（GA4）

### Phase 2: Profile 強化 + Stripe
- [ ] Stripe 決済連携
- [ ] 購入履歴表示
- [ ] ポイント詳細・履歴ページ
- [ ] Discord アカウントリンク
- [ ] ボーナスポイント管理

### Phase 3: Post (Discord Bot)
- [ ] Discord Bot 基盤
- [ ] 告知・スケジュール投稿
- [ ] 管理者 — ユーザー個別詳細
