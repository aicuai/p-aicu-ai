# p.aicu.jp 開発経緯とコンセプト

> このドキュメントは p-aicu-ai リポジトリの開発背景、CEO決定事項、技術的判断を記録したものです。
> 並行セッションや将来の開発者向けのコンテキスト共有を目的としています。

## 基本情報

| 項目 | 値 |
|------|-----|
| **リポジトリ** | [aicuai/p-aicujp](https://github.com/aicuai/p-aicujp) |
| **デプロイ先** | `p.aicu.jp` |
| **ホスティング** | Vercel |
| **コンセプト** | **P**oint, **P**rofile, **P**ost（3P） |

> **命名規則**: 日本語コミュニティ・サービス向けは `.jp` ドメイン / `-aicujp` サフィックスを使用。
> 国際サービスとは明確に分離する方針。

---

## 背景：なぜ p.aicu.jp が必要なのか

### 現状の課題（2025/02時点）

1. **Wixサイトの問題点**
   - サイトが重たい（ページ読み込み遅延）
   - デザインが古臭い
   - スマホレスポンシブが不十分
   - Wix独自の制約による開発柔軟性の欠如

2. **ユーザー体験の課題**
   - AICUポイント確認がわかりにくい
   - Discordコミュニティとの連携が不明確
   - 会員情報の一元管理ができていない

### CEO決定事項（2025/02/09）

> 「ユーザーが不安にならないようにポイント機能を先に移植したい」
> — AICU Japan CEO

**重要な方針転換**: 当初は aicu.jp 全体のヘッドレス化を 3/1 に実施する予定だったが、**ユーザー心理を考慮し、ポイント確認機能を先行リリース**することに決定。

### 意思決定の流れ

1. 「Wixのヘッドレス化」が週次議題として挙がる
2. aicu.jp 全体の 3/1 リリースを検討
3. CEOが「ユーザーが不安にならないよう、ポイント機能を先に」と提案
4. `profile.aicu.jp` → `p.aicu.jp` とドメイン決定
5. コンセプトを「Point, Profile, Post」の 3P に拡張
6. 2/14 先行リリース、3/1 本体移行というスケジュールに変更

---

## コンセプト：3P（Point, Profile, Post）

p.aicu.jp は「3P」をコアコンセプトとする会員専用ポータル。

| P | 機能 | 詳細 | 優先度 |
|---|------|------|--------|
| **Point** | AICUポイント | Wix Loyalty APIから取得・表示。ユーザーが自分のポイント残高を確認できる | **最優先** |
| **Profile** | 会員情報 | Discord連携状況、メールアドレス、会員プラン、Stripe決済情報 | Phase 2 |
| **Post** | お知らせ・投稿 | Discord連携による通知、AICU公式アナウンス、将来的にはコンテンツ投稿 | Phase 3 |

### なぜ「Point」を最優先するのか

Wix → ヘッドレス移行において、ユーザーが最も気にするのは **「自分のポイントは大丈夫か？」** という点。

p.aicu.jp を先行リリースすることで：
- 移行前に「ポイントは安全に引き継がれます」と示せる
- ユーザーが自分でポイント残高を確認できる安心感
- 本体移行時のクレーム・問い合わせを予防

**CEOの意図**: 技術的な移行より、ユーザーの心理的安全を優先する

---

## タイムライン

```
2025/02/09 (月) - プロジェクト開始、p-aicu-ai リポジトリ作成
                   - Discord OAuth ログイン UI 実装
                   - ダッシュボード基本構造

2025/02/14 (金) - p.aicu.jp 先行公開【マイルストーン】
                   - Discord OAuth ログイン
                   - ポイント残高表示
                   - 基本プロフィール表示

2025/03/01 (土) - aicu.jp 本体ヘッドレス移行
                   - Next.js + Vercel で完全リプレイス
                   - Shop機能維持（Wix eCommerce API）
                   - コミュニティ → Discord完全移行
```

**注意**: 木曜日は Akane 作業日のため、金曜日にリリースを集中させる方針。

---

## 技術アーキテクチャ

### 認証フロー（重要）

```
[ユーザー]
    ↓ Discord OAuth ログイン
[p.aicu.jp (Next.js)]
    ↓ Discord ID + Email 取得
[Supabase] Discord ↔ Wix メンバーID マッピングテーブル
    ↓ Wix Member ID 特定（Email でマッチング）
[Wix Loyalty API]
    ↓ ポイント残高取得
[p.aicu.jp] ダッシュボードに表示
```

### 技術スタック

| レイヤー | 技術 | 理由 |
|---------|------|------|
| フロントエンド | Next.js 15 (App Router) | Vercelとの親和性、RSC対応 |
| 認証 | NextAuth.js v5 (beta.30) | Discord OAuth、最新API対応 |
| スタイリング | Tailwind CSS + Liquid Glass | AICU統一デザイン |
| API | Wix Headless SDK | 既存ポイント・会員データ活用 |
| 決済 | Stripe | 課金管理、Customer Portal |
| DB | Supabase | Discord↔Wix連携テーブル |
| ホスティング | Vercel | Next.js最適化、エッジ配信 |
| UIパッケージ | @aicujp/ui | 共通コンポーネント |

### Discord ↔ Wix 連携の課題と解決策

**課題**: Discord OAuth で取得できるのは Discord ID のみ。Wix 会員との紐付けが必要。

**解決策**: Supabase にマッピングテーブルを作成

```sql
CREATE TABLE member_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discord_id TEXT UNIQUE NOT NULL,
  wix_member_id TEXT,
  email TEXT,
  linked_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE
);
```

**連携フロー**:
1. 初回ログイン時、Discord メールアドレスを取得
2. Wix CRM で同一メールの会員を検索
3. 一致すれば自動リンク、なければ手動確認を促す

### Wix API 連携

**Wix Loyalty API** を使用してポイント情報を取得：

```typescript
import { createClient, OAuthStrategy } from '@wix/sdk';
import { loyalty } from '@wix/loyalty';

const wixClient = createClient({
  modules: { loyalty },
  auth: OAuthStrategy({ clientId: process.env.WIX_CLIENT_ID }),
});

// メンバーIDからアカウント取得
const account = await wixClient.loyalty.getAccount(wixMemberId);
const points = account.balance?.points || 0;
```

---

## Wix Headless Loyalty Program 詳細

> 参考: [Wix Loyalty Accounts API](https://dev.wix.com/docs/sdk/backend-modules/loyalty/accounts/introduction)

### 概要

Wix Loyalty Program は、ポイント付与・管理・利用を一元化するシステム。
Headless 実装では **Wix JavaScript SDK** を使用してバックエンドからアクセスする。

### インストール

```bash
npm install @wix/sdk @wix/loyalty
```

### 認証方式

Headless 実装では **API Key 認証**を使用：

```typescript
import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { accounts } from "@wix/loyalty";

const wixClient = createClient({
  auth: ApiKeyStrategy({
    apiKey: process.env.WIX_API_KEY,      // API Key Manager で生成
    siteId: process.env.WIX_SITE_ID,       // Wix サイト ID
    accountId: process.env.WIX_ACCOUNT_ID, // Wix アカウント ID
  }),
  modules: { accounts },
});
```

**API Key の取得方法**:
1. [Wix API Key Manager](https://manage.wix.com/account/api-keys) にアクセス
2. 新しい API Key を生成
3. Loyalty API への権限を付与

### 利用可能なメソッド

| メソッド | 説明 | 用途 |
|---------|------|------|
| `getAccount(accountId)` | アカウント ID で取得 | 既知のアカウント照会 |
| `getAccountBySecondaryId(contactId/memberId)` | Contact ID または Member ID で取得 | **推奨**: Wix会員IDからポイント取得 |
| `getCurrentMemberAccount()` | 現在ログイン中の会員 | Wix認証使用時のみ |
| `listAccounts()` | アカウント一覧取得 | 管理画面用 |
| `queryLoyaltyAccounts()` | 高度なクエリ | フィルタリング |
| `earnPoints(accountId, points)` | ポイント付与 | 購入時等 |
| `adjustPoints(accountId, points)` | ポイント調整（+/-） | 手動調整 |
| `getProgramTotals()` | プログラム全体の統計 | ダッシュボード |

### アカウントオブジェクト構造

```typescript
interface LoyaltyAccount {
  _id: string;                    // アカウント ID
  contactId: string;              // Wix Contact ID（連携キー）
  memberId?: string;              // Wix Member ID
  balance: {
    points: number;               // 現在のポイント残高 ★重要
  };
  earned: {
    points: number;               // 累計獲得ポイント
  };
  adjusted: {
    points: number;               // 累計調整ポイント
  };
  redeemed: {
    points: number;               // 累計利用ポイント
  };
  rewardAvailability: {
    rewardsAvailable: boolean;    // 利用可能な特典があるか
  };
  _createdDate: string;
  _updatedDate: string;
}
```

### 実装例：ポイント残高取得

```typescript
// src/lib/wix.ts
import { createClient, ApiKeyStrategy } from "@wix/sdk";
import { accounts } from "@wix/loyalty";

const wixClient = createClient({
  auth: ApiKeyStrategy({
    apiKey: process.env.WIX_API_KEY!,
    siteId: process.env.WIX_SITE_ID!,
    accountId: process.env.WIX_ACCOUNT_ID!,
  }),
  modules: { accounts },
});

/**
 * Wix Contact ID からポイント残高を取得
 * Discord ユーザーの Email → Wix Contact ID → Loyalty Account
 */
export async function getPointsBalance(wixContactId: string): Promise<number> {
  try {
    const { account } = await wixClient.accounts.getAccountBySecondaryId({
      secondaryId: {
        contactId: wixContactId,
      },
    });
    return account?.balance?.points ?? 0;
  } catch (error) {
    console.error("Failed to get loyalty account:", error);
    return 0;
  }
}

/**
 * ポイント履歴取得（将来実装）
 */
export async function getPointsHistory(wixContactId: string) {
  // Wix Loyalty API では直接的な履歴取得はなく、
  // Transactions API や Webhook で管理する必要がある
  // → Phase 2 で実装検討
}
```

### Webhook イベント

ポイント変動を検知するためのイベント：

| イベント | 発火タイミング |
|---------|---------------|
| `onAccountCreated` | 新規アカウント作成時 |
| `onAccountUpdated` | アカウント情報更新時 |
| `onAccountPointsUpdated` | **ポイント変動時** ★重要 |
| `onAccountRewardAvailabilityUpdated` | 特典利用可能状態変更時 |

### 制限事項・注意点

1. **バックエンド専用 API**
   - Loyalty API は Backend Module のため、クライアントサイドから直接呼び出せない
   - Next.js の Server Actions または API Routes で実装

2. **権限昇格が必要**
   - 一部の操作（ポイント調整等）は `elevate()` 関数で権限昇格が必要

3. **Contact ID vs Member ID**
   - `contactId`: Wix CRM のコンタクト ID（必須）
   - `memberId`: Wix Members のログイン会員 ID（任意）
   - p.aicu.jp では `contactId` を使用（Discord Email でマッチング）

4. **レート制限**
   - Wix API には呼び出し制限あり（具体的な数値は要確認）
   - キャッシュ戦略の検討が必要

### p.aicu.jp での実装方針

```
[Discord OAuth]
     ↓ email 取得
[Supabase member_links]
     ↓ wix_contact_id 検索
[Wix Loyalty API] getAccountBySecondaryId(contactId)
     ↓ balance.points 取得
[Dashboard] ポイント表示
```

**初回連携フロー**:
1. Discord ログイン → Email 取得
2. Wix Contacts API で Email 検索 → Contact ID 取得
3. Supabase に Discord ID ↔ Contact ID マッピング保存
4. 以降は Supabase から Contact ID を取得してポイント照会

---

## ユーザーデータ（2025/02時点）

### 現在の規模

| システム | 項目 | 数値 | 備考 |
|---------|------|------|------|
| **Wix** | 会員（Members） | 約100名 | ログイン可能なアクティブ会員 |
| **Wix** | CRM コンタクト | 513名 | メルマガ登録・問い合わせ含む |
| **Wix** | Loyalty ポイント保持者 | 要確認 | ポイント残高 > 0 のユーザー |
| **Cognito** | 登録ユーザー | 要確認 | cert.aicu.ai / contest 用 |
| **Stripe** | 課金顧客（Customer） | 4名 | 有料プラン加入者 |
| **Stripe** | サブスクリプション | 要確認 | アクティブなサブスク数 |
| **Discord** | コミュニティメンバー | 要確認 | 連携対象 |

### 現状のデータ分散問題

```
┌─────────────────────────────────────────────────────────────┐
│                    現在のデータ分散状況                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [Wix]                [Cognito]           [Stripe]         │
│   ├─ Members           ├─ Users            ├─ Customers     │
│   ├─ CRM Contacts      └─ (cert/contest)   ├─ Subscriptions │
│   ├─ Loyalty Points                        └─ Payments      │
│   └─ Orders                                                 │
│                                                             │
│   問題: 同一ユーザーが複数システムに分散、紐付けなし         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## データベース設計方針

### 統合データベースを作成するか？

**結論: Supabase で統合 ID マッピングテーブルを作成**

既存システム（Wix, Cognito, Stripe）のデータはそのまま維持しつつ、
p.aicu.jp で**統合ビュー**を提供する。

```
┌─────────────────────────────────────────────────────────────┐
│                    目指すアーキテクチャ                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    [p.aicu.jp]                              │
│                         │                                   │
│                    [Supabase]                               │
│                    unified_users テーブル                   │
│                         │                                   │
│        ┌────────────────┼────────────────┐                 │
│        ▼                ▼                ▼                 │
│     [Wix]          [Cognito]         [Stripe]              │
│   (既存維持)        (既存維持)        (新規集約)            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Supabase テーブル設計

```sql
-- 統合ユーザーテーブル
CREATE TABLE unified_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 認証ID（Primary: Discord）
  discord_id TEXT UNIQUE,
  discord_email TEXT,
  discord_username TEXT,

  -- 外部システム連携
  wix_contact_id TEXT,           -- Wix CRM Contact ID
  wix_member_id TEXT,            -- Wix Members ID（ログイン会員）
  cognito_user_id TEXT,          -- AWS Cognito User ID
  stripe_customer_id TEXT,       -- Stripe Customer ID

  -- メタデータ
  primary_email TEXT,            -- 正規化されたメールアドレス
  display_name TEXT,

  -- タイムスタンプ
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,

  -- インデックス
  UNIQUE(wix_contact_id),
  UNIQUE(cognito_user_id),
  UNIQUE(stripe_customer_id)
);

-- ボーナスポイント履歴テーブル（p.aicu.jp 独自）
CREATE TABLE bonus_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES unified_users(id),

  points INTEGER NOT NULL,           -- 付与ポイント
  reason TEXT NOT NULL,              -- 付与理由
  source TEXT NOT NULL,              -- 付与元（survey, campaign, referral 等）
  source_id TEXT,                    -- 元データの ID（アンケート ID 等）

  -- Wix連携
  synced_to_wix BOOLEAN DEFAULT FALSE,
  wix_transaction_id TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS（Row Level Security）
ALTER TABLE unified_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_points ENABLE ROW LEVEL SECURITY;
```

---

## 決済システム移行戦略

### 方針: Wix → Stripe への段階的移行

| 対象 | 方針 | 理由 |
|------|------|------|
| **既存 Wix 課金ユーザー** | そのまま維持 | 移行コスト・ユーザー負担回避 |
| **新規サービス** | Stripe で実装 | 柔軟性・API 充実 |
| **新規サブスク** | Stripe で実装 | Billing Portal、Webhook 充実 |

### 移行フェーズ

```
Phase 1 (現在〜3/1)
├─ Wix: 既存サブスク維持
├─ Stripe: 新規 Lab+ プラン受付開始
└─ p.aicu.jp: 両方の課金状態を表示

Phase 2 (3/1〜)
├─ Wix: 既存ユーザーは継続
├─ Stripe: 新規サービス（AIDX、新コンテンツ）
└─ 希望者のみ Wix → Stripe 移行サポート

Phase 3 (将来)
└─ Wix サブスク終了、Stripe 一本化（長期目標）
```

### Stripe Customer Portal 活用

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/**
 * Stripe Customer Portal セッション作成
 * ユーザーが自分で課金管理できる
 */
export async function createPortalSession(customerId: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: 'https://p.aicu.jp/dashboard',
  });
  return session.url;
}
```

---

## ボーナスポイント実装

### ポイント付与のユースケース

| ソース | 例 | ポイント | 実装場所 |
|--------|------|---------|---------|
| **アンケート回答** | DCAJ調査、ユーザーサーベイ | 50〜500pt | p.aicu.jp |
| **キャンペーン参加** | SNS投稿、レビュー | 100〜1000pt | p.aicu.jp |
| **紹介** | 友達紹介プログラム | 500pt | p.aicu.jp |
| **購入** | Shop での購入 | 購入額の1〜5% | Wix（既存） |
| **イベント参加** | ワークショップ等 | 200〜500pt | p.aicu.jp |

### 実装方針

**p.aicu.jp でボーナスポイントを管理し、Wix Loyalty に同期**

```
[ユーザーアクション]
     ↓ アンケート回答等
[p.aicu.jp API]
     ↓ bonus_points テーブルに記録
[Supabase]
     ↓ バックグラウンドジョブ or 即時
[Wix Loyalty API] earnPoints() or adjustPoints()
     ↓ ポイント付与
[Wix Loyalty]
     ↓ balance 更新
[p.aicu.jp Dashboard] 反映
```

### 実装コード例

```typescript
// src/lib/bonus-points.ts
import { createClient } from '@supabase/supabase-js';
import { wixClient } from './wix';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // サーバーサイドのみ
);

