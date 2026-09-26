# Shared Database Design

更新日: 2026-09-26

## 1. Auth

`auth.users`

Supabase管理。アプリから独自にパスワード列を作らない。

## 2. Shared tables

### races

種族マスタ。

- race_id text PK
- name_ja text
- name_en text
- sprite_key text
- visual_scale numeric
- move_speed integer
- sort_order integer
- active boolean

現在の夏の果種族:

- teddy
- ancient-robot
- rabbit-jk

### profiles

共通プレイヤー人格。

- user_id uuid PK -> auth.users.id
- display_name varchar(20)
- race_id text nullable -> races.race_id
- created_at timestamptz
- updated_at timestamptz

キャラクター外見パラメータは持たない。race_idだけで見た目が決まる。

### player_presence

共通表示ステータス。

- user_id uuid PK -> profiles.user_id
- status text — `online / studying / reading / busy / afk`
- status_changed_at timestamptz
- last_seen_at timestamptz
- updated_at timestamptz

status allowed:

- studying
- reading
- busy
- afk

## 3. Summer End

### summer_end_player_state

再ログイン/再接続用の永続位置。

- user_id uuid PK -> profiles.user_id
- map_id text
- x double precision
- y double precision
- direction text
- updated_at timestamptz

リアルタイム同期用DBではない。リアルタイム移動は既存WebSocket serverが担当する。

## 4. Life Quest

### quest_subjects

- subject_id text PK
- name_ja text
- name_en text
- icon text
- sort_order integer
- active boolean

### quest_fields

- field_id text PK
- subject_id text FK
- name text
- sort_order integer
- active boolean

### quest_topics

- topic_id text PK
- field_id text FK
- name text
- source text nullable
- importance smallint (1..3)
- recommended_order integer
- active boolean

importance convention:

- 3 = high/core
- 2 = standard
- 1 = extension

★の重みには使わない。

### quest_topic_prerequisites

- topic_id text FK
- prerequisite_topic_id text FK
- PK(topic_id, prerequisite_topic_id)

### quest_topic_mastery

- user_id uuid FK
- topic_id text FK
- mastered_at timestamptz
- PK(user_id, topic_id)

行の存在 = MASTER。

解除 = DELETE。

## 5. Derived data

保存しない値:

### Subject stars

対象subject配下のMASTER数。

### Player level

そのuserの `quest_topic_mastery` 全件数。

### MASTER! label

mastery rowの存在で判定。

### NEXT

未MASTER + prerequisites + importance + recommended_orderから算出。

## 6. RLS policy summary

| Table | Read | Write |
|---|---|---|
| races | public/anon可 | server/admin only |
| profiles | authenticated users | own row only |
| player_presence | authenticated users | own row only |
| summer_end_player_state | own row only | own row only |
| quest_subjects | public/anon可 | server/admin only |
| quest_fields | public/anon可 | server/admin only |
| quest_topics | public/anon可 | server/admin only |
| quest_topic_prerequisites | public/anon可 | server/admin only |
| quest_topic_mastery | own rows only | own rows only |

Summer End serverはservice roleでRLSをbypassし、必要な永続位置を扱う。

## 7. Stable IDs

表示名・順序を変えても進捗を壊さないよう、IDは安定させる。

例:

- subject: `math`
- field: `math-number-calculation`
- topic: `math-number-calculation-integer-addition`

一度公開したtopic_idは原則再利用しない。

## 8. Future tables

初期スキーマには入れない候補:

- summer_end_inventory
- summer_end_houses
- summer_end_furniture
- friendships
- life_quest_resources
- life_quest_learning_logs
- activities
- custom curriculum sets

必要になった段階でmigrationを追加する。
