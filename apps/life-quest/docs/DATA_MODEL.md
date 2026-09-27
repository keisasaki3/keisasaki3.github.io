# 人生クエスト — データモデル

更新日: 2026-09-27

## 原則

人生クエスト固有DBは、共通アカウントDB `/shared-world-core/` の `auth.users` / `profiles` を親として利用する。

ステータス★、プレイヤーLv、肩書は派生値であり、独立した保存値にしない。

構造は `ステータス -> 分野 -> トピック`。共通のプリセット（`quest_subjects` / `quest_fields` / `quest_topics`）と、利用者ごとのデータ（`quest_user_*` / `quest_topic_values`）に分かれる。migrationは `/shared-world-core/supabase/migrations/005_life_quest_user_statuses.sql`。

## テーブル

### quest_subjects

プリセットのマスタ（29学問など）。

- subject_id: text PK
- name_ja: text
- name_en: text
- icon: text（絵文字。アイコンとして表示）
- sort_order: integer
- active: boolean
- preset_group: text nullable（まとまり名。現在は29学問すべて `'29学問'`）

### quest_fields

学問配下の分野。

- field_id: text PK
- subject_id: text FK -> quest_subjects.subject_id
- name: text
- sort_order: integer
- active: boolean

### quest_topics

MASTER単位。

- topic_id: text PK
- field_id: text FK -> quest_fields.field_id
- name: text
- source: text nullable
- importance: smallint
- recommended_order: integer
- active: boolean
- input_type: text（`'check'` = チェック型 / `'number'` = 入力型。既定 `'check'`）
- unit: text nullable（入力型の単位）

importanceはNEXT計算用。★の重みには使用しない。

### quest_topic_prerequisites

トピックの多対多の前提関係。

- topic_id: text FK -> quest_topics.topic_id
- prerequisite_topic_id: text FK -> quest_topics.topic_id
- PK(topic_id, prerequisite_topic_id)

### quest_topic_mastery

個人のMASTER履歴。

- user_id: uuid FK -> profiles.user_id
- topic_id: text FK -> quest_topics.topic_id
- mastered_at: timestamptz
- PK(user_id, topic_id)

チェック解除時は該当行をDELETEする。チェック型トピックのみ対象。

### quest_user_settings

人生クエストの個人設定。`profiles` は夏の果てと共有なので列を足さない。

- user_id: uuid PK FK -> profiles.user_id
- setup_completed_at: timestamptz nullable（null = 初回セットアップ未完了）

### quest_user_statuses

自分のステータス一覧。

- status_id: uuid PK
- user_id: uuid FK -> profiles.user_id
- preset_subject_id: text nullable FK -> quest_subjects.subject_id（null = 自作）
- name_ja / name_en / icon: text nullable（プリセットはnullでプリセット側の値を使う。自作は name_ja 必須）
- sort_order: integer（後から追加したものは末尾）
- hidden: boolean（プリセットの非表示）
- UNIQUE(user_id, preset_subject_id)

### quest_user_fields

自作の分野。自作ステータス・プリセットのステータスどちらにも付けられる。

- field_id: uuid PK
- user_id: uuid
- status_id: uuid（(status_id, user_id) で quest_user_statuses へ複合FK）
- name: text
- sort_order: integer

### quest_user_topics

自作のトピック。

- topic_id: uuid PK
- user_id: uuid
- field_id: uuid（(field_id, user_id) で quest_user_fields へ複合FK）
- name: text
- input_type: text（`'check'` / `'number'`）
- unit: text nullable
- sort_order: integer
- mastered_at: timestamptz nullable（チェック型のMASTER。null = 未MASTER。入力型は常にnull）

### quest_topic_values

入力型トピックの記録履歴。

- value_id: uuid PK
- user_id: uuid FK -> profiles.user_id
- topic_id: text nullable FK -> quest_topics.topic_id（プリセットのトピック）
- user_topic_id: uuid nullable（(user_topic_id, user_id) で quest_user_topics へ複合FK）
- value: numeric
- recorded_at: timestamptz

topic_id / user_topic_id はどちらか一方だけを持つ。表示は最新の recorded_at。

子テーブルの user_id は複合FKで親と一致させ、他人のステータスへ分野やトピックを付けられないようにしている。削除は親からカスケードする。

## 派生値

### ステータス★

対象ステータス配下のMASTER済みチェック型トピック数（プリセット側は `quest_topic_mastery`、自作は `quest_user_topics.mastered_at`）。

### プレイヤーLv

その利用者の `quest_topic_mastery` 全件数 + `mastered_at` のある `quest_user_topics` 件数。非表示にしたプリセットのMASTERも含む。

### MASTER!

対象 `(user_id, topic_id)` 行が存在する場合のみ表示する。

### NEXT

以下の優先順で未MASTERトピックを選ぶ。

1. 前提トピックをすべてMASTER済み
2. importanceが高い
3. recommended_orderが早い

前提を満たす未MASTERトピックが存在しない場合のfallbackは仕様側で定義する。

チェック型トピックだけを候補にする。自作トピックは前提なし・importance 2 として扱う。

現行実装（`subject-ui.js` の `nextStatusTopic`）は、ステータス内の分野順（プリセットの分野 → 自作の分野）・トピック順に並べ、前提をすべて満たす未MASTERトピックのうちimportanceが最も高いものを選ぶ（同値なら並び順で先のもの）。該当がない場合は並び順で最初の未MASTERトピックを表示し、未MASTERが0件なら `COMPLETE` と表示する。

## 移行

### migration 005（ステータス化、2026-09-27）

既存テーブルの行は消さず、書き換えるのは `quest_subjects.preset_group` の設定のみ。`quest_topics` には既定値付きの列を追加するだけ。適用時点の全 `profiles` に、有効な全 `quest_subjects` をプリセットのステータスとして登録し、`quest_user_settings.setup_completed_at` を設定する。`quest_topic_mastery` は `topic_id` のまま参照するので移行不要。

### 旧Web版

旧Web版はlocalStorage `lifeQuestMathV06Public` にMASTER状態を保持していた。

ログイン版では初回ログイン後、旧データがあればローカルMASTERを `quest_topic_mastery` へupsertで一度だけ移行できる（`app.js` の `maybeOfferLegacyMigration`）。移行済みかどうかはブラウザのlocalStorageフラグで判定する。詳細は `SPEC.md` §12。

テーマ選択（`SPEC.md` §16）は端末ごとのlocalStorage `lifeQuestTheme` に保存し、DBには持たない。

## 権限

- プリセット（学問 / 分野 / トピック / 前提）: クライアントはread-only
- MASTER: 各ユーザーは自分の行だけSELECT / INSERT / DELETE
- quest_user_settings / quest_user_statuses / quest_user_fields / quest_user_topics / quest_topic_values: 各ユーザーは自分の行だけ読み書き
- 他人のMASTER状況は初期仕様では非公開

具体的RLSは `/shared-world-core/supabase/migrations/001_initial_schema.sql` を正本とする。