interface BonusPointsInput {
  userId: string;        // unified_users.id
  points: number;
  reason: string;
  source: 'survey' | 'campaign' | 'referral' | 'event';
  sourceId?: string;
}

/**
 * ボーナスポイント付与
 * 1. Supabase に記録
 * 2. Wix Loyalty API でポイント付与
 */
export async function grantBonusPoints(input: BonusPointsInput) {
  // 1. ユーザー情報取得
  const { data: user } = await supabase
    .from('unified_users')
    .select('wix_contact_id')
    .eq('id', input.userId)
    .single();

  if (!user?.wix_contact_id) {
    throw new Error('Wix連携されていないユーザーです');
  }

  // 2. Supabase に記録
  const { data: bonus, error } = await supabase
    .from('bonus_points')
    .insert({
      user_id: input.userId,
      points: input.points,
      reason: input.reason,
      source: input.source,
      source_id: input.sourceId,
    })
    .select()
    .single();

  if (error) throw error;

  // 3. Wix Loyalty にポイント付与
  try {
    const { account } = await wixClient.accounts.getAccountBySecondaryId({
      secondaryId: { contactId: user.wix_contact_id },
    });

    await wixClient.accounts.earnPoints(account._id, {
      points: input.points,
      description: `[p.aicu.jp] ${input.reason}`,
    });

    // 4. 同期完了フラグ
    await supabase
      .from('bonus_points')
      .update({ synced_to_wix: true })
      .eq('id', bonus.id);

  } catch (wixError) {
    console.error('Wix同期失敗:', wixError);
    // Supabase には記録済み、後でリトライ可能
  }

  return bonus;
}
```

### アンケート連携の流れ

```
[Google Forms / Typeform / 独自フォーム]
     ↓ Webhook or 手動トリガー
