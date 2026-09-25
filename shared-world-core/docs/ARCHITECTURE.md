# Shared World Architecture

更新日: 2026-09-26

## 方針

人生クエストと「午後三時、夏の果。」は別アプリとして維持し、共通アカウントと共通プレイヤー人格だけを共有する。

```text
Supabase Auth
    |
    v
profiles ---- races
    |
    +---- player_presence
    |
    +---- Life Quest data
    |
    +---- Summer End data
```

## 共通人格

共通するのは以下。

- user_id
- display_name
- race_id
- presence status

外見カスタマイズは持たない。種族を選ぶと見た目が完全に決まる。

## 種族

`profiles.race_id -> races.race_id`

racesは以下を持つ。

- 表示名
- sprite_key
- visual_scale
- move_speed

人生クエストと夏の果は同じrace_idを参照し、同じキャラクターを表示する。

## Life Quest responsibility

人生クエスト固有:

- 学問
- 分野
- トピック
- トピック前提関係
- MASTER履歴
- 科目★ / Lv / NEXTの算出

## Summer End responsibility

午後三時、夏の果。固有:

- 現在マップ
- 最終永続座標
- 向き
- リアルタイムWebSocket移動
- マップ内presence snapshot

リアルタイム座標をDBへ毎フレーム保存しない。WebSocketサーバーをauthoritativeとし、DBは再ログイン/再接続用の永続スナップショットに使う。

推奨保存タイミング:

- マップ移動時
- 明示的ログアウト/切断時
- 一定間隔のthrottle保存（例: 15秒）

## Presence

永続/共有表示ステータス:

- studying = 勉強中
- reading = 読書中
- busy = 取り込み中
- afk = AFK

online/offlineは固定statusとして保存せず、`last_seen_at` とリアルタイム接続状態から判定する。

## Data ownership

- Auth: Supabase Auth
- Shared profile: Shared World Core
- Life Quest progress: Life Quest tables
- Summer End position: Summer End table
- Realtime movement: Summer End WebSocket server

## Source of Truth rule

共通仕様変更はこのディレクトリを先に更新し、各アプリ側には共通仕様を複製しすぎない。

各アプリ側ドキュメントは「共通仕様の利用方法」を記載する。
