# Slack 通知 + DB バックアップ

Issue #5 で追加された運用機能のドキュメント。

## 概要

3つの運用機能:

1. **ログイン時 Slack 通知** — 誰がいつログインしたか Slack で把握
2. **DOB 変更時 Slack 通知** — 生年月日が変更されたら即座に通知（不正防止）
3. **DB バックアップ API** — Supabase 全テーブル + Wix 全データを JSON エクスポート（毎日自動実行）

---

## ファイル構成

```
src/
├── lib/
│   └── slack.ts                          ← Slack 通知ヘルパー（共通）
├── app/
│   ├── auth/
│   │   └── callback/route.ts             ← ログイン時 Slack 通知を追加
│   └── api/
│       ├── profile/update/route.ts       ← DOB 変更通知を notifySlack() に統一
│       └── cron/
│           └── db-backup/route.ts        ← DB バックアップ API（新規）
vercel.json                               ← Vercel Cron Job 設定（新規）
.env.example                              ← SLACK_WEBHOOK_URL, CRON_SECRET 追加
```

---

## 1. Slack 通知ヘルパー

**ファイル:** `src/lib/slack.ts`

```typescript
import { notifySlack } from "@/lib/slack"

await notifySlack("通知メッセージ")
```

- `SLACK_WEBHOOK_URL` が未設定の場合、何もせずに return（エラーにならない）
- 送信失敗時は `console.error` のみ（アプリのメイン処理をブロックしない）
- 全 Slack 通知はこの関数を経由する

### 環境変数

| 変数名 | 用途 | 設定場所 |
|--------|------|----------|
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL | `.env.local` + Vercel |
| `CRON_SECRET` | Vercel Cron 認証トークン | Vercel（自動生成） |

---

## 2. ログイン時 Slack 通知

**ファイル:** `src/app/auth/callback/route.ts`

ユーザーがメールマジックリンクでログインすると、以下の通知が Slack に送信される:

```
✅ ログイン: user@example.com
Provider: email
Time: 2026/2/11 12:30:00
Wix: 連携済み
```

- `exchangeCodeForSession` 成功 → Wix auto-link 処理 → **Slack 通知**の順
- Wix 連携状態（連携済み / 未連携）も通知に含まれる

---

## 3. DOB 変更 Slack 通知

**ファイル:** `src/app/api/profile/update/route.ts`

生年月日が変更された場合に通知:

```
⚠️ DOB変更検知
User: <user-id>
旧: 1990-01-01
新: 1995-06-15
```

- 以前は直接 `fetch(SLACK_WEBHOOK_URL)` していたが、`notifySlack()` ヘルパーに統一

---

## 4. DB バックアップ API

**ファイル:** `src/app/api/cron/db-backup/route.ts`

### エンドポイント

```
GET /api/cron/db-backup
Authorization: Bearer <CRON_SECRET>
```

### バックアップ対象

**Supabase テーブル（全件取得）:**

| テーブル | 内容 |
|---------|------|
| `unified_users` | メール ↔ Discord ↔ Wix ↔ Stripe のマッピング |
| `push_subscriptions` | Web Push 通知の購読情報 |
| `profiles` | ユーザープロフィール（DOB 等） |

**Wix データ（全件ページネーション取得）:**

| データ | 取得方法 | ページサイズ |
|--------|----------|------------|
| Contacts | `queryContacts()` offset ページネーション | 1000件/ページ（最大） |
| Members | `queryMembers().find()` + `hasNext()`/`next()` | 100件/ページ |
| Loyalty Accounts | 各 Contact の `contactId` で `getAccountBySecondaryId()` | 1件ずつ |

### Wix ページネーションの詳細

Wix SDK のデフォルトページサイズは小さいため、全件取得にはページネーションが必要:

- **Contacts**: デフォルト 50件、最大 1000件/ページ → `offset` で繰り返し取得
- **Members**: デフォルト 100件/ページ → `hasNext()` + `next()` イテレーターで全件取得
- **Loyalty**: Contact 一覧から `contactId` を取り出し、個別に取得（`Promise.all` で並列実行）

例: 452人の会員 → Contacts は 1回（1000件以内）、Members は 5ページ（100件 × 5）で全件取得。

### レスポンス形式

```json
{
  "timestamp": "2026-02-11T18:00:00.000Z",
  "supabase": {
    "unified_users": [...],
    "push_subscriptions": [...],
    "profiles": [...]
  },
  "wix": {
    "contacts": [...],
    "members": [...],
    "loyalty_accounts": [...]
  }
}
```

### Slack 通知

バックアップ完了時:

```
📦 DB バックアップ完了
unified_users: 42件
push_subscriptions: 15件
profiles: 38件
wix_contacts: 452件
wix_members: 452件
wix_loyalty: 320件
Time: 2026/2/11 3:00:00
```

バックアップ失敗時:

```
❌ DB バックアップ失敗
Error: エラーメッセージ
```

### 認証

- `CRON_SECRET` 環境変数が設定されている場合、`Authorization: Bearer <CRON_SECRET>` ヘッダーが必要
- Vercel Cron は `vercel.json` に crons を追加するとこのヘッダーを自動付与
- `CRON_SECRET` が未設定の場合は認証スキップ（ローカル開発用）

---

## 5. Vercel Cron 設定

**ファイル:** `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/db-backup",
      "schedule": "0 18 * * *"
    }
  ]
}
```

- `0 18 * * *` = 毎日 18:00 UTC = **03:00 JST**
- Vercel Pro プラン以上で利用可能（Hobby は 1日1回まで）

---

## ローカルテスト

### ログイン通知テスト

```bash
npm run dev
# ブラウザで localhost:3200 にアクセス → メールでログイン
# → Slack にログイン通知が届く
```

### DB バックアップテスト

```bash
# CRON_SECRET 未設定なら認証不要
curl http://localhost:3200/api/cron/db-backup | jq .

# CRON_SECRET 設定済みの場合
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3200/api/cron/db-backup | jq .
```

---

## Vercel デプロイ手順

1. **SLACK_WEBHOOK_URL** を Vercel の Environment Variables に追加
   - Settings → Environment Variables → `SLACK_WEBHOOK_URL` に `.env.local` の値をコピー
2. **デプロイ** — `vercel.json` の crons 設定が反映される
3. **CRON_SECRET** — Vercel が自動生成（Vercel ダッシュボードの Settings → Cron Jobs で確認可能）
4. **動作確認** — 本番でログイン → Slack に通知が届くことを確認

---

## 将来の拡張

- バックアップ JSON を Vercel Blob / Supabase Storage に保存
- バックアップの差分検出（会員数増減のアラート）
- Stripe データ（顧客・サブスクリプション）もバックアップ対象に追加