[p.aicu.jp API] POST /api/bonus-points
     ↓
{
  "email": "user@example.com",
  "points": 100,
  "reason": "DCAJアンケート回答",
  "source": "survey",
  "sourceId": "dcaj-2025-02"
}
     ↓
[grantBonusPoints()] 実行
     ↓
ユーザーのポイント残高に反映
```

### 管理画面での手動付与

Phase 2 で管理画面（`/admin/bonus-points`）を実装予定：
- CSV 一括付与
- 個別付与フォーム
- 付与履歴確認
- Wix 同期失敗のリトライ

---

## 開発優先順位

### Phase 1（2/14 リリース）- Point 重視 【現在ここ】
- [x] Discord OAuth ログイン UI
- [x] ダッシュボード基本レイアウト
- [x] Liquid Glass デザイン適用
- [ ] Supabase セットアップ（unified_users テーブル）
- [ ] Wix API Key 取得・設定
- [ ] Wix Loyalty API 連携
- [ ] ポイント残高表示（実データ）
- [ ] レスポンシブ調整

### Phase 2（2/14〜3/1）- Profile 強化
- [ ] Stripe Customer Portal 連携
- [ ] Wix サブスク状態表示
- [ ] 会員プラン表示・変更
- [ ] Discord ↔ Wix 自動リンク
- [ ] ポイント履歴表示
- [ ] bonus_points テーブル作成

### Phase 3（3/1〜）- Post 機能 & ボーナスポイント
- [ ] お知らせ一覧表示
- [ ] Discord 通知連携
- [ ] ボーナスポイント付与 API
- [ ] アンケート Webhook 連携
- [ ] 管理画面（手動ポイント付与）

---

## 残タスク・ブロッカー

### 必須（2/14 までに必要）

1. **Wix OAuth App の作成**
   - Wix Developers Console で Headless アプリを作成
   - Loyalty API の権限を有効化
   - Client ID / API Key 取得

2. **Supabase セットアップ**
   - member_links テーブル作成
   - Row Level Security 設定

3. **Vercel デプロイ設定**
   - p.aicu.jp ドメイン設定
   - 環境変数設定

### 環境変数一覧

```bash
# Discord OAuth
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=

