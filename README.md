# p-aicujp

**Point, Profile, Post** - AICU会員ポータル

🌐 **本番URL**: https://p.aicu.jp

> 日本語コミュニティ・サービス向けは `-aicujp` サフィックス / `.jp` ドメインを使用。

## 概要

AICUポイント管理とDiscord連携を提供する会員ポータルサイト。

## 機能

- 🎯 **Point**: AICUポイント残高・履歴の確認
- 👤 **Profile**: Discord連携、会員情報管理
- 📢 **Post**: コミュニティ告知（Discord Bot）

## セットアップ

```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env.local

# 開発サーバー起動
npm run dev
```

## 環境変数

`.env.local` に以下を設定:

```env
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
WIX_CLIENT_ID=your_wix_client_id
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## デプロイ

Vercelにデプロイ:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aicuai/p-aicujp)

## ライセンス

Private - AICU Japan
