# Shared World Core

人生クエストと「午後三時、夏の果て」が共有する認証・プレイヤー・種族・Presence・永続データ基盤。

## Source of Truth

このディレクトリを共通基盤の正式仕様とする。

- `docs/ARCHITECTURE.md` — 全体構成
- `docs/AUTH.md` — 認証設計
- `docs/DATABASE.md` — DB設計
- `supabase/migrations/001_initial_schema.sql` — 初期DBスキーマ/RLS
- `supabase/seed.sql` — 種族・29学問の初期マスタ

## Repository placement

GitHub連携の権限制約により、現在は `keisasaki3/keisasaki3.github.io/shared-world-core/` に置く。

専用repo `shared-world-core` を作成可能になった時点で、このディレクトリをそのまま移動する。

## Apps

### 人生クエスト

学習ステータス、学問、分野、トピック、MASTERを担当する。

### 午後三時、夏の果て

2Dオンライン空間、現在マップ、座標、リアルタイムPresenceを担当する。

### Shared

- Supabase Auth user_id
- display_name
- race_id
- race master
- player_presence

各アプリ固有データを無理に統合せず、共通人格だけを同じ基盤で共有する。