# Wix Headless（API Key 認証）
WIX_API_KEY=          # API Key Manager で生成
WIX_SITE_ID=          # Wix サイト ID（サイト設定から取得）
WIX_ACCOUNT_ID=       # Wix アカウント ID

# Wix Headless（OAuth 認証 - 代替）
WIX_CLIENT_ID=        # OAuth App の Client ID（将来用）

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://p.aicu.jp
```

**Wix Site ID の取得方法**:
1. Wix ダッシュボード → サイト設定
2. または URL から: `https://manage.wix.com/dashboard/{SITE_ID}/...`

---

## 関連リソース

### 内部リソース
- **リポジトリ**: https://github.com/aicuai/p-aicujp
- **経営会議Issue**: https://github.com/aicuai/japan-corp/issues/124
- **aicujp-portal**: https://github.com/aicuai/aicujp-portal （Docusaurus + Stripe + Membership）
- **aicujp-wix**: https://github.com/aicuai/aicujp-wix （Wix Velo コード）

### Wix Headless ドキュメント
- **Wix Headless 概要**: https://dev.wix.com/docs/go-headless
- **JavaScript SDK**: https://dev.wix.com/docs/sdk/articles/get-started/about-the-wix-java-script-sdk
- **API Key 認証**: https://dev.wix.com/docs/go-headless/develop-your-project/admin-operations/create-a-java-script-sdk-client-with-an-api-key
- **Loyalty Accounts API**: https://dev.wix.com/docs/sdk/backend-modules/loyalty/accounts/introduction
- **Pricing Plans Quick Start**: https://dev.wix.com/docs/go-headless/tutorials-templates/java-script-sdk-tutorials/pricing-plans-quick-start
- **API Key Manager**: https://manage.wix.com/account/api-keys

