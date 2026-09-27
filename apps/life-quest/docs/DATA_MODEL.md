# 人生クエスト — データモデル

更新日: 2026-09-27

## 原則

人生クエスト固有DBは、共通アカウントDB `/shared-world-core/` の `auth.users` / `profiles` を親として利用する。

科目★、プレイヤーLv、肩書は派生値であり、独立した保存値にしない。

## テーブル

### quest_subjects

学問マスタ。

- subject_id: text PK
- name_ja: text
- name_en: text
- icon: text（絵文字。学問アイコンとして表示）
- sort_order: integer
- active: boolean

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

チェック解除時は該当行をDELETEする。

## 派生値

### 科目★

対象科目に所属する `quest_topic_mastery` の件数。

### プレイヤーLv

その利用者の `quest_topic_mastery` 全件数。

### MASTER!

対象 `(user_id, topic_id)` 行が存在する場合のみ表示する。

### NEXT

以下の優先順で未MASTERトピックを選ぶ。

1. 前提トピックをすべてMASTER済み
2. importanceが高い
3. recommended_orderが早い

前提を満たす未MASTERトピックが存在しない場合のfallbackは仕様側で定義する。

現行実装（`app.js` の `nextTopic`）は、分野の `sort_order` → トピックの `recommended_order` 順に並べ、前提をすべて満たす未MASTERトピックのうちimportanceが最も高いものを選ぶ（同値なら並び順で先のもの）。該当がない場合は並び順で最初の未MASTERトピックを表示し、未MASTERが0件なら `COMPLETE` と表示する。

## 移行

旧Web版はlocalStorage `lifeQuestMathV06Public` にMASTER状態を保持していた。

ログイン版では初回ログイン後、旧データがあればローカルMASTERを `quest_topic_mastery` へupsertで一度だけ移行できる（`app.js` の `maybeOfferLegacyMigration`）。移行済みかどうかはブラウザのlocalStorageフラグで判定する。詳細は `SPEC.md` §12。

テーマ選択（`SPEC.md` §16）は端末ごとのlocalStorage `lifeQuestTheme` に保存し、DBには持たない。

## 権限

- 学問 / 分野 / トピック / 前提: クライアントはread-only
- MASTER: 各ユーザーは自分の行だけSELECT / INSERT / DELETE
- 他人のMASTER状況は初期仕様では非公開

具体的RLSは `/shared-world-core/supabase/migrations/001_initial_schema.sql` を正本とする。
