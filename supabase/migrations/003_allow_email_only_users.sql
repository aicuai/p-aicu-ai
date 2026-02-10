-- discord_id を NULL 許可に変更（メールのみユーザー対応）
ALTER TABLE unified_users ALTER COLUMN discord_id DROP NOT NULL;

-- primary_email にユニーク制約を追加（NULL は除外）
CREATE UNIQUE INDEX idx_unified_users_primary_email_unique
  ON unified_users(primary_email) WHERE primary_email IS NOT NULL;

-- 既存の非ユニーク primary_email インデックスは不要になるが、残しても害はない