### Wix 公式 Next.js テンプレート（参考実装）
- **Classes & Subscriptions Template**: https://github.com/wix-incubator/wix-classes-subscriptions-nextjs-template
- **Vercel Template（Classes）**: https://vercel.com/templates/next.js/wix-classes-subscriptions
- **Appointments Template**: https://github.com/wix/wix-appointments-subscriptions-nextjs-template
- **Next.js Templates 一覧**: https://dev.wix.com/docs/go-headless/tutorials-templates/templates/web/next-js-templates

### その他
- **NextAuth.js v5**: https://authjs.dev/
- **Supabase**: https://supabase.com/docs
- **Stripe Billing Portal**: https://stripe.com/docs/customer-management

---

## 注意事項（開発者向け）

1. **デザインシステム**
   - `@aicujp/ui` パッケージを使用
   - Liquid Glass スタイルを適用（CSS変数で定義）
   - AICU ブランドカラー: Primary (`--aicu-primary`), Secondary, Accent

2. **認証の実装**
   - NextAuth.js v5 (beta) を使用
   - `src/lib/auth.ts` に設定
   - Server Actions で signIn/signOut

3. **コンポーネント構成**
   - Server Component をデフォルトに
   - Client Component は明示的に `"use client"` 宣言
   - `DashboardNav` は bottom navigation として実装済み

---

*最終更新: 2025/02/09*
*作成者: Claude Code (japan-corp session)*
*目的: 並行開発セッションへのコンテキスト共有*
